require('dotenv').config({ path: '../.env' }); 
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
