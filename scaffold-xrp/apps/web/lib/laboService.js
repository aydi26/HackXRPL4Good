/**
 * Service Labo - Récupération et déchiffrement des NFTs depuis la blockchain
 */

import { Client } from "xrpl";
import { DEFAULT_NETWORK } from "./networks";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const ISSUER_ADDRESS = "rDZfCqUyPEQQQYtWZATvmTQMfxFrwFzvkw";

const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[LaboService]", ...args);
}

/**
 * Récupère les NFTs depuis la blockchain XRPL
 * Retourne les données publiques (sans déchiffrer l'image)
 */
export async function fetchNFTsFromBlockchain() {
  log("Fetching NFTs from blockchain...");
  
  const client = new Client(DEFAULT_NETWORK.wss);
  
  try {
    await client.connect();
    log("Connected to XRPL");
    
    const nfts = [];
    const processedSellers = new Set();
    
    // 1. Récupérer les adresses avec le credential SELLER
    const sellersWithCredential = await findSellersWithCredential(client);
    log("Found sellers with SELLER credential:", sellersWithCredential.length);
    
    // 2. Pour chaque seller, récupérer leurs NFTs
    for (const sellerAddress of sellersWithCredential) {
      if (processedSellers.has(sellerAddress)) continue;
      processedSellers.add(sellerAddress);
      
      try {
        // Récupérer les NFTs du seller
        const nftResponse = await client.request({
          command: "account_nfts",
          account: sellerAddress,
          limit: 100,
        });
        
        for (const nft of nftResponse.result?.account_nfts || []) {
          if (!nft.URI) continue;
          
          try {
            // Décoder l'URI
            const jsonString = Buffer.from(nft.URI, 'hex').toString('utf8');
            const publicData = JSON.parse(jsonString);
            
            // Chercher le seal dans les transactions
            const sealHex = await findSealForNFT(client, sellerAddress, nft.NFTokenID);
            
            nfts.push({
              id: nft.NFTokenID,
              nftTokenId: nft.NFTokenID,
              sellerAddress: sellerAddress,
              uriHex: nft.URI,
              sealHex: sealHex,
              publicData: {
                productType: publicData.p || "Unknown",
                weight: publicData.w || "0kg",
                date: publicData.d || "",
                labo: publicData.l || "",
                lotNumber: publicData.n || "",
                price: publicData.pr || "0",
              },
              hasEncryptedImage: !!publicData.i_secret,
              i_secret: publicData.i_secret, // Garder pour le déchiffrement
              laboStatus: "pending", // Par défaut
            });
            
          } catch (e) {
            log("Error parsing NFT:", e.message);
          }
        }
      } catch (e) {
        log("Error fetching NFTs for seller:", sellerAddress, e.message);
      }
    }
    
    // 3. Alternative: Scanner les transactions NFTokenMint récentes
    if (nfts.length === 0) {
      log("No NFTs found via credentials, scanning recent mints...");
      const recentNFTs = await scanRecentNFTMints(client);
      nfts.push(...recentNFTs);
    }
    
    await client.disconnect();
    log("Found", nfts.length, "NFTs");
    
    return {
      success: true,
      nfts: nfts,
    };
    
  } catch (error) {
    log("Error:", error);
    if (client.isConnected()) {
      await client.disconnect();
    }
    return {
      success: false,
      error: error.message,
      nfts: [],
    };
  }
}

/**
 * Trouve les adresses ayant le credential SELLER
 */
async function findSellersWithCredential(client) {
  const sellers = [];
  
  try {
    // Scanner les transactions de l'issuer pour trouver les CredentialCreate
    const txResponse = await client.request({
      command: "account_tx",
      account: ISSUER_ADDRESS,
      limit: 200,
    });
    
    for (const txData of txResponse.result?.transactions || []) {
      const tx = txData.tx || txData.transaction;
      
      // Chercher les CredentialCreate avec type SELLER
      if (tx?.TransactionType === "CredentialCreate") {
        const credType = tx.CredentialType ? 
          Buffer.from(tx.CredentialType, 'hex').toString('utf8') : '';
        
        if (credType === "SELLER" && tx.Subject) {
          sellers.push(tx.Subject);
        }
      }
    }
  } catch (e) {
    log("Error finding sellers:", e.message);
  }
  
  return [...new Set(sellers)]; // Dédupliquer
}

/**
 * Trouve le seal (SEAL_IMG_LABO) pour un NFT donné
 */
