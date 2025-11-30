/**
 * NFT Marketplace Service for CertiChain
 * 
 * Fetches product listings from XRPL by:
 * 1. Scanning issuer transactions to find all SELLER credential holders
 * 2. Fetching NFTs from each seller address
 * 3. Parsing NFT metadata to create listings
 */

import { Client } from "xrpl";
import { ISSUER_ADDRESS, CREDENTIAL_TYPES } from "./credentials";
import { DEFAULT_NETWORK } from "./networks";

// NFT Taxon categories for filtering
export const NFT_TAXON = {
  PRODUCT: 1,        // General product
  OLIVE_OIL: 10,     // Olive oil
  WINE: 20,          // Wine
  HONEY: 30,         // Honey
  CHEESE: 40,        // Cheese
  MEAT: 50,          // Meat
  VEGETABLES: 60,    // Vegetables
  FRUITS: 70,        // Fruits
};

/**
 * Convert hex string to regular string
 */
export function hexToString(hex) {
  if (!hex) return "";
  try {
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  } catch (e) {
    console.error("Error converting hex to string:", e);
    return "";
  }
}

/**
 * Convert string to hex
 */
export function stringToHex(str) {
  if (!str) return "";
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return hex.toUpperCase();
}

/**
 * Fetch metadata from IPFS or HTTP URI
 */
