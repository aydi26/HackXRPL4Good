/**
 * Service XRPL pour la gestion des Verifiable Credentials
 * 
 * Ce service permet de vérifier les credentials des utilisateurs
 * directement sur le ledger XRPL.
 */

import { Client } from "xrpl";
import { DEFAULT_NETWORK } from "./networks";
import { ISSUER_ADDRESS, CREDENTIAL_TYPES } from "./credentials";

// Client XRPL singleton
let xrplClient = null;
let isConnecting = false;
let connectionPromise = null;

// Activer les logs de debug
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[CredentialService]", ...args);
}

/**
 * Obtient une connexion au client XRPL
 * @returns {Promise<Client>} Client XRPL connecté
 */
async function getClient() {
  // Si déjà connecté, retourner le client
  if (xrplClient && xrplClient.isConnected()) {
    log("Using existing connected client");
    return xrplClient;
  }

  // Si une connexion est en cours, attendre
  if (isConnecting && connectionPromise) {
    log("Connection in progress, waiting...");
    await connectionPromise;
    return xrplClient;
  }

  // Nouvelle connexion
  isConnecting = true;
  log("Connexion au réseau:", DEFAULT_NETWORK.wss);
  
  connectionPromise = (async () => {
    try {
      // Fermer l'ancien client si existant
      if (xrplClient) {
        try {
          await xrplClient.disconnect();
        } catch (e) {
          // Ignorer les erreurs de déconnexion
        }
      }
      
      xrplClient = new Client(DEFAULT_NETWORK.wss);
      await xrplClient.connect();
      log("✓ Connecté au réseau XRPL");
      return xrplClient;
    } catch (error) {
      log("❌ Erreur de connexion:", error);
      xrplClient = null;
      throw error;
    } finally {
      isConnecting = false;
    }
  })();

  await connectionPromise;
  return xrplClient;
}

/**
 * Ferme la connexion au client XRPL
 */
export async function disconnectClient() {
  if (xrplClient && xrplClient.isConnected()) {
    await xrplClient.disconnect();
    xrplClient = null;
    log("Déconnecté du réseau XRPL");
  }
}

/**
 * Convertit une chaîne en hexadécimal (format XRPL)
 * Compatible navigateur (sans Buffer)
 * @param {string} str - Chaîne à convertir
 * @returns {string} Chaîne hexadécimale
 */
function stringToHex(str) {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hex += charCode.toString(16).padStart(2, "0");
  }
  return hex.toUpperCase();
}

/**
 * Convertit une chaîne hexadécimale en chaîne normale
 * Compatible navigateur (sans Buffer)
 * @param {string} hex - Chaîne hexadécimale
 * @returns {string} Chaîne décodée
 */
function hexToString(hex) {
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.substr(i, 2), 16);
    str += String.fromCharCode(charCode);
  }
  return str;
}

/**
 * Vérifie si un utilisateur possède un credential spécifique
 * 
 * @param {string} walletAddress - Adresse du wallet de l'utilisateur
 * @param {string} credentialType - Type de credential à vérifier (ex: CREDENTIAL_TYPES.BUYER)
 * @param {string} issuer - Adresse de l'émetteur (optionnel, utilise ISSUER_ADDRESS par défaut)
 * @returns {Promise<{hasCredential: boolean, credential: object|null, error: string|null}>}
 */
export async function checkCredential(walletAddress, credentialType, issuer = ISSUER_ADDRESS) {
  log("=== checkCredential ===");
  log("Wallet:", walletAddress);
  log("Credential Type:", credentialType);
  log("Issuer configuré:", issuer);
  
  try {
    const client = await getClient();
    
    // Construire l'ID du credential
    // Format: Credential object sur XRPL
    const credentialTypeHex = stringToHex(credentialType);
    log("Credential Type (hex):", credentialTypeHex);
    
    // Requête pour obtenir l'objet credential
    const request = {
      command: "ledger_entry",
      credential: {
        subject: walletAddress,
        issuer: issuer,
        credential_type: credentialTypeHex,
      },
      ledger_index: "validated",
    };
    
    log("Requête XRPL:", JSON.stringify(request, null, 2));

    const response = await client.request(request);
    log("Réponse XRPL:", JSON.stringify(response.result, null, 2));
    
    if (response.result && response.result.node) {
      const node = response.result.node;
      
      // Vérifier si le credential est expiré
      if (node.Expiration) {
        const expirationDate = new Date((node.Expiration + 946684800) * 1000); // Ripple epoch
        log("Date d'expiration:", expirationDate);
        if (expirationDate < new Date()) {
          log("❌ Credential expiré!");
          return {
            hasCredential: false,
            credential: null,
            error: "Credential expiré",
          };
        }
      }

      log("✅ Credential trouvé et valide!");
      return {
        hasCredential: true,
        credential: {
          issuer: node.Issuer,
          subject: node.Subject,
          credentialType: hexToString(node.CredentialType),
          expiration: node.Expiration 
            ? new Date((node.Expiration + 946684800) * 1000) 
            : null,
          uri: node.URI ? hexToString(node.URI) : null,
        },
        error: null,
      };
    }

    log("❌ Pas de credential trouvé (response vide)");
    return {
      hasCredential: false,
      credential: null,
      error: null,
    };
  } catch (error) {
    log("Erreur:", error.message);
    log("Error data:", error.data);
    
    // Si l'objet n'existe pas, ce n'est pas une erreur, juste pas de credential
    if (error.data?.error === "entryNotFound" || error.message?.includes("entryNotFound")) {
      log("❌ Credential non trouvé (entryNotFound)");
      return {
        hasCredential: false,
        credential: null,
        error: null,
      };
    }
    
    // Compte non trouvé sur le ledger
    if (error.data?.error === "actNotFound" || error.message?.includes("actNotFound")) {
      log("❌ Compte non trouvé sur le ledger (actNotFound)");
      return {
        hasCredential: false,
        credential: null,
        error: null,
      };
    }

    console.error("Erreur lors de la vérification du credential:", error);
    return {
      hasCredential: false,
      credential: null,
      error: error.message,
    };
  }
}

