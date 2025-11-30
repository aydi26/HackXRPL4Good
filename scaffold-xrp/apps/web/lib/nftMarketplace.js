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
 * Fetch metadata from IPFS, HTTP URI, or parse inline JSON/data
 */
async function fetchMetadata(uri) {
  if (!uri) return null;
  
  try {
    console.log("Fetching metadata from URI:", uri);
    
    // Check if URI is already JSON data (inline metadata)
    if (uri.startsWith("{")) {
      try {
        return JSON.parse(uri);
      } catch (e) {
        console.log("URI looks like JSON but failed to parse");
      }
    }
    
    // Check if it's a data URI (base64 encoded JSON)
    if (uri.startsWith("data:application/json")) {
      try {
        const base64Data = uri.split(",")[1];
        const jsonString = atob(base64Data);
        return JSON.parse(jsonString);
      } catch (e) {
        console.log("Failed to parse data URI:", e);
      }
    }
    
    // Handle IPFS URIs
    let fetchUrl = uri;
    if (uri.startsWith("ipfs://")) {
      // Try multiple IPFS gateways
      const gateways = [
        "https://ipfs.io/ipfs/",
        "https://gateway.pinata.cloud/ipfs/",
        "https://cloudflare-ipfs.com/ipfs/",
        "https://dweb.link/ipfs/"
      ];
      const cid = uri.replace("ipfs://", "");
      
      for (const gateway of gateways) {
        try {
          const response = await fetch(gateway + cid, {
            signal: AbortSignal.timeout(5000),
          });
          if (response.ok) {
            const data = await response.json();
            console.log("Metadata fetched from IPFS:", data);
            return data;
          }
        } catch (e) {
          console.log(`Gateway ${gateway} failed, trying next...`);
        }
      }
      return null;
    }
    
    // Handle HTTP/HTTPS URLs
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      const response = await fetch(fetchUrl, {
        signal: AbortSignal.timeout(10000),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Metadata fetched from HTTP:", data);
      return data;
    }
    
    // Try to parse as raw JSON string (sometimes URIs contain escaped JSON)
    try {
      const decoded = decodeURIComponent(uri);
      if (decoded.startsWith("{")) {
        return JSON.parse(decoded);
      }
    } catch (e) {
      // Not URL-encoded JSON
    }
    
    console.log("Unknown URI format, cannot fetch metadata:", uri);
    return null;
    
  } catch (error) {
    console.error("Error fetching metadata from", uri, error);
    return null;
  }
}

/**
 * Parse NFT data and extract listing information
 * Handles various metadata formats from different NFT standards
 * 
 * Short keys mapping (for compact on-chain storage):
 * - p: productType/title
 * - w: weight
 * - d: date
 * - l: lieu/location/labo
 * - n: numéro de lot (lot number)
 */
function parseNFTToListing(nft, metadata, sellerAddress) {
  // Try to extract values from various possible field names (including short keys)
  const getName = () => {
    return metadata?.p           // Short key: product/title
      || metadata?.productType 
      || metadata?.name 
      || metadata?.title 
      || metadata?.product 
      || metadata?.description?.slice(0, 50)
      || "Product NFT";
  };
  
  const getWeight = () => {
    const w = metadata?.w        // Short key: weight
      || metadata?.weight 
      || metadata?.quantity 
      || metadata?.amount;
    return w ? String(w) : "N/A";
  };
  
  const getDate = () => {
    return metadata?.d           // Short key: date
      || metadata?.date 
      || metadata?.createdAt 
      || metadata?.timestamp 
      || metadata?.mintDate 
      || new Date().toISOString();
  };
  
  const getLabo = () => {
    return metadata?.l           // Short key: lieu/location/labo
      || metadata?.labo 
      || metadata?.laboratory 
      || metadata?.lab 
      || metadata?.lieu
      || metadata?.location
      || metadata?.certifier 
      || "Not specified";
  };
  
  const getLotNumber = () => {
    return metadata?.n           // Short key: numéro de lot
      || metadata?.lotNumber 
      || metadata?.lot 
      || metadata?.batchNumber 
      || metadata?.batch 
      || "N/A";
  };
  
  const getPrice = () => {
    const p = metadata?.price || metadata?.cost || metadata?.value || metadata?.pr;
    return p ? String(p) : "0";
  };
  
  const getPricePerKg = () => {
    const p = metadata?.pricePerKg || metadata?.unitPrice || metadata?.pricePerUnit || metadata?.ppk;
    return p ? String(p) : "0";
  };
  
  const getImage = () => {
    return metadata?.certificate 
      || metadata?.image 
      || metadata?.img 
      || metadata?.i              // Short key: image
      || metadata?.thumbnail 
      || metadata?.media 
      || metadata?.picture
      || metadata?.c              // Short key: certificate
      || null;
  };

  return {
    // NFT identification
    nftId: nft.NFTokenID,
    taxon: nft.NFTokenTaxon,
    issuer: nft.Issuer,
    uri: nft.URI ? hexToString(nft.URI) : null,
    
    // Product information from metadata
    productType: getName(),
    weight: getWeight(),
    price: getPrice(),
    pricePerKg: getPricePerKg(),
    lotNumber: getLotNumber(),
    date: getDate(),
    labo: getLabo(),
    description: metadata?.description || metadata?.desc || metadata?.de || "",
    
    // Seller information
    sellerAddress: sellerAddress,
    sellerName: metadata?.sellerName || metadata?.seller || metadata?.producer || metadata?.vendor || metadata?.s || "Verified Seller",
    
    // Certificate/Image
    certificateUrl: getImage(),
    certificateType: metadata?.certificateType || (getImage()?.includes(".pdf") ? "pdf" : "image"),
    
    // Status
    status: metadata?.status || metadata?.st || "available",
    isPublic: true,
    
    // Timestamps
    createdAt: metadata?.createdAt || metadata?.timestamp || new Date().toISOString(),
    
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
    
    // Log raw NFT data for debugging
    nfts.forEach((nft, idx) => {
      console.log(`NFT ${idx + 1}:`, {
        NFTokenID: nft.NFTokenID,
        URI_hex: nft.URI,
        URI_decoded: nft.URI ? hexToString(nft.URI) : null,
        Taxon: nft.NFTokenTaxon,
        Issuer: nft.Issuer,
      });
    });
    
    // Fetch metadata for each NFT
    const listings = await Promise.all(
      nfts.map(async (nft) => {
        try {
          // Decode URI from hex
          const uri = nft.URI ? hexToString(nft.URI) : null;
          
          console.log("Processing NFT:", nft.NFTokenID);
          console.log("  Raw URI (hex):", nft.URI);
          console.log("  Decoded URI:", uri);
          
          let metadata = null;
          
          if (uri) {
            // Try to fetch/parse metadata
            metadata = await fetchMetadata(uri);
            console.log("  Fetched metadata:", metadata);
          }
          
          // If no metadata, create listing with raw NFT data
          if (!metadata) {
            console.log("  No metadata found, using defaults");
            metadata = {
              productType: "Product NFT",
              name: "NFT #" + nft.NFTokenID.slice(-8),
              status: "available",
            };
          }
          
          const listing = parseNFTToListing(nft, metadata, sellerAddress);
          console.log("  Created listing:", listing);
          
          return listing;
          
        } catch (error) {
          console.error("Error processing NFT:", nft.NFTokenID, error);
          // Return a basic listing even on error
          return parseNFTToListing(nft, {
            productType: "Product NFT",
            name: "NFT #" + nft.NFTokenID.slice(-8),
            status: "available",
          }, sellerAddress);
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
