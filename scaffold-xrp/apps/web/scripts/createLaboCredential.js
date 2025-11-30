/**
 * Script to create a LABO credential for a specific address
 * 
 * Run with: node scripts/createLaboCredential.js
 */

const xrpl = require("xrpl");

// Configuration
const NETWORK = "wss://s.altnet.rippletest.net:51233"; // Testnet

// Issuer (your platform wallet)
const ISSUER_ADDRESS = "rDZfCqUyPEQQQYtWZATvmTQMfxFrwFzvkw";
const ISSUER_SECRET = "sEd7e3aFZJZxj7bXutt1eeu5CruzP1D"; // Issuer secret from backend .env

// Labo address to receive the credential
const LABO_ADDRESS = "r3TUrDX8Y62tgvxVg37HZiRCF5QFWEUxch";
// Labo Seed (for reference): snGFE5rDD35y5DULZC2rZ6A1DCwoP
// Labo Public Key: 03A0343C9615CDBEE180BEEA96C7EF74C053A52F3F1965B85A1C29AFA66AB09354

// Credential type
const CREDENTIAL_TYPE = "CERTICHAIN_LABO";

function stringToHex(str) {
  return Buffer.from(str, "utf8").toString("hex").toUpperCase();
}

async function createLaboCredential() {
  const client = new xrpl.Client(NETWORK);
  
  try {
    console.log("Connecting to XRPL Testnet...");
    await client.connect();
    console.log("Connected!");

    // Create wallet from secret
    const issuerWallet = xrpl.Wallet.fromSeed(ISSUER_SECRET);
    console.log("Issuer wallet:", issuerWallet.address);

    if (issuerWallet.address !== ISSUER_ADDRESS) {
      throw new Error(`Wallet address mismatch! Expected ${ISSUER_ADDRESS}, got ${issuerWallet.address}`);
    }

    // Create CredentialCreate transaction
    const credentialTx = {
      TransactionType: "CredentialCreate",
      Account: ISSUER_ADDRESS,
      Subject: LABO_ADDRESS,
      CredentialType: stringToHex(CREDENTIAL_TYPE),
    };

    console.log("\nCreating credential...");
    console.log("Transaction:", JSON.stringify(credentialTx, null, 2));

    // Prepare transaction
    const prepared = await client.autofill(credentialTx);
    console.log("Prepared TX:", JSON.stringify(prepared, null, 2));

    // Sign transaction
    const signed = issuerWallet.sign(prepared);
    console.log("Signed TX hash:", signed.hash);

    // Submit transaction
    console.log("\nSubmitting transaction...");
    const result = await client.submitAndWait(signed.tx_blob);
    
    console.log("\n=== RESULT ===");
    console.log("Status:", result.result.meta?.TransactionResult);
    
    if (result.result.meta?.TransactionResult === "tesSUCCESS") {
      console.log("\n✅ SUCCESS! LABO credential created!");
      console.log("Credential Type:", CREDENTIAL_TYPE);
      console.log("Issuer:", ISSUER_ADDRESS);
      console.log("Subject (Labo):", LABO_ADDRESS);
      console.log("TX Hash:", signed.hash);
    } else {
      console.log("\n❌ FAILED!");
      console.log("Error:", result.result.meta?.TransactionResult);
    }

  } catch (error) {
    console.error("Error:", error.message);
    if (error.data) {
      console.error("Error data:", JSON.stringify(error.data, null, 2));
    }
  } finally {
    await client.disconnect();
    console.log("\nDisconnected from XRPL.");
  }
}

createLaboCredential();
