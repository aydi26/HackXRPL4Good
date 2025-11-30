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
              <p className="text-white/50 text-sm mb-2">Seller Certificate</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                {offer.certificateUrl.startsWith("data:image") ? (
                  <img
                    src={offer.certificateUrl}
                    alt="Certificate"
                    className="max-w-full h-64 object-contain rounded-lg"
                  />
                ) : (
                  <a
                    href={offer.certificateUrl}
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

          {/* Traceability Info */}
          {offer.traceabilityInfo && (
            <div>
              <p className="text-white/50 text-sm mb-2">Traceability Information</p>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 space-y-2">
                {offer.traceabilityInfo.nftId && (
                  <div>
                    <p className="text-white/60 text-sm">NFT ID:</p>
                    <p className="text-white font-medium text-sm">{offer.traceabilityInfo.nftId}</p>
                  </div>
                )}
                {offer.traceabilityInfo.geographicZone && (
                  <div>
                    <p className="text-white/60 text-sm">Geographic Zone:</p>
                    <p className="text-white font-medium text-sm">{offer.traceabilityInfo.geographicZone}</p>
                  </div>
                )}
                {offer.traceabilityInfo.collectionDate && (
                  <div>
                    <p className="text-white/60 text-sm">Collection Date:</p>
                    <p className="text-white font-medium text-sm">
                      {new Date(offer.traceabilityInfo.collectionDate).toLocaleDateString()}
                    </p>
                  </div>
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
                  {new Date(offer.createdAt).toLocaleString()}
                </p>
              </div>
              
              {offer.producerValidation && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Producer</p>
                      <p className="text-white/60 text-sm">
                        {offer.producerValidation.status === "accepted" ? "Accepted" : "Rejected"}
                      </p>
                    </div>
                    <span className={offer.producerValidation.status === "accepted" ? "text-emerald-400" : "text-red-400"}>
                      {offer.producerValidation.status === "accepted" ? "✓" : "✗"}
                    </span>
                  </div>
                  {offer.producerValidation.reason && (
                    <p className="text-white/60 text-sm mt-2">{offer.producerValidation.reason}</p>
                  )}
                  <p className="text-white/40 text-xs mt-2">
                    {new Date(offer.producerValidation.date).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {offer.status === "pending" && (
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  onAccept(offer);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-emerald-400 font-medium transition-all"
              >
                Accept Offer
              </button>
              <button
                onClick={() => {
                  onReject(offer);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 font-medium transition-all"
              >
                Reject Offer
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

