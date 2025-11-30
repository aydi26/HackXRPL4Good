# Système de Chiffrement NFT pour XRPL

Ce module permet de créer des NFTs avec des données chiffrées sur le testnet XRPL.

## 📋 Fichiers

- **Chiffrement.js** - Module de chiffrement/déchiffrement AES-256
- **TestEncryption.js** - Tests unitaires du chiffrement
- **MintNFT.js** - Minte un NFT avec données chiffrées sur le testnet
- **ReadNFT.js** - Lit et déchiffre un NFT existant

## 🚀 Installation

```bash
pnpm install
# ou
npm install
```

## 🔐 Comment ça marche ?

### 1. Chiffrement des données

Les données sont chiffrées en deux étapes :

1. **Session Key** : Une clé aléatoire (256 bits) chiffre les données en AES-256
2. **Seals** : La session key est chiffrée avec une clé dérivée de chaque clé publique destinataire

### 2. Structure du NFT

- **URI** : Contient les données chiffrées en hexadécimal
- **Memo 1** : Seal pour le Producteur (SEAL_PROD)
- **Memo 2** : Seal pour le Master/Plateforme (SEAL_MASTER)

## 📡 Connexion au Testnet XRPL

### Comment savoir qu'on est sur le Testnet ?

```javascript
const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
await client.connect();

const serverInfo = await client.request({ command: "server_info" });
console.log("Network ID:", serverInfo.result.info.network_id);
```

**Points de connexion :**

- **Testnet** : `wss://s.altnet.rippletest.net:51233`
- **Devnet** : `wss://s.devnet.rippletest.net:51233`
- **Mainnet** : `wss://xrplcluster.com` ou `wss://s1.ripple.com` (⚠️ ARGENT RÉEL)

## 🎨 Minter un NFT

```bash
node MintNFT.js
```

Ce script :

1. Se connecte au testnet
2. Crée des wallets de test (avec fonds gratuits)
3. Chiffre les données
4. Minte le NFT avec URI + Memos
5. Affiche le NFTokenID et le hash de transaction

**Exemple de sortie :**

```
✅ NFT MINTÉ AVEC SUCCÈS !
   Hash: A08B435D30A0019FA20F94A71748D77C7E1467CAF7C6657DBC60E35CE99D6FC6
   NFTokenID: 0008000068296F7DB5CCDED443901D9B1BE455D5B171D3163B7D371200C30677
```

## 🔍 Lire un NFT

Pour lire et déchiffrer un NFT existant, modifiez `ReadNFT.js` avec :

- Le NFTokenID
- L'adresse du propriétaire
- Votre clé publique

Puis exécutez :

```bash
node ReadNFT.js
```

## 🧪 Tests

```bash
node TestEncryption.js
```

Tests effectués :

- ✅ Chiffrement des données
- ✅ Déchiffrement avec clé Producteur
- ✅ Déchiffrement avec clé Master
- ✅ Rejet d'une mauvaise clé

## 📊 Structure des données

Exemple de données d'un lot agricole :

```javascript
{
    p: "Pommes Bio",        // produit
    w: 1500,                // poids (kg)
    d: "2024-11-29",        // date de récolte
    l: "Ferme du Soleil",   // lieu
    c: "AB"                 // certification
}
```

## 🔑 Gestion des clés

**Important :**

- Les clés XRPL utilisent Ed25519 (commencent par "ED")
- Les clés publiques servent à dériver les clés de chiffrement
- Ne JAMAIS partager les clés privées
- Les Seals permettent à plusieurs parties de déchiffrer les données

## 🌐 Explorer le testnet

Visualisez vos transactions sur :

```
https://testnet.xrpl.org/transactions/[VOTRE_TX_HASH]
```

## 🛠️ Utilisation dans votre application

```javascript
const { encryptForNFT, decryptFromNFT } = require("./Chiffrement.js");

// Chiffrer
const encrypted = encryptForNFT(data, pubKeyProd, pubKeyMaster);
// encrypted.uriHex -> dans le champ URI du NFT
// encrypted.sealProd -> dans Memo 1
// encrypted.sealMast -> dans Memo 2

// Déchiffrer
const data = decryptFromNFT(uriHex, sealHex, userPublicKey);
```

## ⚠️ Sécurité

- ✅ Chiffrement AES-256 pour les données
- ✅ Seals chiffrés avec clés dérivées (SHA-256)
- ✅ Session key unique par NFT
- ✅ Accès multi-parties (Producteur + Master)
- ⚠️ La clé publique est visible sur la blockchain
- ⚠️ Ne jamais utiliser sur le mainnet sans audit de sécurité

## 📝 Licence

ISC
