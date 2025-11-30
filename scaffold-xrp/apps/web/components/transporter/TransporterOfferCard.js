"use client";

import { motion } from "framer-motion";

const STATUS_COLORS = {
  "ready-for-transport": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "transport-accepted": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "in-transit": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "completed": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "rejected": "bg-red-500/20 text-red-400 border-red-500/30"
};

export default function TransporterOfferCard({ offer, onView, onAccept, onReject }) {
  const statusColor = STATUS_COLORS[offer.status] || STATUS_COLORS["ready-for-transport"];
  const statusLabel = offer.status === "ready-for-transport" 
    ? "Ready for Transport" 
    : offer.status === "transport-accepted"
    ? "Transport Accepted"
    : offer.status === "in-transit"
    ? "In Transit"
    : offer.status === "completed"
    ? "Completed"
    : "Rejected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-purple-500/30 transition-all"
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
          <p className="text-white/50">Distance</p>
          <p className="text-white font-medium">{offer.distance || "N/A"} km</p>
        </div>
      </div>

      {offer.transportPrice && (
        <div className="mb-4">
          <p className="text-white/50 text-sm mb-1">Transport Price</p>
          <p className="text-white font-medium">{offer.transportPrice} XRP</p>
        </div>
      )}

      <div className="mb-4">
        <p className="text-white/50 text-sm mb-1">Validation Status</p>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            offer.producerValidated ? "bg-emerald-400" : "bg-gray-400"
          }`} />
          <span className="text-white/60 text-xs">
            Producer: {offer.producerValidated ? "Validated" : "Pending"}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${
            offer.sellerValidated ? "bg-emerald-400" : "bg-gray-400"
          }`} />
          <span className="text-white/60 text-xs">
            Seller: {offer.sellerValidated ? "Validated" : "Pending"}
          </span>
        </div>
      </div>

      <div className="text-xs text-white/40 mb-4">
        <p>Created: {new Date(offer.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(offer)}
          className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-lg text-white text-sm font-medium transition-all"
        >
          View Details
        </button>
        {offer.status === "ready-for-transport" && (
          <>
            <button
              onClick={() => onAccept(offer)}
              className="py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-purple-400 text-sm font-medium transition-all"
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

