const xrpl = require("xrpl");

/**
 * Crée un MPToken Dynamique (XLS-94) avec multi-signature pour le suivi d'un lot.
 * Configure automatiquement une SignerList avec l'Issuer et le Labo.
 * 
 * @param {xrpl.Client} client - Client XRPL connecté.
 * @param {xrpl.Wallet} issuerWallet - Le wallet de l'Issuer (Agriculteur/Producteur).
 * @param {Object} lotInfo - Informations du lot
 * @param {string} lotInfo.nftHash - Le NFTokenID (identifiant unique du lot).
 * @param {string} lotInfo.transporteurId - L'identifiant du transporteur.
 * @param {string} lotInfo.producteurAddress - L'adresse XRPL du Producteur (Acheteur).
 * @param {Object} laboInfo - Informations du laboratoire
 * @param {string} laboInfo.address - L'adresse XRPL du laboratoire.
 * @param {string} laboInfo.publicKey - La clé publique du laboratoire.
 * @param {string} laboInfo.name - Le nom du laboratoire (optionnel).
 * @returns {Promise<Object>} { mptID, signerListHash } - ID du MPT et hash de la SignerList.
 */
async function createMPT(client, issuerWallet, lotInfo, laboInfo) {
    console.log(`\n🔗 Initialisation du MPToken pour le lot : ${lotInfo.nftHash.substring(0, 8)}...`);

    // 1. Préparation des Métadonnées
    const initialData = {
        step: 1,
        status: "SALE_INITIATED", 
        nft_hash: lotInfo.nftHash,        
        carrier_id: lotInfo.transporteurId, 
        
        // Identifiants pour l'auditabilité
        issuer_id: issuerWallet.publicKey,      // L'Issuer (Agriculteur/Producteur)
        prod_address: lotInfo.producteurAddress, // L'adresse du Producteur/Acheteur
        labo_id: laboInfo.publicKey,            // Le Laboratoire
        labo_name: laboInfo.name || "Laboratory",
        
        history: [{ 
            action: "CREATED", 
            by: issuerWallet.address, 
            timestamp: Date.now()
        }],
        timestamp: Date.now()
    };

    // Conversion en Hexadécimal (requis par le Ledger)
    const metadataHex = Buffer.from(JSON.stringify(initialData), 'utf8').toString('hex');

    // 2. Configuration de la SignerList (Labo uniquement, Quorum = 1)
    // Note: Le compte propriétaire ne peut pas être dans sa propre SignerList
    console.log("📝 Configuration de la SignerList (Multi-Sig)...");
    
    const signerListTx = {
        TransactionType: "SignerListSet",
        Account: issuerWallet.address,
        SignerQuorum: 1,  // Une seule signature requise
        SignerEntries: [
            {
                SignerEntry: {
                    Account: laboInfo.address,
                    SignerWeight: 1
                }
            }
        ]
    };

    const preparedSigner = await client.autofill(signerListTx);
    const signedSigner = issuerWallet.sign(preparedSigner);
    const signerResult = await client.submitAndWait(signedSigner.tx_blob);

    if (signerResult.result.meta.TransactionResult !== "tesSUCCESS") {
        throw new Error(`Echec de la configuration SignerList : ${signerResult.result.meta.TransactionResult}`);
    }

    console.log("✅ SignerList configurée avec succès");
    console.log(`   - Labo: ${laboInfo.address} (autorisé à signer)`);
    console.log(`   - Issuer: ${issuerWallet.address} (propriétaire, signe toujours)`);
    console.log(`   - Quorum: 1 (une signature suffit)`);

    // 3. Construction de la transaction d'émission MPT
    console.log("\n🪙 Création du Dynamic MPT...");
    
    const createTx = {
        TransactionType: "MPTokenIssuanceCreate",
        Account: issuerWallet.address,
        MaximumAmount: "1",
        AssetScale: 0,
        MPTokenMetadata: metadataHex, 
        
        // FLAGS : Transferable + Clawback
        Flags: xrpl.MPTokenIssuanceCreateFlags.tfMPTCanTransfer | 
               xrpl.MPTokenIssuanceCreateFlags.tfMPTCanClawback,
        TransferFee: 0
    };

    // 4. Soumission de la transaction (Signée par l'Issuer)
    const prepared = await client.autofill(createTx);
    const signed = issuerWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    if (result.result.meta.TransactionResult !== "tesSUCCESS") {
        throw new Error(`Echec de la création MPT : ${result.result.meta.TransactionResult}`);
    }

    // 5. Extraction de l'ID
    const affectedNodes = result.result.meta.AffectedNodes;
    const createdNode = affectedNodes.find(n => n.CreatedNode?.LedgerEntryType === "MPTokenIssuance");
    const mptID = createdNode.CreatedNode.LedgerIndex;
    
    console.log(`✅ Dynamic MPT créé avec succès !`);
    console.log(`   MPT ID: ${mptID}`);
    console.log(`   Flags: Transferable ✓ | Clawback ✓`);
    console.log(`   Multi-Sig: Enabled ✓ (Issuer + Labo)`);
    
    return {
        mptID,
        signerListHash: signerResult.result.hash,
        issuer: issuerWallet.address,
        laboAddress: laboInfo.address
    };
}

module.exports = { createMPT };