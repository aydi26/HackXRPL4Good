"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../providers/WalletProvider";
import { sendOffer } from "../../lib/offerService";

/**
 * Modal for making an offer on a listing
 */
export default function MakeOfferModal({ listing, onClose, onSuccess }) {
  const { walletManager, accountInfo } = useWallet();
  const [offeredPrice, setOfferedPrice] = useState(listing?.price || "0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await sendOffer(
        listing,
        offeredPrice,
        accountInfo?.address,
        walletManager
      );

      // Call success callback with offer data
      onSuccess?.({
        ...result,
        offeredPrice,
        timestamp: new Date().toISOString(),
        validated: true,
      });
    } catch (err) {
      console.error("Error sending offer:", err);
      setError(err.message || "Failed to send offer");
    } finally {
      setIsLoading(false);
    }
  };

  if (!listing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0f0f15] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Make an Offer</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Product Info */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl">
            <h3 className="text-white font-medium mb-2">{listing.productType}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-white/40">Weight:</span>
                <span className="text-white ml-2">{listing.weight} kg</span>
              </div>
              <div>
                <span className="text-white/40">Lot #:</span>
                <span className="text-white ml-2">{listing.lotNumber}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/10">
              <span className="text-white/40 text-sm">Listed Price:</span>
              <span className="text-emerald-400 font-bold text-lg ml-2">{listing.price} XRP</span>
            </div>
          </div>

          {/* Offer Price Input */}
          <div className="mb-6">
            <label className="block text-white/60 text-sm mb-2">
              Your Offer (XRP)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-medium focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="Enter your offer"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
                XRP
              </span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Sending offer to seller</span>
            </div>
            <p className="text-white/50 text-xs mt-1 font-mono">
              {listing.sellerAddress}
            </p>
          </div>

          {/* Transaction Info */}
          <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-300 text-sm">
              This will send a transaction of <strong>1 drop</strong> (0.000001 XRP) to the seller with your offer details. Your wallet will ask you to sign the transaction.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !offeredPrice || parseFloat(offeredPrice) <= 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Offer
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
