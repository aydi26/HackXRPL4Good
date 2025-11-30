/**
 * Création de MPToken pour le Frontend
 * 
 * Une seule fonction simple qui prend les paramètres et crée le MPToken
 * Le wallet de l'utilisateur (Crossmark/GemWallet) signe les transactions
 */

/**
 * Crée un MPToken avec toutes les métadonnées nécessaires
 * 
 * @param {Object} walletManager - WalletManager depuis useWallet()
 * @param {string} lotNumber - Numéro du lot (ex: "LOT-2025-001")
 * @param {string} nftHash - Hash/ID du NFT associé
 * @param {string} issuerAddress - Adresse de l'issuer (agriculteur connecté)
 * @param {string} producteurAddress - Adresse du producteur/acheteur
 * @param {string} laboAddress - Adresse du laboratoire
 * @param {string} laboPublicKey - Clé publique du labo (pour chiffrement)
 * @param {string} laboName - Nom du laboratoire (optionnel, défaut: "Laboratory")
 * @param {string} carrierId - ID du transporteur (optionnel)
 * @returns {Promise<Object>} { success, mptID, txHash, metadata, error }
 * 
 * @example
 * // Dans le frontend:
 * import { useWallet } from "../components/providers/WalletProvider";
 * import { createMPT } from "./CreationMPTVRAIMENT";
 * 
 * const { walletManager, accountInfo } = useWallet();
 * 
 * const result = await createMPT(
 *     walletManager,
 *     "LOT-2025-001",
 *     "00080000ABC123...",
 *     accountInfo.address,
 *     "rPRODUCTEUR...",
 *     "rLABO123...",
 *     "04abc123...",
 *     "Labo Qualité",
 *     "TRANSPORTER-001"
 * );
 * 
 * if (result.success) {
 *     console.log("MPT créé:", result.mptID);
 * }
 */
async function createMPT(
    walletManager,
    lotNumber,
    nftHash,
    issuerAddress,
    producteurAddress,
    laboAddress,
    laboPublicKey,
    laboName = "Laboratory",
    carrierId = null
) {
    console.log("🔗 Création MPToken...");
    console.log("   Lot:", lotNumber);
    console.log("   NFT:", nftHash?.substring(0, 16) + "...");
    
    // Validation
    if (!walletManager) {
        return { success: false, mptID: null, txHash: null, metadata: null, error: "Wallet non connecté" };
    }
    if (!issuerAddress) {
        return { success: false, mptID: null, txHash: null, metadata: null, error: "Adresse issuer manquante" };
    }
    if (!laboAddress) {
        return { success: false, mptID: null, txHash: null, metadata: null, error: "Adresse labo manquante" };
    }
    if (!nftHash) {
        return { success: false, mptID: null, txHash: null, metadata: null, error: "NFT Hash manquant" };
    }

    try {
        // ═══════════════════════════════════════════════════════════
        // ÉTAPE 1: Configuration SignerList (Multi-Sig avec le Labo)
        // ═══════════════════════════════════════════════════════════
        console.log("\n📝 Étape 1: Configuration SignerList...");
        
        const signerListTx = {
            TransactionType: "SignerListSet",
            Account: issuerAddress,
            SignerQuorum: 1,
            SignerEntries: [{
                SignerEntry: {
                    Account: laboAddress,
                    SignerWeight: 1
                }
            }]
        };
        
        console.log("   → Le wallet va s'ouvrir pour signer...");
        const signerResult = await walletManager.signAndSubmit(signerListTx);
        
        const signerTxResult = signerResult.result || signerResult;
        if (signerTxResult.meta?.TransactionResult !== "tesSUCCESS" &&
            signerTxResult.engine_result !== "tesSUCCESS") {
            throw new Error(`SignerList échoué: ${signerTxResult.meta?.TransactionResult || signerTxResult.engine_result}`);
        }
        
        console.log("   ✅ SignerList configurée");

        // ═══════════════════════════════════════════════════════════
        // ÉTAPE 2: Création du MPToken
        // ═══════════════════════════════════════════════════════════
        console.log("\n🪙 Étape 2: Création du MPToken...");
        
        // Métadonnées complètes
        const metadata = {
            lot_number: lotNumber,
            nft_hash: nftHash,
            issuer_address: issuerAddress,
            prod_address: producteurAddress,
            labo_address: laboAddress,
            labo_public_key: laboPublicKey,
            labo_name: laboName,
            carrier_id: carrierId,
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
        
        // Transaction MPTokenIssuanceCreate
        const createTx = {
            TransactionType: "MPTokenIssuanceCreate",
            Account: issuerAddress,
            MaximumAmount: "1",
            AssetScale: 0,
            MPTokenMetadata: metadataHex,
            Flags: 0x00000001 | 0x00000004, // Transferable + Clawback
            TransferFee: 0
        };
        
        console.log("   → Le wallet va s'ouvrir pour signer...");
        const createResult = await walletManager.signAndSubmit(createTx);
        
        const createTxResult = createResult.result || createResult;
        if (createTxResult.meta?.TransactionResult !== "tesSUCCESS" &&
            createTxResult.engine_result !== "tesSUCCESS") {
            throw new Error(`MPT création échouée: ${createTxResult.meta?.TransactionResult || createTxResult.engine_result}`);
        }
        
        // Extraire le MPT ID
        let mptID = null;
        const affectedNodes = createTxResult.meta?.AffectedNodes || [];
        for (const node of affectedNodes) {
            if (node.CreatedNode?.LedgerEntryType === "MPTokenIssuance") {
                mptID = node.CreatedNode.LedgerIndex;
                break;
            }
        }
        
        const txHash = createTxResult.hash || createResult.hash;
        metadata.mpt_id = mptID;
        
        console.log("\n✨ MPToken créé avec succès !");
        console.log(`   MPT ID: ${mptID}`);
        console.log(`   TX Hash: ${txHash}`);
        console.log(`   Lot: ${lotNumber}`);
        
        return {
            success: true,
            mptID: mptID,
            txHash: txHash,
            signerListTxHash: signerTxResult.hash || signerResult.hash,
            metadata: metadata,
            error: null
        };
        
    } catch (error) {
        console.error("❌ Erreur création MPT:", error.message);
        return {
            success: false,
            mptID: null,
            txHash: null,
            metadata: null,
            error: error.message
        };
    }
}

module.exports = { createMPT };