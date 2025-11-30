const xrpl = require("xrpl");

const masterLabo = xrpl.Wallet.generate("ecdsa-secp256k1");

console.log("Adresse Labo :", masterLabo.address);
console.log("Seed Labo (Secret) :", masterLabo.seed); 
console.log("Clé Publique Labo :", masterLabo.publicKey);
