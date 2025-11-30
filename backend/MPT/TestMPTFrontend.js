/**
 * Test de création MPT - Simule un appel frontend
 * 
 * Ce fichier simule comment le frontend appellerait createMPT
 * en créant un "faux" walletManager qui se comporte comme xrpl-connect
 */
require('dotenv').config();
const xrpl = require("xrpl");

async function testCreateMPTFrontend() {
    console.log("=".repeat(60));
    console.log("🧪 TEST CRÉATION MPT (simulation frontend)");
    console.log("=".repeat(60));

    // 1. Connexion au Testnet XRPL
    console.log("\n📡 Connexion au Testnet XRPL...");
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    console.log("   ✅ Connecté au Testnet");

    try {
        // 2. Création des wallets de test
        console.log("\n💰 Création des wallets de test via Faucet...");
        
        // Wallet de l'agriculteur (issuer)
        const issuerFund = await client.fundWallet();
        const issuerWallet = issuerFund.wallet;
        console.log("   ✅ Wallet Issuer (Agriculteur):", issuerWallet.address);
        
        // Wallet du labo
        const laboFund = await client.fundWallet();
        const laboWallet = laboFund.wallet;
        console.log("   ✅ Wallet Labo:", laboWallet.address);
        
        // Wallet du producteur/acheteur
        const prodFund = await client.fundWallet();
        const prodWallet = prodFund.wallet;
        console.log("   ✅ Wallet Producteur:", prodWallet.address);

        // 3. Créer un "faux" walletManager qui simule xrpl-connect
        // C'est exactement ce que fait Crossmark/GemWallet en coulisses
        const fakeWalletManager = {
            signAndSubmit: async (tx) => {
                console.log("   🔐 [Simulation Crossmark] Wallet signe la transaction...");
                console.log("      Type:", tx.TransactionType);
                
                // Autofill + Sign + Submit (comme le fait xrpl-connect)
                const prepared = await client.autofill(tx);
                const signed = issuerWallet.sign(prepared);
                const result = await client.submitAndWait(signed.tx_blob);
                
                console.log("   ✅ [Simulation Crossmark] Transaction soumise");
                return result;
            }
        };

        // 4. Paramètres du MPT (comme dans le formulaire frontend)
        const nftHash = "00080000C9D0BCC9C610D699AB1356379401E865B586EDB27192CDB800C3171D";
        const issuerAddress = issuerWallet.address;
        const producteurAddress = prodWallet.address;
        const laboAddress = process.env.LABO_ADRESS;
        const laboPublicKey = process.env.LABO_PUBKEY;

        console.log("\n📦 Paramètres du MPT (comme un formulaire React):");
        console.log("   NFT Hash:", nftHash.substring(0, 20) + "...");
        console.log("   Issuer:", issuerAddress);
        console.log("   Producteur:", producteurAddress);
        console.log("   Labo:", laboAddress);

        // 5. Appel de createMPT (même logique que mptService.js)
        console.log("\n" + "=".repeat(60));
        console.log("🔗 Appel de createMPT (comme dans React)...");
        console.log("   const result = await createMPT(walletManager, ...)");
        console.log("=".repeat(60));
        
        const result = await createMPT(
            fakeWalletManager,
            nftHash,
            issuerAddress,
            producteurAddress,
            laboAddress,
            laboPublicKey
        );
        
        console.log("=".repeat(60));

        // 6. Affichage du résultat
        console.log("\n📋 RÉSULTAT DU TEST:");
        console.log("-".repeat(40));
        
        if (result.success) {
            console.log("✅ SUCCÈS !");
            console.log("   MPT ID:", result.mptID);
            console.log("   TX Hash:", result.txHash);
            console.log("   SignerList TX:", result.signerListTxHash);
            console.log("\n📝 Métadonnées stockées on-chain:");
            console.log("   nft_hash:", result.metadata.nft_hash.substring(0, 20) + "...");
            console.log("   issuer_address:", result.metadata.issuer_address);
            console.log("   prod_address:", result.metadata.prod_address);
            console.log("   labo_address:", result.metadata.labo_address);
            console.log("   status:", result.metadata.status);
            console.log("   step:", result.metadata.step);
            console.log("\n🔗 Voir sur l'explorer:");
            console.log(`   https://testnet.xrpl.org/transactions/${result.txHash}`);
        } else {
            console.log("❌ ÉCHEC");
            console.log("   Erreur:", result.error);
        }

    } catch (error) {
        console.error("\n❌ Erreur pendant le test:", error.message);
        console.error(error.stack);
    } finally {
        console.log("\n🔌 Déconnexion...");
        await client.disconnect();
        console.log("   ✅ Déconnecté");
        console.log("\n" + "=".repeat(60));
        console.log("🏁 FIN DU TEST");
        console.log("=".repeat(60));
    }
}

// ═══════════════════════════════════════════════════════════════════
// Fonction createMPT - Même logique que mptService.js (frontend)
// Mais avec Buffer.from() au lieu de TextEncoder (Node.js)
// ═══════════════════════════════════════════════════════════════════

async function createMPT(
    walletManager,
    nftHash,
    issuerAddress,
    producteurAddress,
    laboAddress,
    laboPublicKey
) {
    console.log("\n🔗 Création MPToken...");
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
        // ÉTAPE 1: Configuration SignerList
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
        
        const signerResult = await walletManager.signAndSubmit(signerListTx);
        
        const signerTxResult = signerResult.result || signerResult;
        if (signerTxResult.meta?.TransactionResult !== "tesSUCCESS" &&
            signerTxResult.engine_result !== "tesSUCCESS") {
            throw new Error(`SignerList échoué: ${signerTxResult.meta?.TransactionResult || signerTxResult.engine_result}`);
        }
        
        console.log("   ✅ SignerList configurée");

        // ÉTAPE 2: Création du MPToken
        console.log("\n🪙 Étape 2: Création du MPToken...");
        
        const metadata = {
            nft_hash: nftHash,
            issuer_address: issuerAddress,
            prod_address: producteurAddress,
            labo_address: laboAddress,
            labo_public_key: laboPublicKey,
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
        
        const createTx = {
            TransactionType: "MPTokenIssuanceCreate",
            Account: issuerAddress,
            MaximumAmount: "1",
            AssetScale: 0,
            MPTokenMetadata: metadataHex,
            Flags: 0x00000020 | 0x00000040, // tfMPTCanTransfer + tfMPTCanClawback
            TransferFee: 0
        };
        
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

// Lancer le test
testCreateMPTFrontend();
