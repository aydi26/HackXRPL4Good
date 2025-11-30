/**
 * NFT Minting Service for CertiChain
 * 
 * Handles minting NFTs using the connected wallet (Gem, Crossmark, etc.)
 * The wallet handles signing, so no secret is exposed to the frontend.
 * 
 * Uses mintSemiPrivateNFT from backend for encryption.
 */

import { Client } from "xrpl";
import { DEFAULT_NETWORK } from "./networks";
import { uploadNFTToIPFS, createCompactMetadata, encodeIPFSUrl } from "./ipfsService";
import { stringToHex } from "./nftMarketplace";

const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[MintService]", ...args);
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// NFT Taxon for CertiChain products
export const CERTICHAIN_TAXON = 1;

/**
 * Mint an NFT for a product listing
 * Uses the connected wallet for signing (no secret exposed)
 * 
 * @param {object} params
 * @param {object} params.walletManager - Wallet manager from useWallet hook
 * @param {string} params.sellerAddress - Seller's XRPL address
 * @param {object} params.formData - Product form data
 * @param {File} params.certificateFile - Certificate image file
 * @returns {Promise<{success: boolean, nftTokenId?: string, txHash?: string, metadataUrl?: string, error?: string}>}
 */
export async function mintProductNFT({
  walletManager,
  sellerAddress,
  formData,
  certificateFile,
}) {
  log("=== mintProductNFT ===");
  log("Seller:", sellerAddress);
  log("Form data:", formData);
  log("Certificate:", certificateFile?.name);

  if (!walletManager) {
    return { success: false, error: "Wallet not connected" };
  }

  if (!sellerAddress) {
    return { success: false, error: "Seller address not available" };
  }

  try {
    // Step 1: Upload image and metadata to IPFS via backend
    log("Step 1: Uploading to IPFS...");
    
    const metadata = createCompactMetadata(formData, ""); // Image URL will be added by backend
    const uploadResult = await uploadNFTToIPFS(certificateFile, metadata);
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.error || "Failed to upload to IPFS");
    }
    
    log("IPFS upload successful:", uploadResult);
    
    // Step 2: Create NFT URI from metadata URL
    const nftUri = encodeIPFSUrl(uploadResult.metadataUrl);
    const uriHex = stringToHex(nftUri);
    
    log("NFT URI:", nftUri);
    log("URI Hex:", uriHex);

    // Step 3: Create NFT mint transaction
    const mintTx = {
      TransactionType: "NFTokenMint",
      Account: sellerAddress,
      URI: uriHex,
      Flags: 8, // tfTransferable - allows the NFT to be transferred
      NFTokenTaxon: CERTICHAIN_TAXON,
    };

    log("Mint transaction:", mintTx);

    // Step 4: Sign and submit using connected wallet
    log("Step 2: Signing and submitting transaction...");
    const result = await walletManager.signAndSubmit(mintTx);
    
    log("Transaction result:", result);

    // Step 5: Extract NFT Token ID from result
    // The wallet adapter should return the result from XRPL
    const txResult = result.result || result;
    
    // Check if successful
    if (txResult.meta?.TransactionResult !== "tesSUCCESS" && 
        txResult.engine_result !== "tesSUCCESS") {
      throw new Error(`Transaction failed: ${txResult.meta?.TransactionResult || txResult.engine_result}`);
    }

    // Try to extract NFT Token ID
    let nftTokenId = null;
    
    // Method 1: Direct from meta
    if (txResult.meta?.nftoken_id) {
      nftTokenId = txResult.meta.nftoken_id;
    }
    
    // Method 2: From AffectedNodes
    if (!nftTokenId && txResult.meta?.AffectedNodes) {
      for (const node of txResult.meta.AffectedNodes) {
        if (node.CreatedNode?.LedgerEntryType === "NFTokenPage") {
          // NFT was created, but we need to find the specific token
          const nftokens = node.CreatedNode?.NewFields?.NFTokens;
          if (nftokens && nftokens.length > 0) {
            nftTokenId = nftokens[nftokens.length - 1].NFToken?.NFTokenID;
          }
        }
        if (node.ModifiedNode?.LedgerEntryType === "NFTokenPage") {
          const finalNFTokens = node.ModifiedNode?.FinalFields?.NFTokens;
          const previousNFTokens = node.ModifiedNode?.PreviousFields?.NFTokens || [];
          
          if (finalNFTokens) {
            // Find the new NFT (in final but not in previous)
            const previousIds = new Set(previousNFTokens.map(t => t.NFToken?.NFTokenID));
            const newToken = finalNFTokens.find(t => !previousIds.has(t.NFToken?.NFTokenID));
            if (newToken) {
              nftTokenId = newToken.NFToken?.NFTokenID;
            }
          }
        }
      }
    }

    const txHash = txResult.hash || result.hash;
    
    log("NFT minted successfully!");
    log("NFT Token ID:", nftTokenId);
    log("Transaction hash:", txHash);

    return {
      success: true,
      nftTokenId,
      txHash,
      metadataUrl: uploadResult.metadataUrl,
      imageUrl: uploadResult.imageUrl,
    };
  } catch (error) {
    log("Error minting NFT:", error);
    return {
      success: false,
      error: error.message || "Failed to mint NFT",
    };
  }
}

