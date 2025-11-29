"use client";

import { useEffect, useRef } from "react";
import { useWallet } from "../components/providers/WalletProvider";

// Configuration - Replace with your API keys
const XAMAN_API_KEY = process.env.NEXT_PUBLIC_XAMAN_API_KEY || "";
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Debug
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[WalletManager]", ...args);
}

// Singleton global pour le wallet manager (survit aux re-renders et navigations)
let globalWalletManager = null;
let globalInitializing = false;
let globalInitialized = false;

export function useWalletManager() {
  const { walletManager, setWalletManager, setIsConnected, setAccountInfo, addEvent, showStatus } =
    useWallet();
  
  // Ref locale pour updateConnectionState (pour accéder aux setters React)
  const updateConnectionStateRef = useRef(null);
  
  // Stocker la fonction de mise à jour dans le ref
  updateConnectionStateRef.current = (manager) => {
    const connected = manager.connected;
    log("updateConnectionState - connected:", connected);
    
    setIsConnected(connected);

    if (connected) {
      const account = manager.account;
      const wallet = manager.wallet;

      log("Account:", account);
      log("Wallet:", wallet);

      if (account && wallet) {
        const accountData = {
          address: account.address,
          network: `${account.network.name} (${account.network.id})`,
          walletName: wallet.name,
        };
        log("Setting accountInfo:", accountData);
        setAccountInfo(accountData);
      }
    } else {
      log("Setting accountInfo to null");
      setAccountInfo(null);
    }
  };

  useEffect(() => {
    // Si on a déjà un manager global, le réutiliser
    if (globalWalletManager && globalInitialized) {
      log("Reusing existing global wallet manager");
      setWalletManager(globalWalletManager);
      
      // Mettre à jour l'état de connexion
      if (globalWalletManager.connected) {
        updateConnectionStateRef.current(globalWalletManager);
      }
      return;
    }
    
    // Éviter les doubles initialisations
    if (globalInitializing) {
      log("Already initializing globally, skipping...");
      return;
    }
    
    // Dynamic import to avoid SSR issues
    const initWalletManager = async () => {
      globalInitializing = true;
      
      try {
        log("Initializing wallet manager...");
        
        const {
          WalletManager,
          XamanAdapter,
          WalletConnectAdapter,
          CrossmarkAdapter,
          GemWalletAdapter,
        } = await import("xrpl-connect");

        const adapters = [];

        // Only add Xaman if API key is available
        if (XAMAN_API_KEY) {
          adapters.push(new XamanAdapter({ apiKey: XAMAN_API_KEY }));
        }

        // Only add WalletConnect if project ID is available
        if (WALLETCONNECT_PROJECT_ID) {
          adapters.push(new WalletConnectAdapter({ projectId: WALLETCONNECT_PROJECT_ID }));
        }

        // Add browser extension wallets (no config needed)
        adapters.push(new CrossmarkAdapter());
        adapters.push(new GemWalletAdapter());

        log("Creating WalletManager with adapters:", adapters.map(a => a.constructor.name));

        const manager = new WalletManager({
          adapters,
          network: "testnet",
          // Désactiver autoConnect pour éviter les popups intempestifs
          autoConnect: false,
          logger: { level: "info" },
        });

        // Stocker globalement
        globalWalletManager = manager;
        setWalletManager(manager);

        // Event listeners
        manager.on("connect", (account) => {
          log("Event: connect", account);
          addEvent("Connected", account);
          if (updateConnectionStateRef.current) {
            updateConnectionStateRef.current(manager);
          }
        });

        manager.on("disconnect", () => {
          log("Event: disconnect");
          addEvent("Disconnected", null);
          if (updateConnectionStateRef.current) {
            updateConnectionStateRef.current(manager);
          }
        });

        manager.on("error", (error) => {
          log("Event: error", error);
          addEvent("Error", error);
          showStatus(error.message, "error");
        });

        // Vérifier si déjà connecté (session existante)
        log("Checking initial connection state...");
        log("manager.connected:", manager.connected);
        log("manager.account:", manager.account);
        log("manager.wallet:", manager.wallet);
        
        if (manager.connected && manager.account) {
          log("Already connected, updating state...");
          showStatus("Wallet reconnected from previous session", "success");
          updateConnectionStateRef.current(manager);
        } else {
          log("Not connected, user needs to connect manually");
        }

        globalInitialized = true;
        log("✓ Wallet manager initialized");
      } catch (error) {
        console.error("Failed to initialize wallet manager:", error);
        showStatus("Failed to initialize wallet connection", "error");
      } finally {
        globalInitializing = false;
      }
    };

    initWalletManager();
  }, [setWalletManager, setIsConnected, setAccountInfo, addEvent, showStatus]);

  return { walletManager: walletManager || globalWalletManager };
}
