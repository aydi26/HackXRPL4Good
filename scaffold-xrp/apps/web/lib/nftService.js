/**
 * NFT Service for XRPL Ledger
 * Handles NFT minting and retrieval for marketplace listings
 */

import { Client } from "xrpl";
import { DEFAULT_NETWORK } from "./networks";

const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[NFTService]", ...args);
}

// Client XRPL singleton
let xrplClient = null;
let isConnecting = false;
let connectionPromise = null;

/**
 * Get XRPL client connection
 */
async function getClient() {
  // If already connected, return the client
  if (xrplClient && xrplClient.isConnected()) {
    log("Using existing connected client");
    return xrplClient;
  }

  // If a connection is in progress, wait
  if (isConnecting && connectionPromise) {
    log("Connection in progress, waiting...");
    await connectionPromise;
    return xrplClient;
  }

  // New connection
  isConnecting = true;
  log("Connecting to network:", DEFAULT_NETWORK.wss);
  
  connectionPromise = (async () => {
    try {
      // Close old client if exists
      if (xrplClient) {
        try {
          await xrplClient.disconnect();
        } catch (e) {
          // Ignore
        }
      }

      xrplClient = new Client(DEFAULT_NETWORK.wss);
      await xrplClient.connect();
      log("✓ Connected to XRPL");
      isConnecting = false;
      return xrplClient;
    } catch (error) {
      isConnecting = false;
      log("✗ Connection error:", error);
      throw error;
    }
  })();

  return connectionPromise;
}

/**
 * Mint an NFT for a marketplace listing
 * 
 * NOTE: In production, this should be called via backend API for security
 * The wallet secret should never be exposed to the frontend
 * 
 * @param {string} walletAddress - Seller wallet address
 * @param {string} walletSecret - Seller wallet secret (for signing) - should be handled by backend
 * @param {object} listingData - Listing data to store in NFT metadata
 * @param {string} metadataUri - IPFS URI for NFT metadata
 * @returns {Promise<{success: boolean, nftTokenId?: string, txHash?: string, error?: string}>}
 */
export async function mintListingNFT(walletAddress, walletSecret, listingData, metadataUri) {
  log("=== mintListingNFT ===");
  log("Wallet:", walletAddress);
  log("Listing Data:", listingData);
  log("Metadata URI:", metadataUri);

  try {
    const client = await getClient();

    // Convert metadata URI to hex
    const uriHex = Buffer.from(metadataUri).toString("hex").toUpperCase();
    
    // Prepare NFT mint transaction
    const transaction = {
      TransactionType: "NFTokenMint",
      Account: walletAddress,
      URI: uriHex,
      Flags: 8, // Transferable flag
      NFTokenTaxon: 0, // Taxon for marketplace listings
    };

    log("Transaction prepared:", transaction);

    // Sign and submit transaction
    const { Wallet } = await import("xrpl");
    const wallet = Wallet.fromSeed(walletSecret);
    const prepared = await client.autofill(transaction);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    log("Transaction result:", result);

    if (result.result.meta.TransactionResult === "tesSUCCESS") {
      // Extract NFT Token ID from transaction metadata
      const nftokenId = result.result.meta.nftoken_id || 
                        (result.result.meta.AffectedNodes?.find(
                          node => node.CreatedNode?.LedgerEntryType === "NFToken"
                        )?.CreatedNode?.NewFields?.NFTokenID);

      return {
        success: true,
        nftTokenId: nftokenId,
        txHash: result.result.hash,
        ledgerIndex: result.result.ledger_index,
      };
    } else {
      return {
        success: false,
        error: `Transaction failed: ${result.result.meta.TransactionResult}`,
      };
    }
  } catch (error) {
    log("Error minting NFT:", error);
    return {
      success: false,
      error: error.message || "Failed to mint NFT",
    };
  }
}

/**
 * Get all NFTs owned by an address
 * 
 * @param {string} walletAddress - Wallet address to query
 * @returns {Promise<{success: boolean, nfts?: array, error?: string}>}
 */
export async function getAccountNFTs(walletAddress) {
  log("=== getAccountNFTs ===");
  log("Wallet:", walletAddress);

  try {
    const client = await getClient();

    const request = {
      command: "account_nfts",
      account: walletAddress,
      ledger_index: "validated",
    };

    const response = await client.request(request);
    log("Account NFTs response:", response);

    if (response.result && response.result.account_nfts) {
      const nfts = response.result.account_nfts.map((nft) => ({
        nftokenId: nft.NFTokenID,
        uri: nft.URI ? Buffer.from(nft.URI, "hex").toString("utf-8") : null,
        issuer: nft.Issuer,
        nftokenTaxon: nft.NFTokenTaxon,
        flags: nft.Flags,
        transferFee: nft.TransferFee,
      }));

      return {
        success: true,
        nfts: nfts,
      };
    }

    return {
      success: true,
      nfts: [],
    };
  } catch (error) {
    log("Error getting account NFTs:", error);
    return {
      success: false,
      error: error.message || "Failed to get account NFTs",
      nfts: [],
    };
  }
}

/**
 * Get NFT details by Token ID
 * 
 * @param {string} nftokenId - NFT Token ID
 * @returns {Promise<{success: boolean, nft?: object, error?: string}>}
 */
