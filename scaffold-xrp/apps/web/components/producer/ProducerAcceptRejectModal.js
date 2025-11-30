"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ProducerAcceptRejectModal({ offer, action, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = useState("");

  if (!offer) return null;

  const isAccept = action === "accept";

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(offer.id, isAccept ? null : reason);
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
        
        <div className="mb-6">
          <p className="text-white/70 mb-2">
            {isAccept 
              ? "Are you sure you want to accept this offer?"
              : "Are you sure you want to reject this offer?"
            }
          </p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <p className="text-white font-medium">{offer.productType}</p>
            <p className="text-white/60 text-sm">Lot: {offer.lotNumber}</p>
            <p className="text-white/60 text-sm">
              {offer.weight} kg • {offer.price} XRP {offer.pricePerKg ? "/kg" : "total"}
            </p>
          </div>
        </div>

        {!isAccept && (
          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for rejection..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </form>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white font-medium transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isAccept
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {isLoading ? (isAccept ? "Accepting..." : "Rejecting...") : (isAccept ? "Accept" : "Reject")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

