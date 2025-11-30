/**
 * Verifiable Credentials (VC) configuration for CertiChain
 * 
 * This file defines the credential types used for access control
 * and mappings to protected routes.
 */

// The issuer address (your platform) that issues credentials
// This address must be configured via environment variable in production
export const ISSUER_ADDRESS = process.env.NEXT_PUBLIC_ISSUER_ADDRESS || "rISSUER_ADDRESS_HERE";

// Types of credentials available
// These identifiers are used on the XRPL ledger
export const CREDENTIAL_TYPES = {
  BUYER: "CERTICHAIN_BUYER",
  SELLER: "CERTICHAIN_SELLER", 
  PRODUCER: "CERTICHAIN_PRODUCER",
  LABO: "CERTICHAIN_LABO",
  TRANSPORTER: "CERTICHAIN_TRANSPORTER",
};

// Mapping of credentials to authorized routes
export const CREDENTIAL_ROUTES = {
  [CREDENTIAL_TYPES.BUYER]: ["/buyer"],
  [CREDENTIAL_TYPES.SELLER]: ["/seller"],
  [CREDENTIAL_TYPES.PRODUCER]: ["/producer"],
  [CREDENTIAL_TYPES.LABO]: ["/labo"],
  [CREDENTIAL_TYPES.TRANSPORTER]: ["/transporter"],
};

// Inverse mapping: route → required credential
export const ROUTE_CREDENTIALS = {
  "/buyer": CREDENTIAL_TYPES.BUYER,
  "/seller": CREDENTIAL_TYPES.SELLER,
  "/producer": CREDENTIAL_TYPES.PRODUCER,
  "/labo": CREDENTIAL_TYPES.LABO,
  "/transporter": CREDENTIAL_TYPES.TRANSPORTER,
};

// Information displayed for each credential type
export const CREDENTIAL_INFO = {
  [CREDENTIAL_TYPES.BUYER]: {
    name: "Buyer",
    description: "Buyer access - Allows purchasing certified products",
    color: "blue",
    icon: "🛒",
  },
  [CREDENTIAL_TYPES.SELLER]: {
    name: "Seller", 
    description: "Seller access - Allows certifying and selling products",
    color: "emerald",
    icon: "🌾",
  },
  [CREDENTIAL_TYPES.PRODUCER]: {
    name: "Producer",
    description: "Producer access - Allows validating and certifying product listings",
    color: "green",
    icon: "🌱",
  },
  [CREDENTIAL_TYPES.LABO]: {
    name: "Laboratory",
    description: "Laboratory access - Allows validating and analyzing products",
    color: "amber",
    icon: "🔬",
  },
  [CREDENTIAL_TYPES.TRANSPORTER]: {
    name: "Transporter",
    description: "Transporter access - Allows managing deliveries",
    color: "purple", 
    icon: "🚚",
  },
};

// Utility function to get the required credential for a route
export function getRequiredCredential(pathname) {
  // Check exact routes
  if (ROUTE_CREDENTIALS[pathname]) {
    return ROUTE_CREDENTIALS[pathname];
  }
  
  // Check sub-routes (e.g., /buyer/orders → BUYER)
  for (const [route, credential] of Object.entries(ROUTE_CREDENTIALS)) {
    if (pathname.startsWith(route + "/") || pathname === route) {
      return credential;
    }
  }
  
  return null; // No credential required (public route)
}

// Function to check if a route requires a credential
export function isProtectedRoute(pathname) {
  return getRequiredCredential(pathname) !== null;
}
