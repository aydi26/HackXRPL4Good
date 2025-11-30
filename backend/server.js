// Charger les variables d'environnement EN PREMIER
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

const { routes: credentialRoutes } = require("./credentials");
const { routes: ipfsRoutes } = require("./ipfs");
const mintRoutes = require("./Chiffrement/routes");
const mptRoutes = require("./MPT/routes");

const app = express();
app.use(cors());
app.use(express.json());

// Debug: vérifier que les variables sont chargées
console.log("📋 PINATA_JWT loaded:", process.env.PINATA_JWT ? "✓ Yes" : "✗ No");
console.log("📋 PINATA_GATEWAY:", process.env.PINATA_GATEWAY || "default");

// Routes credentials
app.use("/api/credentials", credentialRoutes);

// Routes IPFS
app.use("/api/ipfs", ipfsRoutes);

// Routes Mint NFT
app.use("/api/mint", mintRoutes);

// Routes MPToken
app.use("/api/mpt", mptRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});