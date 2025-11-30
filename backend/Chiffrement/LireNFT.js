require('dotenv').config();
const xrpl = require("xrpl");
const { decryptNFT } = require("./Chiffrement.js"); 

// ---------------------------------------------------------
const TX_HASH_A_LIRE = "0EA220CF52ABC5A6A5828EC9B2DA3B73BBAFC76E722406A5FF35184F6C6C4DDD";
// ---------------------------------------------------------

async function lireEtDechiffrer() {
    console.log("🚀 Démarrage du script de Lecture & Déchiffrement...");

    // 1. Vérifications
    if (!process.env.LABO_MASTER_SEED) {
        console.error("❌ ERREUR : La variable LABO_MASTER_SEED est manquante dans le .env");
        process.exit(1);
    }

    // 2. Connexion Testnet
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    console.log("✅ Connecté au Testnet");

    try {
        // 3. Wallet Labo
        const walletLabo = xrpl.Wallet.fromSeed(process.env.LABO_MASTER_SEED, { 
            algorithm: "ecdsa-secp256k1" 
        });
        console.log("👨‍🔬 Labo identifié :", walletLabo.address);

        // 4. Récupération Transaction
        console.log(`\n🔍 Recherche de la transaction...`);
        
        const txResponse = await client.request({
            command: "tx",
            transaction: TX_HASH_A_LIRE
        });

        const result = txResponse.result;

        if (result.error === "txnNotFound") {
            throw new Error("Transaction introuvable !");
        }

        const tx = result.tx_json || result.transaction || result; 
        
        if (!tx || !tx.TransactionType) {
            console.log("DEBUG JSON:", JSON.stringify(result, null, 2));
            throw new Error("Impossible de trouver les données de la transaction.");
        }

        console.log("   Transaction trouvée ! Type :", tx.TransactionType);

        if (tx.TransactionType !== "NFTokenMint") {
            throw new Error(`Ce n'est pas un Mint de NFT !`);
        }

        // 5. Extraction URI
        const uriHex = tx.URI;
        if (!uriHex) throw new Error("Aucun URI trouvé !");
        console.log("   📦 URI récupéré.");

        // 6. Recherche du Seal (CORRIGÉE)
        let sealHex = null;
        const targetMemoType = Buffer.from("SEAL_IMG_LABO", "utf8").toString("hex");

        if (tx.Memos && tx.Memos.length > 0) {
            // Comparaison insensible à la casse (Majuscule/Minuscule)
            const memoObj = tx.Memos.find(m => 
                m.Memo.MemoType.toUpperCase() === targetMemoType.toUpperCase()
            );
            
            if (memoObj) {
                sealHex = memoObj.Memo.MemoData;
                console.log("   🔐 Seal Labo récupéré.");
            } else {
                console.warn("   ⚠️ Memo 'SEAL_IMG_LABO' absent. Types trouvés :");
                tx.Memos.forEach(m => console.log("      >", m.Memo.MemoType));
            }
        } else {
            console.warn("   ⚠️ Aucun Memo trouvé.");
        }

        // 7. Déchiffrement
        console.log("\n🔓 Tentative de déchiffrement...");
        const resultat = decryptNFT(uriHex, sealHex, walletLabo.privateKey);

        // 8. Résultats
        console.log("===================================================");
        console.log("👁️  VUE PUBLIQUE (Data)");
        console.log("   Données :", resultat.publicData);
        
        console.log("\n👁️  VUE LABO (Image)");
        if (resultat.imageDecrypted) {
            console.log("   ✅ IMAGE DÉCHIFFRÉE !");
            console.log("   📷 Lien :", resultat.imageDecrypted);
        } else {
            console.log("   ❌ Image chiffrée (illisible).");
        }
        console.log("===================================================");

    } catch (error) {
        console.error("❌ CRASH :", error.message);
    } finally {
        client.disconnect();
    }
}

lireEtDechiffrer();