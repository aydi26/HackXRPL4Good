/**
 * Route protection component based on Verifiable Credentials
 * 
 * This component checks if the user possesses the required credential
 * to access the content. Otherwise, it displays an unauthorized access message
 * or redirects to an appropriate page.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCredentialContext } from "./providers/CredentialProvider";
import { CREDENTIAL_INFO, CREDENTIAL_TYPES, ISSUER_ADDRESS } from "../lib/credentials";

// Debug log
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[ProtectedRoute]", ...args);
}

/**
 * Composant de protection de route
 */
export function ProtectedRoute({
  requiredCredential,
  children,
  fallback,
  redirectTo,
  showUnauthorized = true,
}) {
  const router = useRouter();
  const { 
    hasCredential, 
    isLoading, 
    isInitialized, 
    walletAddress,
    isConnected,
    accessMap,
    credentials,
    error
  } = useCredentialContext();

  // Normalize credential type
  const credentialType = CREDENTIAL_TYPES[requiredCredential.toUpperCase()] || requiredCredential;
  const credentialInfo = CREDENTIAL_INFO[credentialType];

  // Check access
  const hasAccess = hasCredential(credentialType);
  
  // Wallet is connected if we have an address OR if isConnected is true
  const walletIsConnected = Boolean(walletAddress) || isConnected;

  // Debug détaillé
  log("=== ProtectedRoute Render ===");
  log("requiredCredential (prop):", requiredCredential);
  log("credentialType (normalized):", credentialType);
  log("CREDENTIAL_TYPES:", CREDENTIAL_TYPES);
  log("ISSUER_ADDRESS:", ISSUER_ADDRESS);
  log("---");
  log("isLoading:", isLoading);
  log("isInitialized:", isInitialized);
  log("walletAddress:", walletAddress);
  log("isConnected:", isConnected);
  log("walletIsConnected:", walletIsConnected);
  log("---");
  log("hasAccess:", hasAccess);
  log("accessMap:", accessMap);
  log("credentials:", credentials);
  log("error:", error);
  log("===========================");

  // Loading state
  if (isLoading || !isInitialized) {
    log("Rendering: LoadingState");
    return <LoadingState />;
  }

  // Wallet not connected
  if (!walletIsConnected) {
    log("Rendering: WalletNotConnected");
    return <WalletNotConnected />;
  }

  // Wallet connected but missing required credential
  if (!hasAccess) {
    log("Rendering: UnauthorizedContent (no access)");
    if (redirectTo) {
      router.push(redirectTo);
      return <LoadingState />;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUnauthorized) {
      return <UnauthorizedContent 
        credentialInfo={credentialInfo} 
        credentialType={credentialType}
        walletAddress={walletAddress}
        accessMap={accessMap}
        error={error}
      />;
    }

    return null;
  }

  // Access granted
  log("Rendering: Children (access granted!)");
  return <>{children}</>;
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
        <p className="text-white/70">Verifying credentials...</p>
      </div>
    </div>
  );
}

/**
 * Wallet not connected component
 */
function WalletNotConnected() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="max-w-md w-full text-center">
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-6xl mb-6">🔗</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Wallet not connected
          </h2>
          <p className="text-white/60 mb-6">
            Please connect your wallet to access this section.
            Your wallet must possess the appropriate credential.
          </p>
          <div className="text-sm text-white/40">
            Use the connection button in the top right corner
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Unauthorized access component
 */
function UnauthorizedContent({ credentialInfo, credentialType, walletAddress, accessMap, error, onRetry }) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    if (onRetry) {
      await onRetry();
    }
    // Force page reload to re-trigger everything
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="max-w-lg w-full text-center">
        <div className="p-8 rounded-2xl bg-white/5 border border-red-500/20">
          {/* Icon */}
          <div className="text-6xl mb-6">🚫</div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4">
            Unauthorized Access
          </h2>
          
          {/* Message */}
          <p className="text-white/60 mb-6">
            You do not have the required credential to access this section.
          </p>

          {/* Error with retry button */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
              <p className="text-red-400 text-sm mb-3">⚠️ Verification error: {error}</p>
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isRetrying ? "Verifying..." : "🔄 Retry"}
              </button>
            </div>
          )}

          {/* Debug Info */}
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 mb-6 text-left text-xs font-mono overflow-x-auto">
            <p className="text-amber-400 mb-2">Debug Info:</p>
            <p className="text-white/70">Wallet: {walletAddress || 'Not connected'}</p>
            <p className="text-white/70">Required credential: {credentialType}</p>
            <p className="text-white/70">AccessMap: {JSON.stringify(accessMap)}</p>
          </div>

          {/* Required Credential */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
            <p className="text-sm text-white/40 mb-2">Required credential:</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{credentialInfo?.icon || "🔒"}</span>
              <div className="text-left">
                <p className="text-white font-semibold">
                  {credentialInfo?.name || credentialType}
                </p>
                <p className="text-sm text-white/50">
                  {credentialInfo?.description || "Unrecognized credential"}
                </p>
              </div>
            </div>
          </div>

          {/* How to obtain */}
          <div className="text-left p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <h3 className="text-amber-400 font-semibold mb-2">
              How to obtain this credential?
            </h3>
            <ol className="text-sm text-white/60 space-y-2 list-decimal list-inside">
              <li>Contact a partner audit company</li>
              <li>Pass the verification audit for your role</li>
              <li>The company will transmit your wallet address to us</li>
              <li>We will issue the credential on your wallet</li>
            </ol>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isRetrying ? "Verifying..." : "🔄 Re-verify"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute;