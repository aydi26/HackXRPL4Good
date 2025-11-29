/**
 * Composant qui initialise le WalletManager au niveau global
 * 
 * Ce composant doit être placé dans le layout pour que le wallet
 * soit disponible partout dans l'application.
 */

"use client";

import { useWalletManager } from "../hooks/useWalletManager";

export function WalletInitializer({ children }) {
  // Initialise le wallet manager globalement
  useWalletManager();
  
  return <>{children}</>;
}

export default WalletInitializer;
