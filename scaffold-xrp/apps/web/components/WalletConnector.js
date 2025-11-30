"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "./providers/WalletProvider";

// Debug
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[WalletConnectorComponent]", ...args);
}

// Tracker global pour éviter les setups multiples
let connectorSetupDone = false;

const THEMES = {
  dark: {
    "--xc-background-color": "#1a202c",
    "--xc-background-secondary": "#2d3748",
    "--xc-background-tertiary": "#4a5568",
    "--xc-text-color": "#F5F4E7",
    "--xc-text-muted-color": "rgba(245, 244, 231, 0.6)",
    "--xc-primary-color": "#3b99fc",
  },
  light: {
    "--xc-background-color": "#ffffff",
    "--xc-background-secondary": "#f5f5f5",
    "--xc-background-tertiary": "#eeeeee",
    "--xc-text-color": "#111111",
    "--xc-text-muted-color": "rgba(17, 17, 17, 0.6)",
    "--xc-primary-color": "#2563eb",
  },
  purple: {
    "--xc-background-color": "#1e1b4b",
    "--xc-background-secondary": "#2d2659",
    "--xc-background-tertiary": "#3d3261",
    "--xc-text-color": "#f3e8ff",
    "--xc-text-muted-color": "rgba(243, 232, 255, 0.6)",
    "--xc-primary-color": "#a78bfa",
  },
  emerald: {
    "--xc-background-color": "#022c22",
    "--xc-background-secondary": "#064e3b",
    "--xc-background-tertiary": "#065f46",
    "--xc-text-color": "#ecfdf5",
    "--xc-text-muted-color": "rgba(236, 253, 245, 0.6)",
    "--xc-primary-color": "#10b981",
  },
};

export function WalletConnector() {
  const { walletManager, addEvent, showStatus } = useWallet();
  const walletConnectorRef = useRef(null);
  const [currentTheme] = useState("emerald");
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const localSetupRef = useRef(false);

  // Register web component on client
  useEffect(() => {
    setIsClient(true);

    const registerWebComponent = async () => {
      try {
        log("Registering web component...");
        const { WalletConnectorElement } = await import("xrpl-connect");

        if (!customElements.get("xrpl-wallet-connector")) {
          customElements.define("xrpl-wallet-connector", WalletConnectorElement);
          log("✓ Web component registered");
        } else {
          log("Web component already registered");
        }
        setIsReady(true);
      } catch (error) {
        console.error("Failed to register wallet connector:", error);
      }
    };

    registerWebComponent();
  }, []);

  // Setup wallet manager on connector when both are ready
  useEffect(() => {
    log("Setup effect - isReady:", isReady, "walletManager:", !!walletManager, "ref:", !!walletConnectorRef.current, "localSetup:", localSetupRef.current);
    
    if (!isReady || !walletManager || !walletConnectorRef.current) {
      return;
    }
    
    // Éviter les setups multiples pour ce composant
    if (localSetupRef.current) {
      log("Local setup already done");
      return;
    }

    const setupConnector = async () => {
      log("Setting up connector with wallet manager...");
      
      await customElements.whenDefined("xrpl-wallet-connector");
      
      // Attendre que l'élément soit complètement initialisé
      await new Promise((resolve) => setTimeout(resolve, 200));

      const element = walletConnectorRef.current;
      
      if (element && typeof element.setWalletManager === "function") {
        log("Calling setWalletManager on element");
        element.setWalletManager(walletManager);
        localSetupRef.current = true;

        // Event listeners - seulement si pas déjà fait globalement
        if (!connectorSetupDone) {
          const handleConnecting = (e) => {
            log("Event: connecting", e.detail);
            showStatus(`Connexion à ${e.detail?.walletId || 'wallet'}...`, "info");
          };

          const handleConnected = (e) => {
            log("Event: connected", e.detail);
            showStatus("Connecté avec succès!", "success");
            addEvent("Connected", e.detail);
          };

          const handleError = (e) => {
            log("Event: error", e.detail);
            const errorDetail = e.detail;
            let errorMessage = "Échec de connexion";
            
            if (errorDetail?.error) {
              if (errorDetail.error.message) {
                errorMessage = errorDetail.error.message;
              } else if (typeof errorDetail.error === 'string') {
                errorMessage = errorDetail.error;
              }
            }
            
            // Messages spécifiques pour GemWallet
            const walletId = errorDetail?.walletId?.toLowerCase() || '';
            const lowerError = errorMessage.toLowerCase();
            
            if (walletId.includes('gem') || lowerError.includes('gem')) {
              if (lowerError.includes('not found') || lowerError.includes('not installed') || lowerError.includes('extension')) {
                errorMessage = "GemWallet n'est pas installé. Veuillez installer l'extension GemWallet depuis le Chrome Web Store ou Firefox Add-ons.";
              } else if (lowerError.includes('rejected') || lowerError.includes('denied') || lowerError.includes('user')) {
                errorMessage = "Connexion refusée. Veuillez autoriser la connexion dans la popup GemWallet.";
              } else if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
                errorMessage = "Délai d'attente dépassé. Veuillez réessayer la connexion.";
              } else if (lowerError.includes('network') || lowerError.includes('connection')) {
                errorMessage = "Erreur de réseau avec GemWallet. Vérifiez votre connexion internet.";
              }
            }
            
            showStatus(errorMessage, "error");
            addEvent("Error", e.detail);
          };

          const handleDisconnected = (e) => {
            log("Event: disconnected");
            addEvent("Disconnected", null);
          };

          element.addEventListener("connecting", handleConnecting);
          element.addEventListener("connected", handleConnected);
          element.addEventListener("error", handleError);
          element.addEventListener("disconnected", handleDisconnected);
          
          connectorSetupDone = true;
          log("✓ Connector event listeners attached");
        }

        log("✓ Connector setup complete with wallet manager");
      } else {
        log("⚠ setWalletManager not available, element:", element);
        log("Element methods:", element ? Object.keys(element) : 'null');
      }
    };

    setupConnector();
  }, [isReady, walletManager, addEvent, showStatus]);

  if (!isClient) {
    return null;
  }

  log("Rendering - isReady:", isReady, "walletManager:", !!walletManager);

  return (
    <xrpl-wallet-connector
      ref={walletConnectorRef}
      id="wallet-connector"
      style={{
        ...THEMES[currentTheme],
        "--xc-font-family": "inherit",
        "--xc-border-radius": "12px",
        "--xc-modal-box-shadow": "0 10px 40px rgba(0, 0, 0, 0.3)",
      }}
      primary-wallet="gem"
    />
  );
}
