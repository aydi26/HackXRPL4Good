"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const WalletContext = createContext(undefined);

// Debug
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[WalletProvider]", ...args);
}

// Clé pour le localStorage (persiste même après fermeture du navigateur)
const WALLET_SESSION_KEY = "certichain_wallet_session";

// Variable globale pour la session (survit aux re-renders)
let globalSession = null;

export function WalletProvider({ children }) {
  const [walletManager, setWalletManagerState] = useState(null);
  const [isConnected, setIsConnectedState] = useState(false);
  const [accountInfo, setAccountInfoState] = useState(null);
  const [events, setEvents] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  
  // Ref pour le manager singleton
  const managerRef = useRef(null);

  // Restaurer la session au montage (côté client uniquement) - UNE SEULE FOIS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Si déjà restauré globalement, utiliser les données globales
    if (globalSession) {
      log("Using global session:", globalSession);
      setAccountInfoState(globalSession.accountInfo);
      setIsConnectedState(true);
      setIsSessionRestored(true);
      return;
    }
    
    try {
      const savedSession = localStorage.getItem(WALLET_SESSION_KEY);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        log("Restored session from storage:", session);
        
        // Vérifier que la session n'est pas trop vieille (7 jours max)
        const age = Date.now() - (session.timestamp || 0);
        if (age < 7 * 24 * 60 * 60 * 1000 && session.accountInfo) {
          globalSession = session;
          setAccountInfoState(session.accountInfo);
          setIsConnectedState(true);
          log("✓ Session restored successfully");
        } else {
          log("Session expired or invalid, clearing");
          localStorage.removeItem(WALLET_SESSION_KEY);
        }
      } else {
        log("No saved session found");
      }
    } catch (e) {
      log("Failed to restore session:", e);
    }
    
    setIsSessionRestored(true);
  }, []);

  const setWalletManager = useCallback((manager) => {
    log("setWalletManager called");
    managerRef.current = manager;
    setWalletManagerState(manager);
  }, []);

  const setIsConnected = useCallback((connected) => {
    log("setIsConnected:", connected);
    setIsConnectedState(connected);
    
    // Si déconnexion, vider la session globale et le localStorage
    if (!connected) {
      globalSession = null;
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(WALLET_SESSION_KEY);
          log("Session cleared on disconnect");
        } catch (e) {
          log("Failed to clear session on disconnect:", e);
        }
      }
    }
  }, []);

  const setAccountInfo = useCallback((info) => {
    log("setAccountInfo:", info);
    setAccountInfoState(info);
    
    // Mettre à jour la session globale
    if (info) {
      globalSession = {
        accountInfo: info,
        timestamp: Date.now()
      };
    } else {
      globalSession = null;
    }
    
    // Persister dans localStorage (persiste même après fermeture du navigateur)
    if (typeof window !== 'undefined') {
      try {
        if (info) {
          localStorage.setItem(WALLET_SESSION_KEY, JSON.stringify({
            accountInfo: info,
            timestamp: Date.now()
          }));
          log("Session saved to localStorage");
        } else {
          localStorage.removeItem(WALLET_SESSION_KEY);
          log("Session cleared from localStorage");
        }
      } catch (e) {
        log("Failed to save session:", e);
      }
    }
  }, []);

  const addEvent = useCallback((name, data) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [{ timestamp, name, data }, ...prev]);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const showStatus = useCallback((message, type) => {
    setStatusMessage({ message, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  }, []);

  log("Render - isConnected:", isConnected, "accountInfo:", accountInfo?.address, "isSessionRestored:", isSessionRestored);

  return (
    <WalletContext.Provider
      value={{
        walletManager: walletManager || managerRef.current,
        isConnected,
        accountInfo,
        events,
        statusMessage,
        isSessionRestored,
        setWalletManager,
        setIsConnected,
        setAccountInfo,
        addEvent,
        clearEvents,
        showStatus,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}