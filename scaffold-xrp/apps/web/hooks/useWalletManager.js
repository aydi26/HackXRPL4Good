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
        // GemWallet first as it's more commonly used
        try {
          const gemAdapter = new GemWalletAdapter();
          adapters.push(gemAdapter);
          log("✓ GemWallet adapter added");
          
          // Vérifier si GemWallet est disponible (plusieurs façons de détecter)
          if (typeof window !== 'undefined') {
            // GemWallet peut être détecté via plusieurs méthodes
            const gemDetected = 
              window.gemwallet || 
              window.GemWallet ||
              (typeof document !== 'undefined' && document.getElementById('gemwallet-extension')) ||
              (window.chrome && window.chrome.runtime && window.chrome.runtime.getManifest);
            
            if (gemDetected) {
              log("✓ GemWallet extension detected");
            } else {
              log("⚠ GemWallet extension not detected (may not be installed)");
              log("Note: This is normal if the extension is not installed. Users can still connect if they install it.");
              log("The adapter will still work - users just need to install the extension first.");
            }
          }
        } catch (error) {
          console.warn("Failed to add GemWallet adapter:", error);
          log("⚠ GemWallet adapter error:", error.message);
        }
        
        try {
          const crossmarkAdapter = new CrossmarkAdapter();
          adapters.push(crossmarkAdapter);
          log("✓ Crossmark adapter added");
        } catch (error) {
          console.warn("Failed to add Crossmark adapter:", error);
          log("⚠ Crossmark adapter error:", error.message);
        }

        log("Creating WalletManager with adapters:", adapters.map(a => a.constructor.name));

        const manager = new WalletManager({
          adapters,
          network: "testnet",
          // Activer autoConnect pour maintenir la connexion entre les sessions
          autoConnect: true,
          logger: { level: "info" },
        });
        
        log("WalletManager created with", adapters.length, "adapters");

        // Stocker globalement
        globalWalletManager = manager;
        setWalletManager(manager);

        // Event listeners
        manager.on("connect", (account) => {
          log("Event: connect", account);
          addEvent("Connected", account);
          showStatus("Wallet connected successfully!", "success");
          if (updateConnectionStateRef.current) {
            updateConnectionStateRef.current(manager);
          }
        });

        manager.on("disconnect", () => {
          log("Event: disconnect");
          addEvent("Disconnected", null);
          showStatus("Wallet disconnected", "info");
          if (updateConnectionStateRef.current) {
            updateConnectionStateRef.current(manager);
          }
        });

        manager.on("error", (error) => {
          log("Event: error", error);
          addEvent("Error", error);
          
          let errorMessage = error.message || "Erreur de connexion";
          
          // Messages spécifiques pour GemWallet
          const lowerError = errorMessage.toLowerCase();
          if (lowerError.includes('gem') || lowerError.includes('gemwallet')) {
            if (lowerError.includes('not found') || lowerError.includes('not installed') || lowerError.includes('extension')) {
              errorMessage = "GemWallet n'est pas installé. Veuillez installer l'extension GemWallet depuis le Chrome Web Store ou Firefox Add-ons.";
            } else if (lowerError.includes('rejected') || lowerError.includes('denied') || lowerError.includes('user')) {
              errorMessage = "Connexion refusée par GemWallet. Veuillez autoriser la connexion dans la popup GemWallet.";
            } else if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
              errorMessage = "Délai d'attente dépassé. Veuillez réessayer la connexion.";
            } else if (lowerError.includes('network') || lowerError.includes('connection')) {
              errorMessage = "Erreur de réseau avec GemWallet. Vérifiez votre connexion internet.";
            }
          }
          
          showStatus(errorMessage, "error");
        });

        // Vérifier si déjà connecté (session existante ou autoConnect)
        log("Checking initial connection state...");
        log("manager.connected:", manager.connected);
        log("manager.account:", manager.account);
        log("manager.wallet:", manager.wallet);
        
        // Vérifier immédiatement l'état de connexion
        if (manager.connected && manager.account) {
          log("Already connected, updating state immediately...");
          updateConnectionStateRef.current(manager);
        } else {
          log("Not connected yet, waiting for autoConnect...");
          // Attendre que autoConnect se déclenche si nécessaire (max 3 secondes)
          let checkCount = 0;
          const maxChecks = 6; // 6 * 500ms = 3 secondes max
          
          const checkConnection = () => {
            checkCount++;
            if (manager.connected && manager.account) {
              log("Auto-connected, updating state...");
              showStatus("Wallet reconnected from previous session", "success");
              updateConnectionStateRef.current(manager);
            } else if (checkCount < maxChecks) {
              // Vérifier périodiquement
              setTimeout(checkConnection, 500);
            } else {
              log("AutoConnect timeout - user needs to connect manually");
            }
          };
          setTimeout(checkConnection, 500);
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
