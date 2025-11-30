"use client";

import { motion } from "framer-motion";

/**
 * Component to display sent offers by the buyer
 */
export default function MyOffersList({ offers, isLoading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "accepted":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const truncateAddress = (address) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-white/60">Loading your offers...</span>
        </div>
      </div>
    );
  }

  if (!offers || offers.length === 0) {
    return (
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-blue-500/20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <p className="text-white/60">No offers sent yet</p>
        <p className="text-white/40 text-sm mt-1">Browse products and make your first offer!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {offers.map((offer, idx) => (
        <motion.div
          key={offer.txHash || idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium truncate">
                {offer.productType || "Product NFT"}
              </h4>
              <p className="text-white/40 text-sm mt-1">
                To: {truncateAddress(offer.sellerAddress)}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-emerald-400 font-bold">{offer.offeredPrice} XRP</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(offer.status)}`}>
                {offer.status}
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-white/40">
              {formatDate(offer.timestamp)}
            </span>
            {offer.validated && (
              <span className="text-emerald-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                On-chain
              </span>
            )}
          </div>
          
          {offer.txHash && (
            <div className="mt-2">
              <p className="text-white/30 text-xs font-mono truncate">
                TX: {offer.txHash}
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
