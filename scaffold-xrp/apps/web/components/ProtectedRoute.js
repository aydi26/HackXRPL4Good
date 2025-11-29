/**
 * Composant de protection de route basé sur les Verifiable Credentials
 * 
 * Ce composant vérifie si l'utilisateur possède le credential requis
 * pour accéder au contenu. Sinon, il affiche un message d'accès refusé
 * ou redirige vers une page appropriée.
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

  // Normaliser le type de credential
  const credentialType = CREDENTIAL_TYPES[requiredCredential.toUpperCase()] || requiredCredential;
  const credentialInfo = CREDENTIAL_INFO[credentialType];

  // Vérifier l'accès
  const hasAccess = hasCredential(credentialType);
  
  // Le wallet est connecté si on a une adresse OU si isConnected est true
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

  // État de chargement
  if (isLoading || !isInitialized) {
    log("Rendering: LoadingState");
    return <LoadingState />;
  }

  // Wallet non connecté
  if (!walletIsConnected) {
    log("Rendering: WalletNotConnected");
    return <WalletNotConnected />;
  }

  // Wallet connecté mais pas le bon credential
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

  // Accès autorisé
  log("Rendering: Children (access granted!)");
  return <>{children}</>;
}

/**
 * Composant d'état de chargement
 */
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
        <p className="text-white/70">Vérification des credentials...</p>
      </div>
    </div>
  );
}

/**
 * Composant wallet non connecté
 */
function WalletNotConnected() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="max-w-md w-full text-center">
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-6xl mb-6">🔗</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Wallet non connecté
          </h2>
          <p className="text-white/60 mb-6">
            Veuillez connecter votre wallet pour accéder à cette section.
            Votre wallet doit posséder le credential approprié.
          </p>
          <div className="text-sm text-white/40">
            Utilisez le bouton de connexion en haut à droite
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant d'accès non autorisé
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
          {/* Icône */}
          <div className="text-6xl mb-6">🚫</div>
          
          {/* Titre */}
          <h2 className="text-2xl font-bold text-white mb-4">
            Accès non autorisé
          </h2>
          
          {/* Message */}
          <p className="text-white/60 mb-6">
            Vous n'avez pas le credential nécessaire pour accéder à cette section.
          </p>

          {/* Erreur avec bouton Réessayer */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
              <p className="text-red-400 text-sm mb-3">⚠️ Erreur de vérification: {error}</p>
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isRetrying ? "Vérification..." : "🔄 Réessayer"}
              </button>
            </div>
          )}

          {/* Debug Info */}
          <div className="p-4 rounded-xl bg-black/50 border border-white/10 mb-6 text-left text-xs font-mono overflow-x-auto">
            <p className="text-amber-400 mb-2">Debug Info:</p>
            <p className="text-white/70">Wallet: {walletAddress || 'Non connecté'}</p>
            <p className="text-white/70">Credential requis: {credentialType}</p>
            <p className="text-white/70">AccessMap: {JSON.stringify(accessMap)}</p>
          </div>

          {/* Credential requis */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
            <p className="text-sm text-white/40 mb-2">Credential requis :</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{credentialInfo?.icon || "🔒"}</span>
              <div className="text-left">
                <p className="text-white font-semibold">
                  {credentialInfo?.name || credentialType}
                </p>
                <p className="text-sm text-white/50">
                  {credentialInfo?.description || "Credential non reconnu"}
                </p>
              </div>
            </div>
          </div>

          {/* Comment obtenir */}
          <div className="text-left p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <h3 className="text-amber-400 font-semibold mb-2">
              Comment obtenir ce credential ?
            </h3>
            <ol className="text-sm text-white/60 space-y-2 list-decimal list-inside">
              <li>Contactez une entreprise d'audit partenaire</li>
              <li>Passez l'audit de vérification pour votre rôle</li>
              <li>L'entreprise nous transmettra votre adresse wallet</li>
              <li>Nous émettrons le credential sur votre wallet</li>
            </ol>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isRetrying ? "Vérification..." : "🔄 Revérifier"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute;
