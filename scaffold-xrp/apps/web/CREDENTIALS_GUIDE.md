# 🔐 Guide d'Implémentation - Système de Verifiable Credentials XRPL

## Vue d'ensemble

Ce système permet de contrôler l'accès aux différentes sections de l'application CertiChain en utilisant les **Verifiable Credentials (VC)** natifs du ledger XRPL.

### Flux de fonctionnement

```
┌─────────────────────┐     Audit réussi      ┌─────────────────────┐
│ Entreprise d'Audit  │ ──────────────────► │   Backend CertiChain │
│     (Externe)       │  Envoie: adresse     │      (Issuer)        │
│                     │  + type de rôle      │                      │
└─────────────────────┘                      └──────────┬────────────┘
                                                        │
                                                        │ Crée le VC
                                                        ▼
                                             ┌─────────────────────┐
                                             │    Ledger XRPL      │
                                             │   (Credential)      │
                                             └──────────┬──────────┘
                                                        │
        ┌───────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────┐
│  Utilisateur        │
│  Connecte wallet    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐     Vérifie VC       ┌─────────────────────┐
│   Frontend Web      │ ◄──────────────────► │    Ledger XRPL      │
│   (Verification)    │                      │                     │
└─────────────────────┘                      └─────────────────────┘
          │
          ├── VC trouvé → Accès autorisé ✅
          └── VC absent → Accès refusé ❌
```

---

## 📁 Structure des Fichiers

```
scaffold-xrp/apps/web/
├── lib/
│   ├── credentials.js         # Configuration des types de credentials
│   └── xrplCredentialService.js # Service de vérification XRPL
├── hooks/
│   └── useCredentials.js      # Hook React pour les credentials
├── components/
│   ├── ProtectedRoute.js      # Composant de protection de route
│   ├── CredentialBadge.js     # Affichage des badges credentials
│   └── providers/
│       ├── WalletProvider.js  # Provider wallet (existant)
│       └── CredentialProvider.js # Provider credentials (nouveau)
├── app/
│   ├── layout.js              # Layout avec providers
│   ├── buyer/page.js          # Page protégée Buyer
│   ├── seller/page.js         # Page protégée Seller
│   ├── labo/page.js           # Page protégée Labo
│   ├── transporter/page.js    # Page protégée Transporter
│   └── unauthorized/page.js   # Page accès refusé
└── .env.example               # Variables d'environnement

backend/
├── credentials/
│   ├── config.js              # Configuration issuer
│   ├── credentialService.js   # Service de création des VC
│   ├── routes.js              # Routes API
│   └── index.js               # Point d'entrée module
└── .env.example               # Variables d'environnement
```

---

## 📋 Description des Fichiers

### Frontend

#### `lib/credentials.js`
**Rôle :** Configuration centrale des Verifiable Credentials.

**Contenu :**
- Adresse de l'issuer (votre plateforme)
- Définition des 4 types de credentials : `BUYER`, `SELLER`, `LABO`, `TRANSPORTER`
- Mapping credentials → routes autorisées
- Mapping routes → credentials requis
- Informations d'affichage (nom, description, couleur, icône)

**Utilisation :**
```javascript
import { CREDENTIAL_TYPES, getRequiredCredential } from "@/lib/credentials";

// Obtenir le type de credential
const type = CREDENTIAL_TYPES.BUYER; // "CERTICHAIN_BUYER"

// Obtenir le credential requis pour une route
const required = getRequiredCredential("/buyer"); // "CERTICHAIN_BUYER"
```

---

#### `lib/xrplCredentialService.js`
**Rôle :** Service pour interroger le ledger XRPL et vérifier les credentials.

**Fonctions principales :**
| Fonction | Description |
|----------|-------------|
| `checkCredential(address, type)` | Vérifie si un wallet a un credential spécifique |
| `getUserCredentials(address)` | Liste tous les credentials d'un utilisateur |
| `checkRouteAccess(address, path)` | Vérifie l'accès à une route |
| `checkAllCredentials(address)` | Vérifie tous les types en parallèle |