async function fetchMetadata(uri) {
  try {
    // Handle IPFS URIs
    let fetchUrl = uri;
    if (uri.startsWith("ipfs://")) {
      // Use public IPFS gateway
      fetchUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    
    const response = await fetch(fetchUrl, {
      timeout: 10000, // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching metadata from", uri, error);
    return null;
  }
}

/**
 * Parse NFT data and extract listing information
 */
function parseNFTToListing(nft, metadata, sellerAddress) {
  return {
    // NFT identification
    nftId: nft.NFTokenID,
    taxon: nft.NFTokenTaxon,
    issuer: nft.Issuer,
    
    // Product information from metadata
    productType: metadata?.productType || metadata?.name || "Unknown Product",
    weight: metadata?.weight || "N/A",
    price: metadata?.price || "0",
    pricePerKg: metadata?.pricePerKg || "0",
    lotNumber: metadata?.lotNumber || "N/A",
    date: metadata?.date || metadata?.createdAt || new Date().toISOString(),
    labo: metadata?.labo || "Not specified",
    
    // Seller information
    sellerAddress: sellerAddress,
    sellerName: metadata?.sellerName || "Verified Seller",
    
    // Certificate/Image
    certificateUrl: metadata?.certificate || metadata?.image || null,
    certificateType: metadata?.certificateType || "image",
    
    // Status
    status: metadata?.status || "available",
    isPublic: true,
    
    // Timestamps
    createdAt: metadata?.createdAt || new Date().toISOString(),
    
    // Original metadata for reference
    rawMetadata: metadata,
  };
}

/**
 * Fetch all seller addresses by scanning issuer's CredentialCreate transactions
 * 
 * @param {string} issuerAddress - The issuer address to scan
 * @param {Client} client - Connected XRPL client
 * @returns {Promise<string[]>} Array of seller addresses
 */
export async function fetchSellerAddresses(issuerAddress = ISSUER_ADDRESS, client = null) {
  const shouldDisconnect = !client;
  
  if (!client) {
    client = new Client(DEFAULT_NETWORK.wss);
    await client.connect();
  }
  
  try {
    console.log("Scanning issuer transactions for SELLER credentials...");
    console.log("Issuer address:", issuerAddress);
    
    const sellerAddresses = new Set();
    let marker = undefined;
    let hasMore = true;
    
    // Encode SELLER credential type to hex for comparison
    const sellerCredentialHex = stringToHex(CREDENTIAL_TYPES.SELLER);
    console.log("Looking for credential type (hex):", sellerCredentialHex);
    
    while (hasMore) {
      const response = await client.request({
        command: "account_tx",
        account: issuerAddress,
        limit: 400,
        marker: marker,
      });
      
      if (!response.result || !response.result.transactions) {
        break;
      }
      
      // Filter CredentialCreate transactions for SELLER type
      for (const txData of response.result.transactions) {
        const tx = txData.tx || txData.transaction;
        
        if (!tx) continue;
        
        // Check if it's a CredentialCreate transaction
        if (tx.TransactionType === "CredentialCreate") {
          console.log("Found CredentialCreate:", {
            subject: tx.Subject,
            credentialType: tx.CredentialType,
            decoded: hexToString(tx.CredentialType)
          });
          
          // Check if it's a SELLER credential
          if (tx.CredentialType === sellerCredentialHex || 
              hexToString(tx.CredentialType) === CREDENTIAL_TYPES.SELLER) {
            if (tx.Subject) {
              sellerAddresses.add(tx.Subject);
              console.log("Found SELLER:", tx.Subject);
            }
          }
        }
      }
      
      // Check for more pages
      if (response.result.marker) {
        marker = response.result.marker;
      } else {
        hasMore = false;
      }
    }
    
    const addresses = Array.from(sellerAddresses);
    console.log(`Found ${addresses.length} seller addresses:`, addresses);
    
    return addresses;
    
  } catch (error) {
    console.error("Error fetching seller addresses:", error);
    throw error;
  } finally {
    if (shouldDisconnect) {
      await client.disconnect();
    }
  }
}

/**
 * Fetch NFTs from a specific seller address
 * 
 * @param {string} sellerAddress - The seller's XRPL address
 * @param {Client} client - Connected XRPL client
 * @returns {Promise<Array>} Array of listings from this seller
 */
async function fetchSellerNFTs(sellerAddress, client) {
  try {
    const response = await client.request({
      command: "account_nfts",
      account: sellerAddress,
      limit: 400,
    });
    
    if (!response.result || !response.result.account_nfts) {
      return [];
    }
    
    const nfts = response.result.account_nfts;
    console.log(`Found ${nfts.length} NFTs for seller ${sellerAddress}`);
    
    // Fetch metadata for each NFT
    const listings = await Promise.all(
      nfts.map(async (nft) => {
        try {
          // Decode URI from hex
          const uri = hexToString(nft.URI);
          
          if (!uri) {
            // NFT without URI - create basic listing
            return parseNFTToListing(nft, {
              productType: "Product #" + nft.NFTokenID.slice(-8),
              status: "available",
            }, sellerAddress);
          }
          
          console.log("NFT URI:", uri);
          
          // Fetch metadata from URI
          const metadata = await fetchMetadata(uri);
          
          return parseNFTToListing(nft, metadata || {
            productType: "Product #" + nft.NFTokenID.slice(-8),
            status: "available",
          }, sellerAddress);
          
        } catch (error) {
          console.error("Error processing NFT:", nft.NFTokenID, error);
          return null;
        }
      })
    );
    
    return listings.filter(listing => listing !== null);
    
  } catch (error) {
    console.error(`Error fetching NFTs for seller ${sellerAddress}:`, error);
    return [];
  }
}

/**
 * Fetch all product listings from the XRPL marketplace
 * 
 * This function:
 * 1. Scans the issuer's transactions to find all SELLER credential holders
 * 2. Fetches NFTs from each seller
 * 3. Returns all listings combined
 * 
 * @param {Object} options - Options for fetching
 * @param {string} options.issuerAddress - Override the default issuer address
 * @returns {Promise<{sellers: string[], listings: Array}>} Sellers and their listings
 */
export async function fetchMarketplaceListings(options = {}) {
  const {
    issuerAddress = ISSUER_ADDRESS,
  } = options;

  const client = new Client(DEFAULT_NETWORK.wss);
  
  try {
    await client.connect();
    console.log("Connected to XRPL:", DEFAULT_NETWORK.name);
    
    // Step 1: Get all seller addresses from issuer's CredentialCreate transactions
    const sellerAddresses = await fetchSellerAddresses(issuerAddress, client);
    
    if (sellerAddresses.length === 0) {
      console.log("No sellers found with SELLER credential");
      return { sellers: [], listings: [] };
    }
    
    // Step 2: Fetch NFTs from each seller
    const allListings = [];
    
    for (const sellerAddress of sellerAddresses) {
      const sellerListings = await fetchSellerNFTs(sellerAddress, client);
      allListings.push(...sellerListings);
    }
    
    console.log(`Total listings found: ${allListings.length}`);
    
    return {
      sellers: sellerAddresses,
      listings: allListings,
    };
    
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
    throw error;
  } finally {
    await client.disconnect();
    console.log("Disconnected from XRPL");
  }
}

/**
 * Fetch a single listing by NFT ID
 */
export async function fetchListingByNFTId(nftId, issuerAddress = ISSUER_ADDRESS) {
  const { listings } = await fetchMarketplaceListings({ issuerAddress });
  return listings.find(listing => listing.nftId === nftId) || null;
}

/**
 * Get listings filtered by product type
 */
export async function fetchListingsByProductType(productType, issuerAddress = ISSUER_ADDRESS) {
  const { listings } = await fetchMarketplaceListings({ issuerAddress });
  return listings.filter(listing => 
    listing.productType.toLowerCase().includes(productType.toLowerCase())
  );
}

/**
 * Get listings filtered by seller address
 */
export async function fetchListingsBySeller(sellerAddress, issuerAddress = ISSUER_ADDRESS) {
  const { listings } = await fetchMarketplaceListings({ issuerAddress });
  return listings.filter(listing => listing.sellerAddress === sellerAddress);
}
