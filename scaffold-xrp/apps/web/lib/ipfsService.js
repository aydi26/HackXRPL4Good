/**
 * IPFS/Pinata Service for Frontend
 * 
 * Handles uploading images to IPFS via the backend API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log("[IPFSService]", ...args);
}

/**
 * Upload an image file to IPFS via Pinata (through backend)
 * 
 * @param {File} file - The image file to upload
 * @returns {Promise<{success: boolean, cid?: string, ipfsUrl?: string, gatewayUrl?: string, error?: string}>}
 */
export async function uploadImageToIPFS(file) {
  log("=== uploadImageToIPFS ===");
  log("File:", file.name, file.type, file.size);

  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/api/ipfs/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    log("Upload response:", data);

    return {
      success: true,
      cid: data.cid,
      ipfsUrl: data.ipfsUrl,
      gatewayUrl: data.gatewayUrl,
    };
  } catch (error) {
    log("Error uploading image:", error);
    return {
      success: false,
      error: error.message || "Failed to upload image",
    };
  }
}

/**
 * Upload JSON metadata to IPFS via Pinata (through backend)
 * 
 * @param {object} metadata - The metadata object to upload
 * @returns {Promise<{success: boolean, cid?: string, ipfsUrl?: string, gatewayUrl?: string, error?: string}>}
 */
export async function uploadMetadataToIPFS(metadata) {
  log("=== uploadMetadataToIPFS ===");
  log("Metadata:", metadata);

  try {
    const response = await fetch(`${API_URL}/api/ipfs/upload-json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonData: metadata }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    log("Upload response:", data);

    return {
      success: true,
      cid: data.cid,
      ipfsUrl: data.ipfsUrl,
      gatewayUrl: data.gatewayUrl,
    };
  } catch (error) {
    log("Error uploading metadata:", error);
    return {
      success: false,
      error: error.message || "Failed to upload metadata",
    };
  }
}

/**
 * Upload image + metadata for NFT in one call (through backend)
 * Now only uploads the image, not JSON metadata
 * 
 * @param {File} imageFile - The image file
 * @param {object} metadata - The metadata (stored locally, not on IPFS)
 * @returns {Promise<{success: boolean, imageCid?: string, imageUrl?: string, error?: string}>}
 */
export async function uploadNFTToIPFS(imageFile, metadata) {
  log("=== uploadNFTToIPFS ===");
  log("Image:", imageFile?.name);
  log("Metadata (local only):", metadata);
  log("API URL:", API_URL);

  if (!imageFile) {
    return {
      success: false,
      error: "No image file provided",
    };
  }

  try {
    // Only upload the image, not the metadata JSON
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(`${API_URL}/api/ipfs/upload`, {
      method: "POST",
      body: formData,
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      log("Non-JSON response:", text.slice(0, 200));
      throw new Error(`Backend returned non-JSON response. Status: ${response.status}. Check if backend is running on ${API_URL}`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    log("Upload response:", data);

    // Build IPFS URL from CID
    const cid = data.cid || data.imageCid;
    const ipfsUrl = cid ? `ipfs://${cid}` : null;
    const gatewayUrl = data.gatewayUrl || (cid ? `https://gateway.pinata.cloud/ipfs/${cid}` : null);

    return {
      success: true,
      imageCid: cid,
      // Use gateway URL as main imageUrl for accessibility
      imageUrl: gatewayUrl,
      ipfsUrl: ipfsUrl,
      gatewayUrl: gatewayUrl,
      // Also return as metadataUrl for compatibility with mint flow
      metadataCid: cid,
      metadataUrl: gatewayUrl,
    };
  } catch (error) {
    log("Error uploading image:", error);
    return {
      success: false,
      error: error.message || "Failed to upload image",
    };
  }
}

/**
 * Check backend IPFS service status
 * 
 * @returns {Promise<{available: boolean, error?: string}>}
 */
export async function checkIPFSStatus() {
  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_URL}/api/ipfs/status`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return { available: false, error: "Backend not responding" };
    }
    
    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { available: false, error: "Backend returned non-JSON response" };
    }
    
    const data = await response.json();
    return { available: data.status === "ok" || data.available === true };
  } catch (error) {
    log("checkIPFSStatus error:", error.message);
    return { available: false, error: error.message };
  }
}

/**
 * Encrypt/encode the IPFS URL for NFT URI field
 * This creates a compact representation for on-chain storage
 * 
 * @param {string} ipfsUrl - Full IPFS URL (ipfs://... or gateway URL)
 * @returns {string} Encoded URI for NFT
 */
export function encodeIPFSUrl(ipfsUrl) {
  // If it's already an ipfs:// URL, use it directly
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl;
  }
  
  // Extract CID from gateway URL
  const cidMatch = ipfsUrl.match(/ipfs\/([a-zA-Z0-9]+)/);
  if (cidMatch) {
    return `ipfs://${cidMatch[1]}`;
  }
  
  // Return as-is if no match
  return ipfsUrl;
}

/**
 * Create compact metadata for NFT (short keys for on-chain storage)
 * 
 * Keys:
 * - p: productType/title
 * - w: weight
 * - d: date
 * - l: lieu/location/labo
 * - lk: labo_key
 * - n: numéro de lot
 * - pc: price
 * - c: certificate/image URL
 * - s: seller name
 * 
 * @param {object} formData - Full form data
 * @param {string} imageUrl - IPFS URL of the certificate image
 * @returns {object} Compact metadata
 */
export function createCompactMetadata(formData, imageUrl) {
  return {
    p: formData.productType,      // Product type
    w: formData.weight,           // Weight
    d: formData.date,             // Date
    l: formData.labo,             // Laboratory/Location
    lk: formData.labo_key,        // Laboratory key
    n: formData.lotNumber,        // Lot number
    pc: formData.price,           // Price
    c: imageUrl,                  // Certificate image URL
    s: formData.sellerName || "Seller", // Seller name
  };
}
