/**
 * Routes API pour la gestion des Verifiable Credentials
 * 
 * Ces routes permettent de créer et révoquer des credentials.
 * Elles doivent être protégées par authentification.
 */

const express = require("express");
const router = express.Router();
const credentialService = require("./credentialService");
const config = require("./config");

/**
 * Middleware d'authentification (à personnaliser)
 * 
 * Cette protection doit vérifier que seules les entreprises
 * d'audit autorisées peuvent appeler ces routes.
 */
const authenticateAuditor = (req, res, next) => {
  // TODO: Implémenter l'authentification réelle
  // Exemple: vérifier un token JWT, une clé API, etc.
  
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.AUDITOR_API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      error: "Non autorisé - Clé API invalide ou manquante",
    });
  }

  next();
};

/**
 * POST /api/credentials/create
 * 
 * Crée un nouveau credential pour un utilisateur.
 * Appelé par les entreprises d'audit après validation.
 * 
 * Body:
 * {
 *   "subjectAddress": "rXXXXXXXXXXXXXXX",
 *   "credentialType": "BUYER" | "SELLER" | "LABO" | "TRANSPORTER",
 *   "expirationDays": 365, // optionnel
 *   "uri": "https://..." // optionnel, lien vers les métadonnées
 * }
 */
router.post("/create", authenticateAuditor, async (req, res) => {
  try {
    const { subjectAddress, credentialType, expirationDays, uri } = req.body;

    // Validation des champs requis
    if (!subjectAddress) {
      return res.status(400).json({
        success: false,
        error: "subjectAddress est requis",
      });
    }

    if (!credentialType) {
      return res.status(400).json({
        success: false,
        error: "credentialType est requis",
      });
    }

    // Vérifier le type de credential
    const validTypes = Object.keys(config.credentialTypes);
    if (!validTypes.includes(credentialType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: `Type de credential invalide. Types valides: ${validTypes.join(", ")}`,
      });
    }

    // Vérifier si le credential existe déjà
    const exists = await credentialService.credentialExists(
      subjectAddress,
      credentialType
    );
    
    if (exists) {
      return res.status(409).json({
        success: false,
        error: "Ce credential existe déjà pour cet utilisateur",
      });
    }

    // Calculer l'expiration en secondes
    const expirationSeconds = expirationDays
      ? expirationDays * 24 * 60 * 60
      : config.defaultExpiration;

    // Créer le credential
    const result = await credentialService.createCredential({
      subjectAddress,
      credentialType: credentialType.toUpperCase(),
      expirationSeconds,
      uri,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Erreur API /create:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/credentials/revoke
 * 
 * Révoque un credential existant.
 * 
 * Body:
 * {
 *   "subjectAddress": "rXXXXXXXXXXXXXXX",
 *   "credentialType": "BUYER" | "SELLER" | "LABO" | "TRANSPORTER"
 * }
 */
router.delete("/revoke", authenticateAuditor, async (req, res) => {
  try {
    const { subjectAddress, credentialType } = req.body;

    if (!subjectAddress || !credentialType) {
      return res.status(400).json({
        success: false,
        error: "subjectAddress et credentialType sont requis",
      });
    }

    // Vérifier si le credential existe
    const exists = await credentialService.credentialExists(
      subjectAddress,
      credentialType
    );
    
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: "Ce credential n'existe pas",
      });
    }

    // Révoquer le credential
    const result = await credentialService.revokeCredential({
      subjectAddress,
      credentialType: credentialType.toUpperCase(),
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur API /revoke:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/credentials/check/:address/:type
 * 
 * Vérifie si un utilisateur possède un credential.
 * Route publique (pas d'auth requise).
 */
router.get("/check/:address/:type", async (req, res) => {
  try {
    const { address, type } = req.params;

    const exists = await credentialService.credentialExists(address, type);

    res.json({
      success: true,
      hasCredential: exists,
      address,
      credentialType: type.toUpperCase(),
    });
  } catch (error) {
    console.error("Erreur API /check:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/credentials/types
 * 
 * Retourne la liste des types de credentials disponibles.
 */
router.get("/types", (req, res) => {
  res.json({
    success: true,
    types: Object.keys(config.credentialTypes),
    mapping: config.credentialTypes,
  });
});

module.exports = router;
