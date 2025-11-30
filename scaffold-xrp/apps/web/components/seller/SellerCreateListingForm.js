"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../providers/WalletProvider";
import { mintSemiPrivateNFT, checkMintingAvailable } from "../../lib/mintService";
import { uploadNFTToIPFS, createCompactMetadata } from "../../lib/ipfsService";

const PRODUCT_TYPES = ["Apple", "Grape", "Orange", "Lemon", "Strawberry", "Tomato", "Potato", "Carrot"];

// Labo public key constant
const LABO_PUBLIC_KEY = "03A0343C9615CDBEE180BEEA96C7EF74C053A52F3F1965B85A1C29AFA66AB09354";

export default function SellerCreateListingForm({ onSubmit, isLoading }) {
  const { walletManager, accountInfo } = useWallet();
  
  const [formData, setFormData] = useState({
    productType: "",
    weight: "",
    date: "",
    lotNumber: "",
    labo: "",
    labo_key: LABO_PUBLIC_KEY,
    price: "",
    certificate: null
  });

  const [errors, setErrors] = useState({});
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mintResult, setMintResult] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Check if backend is available for minting
  useEffect(() => {
    checkMintingAvailable().then(setBackendAvailable);
  }, []);

  // Generate lot number
  const generateLotNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LOT-${year}-${random}`;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      const file = files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
          setErrors({ ...errors, certificate: "Please upload an image or PDF file" });
          return;
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ ...errors, certificate: "File size must be less than 5MB" });
          return;
        }
        setFormData({ ...formData, certificate: file });
        setErrors({ ...errors, certificate: "" });
        
        // Create preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setCertificatePreview(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          setCertificatePreview("pdf");
        }
      }
    } else if (name === "lotNumber" && !value) {
      // Auto-generate lot number if empty
      setFormData({ ...formData, [name]: generateLotNumber() });
    } else {
      setFormData({ ...formData, [name]: value });
      // Clear error when user types
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" });
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.productType) newErrors.productType = "Product type is required";
    if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = "Weight must be greater than 0";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.lotNumber) newErrors.lotNumber = "Lot number is required";
    if (!formData.labo) newErrors.labo = "Location is required";
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Price must be greater than 0";
    if (!formData.certificate) newErrors.certificate = "Certificate is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      handleSaveDraft();
    }
  };

  // Handle Save Draft - Upload to IPFS first
  const handleSaveDraft = async () => {
    if (!validate()) return;
    
    setIsUploading(true);
    setUploadResult(null);
    
    try {
      // Create compact metadata
      const metadata = createCompactMetadata({
        ...formData,
        sellerName: accountInfo?.walletName || "Seller",
      }, ""); // Image URL will be added by backend
      
      // Upload image + metadata to IPFS
      const result = await uploadNFTToIPFS(formData.certificate, metadata);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to upload to IPFS");
      }
      
      setUploadResult(result);
      
      // Save draft with IPFS data
      onSubmit({
        ...formData,
        metadataUrl: result.metadataUrl,
        imageUrl: result.imageUrl,
        metadataCid: result.metadataCid,
        imageCid: result.imageCid,
        // Mark as ready for minting
        readyToMint: true,
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({ success: false, error: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Mint NFT - Uses Semi-Private NFT with encryption
  const handleMintNFT = async () => {
    if (!validate()) return;
    
    setIsMinting(true);
    setMintResult(null);
    
    try {
      let ipfsImageLink = uploadResult?.gatewayUrl || uploadResult?.imageUrl;
      
      // If not uploaded yet, upload first
      if (!ipfsImageLink) {
        console.log("[MintNFT] No image uploaded yet, uploading first...");
        setIsUploading(true);
        
        const metadata = createCompactMetadata({
          ...formData,
          sellerName: accountInfo?.walletName || "Seller",
        }, "");
        
        const uploadRes = await uploadNFTToIPFS(formData.certificate, metadata);
        setIsUploading(false);
        
        if (!uploadRes.success) {
          throw new Error(uploadRes.error || "Failed to upload to IPFS");
        }
        
        setUploadResult(uploadRes);
        ipfsImageLink = uploadRes.gatewayUrl || uploadRes.imageUrl;
        console.log("[MintNFT] Image uploaded:", ipfsImageLink);
      }
      
      if (!ipfsImageLink) {
        throw new Error("Failed to get IPFS image URL");
      }
    
      // Prepare public data for the NFT
      const publicData = {
        productType: formData.productType,
        weight: formData.weight,
        date: formData.date,
        lotNumber: formData.lotNumber,
        labo: formData.labo,
        price: formData.price,
      };

      console.log("[MintNFT] Minting with data:", publicData);
      console.log("[MintNFT] IPFS Image:", ipfsImageLink);
      console.log("[MintNFT] Labo Key:", formData.labo_key?.slice(0, 20) + "...");

      // Mint Semi-Private NFT with encryption
      const result = await mintSemiPrivateNFT({
        walletManager,
        sellerAddress: accountInfo?.address,
        publicData,
        ipfsImageLink,
        laboPublicKey: formData.labo_key,
      });
      
      console.log("[MintNFT] Result:", result);
      setMintResult(result);
      
      if (result.success) {
        // Update listing with NFT data
        onSubmit({
          ...formData,
          nftTokenId: result.nftTokenId,
          txHash: result.txHash,
          imageUrl: ipfsImageLink,
          uriHex: result.uriHex,
          sealHex: result.sealHex,
        });
      }
    } catch (error) {
      console.error("[MintNFT] Error:", error);
      setMintResult({ success: false, error: error.message });
    } finally {
      setIsMinting(false);
      setIsUploading(false);
    }
  };

  const isFormValid = formData.productType && formData.weight && formData.date && 
                     formData.lotNumber && formData.labo && formData.price && formData.certificate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Create New Listing</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Type */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Product Type <span className="text-emerald-400">*</span>
          </label>
          <select
            name="productType"
            value={formData.productType}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">Select product type</option>
            {PRODUCT_TYPES.map(type => (
              <option key={type} value={type} className="bg-[#0a0a0f]">{type}</option>
            ))}
          </select>
          {errors.productType && (
            <p className="text-red-400 text-sm mt-1">{errors.productType}</p>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Weight (kg) <span className="text-emerald-400">*</span>
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="e.g., 1000"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {errors.weight && (
            <p className="text-red-400 text-sm mt-1">{errors.weight}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Date <span className="text-emerald-400">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
            style={{ 
              colorScheme: 'dark',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
          />
          {errors.date && (
            <p className="text-red-400 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Lot Number */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Lot Number <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            name="lotNumber"
            value={formData.lotNumber}
            onChange={handleChange}
            placeholder="Auto-generated if empty"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {errors.lotNumber && (
            <p className="text-red-400 text-sm mt-1">{errors.lotNumber}</p>
          )}
        </div>

        {/* Lieu */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Lieu <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            name="labo"
            value={formData.labo}
            onChange={handleChange}
            placeholder="Enter location"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {errors.labo && (
            <p className="text-red-400 text-sm mt-1">{errors.labo}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Price (XRP) <span className="text-emerald-400">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.000001"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {errors.price && (
            <p className="text-red-400 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        {/* Certificate Upload */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Certificate <span className="text-emerald-400">*</span>
          </label>
          <div className="space-y-3">
            <input
              type="file"
              name="certificate"
              accept="image/*,application/pdf"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {certificatePreview && (
              <div className="mt-3">
                {certificatePreview === "pdf" ? (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-white/80">PDF certificate uploaded</p>
                  </div>
                ) : (
                  <img
                    src={certificatePreview}
                    alt="Certificate preview"
                    className="max-w-full h-48 object-cover rounded-lg border border-white/10"
                  />
                )}
              </div>
            )}
          </div>
          {errors.certificate && (
            <p className="text-red-400 text-sm mt-1">{errors.certificate}</p>
          )}
        </div>

        {/* Summary */}
        {isFormValid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
          >
            <h3 className="text-white font-semibold mb-2">Listing Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-white/60">Product:</span>
                <span className="text-white ml-2">{formData.productType}</span>
              </div>
              <div>
                <span className="text-white/60">Weight:</span>
                <span className="text-white ml-2">{formData.weight} kg</span>
              </div>
              <div>
                <span className="text-white/60">Lot:</span>
                <span className="text-white ml-2">{formData.lotNumber}</span>
              </div>
              <div>
                <span className="text-white/60">Price:</span>
                <span className="text-white ml-2">{formData.price} XRP</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mint Result */}
        {mintResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`p-4 rounded-lg border ${
              mintResult.success 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            {mintResult.success ? (
              <div>
                <h3 className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  NFT Minted Successfully!
                </h3>
                <div className="text-sm space-y-1">
                  <p className="text-white/60">
                    <span className="text-white/40">Token ID:</span>{" "}
                    <span className="font-mono text-xs">{mintResult.nftTokenId?.slice(0, 20)}...</span>
                  </p>
                  <p className="text-white/60">
                    <span className="text-white/40">TX:</span>{" "}
                    <span className="font-mono text-xs">{mintResult.txHash?.slice(0, 20)}...</span>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-red-400 font-semibold mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Minting Failed
                </h3>
                <p className="text-red-300 text-sm">{mintResult.error}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Upload Result */}
        {uploadResult && !mintResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`p-4 rounded-lg border ${
              uploadResult.success 
                ? "bg-blue-500/10 border-blue-500/20" 
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            {uploadResult.success ? (
              <div>
                <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Uploaded to IPFS - Ready to Mint!
                </h3>
                <div className="text-sm space-y-2">
                  {/* Lien cliquable vers l'image */}
                  {(uploadResult.gatewayUrl || uploadResult.imageUrl) && (
                    <div className="p-2 bg-white/5 rounded-lg">
                      <p className="text-white/40 text-xs mb-1">Image IPFS :</p>
                      <a 
                        href={uploadResult.gatewayUrl || uploadResult.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline break-all text-xs"
                      >
                        {uploadResult.gatewayUrl || uploadResult.imageUrl}
                      </a>
                    </div>
                  )}
                  {uploadResult.imageCid && (
                    <p className="text-white/60">
                      <span className="text-white/40">CID:</span>{" "}
                      <span className="font-mono text-xs">{uploadResult.imageCid}</span>
                    </p>
                  )}
                </div>
                <p className="text-blue-300 text-sm mt-2">
                  Click "Mint NFT" to create the NFT on XRPL
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-red-400 font-semibold mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Upload Failed
                </h3>
                <p className="text-red-300 text-sm">{uploadResult.error}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {/* Save Draft Button - Uploads to IPFS */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading || isMinting || isUploading}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              !isFormValid || isLoading || isMinting || isUploading
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            {isUploading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading to IPFS...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save & Upload to IPFS
              </>
            )}
          </button>
          
          {/* Mint NFT Button */}
          <button
            type="button"
            onClick={handleMintNFT}
            disabled={!isFormValid || isLoading || isMinting || isUploading}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              !isFormValid || isLoading || isMinting || isUploading
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : uploadResult?.success
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            }`}
          >
            {isMinting ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Minting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {uploadResult?.success ? "Mint NFT" : "Upload & Mint"}
              </>
            )}
          </button>
        </div>
        
        {/* Backend Status */}
        {!backendAvailable && (
          <p className="text-yellow-400/70 text-sm text-center">
            ⚠️ Backend not available. Start the backend server to mint NFTs.
          </p>
        )}
      </form>
    </motion.div>
  );
}
