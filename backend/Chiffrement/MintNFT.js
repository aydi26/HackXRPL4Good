const xrpl = require("xrpl");
require('dotenv').config();
const { encryptForNFT } = require("./Chiffrement.js"); // Vérifie que le nom du fichier est bon !

async function mintSemiPrivateNFT() {
    console.log("🚀 Démarrage du script de Mint (Architecture Hybride)...");
    
    // 1. Connexion au TESTNET
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    console.log("✅ Connecté au Testnet");
    
    try {
        // --- PREPARATION DES DONNEES (Je les ai remises ici pour que ça marche) ---
        const dataPublique = {
            p: "Pommes Bio",
            w: "1500kg",
            d: "2024-11-29",
            l: "Ferme du Soleil",
            n: "LOT-12345",
            pc: "price"
        };
        const imageSecrete = "ipfs://zobzobzobzobzobzozbozbozbzobzobzobzobzobzob"; // Lien IPFS de l'image privée
        // -----------------------------------------------------------------------

        // 2. Création des Wallets
        console.log("\n💼 Configuration des Wallets...");
        
        // A. AGRICULTEUR (Celui qui Mint) - Besoin de fonds
        const walletAgriculteur = (await client.fundWallet()).wallet;
        console.log("   👨‍🌾 Agriculteur (Minter):", walletAgriculteur.address);
        
        // B. LABO / MASTER (Récupéré depuis .env)
        const seedLabo = process.env.LABO_MASTER_SEED;
        if (!seedLabo) throw new Error("Seed Labo manquante dans .env");

        // IMPORTANT : On force l'algo compatible ECIES
        const walletLabo = xrpl.Wallet.fromSeed(seedLabo, { algorithm: "ecdsa-secp256k1" });
        console.log("   👨‍🔬 Labo (Master):", walletLabo.address);

        
        console.log("\n🔐 Chiffrement...");
        console.log("   Données Publiques :", dataPublique);

        // 3. APPEL DE TA FONCTION CRYPTO
        const cryptoResult = encryptForNFT(
            dataPublique, 
            imageSecrete, 
            walletLabo.publicKey
        );
        
        console.log("   ✅ URI généré (Contient Data claire + Image chiffrée)");
        console.log("   ✅ Seal Labo généré (Memo)");
        
        // 4. Construction de la transaction
        console.log("\n🎨 Construction de la transaction NFTokenMint...");
        
        const mintTx = {
            TransactionType: "NFTokenMint",
            Account: walletAgriculteur.address,
            
            // L'URI contient le JSON (mixte clair/chiffré) converti en Hex
            URI: cryptoResult.uriHex,
            
            Flags: 8, // tfTransferable
            NFTokenTaxon: 0, 
            
            // MEMOS : Un seul Memo (Le Seal pour le Labo)
            Memos: [
                {
                    Memo: {
                        // Type : SEAL_IMG_LABO (en Hex)
                        MemoType: Buffer.from("SEAL_IMG_LABO", "utf8").toString("hex"),
                        // Data : Le Seal chiffré pour le Labo
                        MemoData: cryptoResult.sealImageForLabo,
                        MemoFormat: Buffer.from("hex", "utf8").toString("hex")
                    }
                }
            ]
        };
        
        // 5. Soumission
        console.log("\n📤 Envoi sur la Blockchain...");
        const ts_prepared = await client.autofill(mintTx);
        const ts_signed = walletAgriculteur.sign(ts_prepared);
        const result = await client.submitAndWait(ts_signed.tx_blob);
        
        // 6. Vérification
        if (result.result.meta.TransactionResult === "tesSUCCESS") {
            console.log("\n✨ SUCCÈS ! NFT Minté.");
            console.log("   TX Hash:", result.result.hash);
            
            const affectedNodes = result.result.meta.AffectedNodes;
            const createdNode = affectedNodes.find(n => n.CreatedNode?.LedgerEntryType === "NFTokenPage" || n.ModifiedNode?.LedgerEntryType === "NFTokenPage");
            
            if(createdNode) {
                 console.log("   (Le NFT est bien enregistré dans le Ledger)");
            }

            console.log("\n📋 GARDE ÇA POUR TESTER LE DÉCHIFFREMENT :");
            console.log("   URI Hex à copier :", cryptoResult.uriHex);
            console.log("   Seal Hex à copier :", cryptoResult.sealImageForLabo);
            
        } else {
            console.error("❌ Erreur Transaction:", result.result.meta.TransactionResult);
        }
        
    } catch (error) {
        console.error("❌ CRASH:", error);
    } finally {
        client.disconnect();
    }
}

// Lancer le script
mintSemiPrivateNFT();