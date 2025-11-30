/**
 * Point d'entrée du module credentials
 * 
 * Exporte les routes et services pour une intégration facile
 * dans le serveur Express principal.
 */

const routes = require("./routes");
const credentialService = require("./credentialService");
const config = require("./config");

module.exports = {
  // Routes Express à monter sur /api/credentials
  routes,
  
  // Service pour usage programmatique
  service: credentialService,
  
  // Configuration
  config,
  
  // Types de credentials disponibles
  CREDENTIAL_TYPES: config.credentialTypes,
};
