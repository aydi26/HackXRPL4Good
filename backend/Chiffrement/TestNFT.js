/**
 * Test du mint NFT semi-privé
 * Ce fichier crée un wallet testnet et teste la fonction mintSemiPrivateNFT
 */
require('dotenv').config();
const xrpl = require("xrpl");
const { mintSemiPrivateNFT } = require("./MintNFTVRAIMENT.js");

// Clé publique du labo pour test (format secp256k1 hex)
// En production, cette clé viendrait de la config ou d'une API
const LABO_PUBLIC_KEY_TEST = process.env.LABO_PUBKEY; // Clé fictive pour test

async function testMintNFT() {
    console.log("=".repeat(60));
    console.log("🧪 TEST MINT NFT SEMI-PRIVÉ");
    console.log("=".repeat(60));

    // 1. Connexion au Testnet XRPL
    console.log("\n📡 Connexion au Testnet XRPL...");
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();
    console.log("   ✅ Connecté au Testnet");

    try {
        // 2. Création d'un wallet de test via le Faucet
        console.log("\n💰 Création d'un wallet de test via Faucet...");
        const fundResult = await client.fundWallet();
        const testWallet = fundResult.wallet;
        
        console.log("   ✅ Wallet créé et financé");
        console.log("   📍 Adresse:", testWallet.address);
        console.log("   💵 Balance:", fundResult.balance, "XRP");
        console.log("   🔑 Seed (pour référence):", testWallet.seed);

        // 3. Données de test pour le produit
        const publicData = {
            productType: "Tomates Bio",
            weight: "500",
            date: "2025-11-30",
            lotNumber: "LOT-TEST-001",
            labo: "Labo Qualité Agricole",
            price: "25.50"
        };

        const ipfsImageLink = "ipfs://QmTestImageHash123456789abcdef";

        console.log("\n📦 Données du produit:");
        console.log("   Produit:", publicData.productType);
        console.log("   Poids:", publicData.weight, "kg");
        console.log("   Date:", publicData.date);
        console.log("   Lot:", publicData.lotNumber);
        console.log("   Labo:", publicData.labo);
        console.log("   Prix:", publicData.price, "€");
        console.log("   Image IPFS:", ipfsImageLink);

        // 4. Appel de la fonction de mint
        console.log("\n" + "=".repeat(60));
        const result = await mintSemiPrivateNFT(
            client,
            testWallet,
            publicData,
            ipfsImageLink,
            LABO_PUBLIC_KEY_TEST
        );
        console.log("=".repeat(60));

        // 5. Affichage du résultat
        console.log("\n📋 RÉSULTAT DU TEST:");
        console.log("-".repeat(40));
        
        if (result.success) {
            console.log("✅ SUCCÈS !");
            console.log("   NFT Token ID:", result.nftTokenId);
            console.log("   TX Hash:", result.txHash);
            console.log("   Seller:", result.sellerAddress);
            console.log("\n🔗 Voir sur l'explorer:");
            console.log(`   https://testnet.xrpl.org/transactions/${result.txHash}`);
            console.log(`   https://testnet.xrpl.org/accounts/${result.sellerAddress}/nfts`);
        } else {
            console.log("❌ ÉCHEC");
            console.log("   Erreur:", result.error);
        }

    } catch (error) {
        console.error("\n❌ Erreur pendant le test:", error.message);
        console.error(error.stack);
    } finally {
        // 6. Déconnexion
        console.log("\n🔌 Déconnexion...");
        await client.disconnect();
        console.log("   ✅ Déconnecté");
        console.log("\n" + "=".repeat(60));
        console.log("🏁 FIN DU TEST");
        console.log("=".repeat(60));
    }
}

// Lancer le test
testMintNFT();
