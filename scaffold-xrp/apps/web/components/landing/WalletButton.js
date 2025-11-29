"use client";

import { WalletConnector } from "../WalletConnector";
import { useWalletManager } from "../../hooks/useWalletManager";

export function WalletButton() {
  // Initialize the wallet manager - this is required for WalletConnector to work
  useWalletManager();

  return (
    <div className="wallet-button-wrapper">
      <WalletConnector />
    </div>
  );
}

export default WalletButton;
