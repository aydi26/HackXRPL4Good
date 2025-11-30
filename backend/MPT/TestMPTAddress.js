const xrpl = require("xrpl");
require('dotenv').config();
const { createMPT } = require("./CreationMPT.js");

/**
 * Crée un MPT sur un wallet spécifique à partir de sa seed
 * @param {string} issuerSeed - La seed du wallet issuer
 */
async function testCreateMPTWithAddress(issuerSeed) {
    console.log("=== CRÉATION MPT SUR WALLET SPÉCIFIQUE ===\n");

    // Connexion au Testnet
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    console.log("✅ Connecté au Testnet XRPL");

    try {
        // 1. Configuration des wallets
        console.log("\n💼 Configuration des wallets...");
        
        // Issuer : Chargé depuis la seed fournie
        const issuerWallet = xrpl.Wallet.fromSeed(issuerSeed);
        console.log("   👨‍🌾 Issuer:", issuerWallet.address);
        
        // Labo : Chargé depuis le .env avec secp256k1
        const seedLabo = process.env.LABO_MASTER_SEED;
        if (!seedLabo) {
            throw new Error("LABO_MASTER_SEED manquant dans le .env");
        }
        const laboWallet = xrpl.Wallet.fromSeed(seedLabo, { algorithm: "ecdsa-secp256k1" });
        console.log("   👨‍🔬 Labo:", laboWallet.address);
        
        // Producteur : Adresse depuis le .env
        const producteurAddress = process.env.COMPTE_PROD;
        if (!producteurAddress) {
            throw new Error("COMPTE_PROD manquant dans le .env");
        }
        console.log("   🏭 Producteur:", producteurAddress);

        // 2. Préparer les données
        const lotInfo = {
            nftHash: "0008000068296F7DB5CCDED443901D9B1BE455D5B171D316PROD",
            transporteurId: "TRANS_BIO_001",
            producteurAddress: producteurAddress
        };

        const laboInfo = {
            address: laboWallet.address,
            publicKey: laboWallet.publicKey,
            name: "Laboratoire Bio Certif"
        };

        // 3. Créer le MPT
        console.log("\n🚀 Lancement de createMPT...");
        const result = await createMPT(client, issuerWallet, lotInfo, laboInfo);

        console.log("\n" + "=".repeat(50));
        console.log("✅ MPT CRÉÉ AVEC SUCCÈS !");
        console.log("=".repeat(50));
        console.log("MPT ID:", result.mptID);
        console.log("SignerList Hash:", result.signerListHash);
        console.log("Issuer:", result.issuer);
        console.log("Labo:", result.laboAddress);

        return result;

    } catch (error) {
        console.error("\n❌ ERREUR:", error.message);
        console.error(error);
    } finally {
        await client.disconnect();
        console.log("\n🔌 Déconnecté");
    }
}

// Exécution
if (require.main === module) {
    // Récupérer la seed de l'issuer depuis le .env ou les arguments
    const issuerSeed = process.env.ISSUER_SEED || process.argv[2];
    
    if (!issuerSeed) {
        console.error("\n[ERREUR] : Seed de l'issuer manquante.");
        console.error("Usage: node TestMPTAddress.js <ISSUER_SEED>");
        console.error("   ou: Ajouter ISSUER_SEED dans le .env");
        process.exit(1);
    }
    
    testCreateMPTWithAddress(issuerSeed);
}

module.exports = { testCreateMPTWithAddress };
