/**
 * Provider de contexte pour les Verifiable Credentials
 * 
 * Ce provider wrappe l'application et fournit l'état des credentials
 * à tous les composants enfants via React Context.
 */

"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "./WalletProvider";
import { 
  getUserCredentials, 
  checkAllCredentials,
  disconnectClient 
} from "../../lib/xrplCredentialService";
import { CREDENTIAL_TYPES, CREDENTIAL_INFO, ISSUER_ADDRESS } from "../../lib/credentials";

// Debug log function
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[CredentialProvider]", ...args);
}

// Contexte des credentials
const CredentialContext = createContext(undefined);

/**
 * Provider pour les credentials
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Composants enfants
 */
export function CredentialProvider({ children }) {
  const { accountInfo, isConnected, walletManager } = useWallet();
  
  // État
  const [credentials, setCredentials] = useState([]);
  const [accessMap, setAccessMap] = useState({
    [CREDENTIAL_TYPES.BUYER]: false,
    [CREDENTIAL_TYPES.SELLER]: false,
    [CREDENTIAL_TYPES.LABO]: false,
    [CREDENTIAL_TYPES.TRANSPORTER]: false,
  });
  const [isLoading, setIsLoading] = useState(true); // Commence en loading
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref pour éviter les doubles appels
  const fetchingRef = useRef(false);

  // Adresse du wallet
  const walletAddress = accountInfo?.address || null;

  log("=== Render ===");
  log("isConnected:", isConnected);
  log("walletAddress:", walletAddress);
  log("accountInfo:", accountInfo);
  log("isLoading:", isLoading);
  log("isInitialized:", isInitialized);
  log("ISSUER_ADDRESS:", ISSUER_ADDRESS);
  log("accessMap:", accessMap);

  /**
   * Récupère les credentials depuis le ledger XRPL
   */
  const fetchCredentials = useCallback(async () => {
    // Éviter les appels multiples simultanés
    if (fetchingRef.current) {
      log("Already fetching, skipping...");
      return;
    }
    
    if (!walletAddress) {
      log("No wallet address, resetting credentials");
      setCredentials([]);
      setAccessMap({
        [CREDENTIAL_TYPES.BUYER]: false,
        [CREDENTIAL_TYPES.SELLER]: false,
        [CREDENTIAL_TYPES.LABO]: false,
        [CREDENTIAL_TYPES.TRANSPORTER]: false,
      });
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    log("🔄 Fetching credentials for wallet:", walletAddress);
    log("Using ISSUER_ADDRESS:", ISSUER_ADDRESS);

    try {
      const [credentialsResult, accessResult] = await Promise.all([
        getUserCredentials(walletAddress),
        checkAllCredentials(walletAddress),
      ]);

      log("📦 getUserCredentials result:", credentialsResult);
      log("📦 checkAllCredentials result:", accessResult);

      if (credentialsResult.error) {
        log("❌ Error from getUserCredentials:", credentialsResult.error);
        setError(credentialsResult.error);
      }

      setCredentials(credentialsResult.credentials);
      setAccessMap(accessResult);
      
      log("✅ Credentials set. Access map:", accessResult);
    } catch (err) {
      log("❌ Exception in fetchCredentials:", err);
      console.error("CredentialProvider: Erreur", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      fetchingRef.current = false;
      log("✓ Fetch complete, isLoading=false, isInitialized=true");
    }
  }, [walletAddress]);

  /**
   * Vérifie si l'utilisateur a un credential
   */
  const hasCredential = useCallback(
    (credentialType) => {
      return accessMap[credentialType] === true;
    },
    [accessMap]
  );

  /**
   * Vérifie l'accès à une section
   */
  const hasAccess = useCallback(
    (section) => {
      const typeMap = {
        buyer: CREDENTIAL_TYPES.BUYER,
        seller: CREDENTIAL_TYPES.SELLER,
        labo: CREDENTIAL_TYPES.LABO,
        transporter: CREDENTIAL_TYPES.TRANSPORTER,
      };
      return hasCredential(typeMap[section.toLowerCase()]);
    },
    [hasCredential]
  );

  /**
   * Retourne les sections accessibles
   */
  const getAccessibleSections = useCallback(() => {
    const sections = [];
    if (accessMap[CREDENTIAL_TYPES.BUYER]) sections.push("buyer");
    if (accessMap[CREDENTIAL_TYPES.SELLER]) sections.push("seller");
    if (accessMap[CREDENTIAL_TYPES.LABO]) sections.push("labo");
    if (accessMap[CREDENTIAL_TYPES.TRANSPORTER]) sections.push("transporter");
    return sections;
  }, [accessMap]);

  // Attendre l'initialisation du wallet manager avant de marquer comme initialisé
  useEffect(() => {
    log("Init effect - walletManager:", !!walletManager, "isConnected:", isConnected, "walletAddress:", walletAddress);
    
    // Si on a déjà une adresse (restaurée de la session), on fetch immédiatement
    if (walletAddress && !fetchingRef.current && !isInitialized) {
      log("Have wallet address from session, fetching credentials...");
      fetchCredentials();
      return;
    }
    
    // Si pas de wallet manager, attendre un peu puis marquer comme initialisé sans connexion
    if (!walletManager) {
      const timeout = setTimeout(() => {
        if (!walletManager && !isConnected && !walletAddress) {
          log("No wallet manager and no session, marking as initialized");
          setIsLoading(false);
          setIsInitialized(true);
        }
      }, 2000); // Attendre 2 secondes max pour le wallet manager
      
      return () => clearTimeout(timeout);
    }
  }, [walletManager, isConnected, walletAddress, isInitialized, fetchCredentials]);

  // Récupérer les credentials quand le wallet change
  useEffect(() => {
    log("Wallet change effect - isConnected:", isConnected, "walletAddress:", walletAddress, "isInitialized:", isInitialized);
    
    if (walletAddress) {
      log("Wallet address present, fetching credentials...");
      fetchCredentials();
    } else if (!isConnected && !walletAddress && isInitialized) {
      // Reset complet à la déconnexion (mais seulement si déjà initialisé)
      log("Wallet disconnected, resetting state");
      setCredentials([]);
      setAccessMap({
        [CREDENTIAL_TYPES.BUYER]: false,
        [CREDENTIAL_TYPES.SELLER]: false,
        [CREDENTIAL_TYPES.LABO]: false,
        [CREDENTIAL_TYPES.TRANSPORTER]: false,
      });
      setError(null);
    }
  }, [isConnected, walletAddress, fetchCredentials, isInitialized]);

  // Cleanup
  useEffect(() => {
    return () => {
      disconnectClient();
    };
  }, []);

  const value = {
    // État
    credentials,
    accessMap,
    isLoading,
    error,
    isInitialized,
    walletAddress,
    isConnected,
    
    // Méthodes
    hasCredential,
    hasAccess,
    getAccessibleSections,
    refreshCredentials: fetchCredentials,
    
    // Constantes
    CREDENTIAL_TYPES,
    CREDENTIAL_INFO,
  };

  return (
    <CredentialContext.Provider value={value}>
      {children}
    </CredentialContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte des credentials
 * 
 * @returns {object} Contexte des credentials
 * @throws {Error} Si utilisé hors du CredentialProvider
 */
export function useCredentialContext() {
  const context = useContext(CredentialContext);
  
  if (context === undefined) {
    throw new Error(
      "useCredentialContext doit être utilisé à l'intérieur d'un CredentialProvider"
    );
  }
  
  return context;
}

export default CredentialProvider;
