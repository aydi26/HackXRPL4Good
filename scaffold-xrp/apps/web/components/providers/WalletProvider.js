"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const WalletContext = createContext(undefined);

// Debug
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[WalletProvider]", ...args);
}

// ============================================================
// ÉTAT GLOBAL - Survit aux navigations Next.js
// ============================================================
let globalWalletManager = null;
let globalIsConnected = false;
let globalAccountInfo = null;
let globalIsInitialized = false;
let globalIsAutoConnecting = false;

// Clé localStorage pour la persistance
const WALLET_STORAGE_KEY = "certichain_wallet_session";

// Sauvegarder la session dans localStorage
function saveSession(accountInfo) {
  if (typeof window !== "undefined" && accountInfo) {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({
      address: accountInfo.address,
      network: accountInfo.network,
      walletName: accountInfo.walletName,
      timestamp: Date.now(),
    }));
    log("Session saved to localStorage");
  }
}

// Charger la session depuis localStorage
function loadSession() {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!data) return null;
    
    const session = JSON.parse(data);
    // Session expire après 24h
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(WALLET_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

// Effacer la session
function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    log("Session cleared from localStorage");
  }
}

export function WalletProvider({ children }) {
  // États locaux - initialisés depuis les globaux
  const [walletManager, setWalletManager] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  
  const mountedRef = useRef(true);
  const initStartedRef = useRef(false);

  // Synchroniser état local avec état global
  const syncFromGlobal = useCallback(() => {
    if (globalWalletManager) setWalletManager(globalWalletManager);
    setIsConnected(globalIsConnected);
    setAccountInfo(globalAccountInfo);
    setIsAutoConnecting(globalIsAutoConnecting);
  }, []);

  // Mettre à jour les deux états (local + global)
  const updateConnection = useCallback((connected, account) => {
    log("updateConnection:", connected, account?.address);
    
    // Global
    globalIsConnected = connected;
    globalAccountInfo = account;
    
    // Local
    if (mountedRef.current) {
      setIsConnected(connected);
      setAccountInfo(account);
    }
    
    // Persist
    if (connected && account) {
      saveSession(account);
    } else {
      clearSession();
    }
  }, []);

  // Initialisation
  useEffect(() => {
    mountedRef.current = true;
    
    const init = async () => {
      log("=== WalletProvider Init ===");
      log("globalIsInitialized:", globalIsInitialized);
      log("globalIsConnected:", globalIsConnected);
      
      // Si déjà initialisé globalement, juste synchroniser
      if (globalIsInitialized) {
        log("Already initialized, syncing from global");
        syncFromGlobal();
        setIsReady(true);
        return;
      }
      
      // Éviter double init
      if (initStartedRef.current) {
        log("Init already started, waiting...");
        const checkReady = setInterval(() => {
          if (globalIsInitialized) {
            clearInterval(checkReady);
            syncFromGlobal();
            setIsReady(true);
          }
        }, 100);
        return;
      }
      
      initStartedRef.current = true;
      log("Starting initialization...");

      try {
        const { WalletManager, GemWalletAdapter, CrossmarkAdapter } = await import("xrpl-connect");

        const manager = new WalletManager({
          adapters: [
            new GemWalletAdapter(),
            new CrossmarkAdapter(),
          ],
          network: "testnet",
          autoConnect: true, // ACTIVÉ - autoConnect géré par xrpl-connect
        });

        // Stocker globalement
        globalWalletManager = manager;
        if (mountedRef.current) {
          setWalletManager(manager);
        }

        // Event listeners
        manager.on("connect", () => {
          log("Event: connect");
          globalIsAutoConnecting = false;
          if (mountedRef.current) setIsAutoConnecting(false);
          
          const account = manager.account;
          const wallet = manager.wallet;
          
          if (account && wallet) {
            updateConnection(true, {
              address: account.address,
              network: account.network?.name || "testnet",
              walletName: wallet.name,
            });
          }
        });

        manager.on("disconnect", () => {
          log("Event: disconnect");
          updateConnection(false, null);
        });

        manager.on("error", (error) => {
          console.error("Wallet error:", error);
          globalIsAutoConnecting = false;
          if (mountedRef.current) setIsAutoConnecting(false);
        });

        // Vérifier s'il y a une session sauvegardée pour indiquer un autoConnect en cours
        const savedSession = loadSession();
        if (savedSession) {
          log("Found saved session, autoConnect should restore it");
          globalIsAutoConnecting = true;
          if (mountedRef.current) setIsAutoConnecting(true);
          
          // Timeout de sécurité - si autoConnect échoue après 5s
          setTimeout(() => {
            if (globalIsAutoConnecting && !globalIsConnected) {
              log("AutoConnect timeout - clearing session");
              globalIsAutoConnecting = false;
              if (mountedRef.current) setIsAutoConnecting(false);
              clearSession();
            }
          }, 5000);
        }

        // Attendre un peu pour laisser autoConnect faire son travail
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Vérifier si autoConnect a fonctionné
        if (manager.connected && manager.account) {
          log("AutoConnect succeeded");
          const account = manager.account;
          const wallet = manager.wallet;
          updateConnection(true, {
            address: account.address,
            network: account.network?.name || "testnet",
            walletName: wallet.name,
          });
          globalIsAutoConnecting = false;
          if (mountedRef.current) setIsAutoConnecting(false);
        }

        globalIsInitialized = true;
        if (mountedRef.current) {
          setIsReady(true);
        }
        log("✓ Initialization complete");
        
      } catch (error) {
        console.error("Failed to initialize WalletManager:", error);
        globalIsAutoConnecting = false;
        if (mountedRef.current) {
          setIsAutoConnecting(false);
          setIsReady(true);
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;
    };
  }, [syncFromGlobal, updateConnection]);

  // Connect - seul endroit où popup s'ouvre
  const connect = useCallback(async (walletId) => {
    if (!walletManager && !globalWalletManager) {
      console.error("WalletManager not ready");
      return;
    }
    const manager = walletManager || globalWalletManager;
    log("Manual connect requested:", walletId);
    try {
      await manager.connect(walletId);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  }, [walletManager]);

  // Disconnect
  const disconnect = useCallback(async () => {
    if (!walletManager && !globalWalletManager) return;
    const manager = walletManager || globalWalletManager;
    log("Disconnect requested");
    try {
      await manager.disconnect();
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
    // Toujours mettre à jour l'état
    updateConnection(false, null);
  }, [walletManager, updateConnection]);

  return (
    <WalletContext.Provider
      value={{
        walletManager: walletManager || globalWalletManager,
        isConnected,
        accountInfo,
        isReady,
        isAutoConnecting,
        connect,
        disconnect,
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
