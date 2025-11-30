"use client";

import { motion } from "framer-motion";

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  accepted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30"
};

export default function ProducerOfferCard({ offer, onView, onAccept, onReject }) {
  const statusColor = STATUS_COLORS[offer.status] || STATUS_COLORS.pending;
  const statusLabel = offer.status === "pending" ? "Pending" : offer.status === "accepted" ? "Accepted" : "Rejected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-emerald-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-1">{offer.productType}</h3>
          <p className="text-white/60 text-sm">Lot: {offer.lotNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-white/50">Weight</p>
          <p className="text-white font-medium">{offer.weight} kg</p>
        </div>
        <div>
          <p className="text-white/50">Price</p>
          <p className="text-white font-medium">
            {offer.price} XRP {offer.pricePerKg ? "/kg" : "total"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-white/50 text-sm mb-1">Seller</p>
        <p className="text-white font-medium text-sm">
          {offer.sellerAddress ? `${offer.sellerAddress.slice(0, 6)}...${offer.sellerAddress.slice(-4)}` : "Unknown"}
        </p>
      </div>

      {offer.certificateUrl && (
        <div className="mb-4">
          <p className="text-white/50 text-sm mb-2">Certificate</p>
          <div className="bg-white/5 rounded-lg p-2">
            {offer.certificateUrl.startsWith("data:image") ? (
              <img
                src={offer.certificateUrl}
                alt="Certificate"
                className="w-full h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="text-white/60 text-sm">Certificate available</div>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-white/40 mb-4">
        <p>Created: {new Date(offer.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(offer)}
          className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-lg text-white text-sm font-medium transition-all"
        >
          View Details
        </button>
        {offer.status === "pending" && (
          <>
            <button
              onClick={() => onAccept(offer)}
              className="py-2 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-emerald-400 text-sm font-medium transition-all"
            >
              Accept
            </button>
            <button
              onClick={() => onReject(offer)}
              className="py-2 px-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 text-sm font-medium transition-all"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

