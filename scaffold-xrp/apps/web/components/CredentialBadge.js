/**
 * Badge affichant le credential d'un utilisateur
 * 
 * Affiche un badge visuel indiquant le type de credential
 * que possède l'utilisateur connecté.
 */

"use client";

import { useCredentialContext } from "./providers/CredentialProvider";

/**
 * Affiche les badges des credentials de l'utilisateur
 */
export function CredentialBadges() {
  const { credentials, isLoading, isConnected } = useCredentialContext();

  if (!isConnected || isLoading) {
    return null;
  }

  if (credentials.length === 0) {
    return (
      <div className="text-sm text-white/40 px-3 py-1 rounded-lg bg-white/5">
        Aucun credential
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {credentials.map((cred, index) => (
        <CredentialBadge key={index} credential={cred} />
      ))}
    </div>
  );
}

/**
 * Badge individuel pour un credential
 */
export function CredentialBadge({ credential }) {
  const { CREDENTIAL_INFO } = useCredentialContext();
  const info = CREDENTIAL_INFO[credential.credentialType];

  if (!info) {
    return null;
  }

  const colorClasses = {
    blue: "bg-blue-500/20 border-blue-500/30 text-blue-300",
    emerald: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    amber: "bg-amber-500/20 border-amber-500/30 text-amber-300",
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-300",
  };

  const classes = colorClasses[info.color] || colorClasses.emerald;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${classes}`}
    >
      <span>{info.icon}</span>
      <span>{info.name}</span>
    </div>
  );
}

/**
 * Affiche un indicateur d'accès pour une section
 */
export function AccessIndicator({ section }) {
  const { hasAccess, isLoading, isConnected } = useCredentialContext();

  if (!isConnected) {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">
        Non connecté
      </span>
    );
  }

  if (isLoading) {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/40">
        Chargement...
      </span>
    );
  }

  const hasAccessToSection = hasAccess(section);

  if (hasAccessToSection) {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
        ✓ Accès
      </span>
    );
  }

  return (
    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
      ✗ Bloqué
    </span>
  );
}

export default CredentialBadges;