export async function getNFTDetails(nftokenId) {
  log("=== getNFTDetails ===");
  log("NFToken ID:", nftokenId);

  try {
    const client = await getClient();

    const request = {
      command: "nft_info",
      nft_id: nftokenId,
      ledger_index: "validated",
    };

    const response = await client.request(request);
    log("NFT Info response:", response);

    if (response.result && response.result.nft) {
      const nft = response.result.nft;
      return {
        success: true,
        nft: {
          nftokenId: nft.NFTokenID,
          ledgerIndex: nft.LedgerIndex,
          owner: nft.Owner,
          uri: nft.URI ? Buffer.from(nft.URI, "hex").toString("utf-8") : null,
          issuer: nft.Issuer,
          nftokenTaxon: nft.NFTokenTaxon,
          flags: nft.Flags,
          transferFee: nft.TransferFee,
        },
      };
    }

    return {
      success: false,
      error: "NFT not found",
    };
  } catch (error) {
    log("Error getting NFT details:", error);
    return {
      success: false,
      error: error.message || "Failed to get NFT details",
    };
  }
}

/**
 * Get all Producer credentials from the ledger
 * Loops through accounts to find all accounts with Producer credentials
 * 
 * Note: This is a simplified approach. In production, you might want to:
 * - Maintain a registry of Producer addresses
 * - Use a different indexing mechanism
 * - Query from a database that tracks credentials
 * 
 * @param {string} issuerAddress - Issuer address for credentials
 * @param {array} knownProducerAddresses - Optional list of known Producer addresses to check
 * @returns {Promise<{success: boolean, producers?: array, error?: string}>}
 */
export async function getAllProducerCredentials(issuerAddress, knownProducerAddresses = []) {
  log("=== getAllProducerCredentials ===");
  log("Issuer:", issuerAddress);
  log("Known Producer addresses:", knownProducerAddresses);

  try {
    const client = await getClient();
    const producers = [];

    // If we have known Producer addresses, check them directly
    if (knownProducerAddresses.length > 0) {
      for (const address of knownProducerAddresses) {
        try {
          const request = {
            command: "account_objects",
            account: address,
            type: "credential",
            ledger_index: "validated",
          };

          const response = await client.request(request);
          
          if (response.result && response.result.account_objects) {
            const producerCred = response.result.account_objects.find((obj) => {
              try {
                const credentialType = Buffer.from(obj.CredentialType, "hex").toString("utf-8");
                return credentialType === "CERTICHAIN_PRODUCER" && obj.Issuer === issuerAddress;
              } catch (e) {
                return false;
              }
            });

            if (producerCred) {
              const expiration = producerCred.Expiration
                ? new Date((producerCred.Expiration + 946684800) * 1000)
                : null;
              
              const isExpired = expiration && expiration < new Date();

              if (!isExpired) {
                producers.push({
                  issuer: producerCred.Issuer,
                  subject: producerCred.Subject,
                  walletAddress: address,
                  credentialType: "CERTICHAIN_PRODUCER",
                  expiration: expiration,
                  isValid: true,
                  ledgerIndex: producerCred.index,
                });
              }
            }
          }
        } catch (error) {
          log(`Error checking address ${address}:`, error.message);
          // Continue with other addresses
        }
      }
    }

    // Alternative: Query issuer's account objects if credentials are stored there
    // This depends on your credential implementation
    try {
      const issuerRequest = {
        command: "account_objects",
        account: issuerAddress,
        type: "credential",
        ledger_index: "validated",
      };

      const issuerResponse = await client.request(issuerRequest);
      
      if (issuerResponse.result && issuerResponse.result.account_objects) {
        const issuerProducers = issuerResponse.result.account_objects
          .filter((obj) => {
            try {
              const credentialType = Buffer.from(obj.CredentialType, "hex").toString("utf-8");
              return credentialType === "CERTICHAIN_PRODUCER";
            } catch (e) {
              return false;
            }
          })
          .map((obj) => {
            const expiration = obj.Expiration
              ? new Date((obj.Expiration + 946684800) * 1000)
              : null;
            
            const isExpired = expiration && expiration < new Date();

            return {
              issuer: obj.Issuer,
              subject: obj.Subject,
              walletAddress: obj.Subject,
              credentialType: "CERTICHAIN_PRODUCER",
              expiration: expiration,
              isValid: !isExpired,
              ledgerIndex: obj.index,
            };
          })
          .filter((cred) => cred.isValid);

        // Merge with existing producers (avoid duplicates)
        issuerProducers.forEach((prod) => {
          if (!producers.find((p) => p.walletAddress === prod.walletAddress)) {
            producers.push(prod);
          }
        });
      }
    } catch (error) {
      log("Error querying issuer account objects:", error.message);
    }

    log(`Found ${producers.length} Producer credentials`);
    return {
      success: true,
      producers: producers,
    };
  } catch (error) {
    log("Error getting Producer credentials:", error);
    return {
      success: false,
      error: error.message || "Failed to get Producer credentials",
      producers: [],
    };
  }
}

/**
 * Fetch NFT metadata from IPFS URI
 * 
 * @param {string} uri - IPFS URI (ipfs://... or https://...)
 * @returns {Promise<{success: boolean, metadata?: object, error?: string}>}
 */
export async function fetchNFTMetadata(uri) {
  log("=== fetchNFTMetadata ===");
  log("URI:", uri);

  try {
    let url = uri;
    
    // Convert ipfs:// to gateway URL
    if (uri.startsWith("ipfs://")) {
      const cid = uri.replace("ipfs://", "");
      url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const metadata = await response.json();
    log("Metadata fetched:", metadata);

    return {
      success: true,
      metadata: metadata,
    };
  } catch (error) {
    log("Error fetching NFT metadata:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch NFT metadata",
    };
  }
}

