/**
 * Credential Configuration
 * 
 * This file contains configuration flags for credential verification.
 * Set BYPASS_CREDENTIAL_CHECK to true to bypass all credential checks.
 * 
 * TODO: Remove this bypass before production deployment
 */

// Bypass flag - Set to true to bypass all credential checks
export const BYPASS_CREDENTIAL_CHECK = true;

// Log when bypass is active
if (BYPASS_CREDENTIAL_CHECK) {
  console.warn(
    "⚠️ [CredentialConfig] BYPASS_CREDENTIAL_CHECK is enabled. " +
    "All credential checks are being bypassed. " +
    "Remember to disable this before production!"
  );
}