async function findSealForNFT(client, sellerAddress, nftTokenId) {
  try {
    const txResponse = await client.request({
      command: "account_tx",
      account: sellerAddress,
      limit: 100,
    });
    
    for (const txData of txResponse.result?.transactions || []) {
      const tx = txData.tx || txData.transaction;
      const meta = txData.meta;
      
      // Chercher les NFTokenMint
      if (tx?.TransactionType === "NFTokenMint") {
        // Vérifier si c'est le bon NFT (via nftoken_id dans meta)
        const mintedId = meta?.nftoken_id;
        if (mintedId === nftTokenId || !mintedId) {
          // Chercher le seal dans les memos
          if (tx.Memos) {
            for (const memoWrapper of tx.Memos) {
              const memo = memoWrapper.Memo;
              const memoType = memo?.MemoType ? 
                Buffer.from(memo.MemoType, 'hex').toString('utf8') : '';
              
              if (memoType === 'SEAL_IMG_LABO') {
                return memo.MemoData;
              }
            }
          }
        }
      }
    }
  } catch (e) {
    log("Error finding seal:", e.message);
  }
  
  return null;
}

/**
 * Scanne les NFTokenMint récents pour trouver des produits
 */
async function scanRecentNFTMints(client) {
  const nfts = [];
  
  try {
    // Scanner plusieurs adresses connues ou l'issuer
    const addressesToScan = [ISSUER_ADDRESS];
    
    for (const address of addressesToScan) {
      const txResponse = await client.request({
        command: "account_tx",
        account: address,
        limit: 100,
      });
      
      for (const txData of txResponse.result?.transactions || []) {
        const tx = txData.tx || txData.transaction;
        const meta = txData.meta;
        
        if (tx?.TransactionType === "NFTokenMint" && tx?.URI) {
          try {
            const jsonString = Buffer.from(tx.URI, 'hex').toString('utf8');
            const publicData = JSON.parse(jsonString);
            
            // Chercher le seal
            let sealHex = null;
            if (tx.Memos) {
              for (const memoWrapper of tx.Memos) {
                const memo = memoWrapper.Memo;
                const memoType = memo?.MemoType ? 
                  Buffer.from(memo.MemoType, 'hex').toString('utf8') : '';
                if (memoType === 'SEAL_IMG_LABO') {
                  sealHex = memo.MemoData;
                  break;
                }
              }
            }
            
            nfts.push({
              id: meta?.nftoken_id || tx.hash,
              nftTokenId: meta?.nftoken_id || tx.hash,
              txHash: tx.hash,
              sellerAddress: tx.Account,
              uriHex: tx.URI,
              sealHex: sealHex,
              publicData: {
                productType: publicData.p || "Unknown",
                weight: publicData.w || "0kg",
                date: publicData.d || "",
                labo: publicData.l || "",
                lotNumber: publicData.n || "",
                price: publicData.pr || "0",
              },
              hasEncryptedImage: !!publicData.i_secret,
              i_secret: publicData.i_secret,
              laboStatus: "pending",
              createdAt: tx.date ? new Date((tx.date + 946684800) * 1000).toISOString() : new Date().toISOString(),
            });
          } catch (e) {
            // Ignore NFTs non parsables
          }
        }
      }
    }
  } catch (e) {
    log("Error scanning mints:", e.message);
  }
  
  return nfts;
}

/**
 * Déchiffre l'image d'un NFT avec la clé privée du Labo
 * 
 * @param {string} uriHex - L'URI du NFT en hex
 * @param {string} sealHex - Le seal chiffré (SEAL_IMG_LABO)
 * @param {string} laboPrivateKey - La clé privée du Labo (hex)
 */
export async function decryptNFTImage(uriHex, sealHex, laboPrivateKey) {
  log("Decrypting NFT image...");
  
  try {
    const response = await fetch(`${API_URL}/api/mint/decrypt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uriHex,
        sealHex,
        laboPrivateKey,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Decryption failed");
    }
    
    const result = await response.json();
    log("Decryption result:", result.success);
    
    return result;
    
  } catch (error) {
    log("Decryption error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Récupère les NFTs via l'API backend (alternative)
 */
export async function fetchNFTsViaAPI() {
  log("Fetching NFTs via API...");
  
  try {
    const response = await fetch(`${API_URL}/api/mint/fetch-nfts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch NFTs");
    }
    
    const result = await response.json();
    log("Fetched", result.count, "NFTs via API");
    
    return result;
    
  } catch (error) {
    log("API error:", error);
    return {
      success: false,
      error: error.message,
      nfts: [],
    };
  }
}
