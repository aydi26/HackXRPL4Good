"use client";

import { motion } from "framer-motion";

export default function SellerListingDetails({ listing, onClose }) {
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
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${
              listing.status === "pending" 
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                : listing.status === "producer-validated"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
            }`}>
              {listing.status}
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
              <p className="text-white/50 text-sm mb-1">Laboratory</p>
              <p className="text-white font-semibold text-lg">{listing.labo || "N/A"}</p>
            </div>
          </div>

          {/* Certificate */}
          {listing.certificateUrl && (
            <div>
              <p className="text-white/50 text-sm mb-2">Certificate</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                {listing.certificateUrl.startsWith("data:image/") || 
                 (listing.certificateUrl.startsWith("blob:") && listing.certificateType !== "pdf") ? (
                  <img
                    src={listing.certificateUrl}
                    alt="Certificate"
                    className="w-full max-h-96 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                ) : listing.certificateUrl.startsWith("data:application/pdf") || 
                   listing.certificateUrl.startsWith("data:application/octet-stream") ||
                   listing.certificateType === "pdf" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                      <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-white font-medium">PDF Certificate</p>
                        <p className="text-white/60 text-sm">Click to view or download</p>
                      </div>
                    </div>
                    <a
                      href={listing.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                    >
                      View PDF Certificate
                    </a>
                  </div>
                ) : listing.certificateUrl.startsWith("blob:") ? (
                  <img
                    src={listing.certificateUrl}
                    alt="Certificate"
                    className="w-full max-h-96 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                ) : (
                  <div className="text-white/60 text-sm">Certificate available</div>
                )}
              </div>
            </div>
          )}

          {/* Validation History */}
          <div>
            <p className="text-white/50 text-sm mb-2">Validation History</p>
            <div className="space-y-3">
              {listing.producerValidation && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">Producer</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      listing.producerValidation.status === "accepted"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {listing.producerValidation.status}
                    </span>
                  </div>
                  {listing.producerValidation.reason && (
                    <p className="text-white/60 text-sm">{listing.producerValidation.reason}</p>
                  )}
                  <p className="text-white/40 text-xs mt-2">
                    {new Date(listing.producerValidation.date).toLocaleString()}
                  </p>
                </div>
              )}

              {listing.transporterValidation && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">Transporter</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      listing.transporterValidation.status === "accepted"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {listing.transporterValidation.status}
                    </span>
                  </div>
                  {listing.transporterValidation.reason && (
                    <p className="text-white/60 text-sm">{listing.transporterValidation.reason}</p>
                  )}
                  <p className="text-white/40 text-xs mt-2">
                    {new Date(listing.transporterValidation.date).toLocaleString()}
                  </p>
                </div>
              )}

              {!listing.producerValidation && !listing.transporterValidation && (
                <p className="text-white/60 text-sm">No validations yet</p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/50">Created</p>
                <p className="text-white">{new Date(listing.createdAt).toLocaleString()}</p>
              </div>
              {listing.updatedAt && (
                <div>
                  <p className="text-white/50">Last Updated</p>
                  <p className="text-white">{new Date(listing.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
