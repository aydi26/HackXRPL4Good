require('dotenv').config(); 
const xrpl = require("xrpl");

// ON RÉCUPÈRE LA SEED DU .ENV
const seedLabo = process.env.LABO_MASTER_SEED;

if (!seedLabo) {
    throw new Error("Seed du Labo introuvable dans le .env !");
}

// ON RECRÉE LE WALLET À PARTIR DE LA SEED
// (N'oublie pas l'option secp256k1, c'est vital pour le Labo !)
const labo = xrpl.Wallet.fromSeed(seedLabo, { algorithm: "ecdsa-secp256k1" });

console.log("✅ Labo chargé :", labo.address);
// Maintenant tu peux utiliser labo pour déchiffrer
const { encryptForNFT, decryptNFT } = require("./Chiffrement.js");

console.log("🚀 TEST FINAL : Architecture Donnée Publique / Image Privée");

// 1. Acteurs
// Agriculteur & Producteur = Wallets Classiques (Ed25519) -> OK !
const agriculteur = xrpl.Wallet.generate(); 
const producteur = xrpl.Wallet.generate();

// Labo = Wallet Spécial (secp256k1) -> OBLIGATOIRE POUR ECIES


console.log("👨‍🌾 Agriculteur (Ed25519) prêt.");
console.log("👨‍🔬 Labo (secp256k1) prêt.");

// 2. Données
const data = { p: "Pommes Bio", w: 1000, d:"2024-06-01", l: "Ferme du Soleil", n:"12345" };
const imageSecrete = "ipfs://zobzobzobzobzobzobzobzobzobzobzobzobzob"; // Lien IPFS de l'image privée

// --- ETAPE 1 : CHIFFREMENT ---
console.log("\n🔒 Création du NFT...");
const nft = encryptForNFT(data, imageSecrete, labo.publicKey);

console.log("   URI Hex :", nft.uriHex.substring(0, 20) + "...");
console.log("   Seal Labo :", nft.sealImageForLabo.substring(0, 20) + "...");

// --- ETAPE 2 : LE PRODUCTEUR SCANNE ---
console.log("\n👀 Le Producteur regarde (Sans clé Labo)...");
const vueProd = decryptNFT(nft.uriHex); // Pas de seal, pas de clé privée
console.log("   > Voit Data :", vueProd.publicData.p); // Doit voir "Pommes Bio"
console.log("   > Voit Image :", vueProd.imageDecrypted);    // Doit voir null

// --- ETAPE 3 : LE LABO SCANNE ---
console.log("\n🕵️‍♀️ Le Labo regarde (Avec sa clé privée)...");
const vueLabo = decryptNFT(nft.uriHex, nft.sealImageForLabo, labo.privateKey);
console.log("   > Voit Data :", vueLabo.publicData.p); // Doit voir "Pommes Bio"
console.log("   > Voit Image :", vueLabo.imageDecrypted);    // Doit voir "ipfs://Qm..."

if (vueLabo.imageDecrypted === imageSecrete) {
    console.log("\n✅ SUCCÈS TOTAL ! Ton code est valide.");
} else {
    console.log("\n❌ ERREUR : L'image ne correspond pas.");
}