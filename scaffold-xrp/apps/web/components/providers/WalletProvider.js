"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const WalletContext = createContext(undefined);

// Debug
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[WalletProvider]", ...args);
}

// Clé pour le sessionStorage
const WALLET_SESSION_KEY = "certichain_wallet_session";

export function WalletProvider({ children }) {
  const [walletManager, setWalletManagerState] = useState(null);
  const [isConnected, setIsConnectedState] = useState(false);
  const [accountInfo, setAccountInfoState] = useState(null);
  const [events, setEvents] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  
  // Ref pour le manager singleton
  const managerRef = useRef(null);

  // Restaurer la session au montage (côté client uniquement)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSession = sessionStorage.getItem(WALLET_SESSION_KEY);
        if (savedSession) {
          const session = JSON.parse(savedSession);
          log("Restored session from storage:", session);
          if (session.accountInfo) {
            setAccountInfoState(session.accountInfo);
            setIsConnectedState(true);
          }
        }
      } catch (e) {
        log("Failed to restore session:", e);
      }
    }
  }, []);

  const setWalletManager = useCallback((manager) => {
    log("setWalletManager called");
    managerRef.current = manager;
    setWalletManagerState(manager);
  }, []);

  const setIsConnected = useCallback((connected) => {
    log("setIsConnected:", connected);
    setIsConnectedState(connected);
  }, []);

  const setAccountInfo = useCallback((info) => {
    log("setAccountInfo:", info);
    setAccountInfoState(info);
    
    // Persister dans sessionStorage
    if (typeof window !== 'undefined') {
      try {
        if (info) {
          sessionStorage.setItem(WALLET_SESSION_KEY, JSON.stringify({
            accountInfo: info,
            timestamp: Date.now()
          }));
          log("Session saved to storage");
        } else {
          sessionStorage.removeItem(WALLET_SESSION_KEY);
          log("Session cleared from storage");
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

  log("Render - isConnected:", isConnected, "accountInfo:", accountInfo);

  return (
    <WalletContext.Provider
      value={{
        walletManager: walletManager || managerRef.current,
        isConnected,
        accountInfo,
        events,
        statusMessage,
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