**Utilisation :**
```javascript
import { checkCredential } from "@/lib/xrplCredentialService";

const result = await checkCredential("rXXXXX", "CERTICHAIN_BUYER");
// { hasCredential: true, credential: {...}, error: null }
```

---

#### `hooks/useCredentials.js`
**Rôle :** Hook React pour gérer les credentials de l'utilisateur connecté.

**Retourne :**
```javascript
const {
  credentials,           // Liste des credentials de l'utilisateur
  accessMap,             // Map des accès par type
  isLoading,             // État de chargement
  error,                 // Erreur éventuelle
  hasCredential,         // Fonction: hasCredential("BUYER") → boolean
  hasAccess,             // Fonction: hasAccess("buyer") → boolean
  getAccessibleSections, // Retourne ["buyer", "seller", ...]
  refreshCredentials,    // Rafraîchir les credentials
} = useCredentials();
```

---

#### `components/providers/CredentialProvider.js`
**Rôle :** Provider React Context pour partager l'état des credentials dans toute l'app.

**Fonctionnement :**
- Wrappe l'application (via `layout.js`)
- Charge automatiquement les credentials quand le wallet change
- Fournit le contexte via `useCredentialContext()`

**Utilisation dans un composant :**
```javascript
import { useCredentialContext } from "@/components/providers/CredentialProvider";

function MyComponent() {
  const { hasAccess, isLoading } = useCredentialContext();
  
  if (hasAccess("buyer")) {
    return <BuyerContent />;
  }
}
```

---

#### `components/ProtectedRoute.js`
**Rôle :** Composant pour protéger une page/section.

**Props :**
| Prop | Type | Description |
|------|------|-------------|
| `requiredCredential` | string | Type requis: "BUYER", "SELLER", "LABO", "TRANSPORTER" |
| `children` | ReactNode | Contenu à afficher si autorisé |
| `fallback` | ReactNode | Contenu alternatif si non autorisé (optionnel) |
| `redirectTo` | string | URL de redirection si non autorisé (optionnel) |

**Utilisation :**
```jsx
import ProtectedRoute from "@/components/ProtectedRoute";

export default function BuyerPage() {
  return (
    <ProtectedRoute requiredCredential="BUYER">
      <BuyerContent />
    </ProtectedRoute>
  );
}
```

---

#### `components/CredentialBadge.js`
**Rôle :** Composants d'affichage pour les credentials.

**Composants :**
- `CredentialBadges` : Affiche tous les badges de l'utilisateur
- `CredentialBadge` : Badge individuel
- `AccessIndicator` : Indicateur d'accès pour une section

---

### Backend

#### `backend/credentials/config.js`
**Rôle :** Configuration du wallet issuer.

**⚠️ IMPORTANT :** Ne jamais commiter les secrets ! Utiliser des variables d'environnement.

---

#### `backend/credentials/credentialService.js`
**Rôle :** Service pour créer/révoquer les credentials sur XRPL.

**Fonctions :**
| Fonction | Description |
|----------|-------------|
| `createCredential({...})` | Crée un VC sur le ledger |
| `revokeCredential({...})` | Supprime un VC |
| `credentialExists(address, type)` | Vérifie l'existence |

---

#### `backend/credentials/routes.js`
**Rôle :** Routes API Express.

**Endpoints :**
| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/credentials/create` | Créer un credential | ✓ API Key |
| DELETE | `/api/credentials/revoke` | Révoquer un credential | ✓ API Key |
| GET | `/api/credentials/check/:address/:type` | Vérifier un credential | Public |
| GET | `/api/credentials/types` | Lister les types | Public |

---

## 🚀 Installation

### 1. Configuration du Frontend

```bash
cd scaffold-xrp/apps/web
cp .env.example .env.local
```

Éditer `.env.local` :
```env
NEXT_PUBLIC_ISSUER_ADDRESS=rVOTRE_ADRESSE_ISSUER
```

### 2. Configuration du Backend

```bash
cd backend
cp .env.example .env
```

Éditer `.env` :
```env
ISSUER_ADDRESS=rVOTRE_ADRESSE_ISSUER
ISSUER_SECRET=sVOTRE_SECRET
AUDITOR_API_KEY=votre-cle-api-securisee
```

### 3. Générer un wallet Issuer (Testnet)

```javascript
const xrpl = require("xrpl");

