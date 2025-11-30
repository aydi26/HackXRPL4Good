/**
 * Routes API pour le mint de NFT semi-privé avec chiffrement
 */

const express = require("express");
const router = express.Router();
const xrpl = require("xrpl");
const { mintSemiPrivateNFT } = require("./MintNFTVRAIMENT");

// Configuration
const XRPL_WSS = process.env.XRPL_WSS || "wss://s.altnet.rippletest.net:51233";

/**
 * POST /api/mint/semi-private
 * 
 * Mint un NFT semi-privé avec données publiques et image chiffrée
 * 
 * Body:
 * {
 *   "sellerSeed": "sXXXXXXXXXXXX",  // Seed du wallet vendeur
 *   "publicData": {
 *     "productType": "Apple",
 *     "weight": "1500",
 *     "date": "2024-11-29",
 *     "lotNumber": "LOT-2024-ABC",
 *     "labo": "Laboratoire XYZ",
 *     "price": "10.5"
 *   },
 *   "ipfsImageLink": "https://gateway.pinata.cloud/ipfs/Qm...",
 *   "laboPublicKey": "03A0343C9615CDBEE180BEEA96C7EF74C053A52F3F1965B85A1C29AFA66AB09354"
 * }
 */
router.post("/semi-private", async (req, res) => {
  let client = null;
  
  try {
    const { sellerSeed, publicData, ipfsImageLink, laboPublicKey } = req.body;

    // Validation
    if (!sellerSeed) {
      return res.status(400).json({
        success: false,
        error: "sellerSeed est requis",
      });
    }

    if (!publicData) {
      return res.status(400).json({
        success: false,
        error: "publicData est requis",
      });
    }

    if (!ipfsImageLink) {
      return res.status(400).json({
        success: false,
        error: "ipfsImageLink est requis",
      });
    }

    if (!laboPublicKey) {
      return res.status(400).json({
        success: false,
        error: "laboPublicKey est requis",
      });
    }

    console.log("🚀 API Mint Semi-Privé appelée");
    console.log("   Public Data:", publicData);
    console.log("   IPFS Link:", ipfsImageLink);
    console.log("   Labo Key:", laboPublicKey.slice(0, 20) + "...");

    // Connexion XRPL
    client = new xrpl.Client(XRPL_WSS);
    await client.connect();
    console.log("✅ Connecté à XRPL");

    // Création du wallet vendeur
    const sellerWallet = xrpl.Wallet.fromSeed(sellerSeed);
    console.log("✅ Wallet vendeur:", sellerWallet.address);

    // Appel de la fonction de mint
    const result = await mintSemiPrivateNFT(
      client,
      sellerWallet,
      publicData,
      ipfsImageLink,
      laboPublicKey
    );

    // Déconnexion
    await client.disconnect();

    if (result.success) {
      console.log("✅ NFT minté avec succès:", result.nftTokenId);
      res.status(201).json(result);
    } else {
      console.log("❌ Échec du mint:", result.error);
      res.status(500).json(result);
    }

  } catch (error) {
    console.error("❌ Erreur API mint:", error);
    
    if (client && client.isConnected()) {
      await client.disconnect();
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/mint/semi-private-wallet
 * 
 * Prépare la transaction pour signature par un wallet externe (Gem, Crossmark)
 * Retourne la transaction non signée avec les données chiffrées
 * 
 * Body:
 * {
 *   "sellerAddress": "rXXXXXXXXXXXX",  // Adresse du wallet vendeur
 *   "publicData": { ... },
 *   "ipfsImageLink": "https://gateway.pinata.cloud/ipfs/Qm...",
 *   "laboPublicKey": "03A0343C..."
 * }
 */
router.post("/semi-private-wallet", async (req, res) => {
  try {
    const { sellerAddress, publicData, ipfsImageLink, laboPublicKey } = req.body;

    // Validation
    if (!sellerAddress) {
      return res.status(400).json({
        success: false,
        error: "sellerAddress est requis",
      });
    }

    if (!publicData) {
      return res.status(400).json({
        success: false,
        error: "publicData est requis",
      });
    }

    if (!ipfsImageLink) {
      return res.status(400).json({
        success: false,
        error: "ipfsImageLink est requis",
      });
    }

    if (!laboPublicKey) {
      return res.status(400).json({
        success: false,
        error: "laboPublicKey est requis",
      });
    }

    console.log("🚀 API Préparation TX Semi-Privé");
    console.log("   Seller Address:", sellerAddress);
    console.log("   Public Data:", publicData);
    console.log("   IPFS Link:", ipfsImageLink);

    // Importer la fonction de chiffrement
    const { encryptForNFT } = require("./Chiffrement");

    // Formatage des données publiques
    const dataPublique = {
      p: publicData.productType || "Unknown",
      w: `${publicData.weight}kg`,
      d: publicData.date || new Date().toISOString().split('T')[0],
      l: publicData.labo || "Unknown",
      n: publicData.lotNumber || `LOT-${Date.now()}`,
      pr: publicData.price || "0",
    };

    // Chiffrement
    console.log("🔐 Chiffrement en cours...");
    const cryptoResult = encryptForNFT(
      dataPublique,
      ipfsImageLink,
      laboPublicKey
    );

    // Construction de la transaction (non signée)
    const mintTx = {
      TransactionType: "NFTokenMint",
      Account: sellerAddress,
      URI: cryptoResult.uriHex,
      Flags: 8, // tfTransferable
      NFTokenTaxon: 0,
      Memos: [
        {
          Memo: {
            MemoType: Buffer.from("SEAL_IMG_LABO", "utf8").toString("hex"),
            MemoData: cryptoResult.sealImageForLabo,
            MemoFormat: Buffer.from("hex", "utf8").toString("hex")
          }
        }
      ]
    };

    console.log("✅ Transaction préparée");

    res.json({
      success: true,
      transaction: mintTx,
      uriHex: cryptoResult.uriHex,
      sealHex: cryptoResult.sealImageForLabo,
    });

  } catch (error) {
    console.error("❌ Erreur préparation TX:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
