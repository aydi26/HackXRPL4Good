"use client";

import { motion } from "framer-motion";

/**
 * Card component for displaying a marketplace listing
 */
export default function MarketplaceListingCard({ listing, onView, onBuy }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "sold":
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
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const truncateAddress = (address) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group"
    >
      {/* Certificate/Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 flex items-center justify-center">
        {listing.certificateUrl ? (
          <img
            src={listing.certificateUrl}
            alt={listing.productType}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div className={`${listing.certificateUrl ? "hidden" : "flex"} flex-col items-center justify-center text-white/40`}>
          <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">No Image</span>
        </div>
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(listing.status)}`}>
          {listing.status === "available" ? "Available" : listing.status}
        </div>
        
        {/* NFT Badge */}
        {listing.nftId && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.5 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
            NFT
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Product Type */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {listing.productType}
        </h3>

        {/* Description if available */}
        {listing.description && (
          <p className="text-white/60 text-sm mb-3 line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* NFT URI Debug Info */}
        {listing.uri && (
          <div className="mb-3 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-300 text-xs font-mono break-all">
              URI: {listing.uri.length > 60 ? listing.uri.slice(0, 60) + "..." : listing.uri}
            </p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <span className="text-white/40">Weight</span>
            <p className="text-white font-medium">{listing.weight} kg</p>
          </div>
          <div>
            <span className="text-white/40">Lot #</span>
            <p className="text-white font-medium">{listing.lotNumber}</p>
          </div>
          <div>
            <span className="text-white/40">Date</span>
            <p className="text-white font-medium">{formatDate(listing.date)}</p>
          </div>
          <div>
            <span className="text-white/40">Lab</span>
            <p className="text-white font-medium truncate">{listing.labo || "N/A"}</p>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-white/5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{listing.sellerName}</p>
            <p className="text-white/40 text-xs truncate">{truncateAddress(listing.sellerAddress)}</p>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-white/40 text-sm">Total Price</span>
            <p className="text-2xl font-bold text-white">{listing.price} <span className="text-lg text-white/60">XRP</span></p>
          </div>
          <div className="text-right">
            <span className="text-white/40 text-sm">Per kg</span>
            <p className="text-lg font-medium text-white/80">{listing.pricePerKg} XRP</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onView?.(listing)}
            className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
          <button
            onClick={() => onBuy?.(listing)}
            disabled={listing.status !== "available"}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Buy
          </button>
        </div>
      </div>
    </motion.div>
  );
}
