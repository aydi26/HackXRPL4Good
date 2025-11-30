"use client";

import { motion } from "framer-motion";

export default function ProducerOfferDetails({ offer, onClose, onAccept, onReject }) {
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
          <h2 className="text-2xl font-bold text-white">Offer Details</h2>
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
              offer.status === "pending" 
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                : offer.status === "accepted"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}>
              {offer.status === "pending" ? "Pending" : offer.status === "accepted" ? "Accepted" : "Rejected"}
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
              <p className="text-white/50 text-sm mb-1">Price</p>
              <p className="text-white font-semibold text-lg">
                {offer.price} XRP {offer.pricePerKg ? "/kg" : "total"}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Date</p>
              <p className="text-white font-semibold text-lg">
                {new Date(offer.date).toLocaleDateString()}
              </p>
            </div>
            {offer.labo && (
              <div>
                <p className="text-white/50 text-sm mb-1">Laboratory</p>
                <p className="text-white font-semibold text-lg">{offer.labo}</p>
              </div>
            )}
            <div>
              <p className="text-white/50 text-sm mb-1">Total Value</p>
              <p className="text-white font-semibold text-lg">
                {offer.pricePerKg 
                  ? (parseFloat(offer.price) * parseFloat(offer.weight)).toFixed(6)
                  : offer.price
                } XRP
              </p>
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

          {/* Certificate */}
          {offer.certificateUrl && (
            <div>
              <p className="text-white/50 text-sm mb-2">Certificate</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                {offer.certificateUrl.startsWith("data:image/") || 
                 (offer.certificateUrl.startsWith("blob:") && offer.certificateType !== "pdf") ? (
                  <img
                    src={offer.certificateUrl}
                    alt="Certificate"
                    className="w-full max-h-96 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = "block";
                      }
                    }}
                  />
                ) : offer.certificateUrl.startsWith("data:application/pdf") || 
                   offer.certificateUrl.startsWith("data:application/octet-stream") ||
                   offer.certificateType === "pdf" ? (
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
                      href={offer.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                    >
                      View PDF Certificate
                    </a>
                  </div>
                ) : offer.certificateUrl.startsWith("blob:") ? (
                  <img
                    src={offer.certificateUrl}
                    alt="Certificate"
                    className="w-full max-h-96 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = "block";
                      }
                    }}
                  />
                ) : (
                  <div className="text-white/60 text-sm">Certificate available</div>
                )}
              </div>
            </div>
          )}

          {/* Validation History */}
          {offer.producerValidation && (
            <div>
              <p className="text-white/50 text-sm mb-2">Your Validation</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${
                    offer.producerValidation.status === "accepted"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {offer.producerValidation.status}
                  </span>
                </div>
                {offer.producerValidation.reason && (
                  <p className="text-white/60 text-sm">{offer.producerValidation.reason}</p>
                )}
                <p className="text-white/40 text-xs mt-2">
                  {new Date(offer.producerValidation.date).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          {offer.status === "pending" && (
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
                Reject Offer
              </button>
              <button
                onClick={() => onAccept(offer)}
                className="flex-1 py-3 px-6 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-all"
              >
                Accept Offer
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
