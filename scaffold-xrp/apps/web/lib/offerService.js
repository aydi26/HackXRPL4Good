/**
 * Offer Service for CertiChain
 * 
 * Handles sending purchase offers from buyers to sellers via XRPL transactions.
 * The offer is sent as a minimal payment (1 drop) with memo containing offer details.
 * This allows the seller to retrieve the buyer's public key from the transaction.
 */

import { Client, xrpToDrops, dropsToXrp } from "xrpl";
import { DEFAULT_NETWORK } from "./networks";
import { hexToString, stringToHex } from "./nftMarketplace";

// Memo types for offer transactions
export const MEMO_TYPES = {
  OFFER: "CERTICHAIN_OFFER",
  OFFER_ACCEPT: "CERTICHAIN_OFFER_ACCEPT",
  OFFER_REJECT: "CERTICHAIN_OFFER_REJECT",
  NFT_ID: "CERTICHAIN_NFT_ID",
};

/**
 * Create an offer transaction to send to a seller
 * 
 * The transaction includes:
 * - 1 drop payment (minimal amount for valid tx)
 * - Memo 1: Offer details (type, price, product, timestamp)
 * - Memo 2: NFT ID (separate for easy extraction)
 * 
 * The seller can retrieve the buyer's address and public key from the transaction.
 * 
 * @param {Object} params - Offer parameters
 * @param {string} params.buyerAddress - Buyer's XRPL address
 * @param {string} params.sellerAddress - Seller's XRPL address
 * @param {string} params.nftId - NFT Token ID being offered on
 * @param {string} params.offeredPrice - Price offered in XRP
 * @param {string} params.productType - Product type/name for reference
 * @returns {Object} Prepared transaction object
 */
export function createOfferTransaction({
  buyerAddress,
  sellerAddress,
  nftId,
  offeredPrice,
  productType,
}) {
  // Create offer data to include in memo
  const offerData = {
    type: "OFFER",
    price: offeredPrice,
    product: productType,
    timestamp: new Date().toISOString(),
  };

  // Create the transaction with two memos:
  // 1. Offer details (price, product, timestamp)
  // 2. NFT ID (separate for easy extraction by seller)
  const tx = {
    TransactionType: "Payment",
    Account: buyerAddress,
    Destination: sellerAddress,
    Amount: "1", // 1 drop = 0.000001 XRP (minimal amount to create valid tx)
    Memos: [
      {
        Memo: {
          MemoType: stringToHex(MEMO_TYPES.OFFER),
          MemoData: stringToHex(JSON.stringify(offerData)),
        },
      },
      {
        Memo: {
          MemoType: stringToHex(MEMO_TYPES.NFT_ID),
          MemoData: stringToHex(nftId || ""),
        },
      },
    ],
  };

  return tx;
}

/**
 * Send an offer to a seller using the connected wallet
 * 
 * @param {Object} listing - The listing being offered on
 * @param {string} offeredPrice - The price being offered
 * @param {string} buyerAddress - Buyer's XRPL address  
 * @param {Object} walletManager - The wallet manager from useWallet hook
 * @returns {Promise<Object>} Transaction result
 */
export async function sendOffer(listing, offeredPrice, buyerAddress, walletManager) {
  if (!walletManager) {
    throw new Error("Wallet not connected");
  }

  if (!buyerAddress) {
    throw new Error("Buyer address not available");
  }

  if (!listing?.sellerAddress) {
    throw new Error("Seller address not available");
  }

  const offerParams = {
    buyerAddress,
    sellerAddress: listing.sellerAddress,
    nftId: listing.nftId,
    offeredPrice,
    productType: listing.productType,
  };

  const tx = createOfferTransaction(offerParams);
  
  try {
    // Sign and submit the transaction using the wallet
    const result = await walletManager.signAndSubmit(tx);
    
    console.log("Offer transaction result:", result);
    
    return {
      success: true,
      txHash: result.hash || result.tx_json?.hash,
      ...offerParams,
    };
  } catch (error) {
    console.error("Error sending offer:", error);
    throw error;
  }
}

/**
 * Fetch offers sent by a buyer (by scanning their outgoing transactions)
 * 
 * @param {string} buyerAddress - Buyer's XRPL address
 * @returns {Promise<Array>} Array of sent offers
 */
