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

// Cache global des credentials (survit aux re-renders)
let credentialsCache = {
  walletAddress: null,
  accessMap: null,
  credentials: [],
  timestamp: 0,
};

// Durée de validité du cache (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref pour éviter les doubles appels (local au composant)
  const fetchingRef = useRef(false);
  const lastFetchedAddressRef = useRef(null);

  // Adresse du wallet
  const walletAddress = accountInfo?.address || null;

  log("=== Render ===");
  log("isConnected:", isConnected);
  log("walletAddress:", walletAddress);
  log("isLoading:", isLoading);
  log("isInitialized:", isInitialized);
  log("cache:", credentialsCache);

  /**
   * Récupère les credentials depuis le ledger XRPL
   */
  const fetchCredentials = useCallback(async (forceRefresh = false) => {
    log("fetchCredentials called - walletAddress:", walletAddress, "forceRefresh:", forceRefresh);
    
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

    // Vérifier le cache global
    const now = Date.now();
    const cacheValid = 
      credentialsCache.walletAddress === walletAddress &&
      credentialsCache.accessMap &&
      (now - credentialsCache.timestamp) < CACHE_DURATION;
    
    if (cacheValid && !forceRefresh) {
      log("✓ Using cached credentials for", walletAddress);
      setCredentials(credentialsCache.credentials);
      setAccessMap(credentialsCache.accessMap);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    // Éviter les appels multiples simultanés pour la même adresse
    if (fetchingRef.current && lastFetchedAddressRef.current === walletAddress) {
      log("Already fetching for this address, skipping...");
      return;
    }

    fetchingRef.current = true;
    lastFetchedAddressRef.current = walletAddress;
    setIsLoading(true);
    setError(null);

    log("🔄 Fetching credentials for wallet:", walletAddress);
    log("Using ISSUER_ADDRESS:", ISSUER_ADDRESS);

    // Retry logic
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        log(`Attempt ${attempt}/${maxRetries}...`);
        
        // Petit délai entre les tentatives
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        
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

        // Mettre à jour le cache global
        credentialsCache = {
          walletAddress,
          accessMap: accessResult,
          credentials: credentialsResult.credentials,
          timestamp: Date.now(),
        };

        setCredentials(credentialsResult.credentials);
        setAccessMap(accessResult);
        setError(null);
        
        log("✅ Credentials set. Access map:", accessResult);
        
        // Succès, sortir de la boucle
        break;
        
      } catch (err) {
        log(`❌ Attempt ${attempt} failed:`, err.message);
        lastError = err;
        
        if (attempt === maxRetries) {
          console.error("CredentialProvider: All retries failed", err);
          setError(err.message);
        }
      }
    }
    
    setIsLoading(false);
    setIsInitialized(true);
    fetchingRef.current = false;
    log("✓ Fetch complete, isLoading=false, isInitialized=true");
  }, [walletAddress]);

  /**
   * Vérifie si l'utilisateur a un credential
   */
  const hasCredential = useCallback(
    (credentialType) => {
      const result = accessMap[credentialType] === true;
      log("hasCredential check:", credentialType, "=", result);
      return result;
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

  // Effet principal : fetch credentials quand wallet change
  useEffect(() => {
    log("Main effect - walletAddress:", walletAddress, "isInitialized:", isInitialized);
    
    if (walletAddress) {
      // On a une adresse, fetch les credentials
      fetchCredentials();
    } else {
      // Pas d'adresse
      if (isConnected === false) {
        // Explicitement déconnecté, reset tout
        log("Wallet explicitly disconnected, resetting");
        setCredentials([]);
        setAccessMap({
          [CREDENTIAL_TYPES.BUYER]: false,
          [CREDENTIAL_TYPES.SELLER]: false,
          [CREDENTIAL_TYPES.LABO]: false,
          [CREDENTIAL_TYPES.TRANSPORTER]: false,
        });
        setError(null);
        setIsLoading(false);
        setIsInitialized(true);
        // Vider le cache
        credentialsCache = {
          walletAddress: null,
          accessMap: null,
          credentials: [],
          timestamp: 0,
        };
      } else {
        // Pas encore d'adresse, attendre un peu
        const timeout = setTimeout(() => {
          if (!walletAddress) {
            log("Timeout: still no wallet address, marking initialized");
            setIsLoading(false);
            setIsInitialized(true);
          }
        }, 1500);
        return () => clearTimeout(timeout);
      }
    }
  }, [walletAddress, isConnected, fetchCredentials]);

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
    refreshCredentials: () => fetchCredentials(true), // Force refresh
    
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
