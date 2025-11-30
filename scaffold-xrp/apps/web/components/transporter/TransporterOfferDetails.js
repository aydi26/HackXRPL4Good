"use client";

import { motion } from "framer-motion";

export default function TransporterOfferDetails({ offer, onClose, onAccept, onReject }) {
  if (!offer) return null;

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
        className="bg-[#0a0a0f] border border-white/20 rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Transport Mission Details</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Status Badge */}
          <div>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${
              offer.status === "ready-for-transport" 
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                : offer.status === "transport-accepted" || offer.status === "in-transit"
                ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                : "bg-green-500/20 text-green-400 border-green-500/30"
            }`}>
              {offer.status === "ready-for-transport" 
                ? "Ready for Transport" 
                : offer.status === "transport-accepted"
                ? "Transport Accepted"
                : offer.status === "in-transit"
                ? "In Transit"
                : "Completed"}
            </span>
          </div>

          {/* Main Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-white/50 text-sm mb-1">Product Type</p>
              <p className="text-white font-semibold text-lg">{offer.productType}</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Lot Number</p>
              <p className="text-white font-semibold text-lg">{offer.lotNumber}</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Weight</p>
              <p className="text-white font-semibold text-lg">{offer.weight} kg</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Distance</p>
              <p className="text-white font-semibold text-lg">{offer.distance || "N/A"} km</p>
            </div>
            {offer.transportPrice && (
              <div>
                <p className="text-white/50 text-sm mb-1">Transport Price</p>
                <p className="text-white font-semibold text-lg">{offer.transportPrice} XRP</p>
              </div>
            )}
            {offer.labo && (
              <div>
                <p className="text-white/50 text-sm mb-1">Laboratory</p>
                <p className="text-white font-semibold text-lg">{offer.labo}</p>
              </div>
            )}
          </div>

          {/* Validation Status */}
          <div>
            <p className="text-white/50 text-sm mb-2">Validation Status</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-white/60 text-sm mb-1">Seller</p>
                <span className={`px-2 py-1 rounded text-xs ${
                  offer.sellerValidated 
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}>
                  {offer.sellerValidated ? "✓ Validated" : "Pending"}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-white/60 text-sm mb-1">Producer</p>
                <span className={`px-2 py-1 rounded text-xs ${
                  offer.producerValidated 
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}>
                  {offer.producerValidated ? "✓ Validated" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div>
            <p className="text-white/50 text-sm mb-2">Seller Information</p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white font-medium mb-1">
                {offer.sellerName || "Unknown Seller"}
              </p>
              <p className="text-white/60 text-sm">
                Address: {offer.sellerAddress || "Not available"}
              </p>
            </div>
          </div>

          {/* Validation History Timeline */}
          <div>
            <p className="text-white/50 text-sm mb-2">Validation Timeline</p>
            <div className="space-y-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">Seller</p>
                  <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400">
                    ✓ Created
                  </span>
                </div>
                <p className="text-white/40 text-xs">
                  {new Date(offer.createdAt).toLocaleString()}
                </p>
              </div>

              {offer.producerValidation && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">Producer</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      offer.producerValidation.status === "accepted"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {offer.producerValidation.status === "accepted" ? "✓ Accepted" : "✗ Rejected"}
                    </span>
                  </div>
                  {offer.producerValidation.reason && (
                    <p className="text-white/60 text-sm">{offer.producerValidation.reason}</p>
                  )}
                  <p className="text-white/40 text-xs mt-2">
                    {new Date(offer.producerValidation.date).toLocaleString()}
                  </p>
                </div>
              )}

              {offer.transporterValidation && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">Transporter</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      offer.transporterValidation.status === "accepted"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {offer.transporterValidation.status === "accepted" ? "✓ Accepted" : "✗ Rejected"}
                    </span>
                  </div>
                  {offer.transporterValidation.reason && (
                    <p className="text-white/60 text-sm">{offer.transporterValidation.reason}</p>
                  )}
                  <p className="text-white/40 text-xs mt-2">
                    {new Date(offer.transporterValidation.date).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {offer.status === "ready-for-transport" && (
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
              >
                Close
              </button>
              <button
                onClick={() => onReject(offer)}
                className="flex-1 py-3 px-6 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 font-medium transition-all"
              >
                Reject Mission
              </button>
              <button
                onClick={() => onAccept(offer)}
                className="flex-1 py-3 px-6 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-all"
              >
                Accept Mission
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
