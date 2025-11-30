/**
 * Marketplace Service
 * Handles marketplace operations using XRPL Ledger and NFTs
 */

import { mintListingNFT, getAccountNFTs, getNFTDetails, fetchNFTMetadata, getAllProducerCredentials } from "./nftService";
import { ISSUER_ADDRESS } from "./credentials";

const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[MarketplaceService]", ...args);
}

/**
 * Create a marketplace listing by minting an NFT
 * This is called when a Seller creates a new listing
 * 
 * @param {object} listingData - Listing data
 * @param {string} walletAddress - Seller wallet address
 * @param {string} walletSecret - Seller wallet secret (for signing)
 * @param {string} metadataUri - IPFS URI for NFT metadata
 * @returns {Promise<{success: boolean, listing?: object, nftTokenId?: string, error?: string}>}
 */
export async function createMarketplaceListing(listingData, walletAddress, walletSecret, metadataUri) {
  log("=== createMarketplaceListing ===");
  log("Listing Data:", listingData);
  log("Wallet:", walletAddress);
  log("Metadata URI:", metadataUri);

  try {
    // Mint NFT for the listing
    const mintResult = await mintListingNFT(walletAddress, walletSecret, listingData, metadataUri);

    if (!mintResult.success) {
      return {
        success: false,
        error: mintResult.error || "Failed to mint NFT",
      };
    }

    // Create listing object with NFT information
    const listing = {
      ...listingData,
      id: `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nftTokenId: mintResult.nftTokenId,
      txHash: mintResult.txHash,
      ledgerIndex: mintResult.ledgerIndex,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
      sellerAddress: walletAddress,
      isPublic: true,
    };

    return {
      success: true,
      listing: listing,
      nftTokenId: mintResult.nftTokenId,
      txHash: mintResult.txHash,
    };
  } catch (error) {
    log("Error creating marketplace listing:", error);
    return {
      success: false,
      error: error.message || "Failed to create marketplace listing",
    };
  }
}

/**
 * Get all marketplace listings from NFTs
 * Fetches all NFTs from Seller accounts and converts them to listings
 * 
 * @param {array} sellerAddresses - List of Seller wallet addresses to query
 * @returns {Promise<{success: boolean, listings?: array, error?: string}>}
 */
export async function getAllMarketplaceListings(sellerAddresses = []) {
  log("=== getAllMarketplaceListings ===");
  log("Seller addresses:", sellerAddresses);

  try {
    const allListings = [];

    // If no seller addresses provided, return empty list
    // In production, you might want to maintain a registry of Seller addresses
    if (sellerAddresses.length === 0) {
      log("No seller addresses provided");
      return {
        success: true,
        listings: [],
      };
    }

    // Fetch NFTs from each Seller account
    for (const sellerAddress of sellerAddresses) {
      try {
        const nftsResult = await getAccountNFTs(sellerAddress);
        
        if (nftsResult.success && nftsResult.nfts) {
          // Convert NFTs to listings
          for (const nft of nftsResult.nfts) {
            try {
              // Fetch metadata from IPFS
              if (nft.uri) {
                const metadataResult = await fetchNFTMetadata(nft.uri);
                
                if (metadataResult.success && metadataResult.metadata) {
                  const listing = {
                    id: nft.nftokenId,
                    nftTokenId: nft.nftokenId,
                    sellerAddress: sellerAddress,
                    metadata: metadataResult.metadata,
                    // Extract listing data from metadata
                    productType: metadataResult.metadata.attributes?.find(a => a.trait_type === "productType")?.value || metadataResult.metadata.name,
                    weight: metadataResult.metadata.attributes?.find(a => a.trait_type === "weight")?.value || null,
                    date: metadataResult.metadata.attributes?.find(a => a.trait_type === "date")?.value || null,
                    lotNumber: metadataResult.metadata.attributes?.find(a => a.trait_type === "lotNumber")?.value || null,
                    labo: metadataResult.metadata.attributes?.find(a => a.trait_type === "labo")?.value || null,
                    price: metadataResult.metadata.attributes?.find(a => a.trait_type === "price")?.value || null,
                    pricePerKg: metadataResult.metadata.attributes?.find(a => a.trait_type === "pricePerKg")?.value || false,
                    certificateUrl: metadataResult.metadata.image || null,
                    status: metadataResult.metadata.attributes?.find(a => a.trait_type === "status")?.value || "pending",
                    createdAt: metadataResult.metadata.properties?.created_at || new Date().toISOString(),
                    updatedAt: metadataResult.metadata.properties?.updated_at || new Date().toISOString(),
                    isPublic: true,
                  };

                  allListings.push(listing);
                }
              }
            } catch (error) {
              log(`Error processing NFT ${nft.nftokenId}:`, error.message);
              // Continue with other NFTs
            }
          }
        }
      } catch (error) {
        log(`Error fetching NFTs for ${sellerAddress}:`, error.message);
        // Continue with other sellers
      }
    }

    log(`Found ${allListings.length} listings from NFTs`);
    return {
      success: true,
      listings: allListings,
    };
  } catch (error) {
    log("Error getting marketplace listings:", error);
    return {
      success: false,
      error: error.message || "Failed to get marketplace listings",
      listings: [],
    };
  }
}

/**
 * Get all Producer credentials from the ledger
 * Wrapper function for getAllProducerCredentials
 * 
 * @param {array} knownProducerAddresses - Optional list of known Producer addresses
 * @returns {Promise<{success: boolean, producers?: array, error?: string}>}
 */
export async function getProducers(knownProducerAddresses = []) {
  return await getAllProducerCredentials(ISSUER_ADDRESS, knownProducerAddresses);
}

/**
 * Prepare NFT metadata for IPFS upload
 * Creates the metadata structure that will be stored on IPFS
 * 
 * @param {object} listingData - Listing data
 * @param {string} imageCid - IPFS CID of the certificate image
 * @returns {object} NFT metadata object
 */
export function prepareNFTMetadata(listingData, imageCid) {
  return {
    name: `${listingData.productType} - ${listingData.lotNumber}`,
    description: `Certified agricultural product listing: ${listingData.productType}, ${listingData.weight}kg, Lot ${listingData.lotNumber}`,
    image: `ipfs://${imageCid}`,
    external_url: "https://certichain.io",
    attributes: [
      { trait_type: "productType", value: listingData.productType },
      { trait_type: "weight", value: listingData.weight },
      { trait_type: "date", value: listingData.date },
      { trait_type: "lotNumber", value: listingData.lotNumber },
      { trait_type: "labo", value: listingData.labo },
      { trait_type: "price", value: listingData.price },
      { trait_type: "pricePerKg", value: listingData.pricePerKg },
      { trait_type: "status", value: "pending" },
    ],
    properties: {
      category: "agricultural",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sellerAddress: listingData.sellerAddress,
    },
  };
}