/**
 * Mint an NFT using pre-uploaded metadata URL
 * Uses the connected wallet for signing (no secret exposed)
 * 
 * @param {object} params
 * @param {object} params.walletManager - Wallet manager from useWallet hook
 * @param {string} params.sellerAddress - Seller's XRPL address
 * @param {string} params.metadataUrl - Pre-uploaded metadata URL (IPFS)
 * @returns {Promise<{success: boolean, nftTokenId?: string, txHash?: string, error?: string}>}
 */
export async function mintProductNFTFromMetadata({
  walletManager,
  sellerAddress,
  metadataUrl,
}) {
  log("=== mintProductNFTFromMetadata ===");
  log("Seller:", sellerAddress);
  log("Metadata URL:", metadataUrl);

  if (!walletManager) {
    return { success: false, error: "Wallet not connected" };
  }

  if (!sellerAddress) {
    return { success: false, error: "Seller address not available" };
  }

  if (!metadataUrl) {
    return { success: false, error: "Metadata URL is required" };
  }

  try {
    // Create NFT URI from metadata URL
    const nftUri = encodeIPFSUrl(metadataUrl);
    const uriHex = stringToHex(nftUri);
    
    log("NFT URI:", nftUri);
    log("URI Hex:", uriHex);

    // Create NFT mint transaction
    const mintTx = {
      TransactionType: "NFTokenMint",
      Account: sellerAddress,
      URI: uriHex,
      Flags: 8, // tfTransferable - allows the NFT to be transferred
      NFTokenTaxon: CERTICHAIN_TAXON,
    };

    log("Mint transaction:", mintTx);

    // Sign and submit using connected wallet
    log("Signing and submitting transaction...");
    const result = await walletManager.signAndSubmit(mintTx);
    
    log("Transaction result:", result);

    // Extract NFT Token ID from result
    const txResult = result.result || result;
    
    // Check if successful
    if (txResult.meta?.TransactionResult !== "tesSUCCESS" && 
        txResult.engine_result !== "tesSUCCESS") {
      throw new Error(`Transaction failed: ${txResult.meta?.TransactionResult || txResult.engine_result}`);
    }

    // Try to extract NFT Token ID
    let nftTokenId = null;
    
    // Method 1: Direct from meta
    if (txResult.meta?.nftoken_id) {
      nftTokenId = txResult.meta.nftoken_id;
    }
    
    // Method 2: From AffectedNodes
    if (!nftTokenId && txResult.meta?.AffectedNodes) {
      for (const node of txResult.meta.AffectedNodes) {
        if (node.CreatedNode?.LedgerEntryType === "NFTokenPage") {
          const nftokens = node.CreatedNode?.NewFields?.NFTokens;
          if (nftokens && nftokens.length > 0) {
            nftTokenId = nftokens[nftokens.length - 1].NFToken?.NFTokenID;
          }
        }
        if (node.ModifiedNode?.LedgerEntryType === "NFTokenPage") {
          const finalNFTokens = node.ModifiedNode?.FinalFields?.NFTokens;
          const previousNFTokens = node.ModifiedNode?.PreviousFields?.NFTokens || [];
          
          if (finalNFTokens) {
            const previousIds = new Set(previousNFTokens.map(t => t.NFToken?.NFTokenID));
            const newToken = finalNFTokens.find(t => !previousIds.has(t.NFToken?.NFTokenID));
            if (newToken) {
              nftTokenId = newToken.NFToken?.NFTokenID;
            }
          }
        }
      }
    }

    const txHash = txResult.hash || result.hash;
    
    log("NFT minted successfully!");
    log("NFT Token ID:", nftTokenId);
    log("Transaction hash:", txHash);

    return {
      success: true,
      nftTokenId,
      txHash,
      metadataUrl,
    };
  } catch (error) {
    log("Error minting NFT:", error);
    return {
      success: false,
      error: error.message || "Failed to mint NFT",
    };
  }
}

