/**
 * Configuration pour l'émission des Verifiable Credentials
 * 
 * ⚠️ FICHIER SENSIBLE - Ne jamais commiter les secrets en clair
 * Utilisez des variables d'environnement en production
 */

require("dotenv").config();

// Configuration de l'issuer
const config = {
  // Adresse du wallet issuer (votre plateforme)
  issuerAddress: process.env.ISSUER_ADDRESS || "rISSUER_ADDRESS_HERE",
  
  // Secret du wallet issuer - ⚠️ NE JAMAIS EXPOSER
  issuerSecret: process.env.ISSUER_SECRET || "sISSUER_SECRET_HERE",
  
  // Réseau XRPL
  network: {
    wss: process.env.XRPL_WSS || "wss://s.altnet.rippletest.net:51233",
    networkId: process.env.XRPL_NETWORK_ID || 1,
  },
  
  // Types de credentials
  credentialTypes: {
    BUYER: "CERTICHAIN_BUYER",
    SELLER: "CERTICHAIN_SELLER",
    LABO: "CERTICHAIN_LABO",
    TRANSPORTER: "CERTICHAIN_TRANSPORTER",
  },
  
  // Durée de validité par défaut (en secondes)
  // 1 an = 31536000 secondes
  defaultExpiration: 31536000,
};

module.exports = config;
