const CryptoJS = require("crypto-js");
const ecies = require("eciesjs"); 
const { randomBytes } = require("crypto");

/**
 * FONCTION 1 : CHIFFREMENT HYBRIDE (Agriculteur)
 * - Données Textes : EN CLAIR (Visible par tous sur le NFT)
 * - Image : CHIFFRÉE (Visible uniquement par le Labo/Master)
 */
function encryptForNFT(publicDataJSON, ipfslink, laboPubKey) {
    try {
        // 1. Préparation des données publiques
        // On clone pour ne pas toucher l'objet original
        const finalPayload = { ...publicDataJSON };

        // 2. Chiffrement de l'Image (Partie Privée)
        // Génération d'une clé AES jetable juste pour cette image
        const sessionKeyImage = randomBytes(32).toString('hex');

        // Chiffrement du lien IPFS
        const encryptedImage = CryptoJS.AES.encrypt(ipfslink, sessionKeyImage).toString();

        // Ajout au JSON (champ spécial "i_secret")
        finalPayload.i_secret = encryptedImage;

        // 3. Conversion en Hex pour l'URI du NFT (Format XRPL)
        const uriHex = Buffer.from(JSON.stringify(finalPayload), 'utf8').toString('hex');

        // 4. Création du Seal pour le Labo (La clé pour ouvrir l'image)
        // Utilise ECIES (Nécessite une clé Labo secp256k1)
        const sealImageForLabo = ecies.encrypt(laboPubKey, Buffer.from(sessionKeyImage)).toString('hex');

        return {
            uriHex,           // À mettre dans URI du NFT
            sealImageForLabo  // À mettre dans un Memo (Type: SEAL_IMG_LABO)
        };

    } catch (error) {
        throw new Error("Erreur chiffrement : " + error.message);
    }
}

/**
 * FONCTION 2 : LECTURE (Corrigée)
 */
function decryptNFT(uriHex, sealHex = null, laboPrivateKey = null) {
    try {
        // 1. Lire le Payload (JSON clair)
        const jsonString = Buffer.from(uriHex, 'hex').toString('utf8');
        const payload = JSON.parse(jsonString);

        const result = {
            publicData: payload,
            imageDecrypted: null 
        };

        // 2. Déchiffrement Image (Seulement si c'est le Labo)
        if (sealHex && laboPrivateKey && payload.i_secret) {
            try {
                // --- CORRECTION CRITIQUE ICI ---
                // XRPL ajoute parfois '00' au début de la clé privée secp256k1.
                // eciesjs n'aime pas ça. On l'enlève si présent.
                let cleanPrivateKey = laboPrivateKey;
                if (cleanPrivateKey.length === 66 && cleanPrivateKey.startsWith('00')) {
                    cleanPrivateKey = cleanPrivateKey.substring(2);
                }
                // -------------------------------

                // A. Ouvrir le Seal avec la clé nettoyée
                const sessionKeyBuffer = ecies.decrypt(cleanPrivateKey, Buffer.from(sealHex, 'hex'));
                const sessionKey = sessionKeyBuffer.toString();

                // B. Déchiffrer le lien Image
                const decryptedBytes = CryptoJS.AES.decrypt(payload.i_secret, sessionKey);
                const clearLink = decryptedBytes.toString(CryptoJS.enc.Utf8);
                
                if(clearLink) result.imageDecrypted = clearLink;

            } catch (e) {
                console.warn("Déchiffrement image échoué :", e.message);
            }
        }

        return result;

    } catch (error) {
        throw new Error("Impossible de lire le NFT : " + error.message);
    }
}

module.exports = { encryptForNFT, decryptNFT };