/**
 * Mint a Semi-Private NFT with encrypted image
 * Uses backend for encryption (ECIES) and wallet for signing
 * 
 * @param {object} params
 * @param {object} params.walletManager - Wallet manager from useWallet hook
 * @param {string} params.sellerAddress - Seller's XRPL address
 * @param {object} params.publicData - Public product data
 * @param {string} params.publicData.productType - Product type (e.g., "Apple")
 * @param {string} params.publicData.weight - Weight in kg
 * @param {string} params.publicData.date - Date (YYYY-MM-DD)
 * @param {string} params.publicData.lotNumber - Lot number
 * @param {string} params.publicData.labo - Laboratory/Location name
 * @param {string} params.publicData.price - Price
 * @param {string} params.ipfsImageLink - IPFS gateway URL of the image
 * @param {string} params.laboPublicKey - Labo's secp256k1 public key for encryption
 * @returns {Promise<{success: boolean, nftTokenId?: string, txHash?: string, error?: string}>}
 */
export async function mintSemiPrivateNFT({
  walletManager,
  sellerAddress,
  publicData,
  ipfsImageLink,
  laboPublicKey,
}) {
  log("=== mintSemiPrivateNFT ===");
  log("Seller:", sellerAddress);
  log("Public Data:", publicData);
  log("IPFS Image:", ipfsImageLink);
  log("Labo Key:", laboPublicKey?.slice(0, 20) + "...");

  if (!walletManager) {
    return { success: false, error: "Wallet not connected" };
  }

  if (!sellerAddress) {
    return { success: false, error: "Seller address not available" };
  }

  if (!ipfsImageLink) {
    return { success: false, error: "IPFS image link is required" };
  }

  if (!laboPublicKey) {
    return { success: false, error: "Labo public key is required" };
  }

  try {
    // Step 1: Call backend to prepare encrypted transaction
    log("Step 1: Preparing encrypted transaction via backend...");
    
    const response = await fetch(`${API_URL}/api/mint/semi-private-wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sellerAddress,
        publicData,
        ipfsImageLink,
        laboPublicKey,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const prepResult = await response.json();
    
    if (!prepResult.success) {
      throw new Error(prepResult.error || "Failed to prepare transaction");
    }

    log("Transaction prepared:", prepResult.transaction);
    log("URI Hex length:", prepResult.uriHex?.length);
    log("Seal Hex length:", prepResult.sealHex?.length);

    // Step 2: Sign and submit using connected wallet
    log("Step 2: Signing and submitting transaction...");
    const result = await walletManager.signAndSubmit(prepResult.transaction);
    
    log("Transaction result:", JSON.stringify(result, null, 2));

    // Step 3: Extract NFT Token ID from result
    // Different wallets return results in different formats
    const txResult = result.result || result.response || result;
    
    // Check if successful - handle multiple response formats
    const txResultCode = txResult.meta?.TransactionResult || 
                         txResult.engine_result || 
                         result.engine_result ||
                         result.status;
    
    log("Transaction result code:", txResultCode);
    
    // If there's a hash, it likely succeeded on-chain
    const txHash = txResult.hash || result.hash || result.tx_hash || result.txHash;
    
    // Consider success if we have a hash OR explicit success status
    const isSuccess = txResultCode === "tesSUCCESS" || 
                      txResultCode === "success" ||
                      (txHash && !txResultCode?.startsWith?.("tec") && !txResultCode?.startsWith?.("tef"));
    
    if (!isSuccess && txResultCode) {
      throw new Error(`Transaction failed: ${txResultCode}`);
    }

    // Try to extract NFT Token ID
    let nftTokenId = null;
    
    // Method 1: Direct from meta
    if (txResult.meta?.nftoken_id) {
      nftTokenId = txResult.meta.nftoken_id;
    }
    
    // Method 2: From AffectedNodes
    if (!nftTokenId && txResult.meta?.AffectedNodes) {
      for (const node of txResult.meta.AffectedNodes) {
        if (node.CreatedNode?.LedgerEntryType === "NFTokenPage") {
          const nftokens = node.CreatedNode?.NewFields?.NFTokens;
          if (nftokens && nftokens.length > 0) {
            nftTokenId = nftokens[nftokens.length - 1].NFToken?.NFTokenID;
          }
        }
        if (node.ModifiedNode?.LedgerEntryType === "NFTokenPage") {
          const finalNFTokens = node.ModifiedNode?.FinalFields?.NFTokens;
          const previousNFTokens = node.ModifiedNode?.PreviousFields?.NFTokens || [];
          
          if (finalNFTokens) {
            const previousIds = new Set(previousNFTokens.map(t => t.NFToken?.NFTokenID));
            const newToken = finalNFTokens.find(t => !previousIds.has(t.NFToken?.NFTokenID));
            if (newToken) {
              nftTokenId = newToken.NFToken?.NFTokenID;
            }
          }
        }
      }
    }

    // txHash is already extracted above
    log("Semi-Private NFT minted successfully!");
    log("NFT Token ID:", nftTokenId);
    log("Transaction hash:", txHash);

    return {
      success: true,
      nftTokenId,
      txHash,
      uriHex: prepResult.uriHex,
      sealHex: prepResult.sealHex,
    };
  } catch (error) {
    log("Error minting Semi-Private NFT:", error);
    return {
      success: false,
      error: error.message || "Failed to mint NFT",
    };
  }
}

/**
 * Get NFT Token ID from a recent mint transaction
 * Useful if we didn't capture it during minting
 * 
 * @param {string} address - Account address
 * @param {string} txHash - Transaction hash (optional, gets latest if not provided)
 * @returns {Promise<string|null>} NFT Token ID or null
 */
export async function getNFTFromRecentMint(address, txHash = null) {
  const client = new Client(DEFAULT_NETWORK.wss);
  
  try {
    await client.connect();
    
    if (txHash) {
      // Get specific transaction
      const response = await client.request({
        command: "tx",
        transaction: txHash,
      });
      
      if (response.result?.meta?.nftoken_id) {
        return response.result.meta.nftoken_id;
      }
    }
    
    // Fallback: get account's NFTs and return the most recent
    const nftsResponse = await client.request({
      command: "account_nfts",
      account: address,
      ledger_index: "validated",
    });
    
    if (nftsResponse.result?.account_nfts?.length > 0) {
      // Return the last NFT (most recent)
      return nftsResponse.result.account_nfts[nftsResponse.result.account_nfts.length - 1].NFTokenID;
    }
    
    return null;
  } catch (error) {
    log("Error getting NFT from mint:", error);
    return null;
  } finally {
    await client.disconnect();
  }
}

/**
 * Check if backend is available for IPFS uploads
 */
export async function checkMintingAvailable() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_URL}/api/ipfs/status`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    // Backend returns { success: true } not { status: "ok" }
    return data.success === true;
  } catch {
    return false;
  }
}
