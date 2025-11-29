/**
 * Configuration des Verifiable Credentials (VC) pour CertiChain
 * 
 * Ce fichier définit les types de credentials utilisés pour le contrôle d'accès
 * et les mappings vers les routes protégées.
 */

// L'adresse de l'issuer (votre plateforme) qui émet les credentials
// Cette adresse doit être configurée via variable d'environnement en production
export const ISSUER_ADDRESS = process.env.NEXT_PUBLIC_ISSUER_ADDRESS || "rISSUER_ADDRESS_HERE";

// Types de credentials disponibles
// Ces identifiants sont utilisés sur le ledger XRPL
export const CREDENTIAL_TYPES = {
  BUYER: "CERTICHAIN_BUYER",
  SELLER: "CERTICHAIN_SELLER", 
  LABO: "CERTICHAIN_LABO",
  TRANSPORTER: "CERTICHAIN_TRANSPORTER",
};

// Mapping des credentials vers les routes autorisées
export const CREDENTIAL_ROUTES = {
  [CREDENTIAL_TYPES.BUYER]: ["/buyer"],
  [CREDENTIAL_TYPES.SELLER]: ["/seller"],
  [CREDENTIAL_TYPES.LABO]: ["/labo"],
  [CREDENTIAL_TYPES.TRANSPORTER]: ["/transporter"],
};

// Mapping inverse : route → credential requis
export const ROUTE_CREDENTIALS = {
  "/buyer": CREDENTIAL_TYPES.BUYER,
  "/seller": CREDENTIAL_TYPES.SELLER,
  "/labo": CREDENTIAL_TYPES.LABO,
  "/transporter": CREDENTIAL_TYPES.TRANSPORTER,
};

// Informations affichées pour chaque type de credential
export const CREDENTIAL_INFO = {
  [CREDENTIAL_TYPES.BUYER]: {
    name: "Buyer",
    description: "Accès acheteur - Permet d'acheter des produits certifiés",
    color: "blue",
    icon: "🛒",
  },
  [CREDENTIAL_TYPES.SELLER]: {
    name: "Seller", 
    description: "Accès vendeur - Permet de certifier et vendre des produits",
    color: "emerald",
    icon: "🌾",
  },
  [CREDENTIAL_TYPES.LABO]: {
    name: "Laboratory",
    description: "Accès laboratoire - Permet de valider et analyser des produits",
    color: "amber",
    icon: "🔬",
  },
  [CREDENTIAL_TYPES.TRANSPORTER]: {
    name: "Transporter",
    description: "Accès transporteur - Permet de gérer les livraisons",
    color: "purple", 
    icon: "🚚",
  },
};

// Fonction utilitaire pour obtenir le credential requis pour une route
export function getRequiredCredential(pathname) {
  // Vérifie les routes exactes
  if (ROUTE_CREDENTIALS[pathname]) {
    return ROUTE_CREDENTIALS[pathname];
  }
  
  // Vérifie les sous-routes (ex: /buyer/orders → BUYER)
  for (const [route, credential] of Object.entries(ROUTE_CREDENTIALS)) {
    if (pathname.startsWith(route + "/") || pathname === route) {
      return credential;
    }
  }
  
  return null; // Pas de credential requis (route publique)
}

// Fonction pour vérifier si une route nécessite un credential
export function isProtectedRoute(pathname) {
  return getRequiredCredential(pathname) !== null;
}
