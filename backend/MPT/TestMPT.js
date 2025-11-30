const xrpl = require("xrpl");
require('dotenv').config();
const { createMPT } = require("./CreationMPT.js");

async function testCreateMPT(issuerWallet) {
    console.log("=== TEST CRÉATION MPT DYNAMIQUE AVEC MULTI-SIG ===\n");

    // Connexion au Testnet
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    console.log("✅ Connecté au Testnet XRPL");

    try {
        // 1. Configuration des wallets
        console.log("\n💼 Configuration des wallets...");
        
        // Issuer : Le wallet passé en paramètre (celui qui appelle)
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
            nftHash: "000800009E297836632B1507B7B9D1C3A98F5AA082C43BECE82FE7B200C31717",
            transporteurId: "TRANS_BIO_001",
            producteurAddress: producteurAddress  // On passe l'adresse du producteur
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
        console.log("✅ TEST RÉUSSI !");
        console.log("=".repeat(50));
        console.log("MPT ID:", result.mptID);
        console.log("SignerList Hash:", result.signerListHash);
        console.log("Issuer:", result.issuer);
        console.log("Labo:", result.laboAddress);

    } catch (error) {
        console.error("\n❌ ERREUR:", error.message);
        console.error(error);
    } finally {
        await client.disconnect();
        console.log("\n🔌 Déconnecté");
    }
}

// Exécution du test
if (require.main === module) {
    // Pour le test, on génère un wallet issuer et on le fund
    (async () => {
        const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await client.connect();
        
        console.log("💰 Création et financement du wallet Issuer pour le test...");
        const issuerWallet = (await client.fundWallet()).wallet;
        
        await client.disconnect();
        
        // Appel de la fonction avec le wallet issuer
        await testCreateMPT(issuerWallet);
    })();
}

module.exports = { testCreateMPT };
