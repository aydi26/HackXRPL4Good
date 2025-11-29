"use client";

import { WalletConnector } from "../WalletConnector";

export function WalletButton() {
  // Le WalletManager est maintenant initialisé dans le layout via WalletInitializer
  // Plus besoin de l'appeler ici

  return (
    <div className="wallet-button-wrapper">
      <WalletConnector />
    </div>
  );
}

export default WalletButton;
