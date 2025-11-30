/**
 * Service IPFS via Pinata
 * 
 * Gère l'upload de fichiers (images) vers IPFS via Pinata
 * et retourne les CIDs de manière sécurisée.
 */

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

// Configuration Pinata
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";

// Configuration multer pour l'upload en mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les images
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé. Utilisez JPEG, PNG, GIF ou WebP."));
    }
  },
});

/**
 * Upload une image vers IPFS via Pinata
 * 
 * @param {Buffer} fileBuffer - Le contenu du fichier
 * @param {string} fileName - Nom du fichier
 * @param {object} metadata - Métadonnées optionnelles
 * @returns {Promise<{success: boolean, cid?: string, url?: string, error?: string}>}
 */
async function uploadToIPFS(fileBuffer, fileName, metadata = {}) {
  if (!PINATA_JWT) {
    throw new Error("PINATA_JWT non configuré");
  }

  try {
    const formData = new FormData();
    
    // Ajouter le fichier
    formData.append("file", fileBuffer, {
      filename: fileName,
    });

    // Ajouter les options Pinata (métadonnées)
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", pinataOptions);

    // Ajouter les métadonnées Pinata
    const pinataMetadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        app: "CertiChain",
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    });
    formData.append("pinataMetadata", pinataMetadata);

    // Appel API Pinata
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders(),
        },
      }
    );

    const cid = response.data.IpfsHash;
    
    return {
      success: true,
      cid: cid,
      ipfsUrl: `ipfs://${cid}`,
      gatewayUrl: `${PINATA_GATEWAY}/ipfs/${cid}`,
      size: response.data.PinSize,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error("Erreur upload IPFS:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Upload un JSON (métadonnées NFT) vers IPFS
 * 
 * @param {object} jsonData - Les données JSON à uploader
 * @param {string} name - Nom du fichier JSON
 * @returns {Promise<{success: boolean, cid?: string, url?: string, error?: string}>}
 */
async function uploadJSONToIPFS(jsonData, name = "metadata.json") {
  if (!PINATA_JWT) {
    throw new Error("PINATA_JWT non configuré");
  }

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: jsonData,
        pinataMetadata: {
          name: name,
          keyvalues: {
            app: "CertiChain",
            type: "nft-metadata",
            uploadedAt: new Date().toISOString(),
          },
        },
        pinataOptions: {
          cidVersion: 1,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      }
    );

    const cid = response.data.IpfsHash;
    
    return {
      success: true,
      cid: cid,
      ipfsUrl: `ipfs://${cid}`,
      gatewayUrl: `${PINATA_GATEWAY}/ipfs/${cid}`,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error("Erreur upload JSON IPFS:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Crée les métadonnées NFT complètes et les upload sur IPFS
 * 
 * @param {string} imageCid - CID de l'image déjà uploadée
 * @param {object} nftData - Données du NFT
 * @returns {Promise<object>}
 */
async function createNFTMetadata(imageCid, nftData) {
  const metadata = {
    name: nftData.name || "CertiChain NFT",
    description: nftData.description || "",
    image: `ipfs://${imageCid}`,
    external_url: nftData.externalUrl || "https://certichain.io",
    attributes: nftData.attributes || [],
    properties: {
      category: nftData.category || "agricultural",
      created_at: new Date().toISOString(),
      ...nftData.properties,
    },
  };

  return uploadJSONToIPFS(metadata, `${nftData.name || "nft"}-metadata.json`);
}

// ============ ROUTES API ============

/**
 * POST /api/ipfs/upload
 * Upload une image vers IPFS
 */
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Aucune image fournie",
      });
    }

    console.log(`📤 Upload image: ${req.file.originalname} (${req.file.size} bytes)`);

    const result = await uploadToIPFS(
      req.file.buffer,
      req.file.originalname,
      req.body.metadata ? JSON.parse(req.body.metadata) : {}
    );

    if (result.success) {
      console.log(`✅ Image uploadée: ${result.cid}`);
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Erreur route upload:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ipfs/upload-json
 * Upload du JSON (métadonnées) vers IPFS
 */
router.post("/upload-json", async (req, res) => {
  try {
    const { data, name } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: "Données JSON requises",
      });
    }

    console.log(`📤 Upload JSON: ${name || "metadata.json"}`);

    const result = await uploadJSONToIPFS(data, name);

    if (result.success) {
      console.log(`✅ JSON uploadé: ${result.cid}`);
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Erreur route upload-json:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ipfs/upload-nft
 * Upload complet d'un NFT (image + métadonnées)
 */
router.post("/upload-nft", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Aucune image fournie",
      });
    }

    // Parser les données NFT
    const nftData = req.body.nftData ? JSON.parse(req.body.nftData) : {};

    console.log(`📤 Upload NFT complet: ${nftData.name || req.file.originalname}`);

    // 1. Upload de l'image
    const imageResult = await uploadToIPFS(req.file.buffer, req.file.originalname);
    
    if (!imageResult.success) {
      return res.status(500).json({
        success: false,
        error: "Échec upload image: " + imageResult.error,
      });
    }

    console.log(`✅ Image uploadée: ${imageResult.cid}`);

    // 2. Créer et uploader les métadonnées
    const metadataResult = await createNFTMetadata(imageResult.cid, nftData);

    if (!metadataResult.success) {
      return res.status(500).json({
        success: false,
        error: "Échec upload métadonnées: " + metadataResult.error,
        imageCid: imageResult.cid, // On retourne quand même le CID de l'image
      });
    }

    console.log(`✅ Métadonnées uploadées: ${metadataResult.cid}`);

    // Retourner les deux CIDs
    res.json({
      success: true,
      image: {
        cid: imageResult.cid,
        ipfsUrl: imageResult.ipfsUrl,
        gatewayUrl: imageResult.gatewayUrl,
      },
      metadata: {
        cid: metadataResult.cid,
        ipfsUrl: metadataResult.ipfsUrl,
        gatewayUrl: metadataResult.gatewayUrl,
      },
      // L'URI à utiliser pour le NFT
      nftUri: metadataResult.ipfsUrl,
    });
  } catch (error) {
    console.error("Erreur route upload-nft:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ipfs/status
 * Vérifie la connexion à Pinata
 */
router.get("/status", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.pinata.cloud/data/testAuthentication",
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );

    res.json({
      success: true,
      message: "Connexion Pinata OK",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Échec connexion Pinata: " + (error.response?.data?.message || error.message),
    });
  }
});

module.exports = {
  routes: router,
  uploadToIPFS,
  uploadJSONToIPFS,
  createNFTMetadata,
};