/**
 * Récupère tous les credentials d'un utilisateur émis par notre plateforme
 * 
 * @param {string} walletAddress - Adresse du wallet de l'utilisateur
 * @param {string} issuer - Adresse de l'émetteur (optionnel)
 * @returns {Promise<{credentials: object[], error: string|null}>}
 */
export async function getUserCredentials(walletAddress, issuer = ISSUER_ADDRESS) {
  try {
    const client = await getClient();
    
    // Récupérer tous les objets du compte
    const request = {
      command: "account_objects",
      account: walletAddress,
      type: "credential",
      ledger_index: "validated",
    };

    const response = await client.request(request);
    
    if (response.result && response.result.account_objects) {
      const credentials = response.result.account_objects
        .filter((obj) => obj.Issuer === issuer) // Filtrer par notre issuer
        .map((obj) => {
          const credentialType = hexToString(obj.CredentialType);
          const expiration = obj.Expiration
            ? new Date((obj.Expiration + 946684800) * 1000)
            : null;
          
          // Vérifier si expiré
          const isExpired = expiration && expiration < new Date();
          
          return {
            issuer: obj.Issuer,
            subject: obj.Subject,
            credentialType: credentialType,
            expiration: expiration,
            isExpired: isExpired,
            uri: obj.URI ? hexToString(obj.URI) : null,
            isValid: !isExpired,
          };
        })
        .filter((cred) => cred.isValid); // Ne garder que les credentials valides

      return {
        credentials,
        error: null,
      };
    }

    return {
      credentials: [],
      error: null,
    };
  } catch (error) {
    // Compte non trouvé sur le ledger - ce n'est pas une erreur fatale
    if (error.data?.error === "actNotFound" || error.message?.includes("actNotFound")) {
      console.log("Compte non trouvé sur le ledger:", walletAddress);
      return {
        credentials: [],
        error: null,
      };
    }
    
    console.error("Erreur lors de la récupération des credentials:", error);
    return {
      credentials: [],
      error: error.message,
    };
  }
}

/**
 * Vérifie si l'utilisateur a accès à une route spécifique
 * 
 * @param {string} walletAddress - Adresse du wallet
 * @param {string} pathname - Chemin de la route (ex: "/buyer")
 * @returns {Promise<{hasAccess: boolean, credential: object|null, error: string|null}>}
 */
export async function checkRouteAccess(walletAddress, pathname) {
  const { getRequiredCredential } = await import("./credentials");
  
  const requiredCredential = getRequiredCredential(pathname);
  
  // Route publique
  if (!requiredCredential) {
    return {
      hasAccess: true,
      credential: null,
      error: null,
    };
  }

  // Vérifier le credential requis
  const result = await checkCredential(walletAddress, requiredCredential);
  
  return {
    hasAccess: result.hasCredential,
    credential: result.credential,
    error: result.error,
  };
}

/**
 * Vérifie plusieurs types de credentials en parallèle
 * Utile pour déterminer tous les accès d'un utilisateur
 * 
 * @param {string} walletAddress - Adresse du wallet
 * @returns {Promise<{[key: string]: boolean}>} Map des accès par type
 */
export async function checkAllCredentials(walletAddress) {
  const types = Object.values(CREDENTIAL_TYPES);
  
  const results = await Promise.all(
    types.map(async (type) => {
      const result = await checkCredential(walletAddress, type);
      return [type, result.hasCredential];
    })
  );

  return Object.fromEntries(results);
}