export async function fetchSentOffers(buyerAddress) {
  const client = new Client(DEFAULT_NETWORK.wss);
  
  try {
    await client.connect();
    
    const response = await client.request({
      command: "account_tx",
      account: buyerAddress,
      limit: 200,
    });
    
    if (!response.result || !response.result.transactions) {
      return [];
    }
    
    const offers = [];
    const offerMemoTypeHex = stringToHex(MEMO_TYPES.OFFER);
    const nftIdMemoTypeHex = stringToHex(MEMO_TYPES.NFT_ID);
    
    for (const txData of response.result.transactions) {
      const tx = txData.tx || txData.transaction;
      const meta = txData.meta;
      
      if (!tx || tx.TransactionType !== "Payment") continue;
      if (tx.Account !== buyerAddress) continue; // Only outgoing transactions
      
      // Check for offer memo
      if (tx.Memos && tx.Memos.length > 0) {
        let offerData = null;
        let nftId = null;
        
        // Parse all memos
        for (const memoWrapper of tx.Memos) {
          const memo = memoWrapper.Memo;
          
          if (memo.MemoType === offerMemoTypeHex) {
            try {
              offerData = JSON.parse(hexToString(memo.MemoData));
            } catch (e) {
              console.error("Error parsing offer memo:", e);
            }
          } else if (memo.MemoType === nftIdMemoTypeHex) {
            nftId = hexToString(memo.MemoData);
          }
        }
        
        // If we found offer data, add to list
        if (offerData) {
          offers.push({
            txHash: tx.hash,
            buyerAddress: tx.Account,
            sellerAddress: tx.Destination,
            nftId: nftId || offerData.nftId, // Fallback to old format
            offeredPrice: offerData.price,
            productType: offerData.product,
            timestamp: offerData.timestamp,
            status: "pending", // TODO: Check for accept/reject response
            validated: meta?.TransactionResult === "tesSUCCESS",
          });
        }
      }
    }
    
    // Sort by timestamp (newest first)
    offers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return offers;
    
  } catch (error) {
    console.error("Error fetching sent offers:", error);
    throw error;
  } finally {
    await client.disconnect();
  }
}

/**
 * Fetch offers received by a seller (by scanning their incoming transactions)
 * 
 * Returns offers with:
 * - buyerAddress: The buyer's XRPL address (from tx.Account)
 * - buyerPublicKey: The buyer's public key (from tx.SigningPubKey)
 * - nftId: The NFT being offered on (from memo)
 * 
 * @param {string} sellerAddress - Seller's XRPL address
 * @returns {Promise<Array>} Array of received offers with buyer public keys
 */
export async function fetchReceivedOffers(sellerAddress) {
  const client = new Client(DEFAULT_NETWORK.wss);
  
  try {
    await client.connect();
    
    const response = await client.request({
      command: "account_tx",
      account: sellerAddress,
      limit: 200,
    });
    
    if (!response.result || !response.result.transactions) {
      return [];
    }
    
    const offers = [];
    const offerMemoTypeHex = stringToHex(MEMO_TYPES.OFFER);
    const nftIdMemoTypeHex = stringToHex(MEMO_TYPES.NFT_ID);
    
    for (const txData of response.result.transactions) {
      const tx = txData.tx || txData.transaction;
      const meta = txData.meta;
      
      if (!tx || tx.TransactionType !== "Payment") continue;
      if (tx.Destination !== sellerAddress) continue; // Only incoming transactions
      
      // Check for offer memo
      if (tx.Memos && tx.Memos.length > 0) {
        let offerData = null;
        let nftId = null;
        
        // Parse all memos
        for (const memoWrapper of tx.Memos) {
          const memo = memoWrapper.Memo;
          
          if (memo.MemoType === offerMemoTypeHex) {
            try {
              offerData = JSON.parse(hexToString(memo.MemoData));
            } catch (e) {
              console.error("Error parsing offer memo:", e);
            }
          } else if (memo.MemoType === nftIdMemoTypeHex) {
            nftId = hexToString(memo.MemoData);
          }
        }
        
        // If we found offer data, add to list
        if (offerData) {
          offers.push({
            txHash: tx.hash,
            buyerAddress: tx.Account,                // ← Buyer's address
            buyerPublicKey: tx.SigningPubKey,        // ← Buyer's public key for encryption
            sellerAddress: tx.Destination,
            nftId: nftId || offerData.nftId,         // NFT ID from dedicated memo or fallback
            offeredPrice: offerData.price,
            productType: offerData.product,
            timestamp: offerData.timestamp,
            status: "pending", // TODO: Check for accept/reject response
            validated: meta?.TransactionResult === "tesSUCCESS",
          });
        }
      }
    }
    
    // Sort by timestamp (newest first)
    offers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return offers;
    
  } catch (error) {
    console.error("Error fetching received offers:", error);
    throw error;
  } finally {
    await client.disconnect();
  }
}
