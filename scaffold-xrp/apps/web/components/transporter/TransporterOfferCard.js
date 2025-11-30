"use client";

import { motion } from "framer-motion";

const STATUS_COLORS = {
  "ready-for-transport": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "transport-accepted": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "in-transit": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30"
};

const STATUS_LABELS = {
  "ready-for-transport": "Ready for Transport",
  "transport-accepted": "Transport Accepted",
  "in-transit": "In Transit",
  completed: "Completed",
  rejected: "Rejected"
};

export default function TransporterOfferCard({ offer, onView, onAccept, onReject }) {
  const statusColor = STATUS_COLORS[offer.status] || STATUS_COLORS["ready-for-transport"];
  const statusLabel = STATUS_LABELS[offer.status] || offer.status;

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
          <p className="text-white/50">Distance</p>
          <p className="text-white font-medium">{offer.distance || "N/A"} km</p>
        </div>
        {offer.transportPrice && (
          <div className="col-span-2">
            <p className="text-white/50">Transport Price</p>
            <p className="text-white font-medium">{offer.transportPrice} XRP</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs">
          {offer.sellerValidated && (
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">Seller ✓</span>
          )}
          {offer.producerValidated && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Producer ✓</span>
          )}
        </div>
      </div>

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
        {offer.status === "ready-for-transport" && (
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
