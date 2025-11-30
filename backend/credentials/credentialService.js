/**
 * Service backend pour la création des Verifiable Credentials sur XRPL
 * 
 * Ce service est appelé par l'API pour créer des credentials
 * quand une entreprise d'audit valide un utilisateur.
 */

const xrpl = require("xrpl");
const config = require("./config");

// Client XRPL
let client = null;

/**
 * Obtient une connexion au client XRPL
 */
async function getClient() {
  if (client && client.isConnected()) {
    return client;
  }

  client = new xrpl.Client(config.network.wss);
  await client.connect();
  console.log("✓ Connecté au réseau XRPL:", config.network.wss);
  return client;
}

/**
 * Ferme la connexion XRPL
 */
async function disconnectClient() {
  if (client && client.isConnected()) {
    await client.disconnect();
    client = null;
    console.log("✓ Déconnecté du réseau XRPL");
  }
}

/**
 * Convertit une chaîne en hexadécimal
 */
function stringToHex(str) {
  return Buffer.from(str, "utf8").toString("hex").toUpperCase();
}

/**
 * Calcule la date d'expiration XRPL
 * XRPL utilise l'epoch Ripple (946684800 secondes après Unix epoch)
 */
function calculateExpiration(expirationSeconds = config.defaultExpiration) {
  const now = Math.floor(Date.now() / 1000);
  const rippleEpoch = 946684800;
  return now - rippleEpoch + expirationSeconds;
}

/**
 * Crée un Verifiable Credential sur XRPL
 * 
 * @param {object} params
 * @param {string} params.subjectAddress - Adresse wallet de l'utilisateur
 * @param {string} params.credentialType - Type de credential (BUYER, SELLER, LABO, TRANSPORTER)
 * @param {number} [params.expirationSeconds] - Durée de validité en secondes
 * @param {string} [params.uri] - URI vers des métadonnées (optionnel)
 * @returns {Promise<object>} Résultat de la transaction
 */
async function createCredential({
  subjectAddress,
  credentialType,
  expirationSeconds,
  uri,
}) {
  // Valider le type de credential
  const credentialTypeValue = config.credentialTypes[credentialType.toUpperCase()];
  if (!credentialTypeValue) {
    throw new Error(`Type de credential invalide: ${credentialType}`);
  }

  // Valider l'adresse
  if (!xrpl.isValidClassicAddress(subjectAddress)) {
    throw new Error(`Adresse wallet invalide: ${subjectAddress}`);
  }

  const xrplClient = await getClient();
  
  // Créer le wallet issuer
  const issuerWallet = xrpl.Wallet.fromSeed(config.issuerSecret);
  
  // Vérifier que le wallet correspond à l'adresse configurée
  if (issuerWallet.address !== config.issuerAddress) {
    throw new Error("Le secret ne correspond pas à l'adresse issuer configurée");
  }

  // Construire la transaction CredentialCreate
  const credentialCreateTx = {
    TransactionType: "CredentialCreate",
    Account: issuerWallet.address,
    Subject: subjectAddress,
    CredentialType: stringToHex(credentialTypeValue),
  };

  // Ajouter l'expiration si spécifiée
  if (expirationSeconds !== undefined) {
    credentialCreateTx.Expiration = calculateExpiration(expirationSeconds);
  } else {
    credentialCreateTx.Expiration = calculateExpiration();
  }

  // Ajouter l'URI si spécifié
  if (uri) {
    credentialCreateTx.URI = stringToHex(uri);
  }

  console.log("📝 Création du credential:", {
    issuer: issuerWallet.address,
    subject: subjectAddress,
    type: credentialTypeValue,
  });

  try {
    // Préparer et soumettre la transaction
    const prepared = await xrplClient.autofill(credentialCreateTx);
    const signed = issuerWallet.sign(prepared);
    const result = await xrplClient.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult === "tesSUCCESS") {
      console.log("✅ Credential créé avec succès!");
      return {
        success: true,
        transactionHash: result.result.hash,
        credential: {
          issuer: issuerWallet.address,
          subject: subjectAddress,
          credentialType: credentialTypeValue,
          expiration: new Date((credentialCreateTx.Expiration + 946684800) * 1000),
        },
      };
    } else {
      throw new Error(`Transaction échouée: ${result.result.meta.TransactionResult}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la création du credential:", error);
    throw error;
  }
}

/**
 * Supprime (révoque) un Verifiable Credential
 * 
 * @param {object} params
 * @param {string} params.subjectAddress - Adresse wallet de l'utilisateur
 * @param {string} params.credentialType - Type de credential
 * @returns {Promise<object>} Résultat de la transaction
 */
async function revokeCredential({ subjectAddress, credentialType }) {
  const credentialTypeValue = config.credentialTypes[credentialType.toUpperCase()];
  if (!credentialTypeValue) {
    throw new Error(`Type de credential invalide: ${credentialType}`);
  }

  const xrplClient = await getClient();
  const issuerWallet = xrpl.Wallet.fromSeed(config.issuerSecret);

  const credentialDeleteTx = {
    TransactionType: "CredentialDelete",
    Account: issuerWallet.address,
    Subject: subjectAddress,
    CredentialType: stringToHex(credentialTypeValue),
  };

  console.log("🗑️ Révocation du credential:", {
    issuer: issuerWallet.address,
    subject: subjectAddress,
    type: credentialTypeValue,
  });

  try {
    const prepared = await xrplClient.autofill(credentialDeleteTx);
    const signed = issuerWallet.sign(prepared);
    const result = await xrplClient.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult === "tesSUCCESS") {
      console.log("✅ Credential révoqué avec succès!");
      return {
        success: true,
        transactionHash: result.result.hash,
      };
    } else {
      throw new Error(`Transaction échouée: ${result.result.meta.TransactionResult}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors de la révocation:", error);
    throw error;
  }
}

/**
 * Vérifie si un credential existe
 * 
 * @param {string} subjectAddress - Adresse wallet
 * @param {string} credentialType - Type de credential
 * @returns {Promise<boolean>}
 */
async function credentialExists(subjectAddress, credentialType) {
  const credentialTypeValue = config.credentialTypes[credentialType.toUpperCase()];
  if (!credentialTypeValue) {
    return false;
  }

  const xrplClient = await getClient();

  try {
    const request = {
      command: "ledger_entry",
      credential: {
        subject: subjectAddress,
        issuer: config.issuerAddress,
        credential_type: stringToHex(credentialTypeValue),
      },
      ledger_index: "validated",
    };

    await xrplClient.request(request);
    return true;
  } catch (error) {
    if (error.data?.error === "entryNotFound") {
      return false;
    }
    throw error;
  }
}

module.exports = {
  createCredential,
  revokeCredential,
  credentialExists,
  getClient,
  disconnectClient,
};
