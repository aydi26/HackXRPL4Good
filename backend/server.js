const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { routes: credentialRoutes } = require("./credentials");

const app = express();
app.use(cors());
app.use(express.json());

// Routes credentials
app.use("/api/credentials", credentialRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});