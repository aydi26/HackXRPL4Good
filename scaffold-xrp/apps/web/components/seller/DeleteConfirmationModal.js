"use client";

import { motion } from "framer-motion";

export default function DeleteConfirmationModal({ listing, onClose, onConfirm, isLoading }) {
  if (!listing) return null;

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
        className="bg-[#0a0a0f] border border-white/20 rounded-2xl p-6 md:p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Delete Listing</h2>
        
        <p className="text-white/80 mb-6">
          Are you sure you want to delete this listing? This action cannot be undone.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <p className="text-white font-semibold">{listing.productType}</p>
          <p className="text-white/60 text-sm">Lot: {listing.lotNumber}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(listing.id)}
            disabled={isLoading}
            className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
