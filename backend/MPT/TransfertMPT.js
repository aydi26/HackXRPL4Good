/**
 * Transfert de MPToken
 * 
 * Fonction pour transférer un MPToken à une adresse destinataire
 * (tfMPTCanTransfer activé = pas besoin d'autorisation)
 */

/**
 * Transfère un MPToken à une adresse destinataire
 * 
 * @param {Object} walletManager - WalletManager depuis useWallet() (frontend)
 * @param {string} mptIssuanceID - L'ID du MPToken Issuance (le MPT ID)
 * @param {string} senderAddress - Adresse de l'expéditeur (celui qui envoie)
 * @param {string} destinationAddress - Adresse du destinataire
 * @param {string} amount - Montant à transférer (généralement "1" pour un token unique)
 * @returns {Promise<Object>} { success, txHash, error }
 * 
 * @example
 * // Dans le frontend:
 * import { useWallet } from "@/components/providers/WalletProvider";
 * import { transferMPT } from "@/lib/transferMPT";
 * 
 * const { walletManager, accountInfo } = useWallet();
 * 
 * const result = await transferMPT(
 *     walletManager,
 *     "000003B5B8138CDEC83CB4A481C9B8D5F24DAA...", // MPT ID
 *     accountInfo.address,                         // Mon adresse
 *     "rDESTINATION123..."                         // Adresse destinataire
 * );
 */
async function transferMPT(
    walletManager,
    mptIssuanceID,
    senderAddress,
    destinationAddress,
    amount = "1"
) {
    console.log("📤 Transfert MPToken...");
    console.log("   MPT ID:", mptIssuanceID?.substring(0, 20) + "...");
    console.log("   De:", senderAddress);
    console.log("   Vers:", destinationAddress);
    console.log("   Montant:", amount);

    // Validation
    if (!walletManager) {
        return { success: false, txHash: null, error: "Wallet non connecté" };
    }
    if (!mptIssuanceID) {
        return { success: false, txHash: null, error: "MPT ID manquant" };
    }
    if (!senderAddress) {
        return { success: false, txHash: null, error: "Adresse expéditeur manquante" };
    }
    if (!destinationAddress) {
        return { success: false, txHash: null, error: "Adresse destinataire manquante" };
    }

    try {
        console.log("\n📝 Préparation du transfert...");

        // Transaction Payment avec MPToken
        const transferTx = {
            TransactionType: "Payment",
            Account: senderAddress,
            Destination: destinationAddress,
            Amount: {
                mpt_issuance_id: mptIssuanceID,
                value: amount
            }
        };

        console.log("   → Le wallet va s'ouvrir pour signer...");
        const result = await walletManager.signAndSubmit(transferTx);

        const txResult = result.result || result;
        if (txResult.meta?.TransactionResult !== "tesSUCCESS" &&
            txResult.engine_result !== "tesSUCCESS") {
            throw new Error(`Transfert échoué: ${txResult.meta?.TransactionResult || txResult.engine_result}`);
        }

        const txHash = txResult.hash || result.hash;

        console.log("\n✨ MPToken transféré avec succès !");
        console.log(`   TX Hash: ${txHash}`);
        console.log(`   Destinataire: ${destinationAddress}`);

        return {
            success: true,
            txHash: txHash,
            sender: senderAddress,
            destination: destinationAddress,
            mptIssuanceID: mptIssuanceID,
            amount: amount,
            error: null
        };

    } catch (error) {
        console.error("❌ Erreur transfert MPT:", error.message);
        return {
            success: false,
            txHash: null,
            error: error.message
        };
    }
}

module.exports = { transferMPT };
