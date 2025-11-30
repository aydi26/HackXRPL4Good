/**
 * Hook React pour gérer les credentials de l'utilisateur connecté
 * 
 * Ce hook récupère automatiquement les credentials quand le wallet
 * est connecté et fournit des méthodes utilitaires pour vérifier les accès.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../components/providers/WalletProvider";
import { 
  getUserCredentials, 
  checkCredential, 
  checkAllCredentials,
  disconnectClient 
} from "../lib/xrplCredentialService";
import { CREDENTIAL_TYPES, CREDENTIAL_INFO } from "../lib/credentials";

/**
 * Hook pour gérer les credentials de l'utilisateur
 * 
 * @returns {object} État et méthodes pour les credentials
 */
export function useCredentials() {
  const { accountInfo, isConnected } = useWallet();
  
  // État des credentials
  const [credentials, setCredentials] = useState([]);
  const [accessMap, setAccessMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Adresse du wallet connecté
  const walletAddress = accountInfo?.address || null;

  /**
   * Récupère tous les credentials de l'utilisateur
   */
  const fetchCredentials = useCallback(async () => {
    if (!walletAddress) {
      setCredentials([]);
      setAccessMap({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Récupérer les credentials et vérifier tous les types en parallèle
      const [credentialsResult, accessResult] = await Promise.all([
        getUserCredentials(walletAddress),
        checkAllCredentials(walletAddress),
      ]);

      if (credentialsResult.error) {
        setError(credentialsResult.error);
      } else {
        setCredentials(credentialsResult.credentials);
      }

      setAccessMap(accessResult);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Erreur lors de la récupération des credentials:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  /**
   * Vérifie si l'utilisateur a un credential spécifique
   * 
   * @param {string} credentialType - Type de credential (ex: CREDENTIAL_TYPES.BUYER)
   * @returns {boolean}
   */
  const hasCredential = useCallback(
    (credentialType) => {
      return accessMap[credentialType] === true;
    },
    [accessMap]
  );

  /**
   * Vérifie si l'utilisateur a accès à une section
   * 
   * @param {"buyer" | "seller" | "labo" | "transporter"} section
   * @returns {boolean}
   */
  const hasAccess = useCallback(
    (section) => {
      const typeMap = {
        buyer: CREDENTIAL_TYPES.BUYER,
        seller: CREDENTIAL_TYPES.SELLER,
        labo: CREDENTIAL_TYPES.LABO,
        transporter: CREDENTIAL_TYPES.TRANSPORTER,
      };
      
      const credentialType = typeMap[section.toLowerCase()];
      return credentialType ? hasCredential(credentialType) : false;
    },
    [hasCredential]
  );

  /**
   * Obtient les informations détaillées d'un credential
   * 
   * @param {string} credentialType 
   * @returns {object|null}
   */
  const getCredentialInfo = useCallback((credentialType) => {
    return CREDENTIAL_INFO[credentialType] || null;
  }, []);

  /**
   * Obtient la liste des sections accessibles
   * 
   * @returns {string[]} Liste des sections (ex: ["buyer", "seller"])
   */
  const getAccessibleSections = useCallback(() => {
    const sections = [];
    
    if (hasCredential(CREDENTIAL_TYPES.BUYER)) sections.push("buyer");
    if (hasCredential(CREDENTIAL_TYPES.SELLER)) sections.push("seller");
    if (hasCredential(CREDENTIAL_TYPES.LABO)) sections.push("labo");
    if (hasCredential(CREDENTIAL_TYPES.TRANSPORTER)) sections.push("transporter");
    
    return sections;
  }, [hasCredential]);

  // Effet pour récupérer les credentials quand le wallet change
  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchCredentials();
    } else {
      // Reset quand déconnecté
      setCredentials([]);
      setAccessMap({});
      setError(null);
    }
  }, [isConnected, walletAddress, fetchCredentials]);

  // Cleanup à la déconnexion
  useEffect(() => {
    return () => {
      disconnectClient();
    };
  }, []);

  return {
    // État
    credentials,
    accessMap,
    isLoading,
    error,
    lastUpdated,
    walletAddress,
    isConnected,
    
    // Méthodes de vérification
    hasCredential,
    hasAccess,
    getCredentialInfo,
    getAccessibleSections,
    
    // Actions
    refreshCredentials: fetchCredentials,
    
    // Constantes utiles
    CREDENTIAL_TYPES,
  };
}

export default useCredentials;
