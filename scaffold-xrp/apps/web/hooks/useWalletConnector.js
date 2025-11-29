"use client";

import { useEffect, useRef } from "react";
import { useWallet } from "../components/providers/WalletProvider";

// Debug
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[WalletConnector]", ...args);
}

export function useWalletConnector(walletManager) {
  const walletConnectorRef = useRef(null);
  const { addEvent, showStatus } = useWallet();
  const setupDoneRef = useRef(false);

  useEffect(() => {
    log("useEffect triggered - walletManager:", !!walletManager, "ref:", !!walletConnectorRef.current);
    
    if (!walletConnectorRef.current) {
      log("No ref yet, waiting...");
      return;
    }
    
    if (!walletManager) {
      log("No walletManager yet, waiting...");
      return;
    }

    const setupConnector = async () => {
      // Éviter les doubles setups
      if (setupDoneRef.current) {
        log("Setup already done, skipping...");
        return;
      }

      log("Setting up connector...");
      
      // Wait for custom element to be defined and upgraded
      await customElements.whenDefined("xrpl-wallet-connector");
      log("Custom element defined");

      // Small delay to ensure the element is fully initialized
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (
        walletConnectorRef.current &&
        typeof walletConnectorRef.current.setWalletManager === "function"
      ) {
        log("Setting wallet manager on connector element");
        walletConnectorRef.current.setWalletManager(walletManager);
        setupDoneRef.current = true;

        // Listen to connector events
        const handleConnecting = (e) => {
          log("Event: connecting", e.detail);
          showStatus(`Connecting to ${e.detail.walletId}...`, "info");
        };

        const handleConnected = (e) => {
          log("Event: connected", e.detail);
          showStatus("Connected successfully!", "success");
          addEvent("Connected via Web Component", e.detail);
        };

        const handleError = (e) => {
          log("Event: error", e.detail);
          showStatus(`Connection failed: ${e.detail.error.message}`, "error");
          addEvent("Connection Error", e.detail);
        };

        walletConnectorRef.current.addEventListener("connecting", handleConnecting);
        walletConnectorRef.current.addEventListener("connected", handleConnected);
        walletConnectorRef.current.addEventListener("error", handleError);

        log("✓ Connector setup complete");

        return () => {
          if (walletConnectorRef.current) {
            walletConnectorRef.current.removeEventListener("connecting", handleConnecting);
            walletConnectorRef.current.removeEventListener("connected", handleConnected);
            walletConnectorRef.current.removeEventListener("error", handleError);
          }
        };
      } else {
        log("setWalletManager function not available on element");
      }
    };

    setupConnector();
  }, [walletManager, addEvent, showStatus]);

  return walletConnectorRef;
}
