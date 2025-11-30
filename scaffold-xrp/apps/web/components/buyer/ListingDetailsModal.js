"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * Modal for viewing listing details
 */
export default function ListingDetailsModal({ listing, onClose, onBuy }) {
  if (!listing) return null;

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const truncateNFTId = (nftId) => {
    if (!nftId) return "N/A";
    return `${nftId.slice(0, 12)}...${nftId.slice(-8)}`;
  };

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
        className="bg-[#0f0f15] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 bg-gradient-to-br from-blue-500/20 to-emerald-500/20">
          {listing.certificateUrl ? (
            <img
              src={listing.certificateUrl}
              alt={listing.productType}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30">
              <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* NFT Badge */}
          {listing.nftId && (
            <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-purple-500/30 backdrop-blur-sm rounded-full text-sm font-medium text-purple-300 border border-purple-500/30 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.5 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
              </svg>
              On-Chain NFT
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{listing.productType}</h2>
            <p className="text-white/60">Lot #{listing.lotNumber}</p>
          </div>

          {/* Price Section */}
          <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-white/50 text-sm">Total Price</span>
                <p className="text-3xl font-bold text-white">{listing.price} <span className="text-xl text-white/60">XRP</span></p>
              </div>
              <div className="text-right">
                <span className="text-white/50 text-sm">Per kilogram</span>
                <p className="text-xl font-medium text-white">{listing.pricePerKg} XRP/kg</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4">
              <span className="text-white/40 text-sm">Weight</span>
              <p className="text-white text-lg font-medium">{listing.weight} kg</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <span className="text-white/40 text-sm">Date</span>
              <p className="text-white text-lg font-medium">{formatDate(listing.date)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <span className="text-white/40 text-sm">Laboratory</span>
              <p className="text-white text-lg font-medium">{listing.labo || "Not specified"}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <span className="text-white/40 text-sm">Status</span>
              <p className={`text-lg font-medium ${listing.status === "available" ? "text-emerald-400" : "text-yellow-400"}`}>
                {listing.status === "available" ? "Available" : listing.status}
              </p>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-white/40 text-sm mb-3">Seller Information</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{listing.sellerName}</p>
                <p className="text-white/50 text-sm font-mono">{listing.sellerAddress}</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-400 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Seller
              </div>
            </div>
          </div>

          {/* NFT Info */}
          {listing.nftId && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
              <h3 className="text-purple-300 text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.5 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                </svg>
                Blockchain Verification
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-white/40 text-xs">NFT Token ID</span>
                  <p className="text-white/80 text-sm font-mono break-all">{listing.nftId}</p>
                </div>
                {listing.taxon !== undefined && (
                  <div>
                    <span className="text-white/40 text-xs">Category Taxon</span>
                    <p className="text-white/80 text-sm">{listing.taxon}</p>
                  </div>
                )}
                {listing.uri && (
                  <div>
                    <span className="text-white/40 text-xs">Metadata URI</span>
                    <p className="text-white/80 text-sm font-mono break-all">{listing.uri}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Metadata (Debug) */}
          {listing.rawMetadata && Object.keys(listing.rawMetadata).length > 0 && (
            <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4 mb-6">
              <h3 className="text-gray-300 text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Raw Metadata
              </h3>
              <pre className="text-white/60 text-xs font-mono overflow-x-auto whitespace-pre-wrap bg-black/30 p-3 rounded-lg max-h-48 overflow-y-auto">
                {JSON.stringify(listing.rawMetadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onBuy?.(listing)}
              disabled={listing.status !== "available"}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Buy Now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
