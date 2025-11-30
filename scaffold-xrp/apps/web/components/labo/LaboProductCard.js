"use client";

import { motion } from "framer-motion";

const STATUS_COLORS = {
  "pending": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "labo-validated": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "rejected": "bg-red-500/20 text-red-400 border-red-500/30"
};

const STATUS_LABELS = {
  "pending": "Pending Validation",
  "labo-validated": "Validated",
  "rejected": "Rejected"
};

export default function LaboProductCard({ product, onView, onValidate, onReject, onDecrypt }) {
  const statusColor = STATUS_COLORS[product.laboStatus] || STATUS_COLORS["pending"];
  const statusLabel = STATUS_LABELS[product.laboStatus] || product.laboStatus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-cyan-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-1">{product.productType}</h3>
          <p className="text-white/60 text-sm">Lot: {product.lotNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-white/50">Weight</p>
          <p className="text-white font-medium">{product.weight} kg</p>
        </div>
        <div>
          <p className="text-white/50">Date</p>
          <p className="text-white font-medium">{new Date(product.date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-white/50">Lieu</p>
          <p className="text-white font-medium">{product.labo || "N/A"}</p>
        </div>
        <div>
          <p className="text-white/50">Price</p>
          <p className="text-white font-medium">{product.price} XRP</p>
        </div>
      </div>

      {/* NFT Info */}
      {product.nftTokenId && (
        <div className="mb-4 p-2 bg-white/5 rounded-lg">
          <p className="text-white/50 text-xs">NFT Token ID</p>
          <p className="text-cyan-400 font-mono text-xs break-all">
            {product.nftTokenId.slice(0, 20)}...
          </p>
        </div>
      )}

      {/* Encrypted data indicator */}
      {product.hasEncryptedData && (
        <div className="mb-4 flex items-center gap-2">
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Encrypted Data
          </span>
        </div>
      )}

      <div className="text-xs text-white/40 mb-4">
        <p>Seller: {product.sellerName || product.sellerAddress?.slice(0, 10) + "..."}</p>
        <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onView(product)}
          className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-lg text-white text-sm font-medium transition-all"
        >
          View Details
        </button>
        
        {product.hasEncryptedData && (
          <button
            onClick={() => onDecrypt(product)}
            className="py-2 px-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-purple-400 text-sm font-medium transition-all flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Decrypt
          </button>
        )}
        
        {product.laboStatus === "pending" && (
          <>
            <button
              onClick={() => onValidate(product)}
              className="py-2 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg text-cyan-400 text-sm font-medium transition-all"
            >
              Validate
            </button>
            <button
              onClick={() => onReject(product)}
              className="py-2 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 text-sm font-medium transition-all"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
