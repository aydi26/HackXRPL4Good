const xrpl = require("xrpl");
require('dotenv').config();
const { encryptForNFT } = require("./Chiffrement.js"); 

// --- NOUVELLE FONCTION AVEC PARAMÈTRES POUR L'AGRICULTEUR ---

async function mintSemiPrivateNFT(agriSecret, laboSeed) {
    console.log("🚀 Démarrage du script de Mint (Architecture Hybride)...");
    
    // 1. Connexion au TESTNET
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    console.log("✅ Connecté au Testnet");
    
    try {
        // --- PREPARATION DES DONNEES ---
        const dataPublique = {
            p: "Pommes Bio",
            w: "1500kg",
            d: "2024-11-29",
            l: "Ferme du Soleil",
            n: "LOT-12345"
        };
        const imageSecrete = "ipfs://zobzobzobzobzobzozbozbozbzobzobzobzobzobzob"; 
        
        // 2. Création des Wallets
        console.log("\n💼 Configuration des Wallets...");
        
        // A. AGRICULTEUR (Minter) : Chargement à partir du secret donné
        // On suppose que l'Agriculteur a un wallet de type Ed25519 ou secp256k1 (le type n'est pas critique ici, seule la clé privée l'est)
        const walletAgriculteur = xrpl.Wallet.fromSeed(agriSecret);
        console.log(`   👨‍🌾 Agriculteur (Minter): ${walletAgriculteur.address} (Chargé)`);
        
        // B. LABO / MASTER : Chargement à partir du .env (Doit être secp256k1)
        const walletLabo = xrpl.Wallet.fromSeed(laboSeed, { algorithm: "ecdsa-secp256k1" });
        console.log(`   👨‍🔬 Labo (Master): ${walletLabo.address} (Chargé)`);

        
        console.log("\n🔐 Chiffrement...");

        // 3. APPEL DE TA FONCTION CRYPTO
        const cryptoResult = encryptForNFT(
            dataPublique, 
            imageSecrete, 
            walletLabo.publicKey
        );
        
        console.log("   ✅ URI et Seal Labo générés.");
        
        // 4. Construction de la transaction
        const mintTx = {
            TransactionType: "NFTokenMint",
            Account: walletAgriculteur.address, // Utilisation de l'adresse chargée
            URI: cryptoResult.uriHex,
            Flags: 8, 
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
        
        // 5. Soumission
        console.log("\n📤 Envoi sur la Blockchain...");
        
        // Vérifier l'état du compte Agriculteur avant de signer (Doit avoir des fonds)
        // Note: Cette vérification n'est pas nécessaire si le compte a déjà été financé (via le faucet, comme dans le script original), mais elle est cruciale si tu utilises une seed inactive.
        
        const ts_prepared = await client.autofill(mintTx);
        const ts_signed = walletAgriculteur.sign(ts_prepared); // Signature avec la clé de l'Agriculteur
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
            console.log("\n📋 Clé Privée Labo :", walletLabo.privateKey); // Clé pour tester le déchiffrement
            
        } else {
            console.error("❌ Échec de la transaction:", result.result.meta.TransactionResult);
        }
        
    } catch (error) {
        // Le code peut planter si le wallet n'a pas assez de fonds pour les frais (faut l'activer/le financer)
        console.error("❌ CRASH:", error.message);
    } finally {
        client.disconnect();
    }
}

// -------------------------------------------------------------------
// EXÉCUTION DU SCRIPT (On prend les secrets du .env)
// -------------------------------------------------------------------
if (require.main === module) {
    // Variables d'environnement
    const AGRI_SECRET = process.env.AGRI_SECRET; 
    const LABO_SECRET = process.env.LABO_MASTER_SEED;
    
    if (!AGRI_SECRET || !LABO_SECRET) {
        console.error("\n[ERREUR FATALE] : Les secrets de l'Agriculteur ou du Labo sont manquants dans le .env.");
        process.exit(1);
    }

    // Tu peux appeler ta fonction avec les secrets maintenant
    mintSemiPrivateNFT(AGRI_SECRET, LABO_SECRET);
}

module.exports = { mintSemiPrivateNFT };