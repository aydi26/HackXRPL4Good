/**
 * Routes API pour MPToken
 * Création, transfert et gestion des MPTokens
 */

const express = require("express");
const router = express.Router();
const xrpl = require("xrpl");

// Configuration
const XRPL_WSS = process.env.XRPL_WSS || "wss://s.altnet.rippletest.net:51233";

/**
 * POST /api/mpt/create
 * 
 * Prépare une transaction de création de MPToken pour signature par le wallet
 * 
 * Body:
 * {
 *   "issuerAddress": "rXXX...",
 *   "nftId": "00080000...",
 *   "buyerAddress": "rYYY...",
 *   "buyerPublicKey": "03ABC...",
 *   "laboAddress": "rZZZ...",
 *   "lotNumber": "LOT-2024-001",
 *   "price": "100"
 * }
 */
router.post("/create", async (req, res) => {
  try {
    const { 
      issuerAddress, 
      nftId, 
      buyerAddress, 
      buyerPublicKey,
      laboAddress, 
      lotNumber,
      price 
    } = req.body;

    // Validation
    if (!issuerAddress) {
      return res.status(400).json({ success: false, error: "issuerAddress requis" });
    }
    if (!nftId) {
      return res.status(400).json({ success: false, error: "nftId requis" });
    }
    if (!buyerAddress) {
      return res.status(400).json({ success: false, error: "buyerAddress requis" });
    }

    console.log("🔗 Préparation création MPToken");
    console.log("   Issuer:", issuerAddress);
    console.log("   NFT ID:", nftId.substring(0, 20) + "...");
    console.log("   Buyer:", buyerAddress);

    // Métadonnées du MPToken
    const metadata = {
      nft_id: nftId,
      lot_number: lotNumber || `LOT-${Date.now()}`,
      issuer_address: issuerAddress,
      buyer_address: buyerAddress,
      buyer_public_key: buyerPublicKey || null,
      labo_address: laboAddress || null,
      price: price || "0",
      step: 1,
      status: "SALE_INITIATED",
      history: [{
        action: "CREATED",
        by: issuerAddress,
        timestamp: Date.now()
      }],
      created_at: Date.now()
    };

    const metadataHex = Buffer.from(JSON.stringify(metadata), 'utf8').toString('hex');

    // Transaction SignerListSet (pour multi-sig avec le labo si nécessaire)
    const signerListTx = laboAddress ? {
      TransactionType: "SignerListSet",
      Account: issuerAddress,
      SignerQuorum: 1,
      SignerEntries: [{
        SignerEntry: {
          Account: laboAddress,
          SignerWeight: 1
        }
      }]
    } : null;

    // Transaction MPTokenIssuanceCreate
    const createTx = {
      TransactionType: "MPTokenIssuanceCreate",
      Account: issuerAddress,
      MaximumAmount: "1",
      AssetScale: 0,
      MPTokenMetadata: metadataHex,
      Flags: 0x00000002 | 0x00000008, // tfMPTCanLock + tfMPTCanTransfer
      TransferFee: 0
    };

    res.json({
      success: true,
      signerListTx: signerListTx,
      createTx: createTx,
      metadata: metadata
    });

  } catch (error) {
    console.error("❌ Erreur préparation MPT:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mpt/authorize
 * 
 * Prépare une transaction d'autorisation MPToken pour le holder
 * Le holder doit d'abord autoriser avant de pouvoir recevoir des tokens
 * 
 * Body:
 * {
 *   "holderAddress": "rXXX...",
 *   "mptIssuanceId": "00000..."
 * }
 */
router.post("/authorize", async (req, res) => {
  try {
    const { holderAddress, mptIssuanceId } = req.body;

    if (!holderAddress) {
      return res.status(400).json({ success: false, error: "holderAddress requis" });
    }
    if (!mptIssuanceId) {
      return res.status(400).json({ success: false, error: "mptIssuanceId requis" });
    }

    console.log("🔓 Préparation autorisation MPToken");
    console.log("   Holder:", holderAddress);
    console.log("   MPT ID:", mptIssuanceId.substring(0, 20) + "...");

    // Transaction MPTokenAuthorize
    const authorizeTx = {
      TransactionType: "MPTokenAuthorize",
      Account: holderAddress,
      MPTokenIssuanceID: mptIssuanceId
    };

    res.json({
      success: true,
      transaction: authorizeTx
    });

  } catch (error) {
    console.error("❌ Erreur autorisation MPT:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mpt/transfer
 * 
 * Prépare une transaction de transfert de MPToken
 * 
 * Body:
 * {
 *   "senderAddress": "rXXX...",
 *   "receiverAddress": "rYYY...",
 *   "mptIssuanceId": "00000...",
 *   "amount": "1"
 * }
 */
router.post("/transfer", async (req, res) => {
  try {
    const { senderAddress, receiverAddress, mptIssuanceId, amount } = req.body;

    if (!senderAddress) {
      return res.status(400).json({ success: false, error: "senderAddress requis" });
    }
    if (!receiverAddress) {
      return res.status(400).json({ success: false, error: "receiverAddress requis" });
    }
    if (!mptIssuanceId) {
      return res.status(400).json({ success: false, error: "mptIssuanceId requis" });
    }

    console.log("📤 Préparation transfert MPToken");
    console.log("   From:", senderAddress);
    console.log("   To:", receiverAddress);
    console.log("   MPT ID:", mptIssuanceId.substring(0, 20) + "...");
    console.log("   Amount:", amount || "1");

    // Transaction Payment avec MPToken
    const transferTx = {
      TransactionType: "Payment",
      Account: senderAddress,
      Destination: receiverAddress,
      Amount: {
        mpt_issuance_id: mptIssuanceId,
        value: amount || "1"
      }
    };

    res.json({
      success: true,
      transaction: transferTx
    });

  } catch (error) {
    console.error("❌ Erreur transfert MPT:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mpt/create-and-transfer
 * 
 * Crée un MPToken et le transfère au buyer en une seule opération
 * Retourne les deux transactions à signer séquentiellement
 * 
 * Body:
 * {
 *   "sellerAddress": "rXXX...",
 *   "sellerSeed": "sXXX..." (optionnel - pour signature côté serveur),
 *   "buyerAddress": "rYYY...",
 *   "buyerPublicKey": "03ABC...",
 *   "nftId": "00080000...",
 *   "lotNumber": "LOT-2024-001",
 *   "price": "100"
 * }
 */
router.post("/create-and-transfer", async (req, res) => {
  let client = null;
  
  try {
    const { 
      sellerAddress,
      sellerSeed,
      buyerAddress, 
      buyerPublicKey,
      nftId, 
      lotNumber,
      price 
    } = req.body;

    // Validation
    if (!sellerAddress) {
      return res.status(400).json({ success: false, error: "sellerAddress requis" });
    }
    if (!buyerAddress) {
      return res.status(400).json({ success: false, error: "buyerAddress requis" });
    }
    if (!nftId) {
      return res.status(400).json({ success: false, error: "nftId requis" });
    }

    console.log("🔗 Création et transfert MPToken");
    console.log("   Seller:", sellerAddress);
    console.log("   Buyer:", buyerAddress);
    console.log("   NFT ID:", nftId.substring(0, 20) + "...");

    // Si on a le seed, on exécute côté serveur
    if (sellerSeed) {
      client = new xrpl.Client(XRPL_WSS);
      await client.connect();

      const sellerWallet = xrpl.Wallet.fromSeed(sellerSeed);

      // Métadonnées du MPToken
      const metadata = {
        nft_id: nftId,
        lot_number: lotNumber || `LOT-${Date.now()}`,
        seller_address: sellerAddress,
        buyer_address: buyerAddress,
        buyer_public_key: buyerPublicKey || null,
        price: price || "0",
        status: "TRANSFERRED",
        history: [
          { action: "CREATED", by: sellerAddress, timestamp: Date.now() },
          { action: "TRANSFERRED", to: buyerAddress, timestamp: Date.now() }
        ],
        created_at: Date.now()
      };

      const metadataHex = Buffer.from(JSON.stringify(metadata), 'utf8').toString('hex');

      // 1. Créer le MPToken
      const createTx = {
        TransactionType: "MPTokenIssuanceCreate",
        Account: sellerAddress,
        MaximumAmount: "1",
        AssetScale: 0,
        MPTokenMetadata: metadataHex,
        Flags: 0x00000002 | 0x00000008,
        TransferFee: 0
      };

      const preparedCreate = await client.autofill(createTx);
      const signedCreate = sellerWallet.sign(preparedCreate);
      const createResult = await client.submitAndWait(signedCreate.tx_blob);

      if (createResult.result.meta?.TransactionResult !== "tesSUCCESS") {
        throw new Error(`Création MPT échouée: ${createResult.result.meta?.TransactionResult}`);
      }

      // Extraire le MPT ID
      let mptIssuanceId = null;
      for (const node of createResult.result.meta?.AffectedNodes || []) {
        if (node.CreatedNode?.LedgerEntryType === "MPTokenIssuance") {
          mptIssuanceId = node.CreatedNode.LedgerIndex;
          break;
        }
      }

      console.log("   ✅ MPToken créé:", mptIssuanceId);

      // 2. Transférer au buyer
      const transferTx = {
        TransactionType: "Payment",
        Account: sellerAddress,
        Destination: buyerAddress,
        Amount: {
          mpt_issuance_id: mptIssuanceId,
          value: "1"
        }
      };

      const preparedTransfer = await client.autofill(transferTx);
      const signedTransfer = sellerWallet.sign(preparedTransfer);
      const transferResult = await client.submitAndWait(signedTransfer.tx_blob);

      if (transferResult.result.meta?.TransactionResult !== "tesSUCCESS") {
        throw new Error(`Transfert MPT échoué: ${transferResult.result.meta?.TransactionResult}`);
      }

      console.log("   ✅ MPToken transféré au buyer");

      await client.disconnect();

      res.json({
        success: true,
        mptIssuanceId: mptIssuanceId,
        createTxHash: createResult.result.hash,
        transferTxHash: transferResult.result.hash,
        metadata: metadata
      });

    } else {
      // Sinon, on retourne les transactions pour signature côté client
      const metadata = {
        nft_id: nftId,
        lot_number: lotNumber || `LOT-${Date.now()}`,
        seller_address: sellerAddress,
        buyer_address: buyerAddress,
        buyer_public_key: buyerPublicKey || null,
        price: price || "0",
        status: "SALE_INITIATED",
        created_at: Date.now()
      };

      const metadataHex = Buffer.from(JSON.stringify(metadata), 'utf8').toString('hex');

      const createTx = {
        TransactionType: "MPTokenIssuanceCreate",
        Account: sellerAddress,
        MaximumAmount: "1",
        AssetScale: 0,
        MPTokenMetadata: metadataHex,
        Flags: 0x00000002 | 0x00000008,
        TransferFee: 0
      };

      res.json({
        success: true,
        requiresWalletSignature: true,
        createTx: createTx,
        metadata: metadata,
        nextStep: "After createTx is signed and submitted, call /api/mpt/transfer with the mptIssuanceId"
      });
    }

  } catch (error) {
    console.error("❌ Erreur création/transfert MPT:", error);
    
    if (client && client.isConnected()) {
      await client.disconnect();
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
