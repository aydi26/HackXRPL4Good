"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "./providers/WalletProvider";

export function WalletConnector() {
  const { walletManager } = useWallet();
  const walletConnectorRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const setupDoneRef = useRef(false);

  // Register web component on client
  useEffect(() => {
    setIsClient(true);

    const registerWebComponent = async () => {
      try {
        const { WalletConnectorElement } = await import("xrpl-connect");

        if (!customElements.get("xrpl-wallet-connector")) {
          customElements.define("xrpl-wallet-connector", WalletConnectorElement);
        }
        setIsReady(true);
      } catch (error) {
        console.error("Failed to register wallet connector:", error);
      }
    };

    registerWebComponent();
  }, []);

  // Setup wallet manager on connector
  useEffect(() => {
    if (!isReady || !walletManager || !walletConnectorRef.current || setupDoneRef.current) {
      return;
    }

    const setupConnector = async () => {
      await customElements.whenDefined("xrpl-wallet-connector");
      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = walletConnectorRef.current;
      
      if (element && typeof element.setWalletManager === "function") {
        element.setWalletManager(walletManager);
        setupDoneRef.current = true;
      }
    };

    setupConnector();
  }, [isReady, walletManager]);

  if (!isClient) {
    return null;
  }

  return (
    <xrpl-wallet-connector
      ref={walletConnectorRef}
      id="wallet-connector"
      style={{
        "--xc-background-color": "#022c22",
        "--xc-background-secondary": "#064e3b",
        "--xc-background-tertiary": "#065f46",
        "--xc-text-color": "#ecfdf5",
        "--xc-text-muted-color": "rgba(236, 253, 245, 0.6)",
        "--xc-primary-color": "#10b981",
        "--xc-font-family": "inherit",
        "--xc-border-radius": "12px",
        "--xc-modal-box-shadow": "0 10px 40px rgba(0, 0, 0, 0.3)",
      }}
      primary-wallet="gem"
    />
  );
}

export default WalletConnector;
