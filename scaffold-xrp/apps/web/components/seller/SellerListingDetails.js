"use client";

import { motion } from "framer-motion";

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "producer-validated": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "producer-transporter-validated": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "in-transit": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  deleted: "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

const STATUS_LABELS = {
  pending: "Pending Producer Validation",
  "producer-validated": "Producer Validated",
  "producer-transporter-validated": "Ready for Transport",
  "in-transit": "In Transit",
  completed: "Completed",
  cancelled: "Cancelled",
  deleted: "Deleted"
};

export default function SellerListingDetails({ listing, onClose, onEdit, onDelete }) {
  if (!listing) return null;

  const statusColor = STATUS_COLORS[listing.status] || STATUS_COLORS.pending;
  const statusLabel = STATUS_LABELS[listing.status] || "Unknown";

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
          <h2 className="text-2xl font-bold text-white">Listing Details</h2>
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
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          {/* Main Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-white/50 text-sm mb-1">Product Type</p>
              <p className="text-white font-semibold text-lg">{listing.productType}</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Lot Number</p>
              <p className="text-white font-semibold text-lg">{listing.lotNumber}</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Laboratory</p>
              <p className="text-white font-semibold text-lg">{listing.labo || "N/A"}</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Weight</p>
              <p className="text-white font-semibold text-lg">{listing.weight} kg</p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Price</p>
              <p className="text-white font-semibold text-lg">
                {listing.price} XRP {listing.pricePerKg ? "/kg" : "total"}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Date</p>
              <p className="text-white font-semibold text-lg">
                {new Date(listing.date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Total Value</p>
              <p className="text-white font-semibold text-lg">
                {listing.pricePerKg 
                  ? (parseFloat(listing.price) * parseFloat(listing.weight)).toFixed(6)
                  : listing.price
                } XRP
              </p>
            </div>
          </div>

          {/* Certificate */}
          {listing.certificateUrl && (
            <div>
              <p className="text-white/50 text-sm mb-2">Certificate</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                {listing.certificateUrl.startsWith("data:image") ? (
                  <img
                    src={listing.certificateUrl}
                    alt="Certificate"
                    className="max-w-full h-64 object-contain rounded-lg"
                  />
                ) : (
                  <a
                    href={listing.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 underline"
                  >
                    View Certificate
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Validation History */}
          <div>
            <p className="text-white/50 text-sm mb-3">Validation History</p>
            <div className="space-y-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Seller</p>
                    <p className="text-white/60 text-sm">Listing created</p>
                  </div>
                  <span className="text-emerald-400 text-sm">✓ Validated</span>
                </div>
                <p className="text-white/40 text-xs mt-2">
                  {new Date(listing.createdAt).toLocaleString()}
                </p>
              </div>
              
              {listing.producerValidation && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Producer</p>
                      <p className="text-white/60 text-sm">
                        {listing.producerValidation.status === "accepted" ? "Accepted" : "Rejected"}
                      </p>
                    </div>
                    <span className={listing.producerValidation.status === "accepted" ? "text-emerald-400" : "text-red-400"}>
                      {listing.producerValidation.status === "accepted" ? "✓" : "✗"}
                    </span>
                  </div>
                  {listing.producerValidation.reason && (
                    <p className="text-white/60 text-sm mt-2">{listing.producerValidation.reason}</p>
                  )}
                  <p className="text-white/40 text-xs mt-2">
                    {new Date(listing.producerValidation.date).toLocaleString()}
                  </p>
                </div>
              )}

              {listing.transporterValidation && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Transporter</p>
                      <p className="text-white/60 text-sm">
                        {listing.transporterValidation.status === "accepted" ? "Accepted" : "Rejected"}
                      </p>
                    </div>
                    <span className={listing.transporterValidation.status === "accepted" ? "text-emerald-400" : "text-red-400"}>
                      {listing.transporterValidation.status === "accepted" ? "✓" : "✗"}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    {new Date(listing.transporterValidation.date).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Blockchain Info */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-emerald-400 text-sm font-medium mb-2">On-Chain Information</p>
            <p className="text-white/60 text-sm">
              This listing is registered on the XRPL blockchain. Transaction details will be available after confirmation.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                onEdit(listing);
                onClose();
              }}
              disabled={listing.status === "completed" || listing.status === "cancelled" || listing.status === "deleted"}
              className="flex-1 py-3 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-emerald-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Listing
            </button>
            <button
              onClick={() => {
                onDelete(listing);
                onClose();
              }}
              disabled={listing.status === "completed" || listing.status === "cancelled" || listing.status === "deleted"}
              className="flex-1 py-3 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Listing
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

