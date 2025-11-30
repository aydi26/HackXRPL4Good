"use client";

import { motion } from "framer-motion";

export default function LaboProductDetails({ product, onClose, onValidate, onReject, onDecrypt, decryptedData }) {
  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0f] border border-white/20 rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Product Details</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Status Badge */}
          <div>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${
              product.laboStatus === "pending" 
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                : product.laboStatus === "labo-validated"
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}>
              {product.laboStatus === "pending" ? "Pending Validation" 
                : product.laboStatus === "labo-validated" ? "Validated"
                : "Rejected"}
            </span>
          </div>

          {/* Main Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-white/50 text-sm mb-1">Product Type</p>
              <p className="text-white font-semibold text-lg">{product.productType}</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Lot Number</p>
              <p className="text-white font-semibold text-lg">{product.lotNumber}</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Weight</p>
              <p className="text-white font-semibold text-lg">{product.weight} kg</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Price</p>
              <p className="text-white font-semibold text-lg">{product.price} XRP</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Date</p>
              <p className="text-white font-semibold text-lg">
                {new Date(product.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Lieu</p>
              <p className="text-white font-semibold text-lg">{product.labo || "N/A"}</p>
            </div>
          </div>

          {/* Seller Info */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-white/50 text-sm mb-2">Seller</p>
            <p className="text-white font-medium">{product.sellerName || "Unknown Seller"}</p>
            <p className="text-white/60 text-sm font-mono">{product.sellerAddress}</p>
          </div>

          {/* NFT Info */}
          {product.nftTokenId && (
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <p className="text-cyan-400 font-medium mb-2">NFT Information</p>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-white/50">Token ID</p>
                  <p className="text-white font-mono text-xs break-all">{product.nftTokenId}</p>
                </div>
                {product.txHash && (
                  <div>
                    <p className="text-white/50">Transaction Hash</p>
                    <p className="text-white font-mono text-xs break-all">{product.txHash}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Encrypted Data Section */}
          {product.hasEncryptedData && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-purple-400 font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Encrypted Data
                </p>
                {!decryptedData && (
                  <button
                    onClick={() => onDecrypt(product)}
                    className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-all flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Decrypt with Labo Key
                  </button>
                )}
              </div>
              
              {decryptedData ? (
                <div className="space-y-2">
                  <p className="text-green-400 text-sm mb-2">✓ Data decrypted successfully</p>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <pre className="text-white/80 text-xs overflow-x-auto whitespace-pre-wrap">
                      {typeof decryptedData === "object" 
                        ? JSON.stringify(decryptedData, null, 2)
                        : decryptedData}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-sm">
                  This product contains encrypted data that can only be decrypted with the Labo private key.
                </p>
              )}
            </div>
          )}

          {/* Certificate */}
          {product.certificateUrl && (
            <div>
              <p className="text-white/50 text-sm mb-2">Certificate</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                {product.certificateUrl.startsWith("data:image/") ? (
                  <img
                    src={product.certificateUrl}
                    alt="Certificate"
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-white font-medium">Certificate Document</p>
                      <a
                        href={product.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 text-sm hover:underline"
                      >
                        View Certificate
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Labo Validation History */}
          {product.laboValidation && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-white font-medium mb-2">Validation History</p>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/60">Labo Validation</p>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.laboValidation.status === "accepted"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {product.laboValidation.status}
                </span>
              </div>
              {product.laboValidation.reason && (
                <p className="text-white/60 text-sm">{product.laboValidation.reason}</p>
              )}
              <p className="text-white/40 text-xs mt-2">
                {new Date(product.laboValidation.date).toLocaleString()}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/50">Created</p>
                <p className="text-white">{new Date(product.createdAt).toLocaleString()}</p>
              </div>
              {product.updatedAt && (
                <div>
                  <p className="text-white/50">Last Updated</p>
                  <p className="text-white">{new Date(product.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {product.laboStatus === "pending" && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => onValidate(product)}
                className="flex-1 py-3 px-6 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white font-semibold transition-all"
              >
                ✓ Validate Product
              </button>
              <button
                onClick={() => onReject(product)}
                className="flex-1 py-3 px-6 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 font-semibold transition-all"
              >
                ✗ Reject Product
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
