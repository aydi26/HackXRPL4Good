"use client";

import { useEffect } from "react";

/**
 * WalletConflictProtection
 * 
 * Protects against conflicts with browser wallet extensions (like MetaMask)
 * that try to redefine window.ethereum, which can cause runtime errors.
 * 
 * This component wraps Object.defineProperty to catch and handle
 * ethereum redefinition errors gracefully.
 */
export function WalletConflictProtection() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Store original defineProperty
    const originalDefineProperty = Object.defineProperty;
    let isProtected = false;

    // Wrap Object.defineProperty to catch ethereum redefinition errors
    Object.defineProperty = function(obj, prop, descriptor) {
      // Check if this is an attempt to define ethereum on window
      if (obj === window && prop === "ethereum") {
        try {
          // Try to call the original defineProperty
          return originalDefineProperty.call(this, obj, prop, descriptor);
        } catch (error) {
          // If it's an ethereum redefinition error, handle it gracefully
          if (error.message && error.message.includes("Cannot redefine property: ethereum")) {
            console.warn(
              "[WalletConflictProtection] Wallet extension conflict detected. " +
              "An EVM wallet extension (like MetaMask) is trying to redefine window.ethereum. " +
              "This is harmless for XRPL wallets. The error has been caught and the app will continue."
            );
            // Return window to avoid breaking the extension's code
            return window;
          }
          // Re-throw other errors
          throw error;
        }
      }
      
      // For all other cases, use the original defineProperty
      return originalDefineProperty.call(this, obj, prop, descriptor);
    };

    // Mark as protected
    isProtected = true;

    // Global error handler for uncaught errors
    const handleError = (event) => {
      // Check if it's an ethereum redefinition error
      if (event.error && event.error.message && 
          event.error.message.includes("Cannot redefine property: ethereum")) {
        console.warn(
          "[WalletConflictProtection] Caught ethereum redefinition error. " +
          "This is likely due to multiple wallet extensions. " +
          "The app will continue to work normally."
        );
        event.preventDefault(); // Prevent the error from crashing the app
      }
    };

    window.addEventListener("error", handleError);

    // Cleanup on unmount
    return () => {
      if (isProtected) {
        Object.defineProperty = originalDefineProperty;
        window.removeEventListener("error", handleError);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}

