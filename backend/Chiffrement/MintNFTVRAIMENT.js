const xrpl = require("xrpl");
require('dotenv').config();
const { encryptForNFT } = require("./Chiffrement.js");

/**
 * Mint un NFT semi-privé avec données publiques et image chiffrée
 * 
 * @param {xrpl.Client} client - Client XRPL connecté
 * @param {xrpl.Wallet} sellerWallet - Wallet du vendeur (signataire de la transaction)
 * @param {Object} publicData - Données publiques du produit (lisibles par tous)
 * @param {string} publicData.productType - Type de produit (ex: "Apple", "Grape")
 * @param {string} publicData.weight - Poids en kg (ex: "1500")
 * @param {string} publicData.date - Date (ex: "2024-11-29")
 * @param {string} publicData.lotNumber - Numéro de lot (ex: "LOT-2024-ABC")
 * @param {string} publicData.labo - Laboratoire (ex: "Laboratoire XYZ")
 * @param {string} publicData.price - Prix (ex: "10.5")
 * @param {string} ipfsImageLink - Lien IPFS de l'image/certificat à chiffrer (ex: "ipfs://Qm...")
 * @param {string} laboPublicKey - Clé publique du labo (pour le chiffrement ECIES)
 * @returns {Promise<Object>} { success, nftTokenId, txHash, uriHex, sealHex, error }
 */
async function mintSemiPrivateNFT(client, sellerWallet, publicData, ipfsImageLink, laboPublicKey) {
    console.log("🚀 Mint NFT Semi-Privé...");
    
    try {
        // 1. Validation des paramètres
        if (!client || !client.isConnected()) {
            throw new Error("Client XRPL non connecté");
        }
        if (!sellerWallet || !sellerWallet.address) {
            throw new Error("Wallet vendeur invalide");
        }
        if (!publicData) {
            throw new Error("Données publiques manquantes");
        }
        if (!ipfsImageLink) {
            throw new Error("Lien IPFS de l'image manquant");
        }
        if (!laboPublicKey) {
            throw new Error("Clé publique du labo manquante");
        }

        // 2. Formatage des données publiques (format compact pour le ledger)
        const dataPublique = {
            p: publicData.productType || "Unknown",           // Produit
            w: `${publicData.weight}kg`,                      // Poids
            d: publicData.date || new Date().toISOString().split('T')[0], // Date
            l: publicData.labo || "Unknown",                  // Labo
            n: publicData.lotNumber || `LOT-${Date.now()}`,   // Numéro de lot
            pr: publicData.price || "0",                      // Prix            // Prix par kg (1=oui, 0=non)
        };

        console.log("📦 Données publiques:", dataPublique);
        console.log("🔒 Image à chiffrer:", ipfsImageLink);

        // 3. Chiffrement avec ta fonction
        console.log("\n🔐 Chiffrement en cours...");
        const cryptoResult = encryptForNFT(
            dataPublique,
            ipfsImageLink,
            laboPublicKey
        );

        console.log("   ✅ URI généré (données claires + image chiffrée)");
        console.log("   ✅ Seal Labo généré (clé pour déchiffrer)");

        // 4. Construction de la transaction NFTokenMint
        console.log("\n🎨 Construction de la transaction...");
        
        const mintTx = {
            TransactionType: "NFTokenMint",
            Account: sellerWallet.address,
            
            // L'URI contient le JSON avec données publiques + image chiffrée
            URI: cryptoResult.uriHex,
            
            Flags: 8, // tfTransferable - Le NFT peut être transféré
            NFTokenTaxon: 0,
            
            // MEMO : Le Seal chiffré pour le Labo (lui seul peut déchiffrer l'image)
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

        // 5. Soumission de la transaction
        console.log("\n📤 Envoi sur la Blockchain...");
        const prepared = await client.autofill(mintTx);
        const signed = sellerWallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        // 6. Vérification du résultat
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            // Extraire le NFT Token ID
            const affectedNodes = result.result.meta.AffectedNodes;
            let nftTokenId = null;

            // Chercher dans les nœuds créés/modifiés
            for (const node of affectedNodes) {
                if (node.CreatedNode?.LedgerEntryType === "NFTokenPage" ||
                    node.ModifiedNode?.LedgerEntryType === "NFTokenPage") {
                    
                    const nftTokens = node.CreatedNode?.NewFields?.NFTokens || 
                                     node.ModifiedNode?.FinalFields?.NFTokens;
                    
                    if (nftTokens && nftTokens.length > 0) {
                        // Prendre le dernier token créé
                        nftTokenId = nftTokens[nftTokens.length - 1].NFToken?.NFTokenID;
                    }
                }
            }

            console.log("\n✨ SUCCÈS ! NFT Minté.");
            console.log("   TX Hash:", result.result.hash);
            console.log("   NFT Token ID:", nftTokenId || "(voir sur l'explorer)");

            return {
                success: true,
                nftTokenId: nftTokenId,
                txHash: result.result.hash,
                uriHex: cryptoResult.uriHex,
                sealHex: cryptoResult.sealImageForLabo,
                sellerAddress: sellerWallet.address,
                error: null
            };

        } else {
            const errorMsg = `Transaction échouée: ${result.result.meta.TransactionResult}`;
            console.error("❌", errorMsg);
            
            return {
                success: false,
                nftTokenId: null,
                txHash: null,
                uriHex: null,
                sealHex: null,
                sellerAddress: sellerWallet.address,
                error: errorMsg
            };
        }

    } catch (error) {
        console.error("❌ Erreur mint NFT:", error.message);
        
        return {
            success: false,
            nftTokenId: null,
            txHash: null,
            uriHex: null,
            sealHex: null,
            sellerAddress: sellerWallet?.address || null,
            error: error.message
        };
    }
}
module.exports = { mintSemiPrivateNFT };