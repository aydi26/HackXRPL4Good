"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function LaboDecryptModal({ product, onClose, onDecrypt, isLoading, decryptedData, error }) {
  const [privateKey, setPrivateKey] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onDecrypt(product, privateKey);
  };

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
        className="bg-[#0a0a0f] border border-white/20 rounded-2xl p-6 md:p-8 max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Decrypt NFT Data
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-white font-semibold mb-2">{product.productType}</h3>
          <p className="text-white/60 text-sm">Lot: {product.lotNumber}</p>
          {product.nftTokenId && (
            <p className="text-cyan-400 font-mono text-xs mt-2 break-all">
              NFT: {product.nftTokenId.slice(0, 30)}...
            </p>
          )}
        </div>

        {decryptedData ? (
          /* Show Decrypted Data */
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 font-medium mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Decryption Successful
              </p>
            </div>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-white/50 text-xs mb-2">Decrypted Content:</p>
              <pre className="text-white/80 text-sm whitespace-pre-wrap break-all font-mono">
                {typeof decryptedData === "object" 
                  ? JSON.stringify(decryptedData, null, 2)
                  : decryptedData}
              </pre>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white font-semibold transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          /* Show Decrypt Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-purple-300 text-sm">
                Enter the laboratory private key to decrypt the sealed NFT data. 
                This data was encrypted specifically for this laboratory using ECIES encryption.
              </p>
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2">
                Labo Private Key <span className="text-purple-400">*</span>
              </label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key (hex format)"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <p className="text-white/40 text-xs mt-1">
                Your private key is never sent to any server - decryption happens locally.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">❌ {error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !privateKey.trim()}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isLoading || !privateKey.trim()
                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Decrypting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Decrypt Data
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