async function createIssuer() {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  
  const wallet = (await client.fundWallet()).wallet;
  console.log("Address:", wallet.address);
  console.log("Secret:", wallet.seed);
  
  await client.disconnect();
}

createIssuer();
```

### 4. Intégrer les routes dans votre serveur Express

```javascript
const express = require("express");
const { routes: credentialRoutes } = require("./credentials");

const app = express();
app.use(express.json());

// Monter les routes credentials
app.use("/api/credentials", credentialRoutes);

app.listen(3001);
```

---

## 🔧 Utilisation

### Protéger une page

```jsx
// app/buyer/page.js
import ProtectedRoute from "@/components/ProtectedRoute";

export default function BuyerPage() {
  return (
    <ProtectedRoute requiredCredential="BUYER">
      {/* Contenu protégé */}
    </ProtectedRoute>
  );
}
```

### Afficher les credentials de l'utilisateur

```jsx
import { CredentialBadges } from "@/components/CredentialBadge";

function UserProfile() {
  return (
    <div>
      <h2>Vos credentials</h2>
      <CredentialBadges />
    </div>
  );
}
```

### Navigation conditionnelle

```jsx
import { useCredentialContext } from "@/components/providers/CredentialProvider";

function Navigation() {
  const { hasAccess } = useCredentialContext();
  
  return (
    <nav>
      <Link href="/">Accueil</Link>
      {hasAccess("buyer") && <Link href="/buyer">Acheter</Link>}
      {hasAccess("seller") && <Link href="/seller">Vendre</Link>}
      {hasAccess("labo") && <Link href="/labo">Laboratoire</Link>}
      {hasAccess("transporter") && <Link href="/transporter">Transport</Link>}
    </nav>
  );
}
```

### Créer un credential (Backend)

```bash
curl -X POST http://localhost:3001/api/credentials/create \
  -H "Content-Type: application/json" \
  -H "x-api-key: votre-cle-api" \
  -d '{
    "subjectAddress": "rADRESSE_UTILISATEUR",
    "credentialType": "BUYER",
    "expirationDays": 365
  }'
```

---

## 📊 Types de Credentials

| Type | Identifiant XRPL | Accès |
|------|-----------------|-------|
| Buyer | `CERTICHAIN_BUYER` | `/buyer/*` |
| Seller | `CERTICHAIN_SELLER` | `/seller/*` |
| Laboratory | `CERTICHAIN_LABO` | `/labo/*` |
| Transporter | `CERTICHAIN_TRANSPORTER` | `/transporter/*` |

---

## 🔐 Sécurité

### Points importants :

1. **Secret de l'issuer** : Ne jamais exposer côté frontend
2. **API Key** : Utiliser des clés longues et aléatoires
3. **HTTPS** : Toujours en production
4. **Validation** : L'API valide les adresses XRPL
5. **Expiration** : Les credentials ont une date d'expiration

### Bonnes pratiques :

- Utiliser un wallet dédié pour l'issuer
- Rotation régulière des API keys
- Logs des créations/révocations de credentials
- Backup des clés issuer

---

## 🐛 Debugging

### Vérifier les credentials d'un utilisateur

```bash
# Via API
curl http://localhost:3001/api/credentials/check/rADRESSE/BUYER

# Via console XRPL
const result = await client.request({
  command: "account_objects",
  account: "rADRESSE",
  type: "credential"
});
console.log(result);
```

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `entryNotFound` | Credential n'existe pas | Normal si pas encore créé |
| `tecINSUFFICIENT_RESERVE` | Pas assez de XRP | Alimenter le wallet issuer |
| `Invalid address` | Format d'adresse incorrect | Vérifier le format r... |

---

## 📚 Ressources

- [XRPL Credentials Documentation](https://xrpl.org/credentials.html)
- [xrpl.js Library](https://js.xrpl.org/)
- [XRPL Testnet Faucet](https://faucet.altnet.rippletest.net/)
