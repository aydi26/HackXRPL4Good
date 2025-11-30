"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchReceivedOffers, MEMO_TYPES } from "../../lib/offerService";

/**
 * Component for displaying incoming offers notifications
 * Shows a bell icon with badge and dropdown list of offers
 */
export default function SellerOffersNotification({ 
  sellerAddress, 
  onAcceptOffer,
  onViewOffer 
}) {
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  // Fetch offers from blockchain
  const fetchOffers = useCallback(async () => {
    if (!sellerAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const receivedOffers = await fetchReceivedOffers(sellerAddress);
      
      // Filter to only show pending offers
      const pendingOffers = receivedOffers.filter(o => o.status === "pending" && o.validated);
      
      setOffers(pendingOffers);
      setLastCheck(new Date());
      
      console.log(`📬 Found ${pendingOffers.length} pending offers`);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sellerAddress]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchOffers();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchOffers, 30000);
    
    return () => clearInterval(interval);
  }, [fetchOffers]);

  // Count of unread/pending offers
  const pendingCount = offers.length;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-xl transition-all"
      >
        <svg 
          className={`w-6 h-6 ${pendingCount > 0 ? "text-emerald-400" : "text-white/60"}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Badge */}
        {pendingCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {pendingCount > 9 ? "9+" : pendingCount}
          </motion.span>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <span className="absolute -bottom-1 -right-1 w-3 h-3">
            <span className="absolute w-full h-full bg-blue-400 rounded-full animate-ping opacity-75"></span>
            <span className="relative block w-3 h-3 bg-blue-500 rounded-full"></span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[#0f0f18] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Incoming Offers
                </h3>
                <button
                  onClick={fetchOffers}
                  disabled={isLoading}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <svg 
                    className={`w-4 h-4 text-white/60 ${isLoading ? "animate-spin" : ""}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                {error && (
                  <div className="p-4 text-red-400 text-sm">
                    <p>Error loading offers: {error}</p>
                  </div>
                )}

                {!error && offers.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-white/40 text-sm">No pending offers</p>
                    <p className="text-white/20 text-xs mt-1">
                      {lastCheck && `Last checked: ${lastCheck.toLocaleTimeString()}`}
                    </p>
                  </div>
                )}

                {offers.map((offer, idx) => (
                  <OfferItem
                    key={offer.txHash || idx}
                    offer={offer}
                    onAccept={() => {
                      onAcceptOffer?.(offer);
                      setIsOpen(false);
                    }}
                    onView={() => {
                      onViewOffer?.(offer);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>

              {/* Footer */}
              {lastCheck && (
                <div className="p-2 border-t border-white/10 text-center">
                  <p className="text-white/30 text-xs">
                    Last updated: {lastCheck.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual offer item in the list
 */
function OfferItem({ offer, onAccept, onView }) {
  const formatAddress = (addr) => {
    if (!addr) return "Unknown";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Product & Price */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium truncate">
              {offer.productType || "Product NFT"}
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">
              {offer.offeredPrice} XRP
            </span>
          </div>
          
          {/* Buyer */}
          <p className="text-white/50 text-sm flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            From: {formatAddress(offer.buyerAddress)}
          </p>
          
          {/* NFT ID */}
          {offer.nftId && (
            <p className="text-white/30 text-xs font-mono mt-1 truncate">
              NFT: {offer.nftId.slice(0, 16)}...
            </p>
          )}
          
          {/* Time */}
          <p className="text-white/30 text-xs mt-1">
            {formatTime(offer.timestamp)}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onAccept}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accept
          </button>
          <button
            onClick={onView}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium rounded-lg transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}
