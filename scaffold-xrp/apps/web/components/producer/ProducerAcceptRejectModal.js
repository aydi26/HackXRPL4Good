"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ProducerAcceptRejectModal({ offer, action, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = useState("");
  const isAccept = action === "accept";

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(offer.id, action, reason);
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
        className="bg-[#0a0a0f] border border-white/20 rounded-2xl p-6 md:p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          {isAccept ? "Accept Offer" : "Reject Offer"}
        </h2>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <p className="text-white font-semibold">{offer.productType}</p>
          <p className="text-white/60 text-sm">Lot: {offer.lotNumber}</p>
          <p className="text-white/60 text-sm mt-1">
            {offer.price} XRP {offer.pricePerKg ? "/kg" : "total"} • {offer.weight} kg
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isAccept && (
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {isAccept && (
            <p className="text-white/80">
              Are you sure you want to accept this offer? This will validate the product listing.
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3 px-6 rounded-lg text-white font-medium transition-all disabled:opacity-50 ${
                isAccept
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isLoading 
                ? (isAccept ? "Accepting..." : "Rejecting...") 
                : (isAccept ? "Accept Offer" : "Reject Offer")
              }
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
