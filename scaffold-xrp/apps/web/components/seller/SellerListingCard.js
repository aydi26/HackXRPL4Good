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

export default function SellerListingCard({ listing, onView, onEdit, onDelete }) {
  const statusColor = STATUS_COLORS[listing.status] || STATUS_COLORS.pending;
  const statusLabel = STATUS_LABELS[listing.status] || "Unknown";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-emerald-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-1">{listing.productType}</h3>
          <p className="text-white/60 text-sm">Lot: {listing.lotNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-white/50">Weight</p>
          <p className="text-white font-medium">{listing.weight} kg</p>
        </div>
        <div>
          <p className="text-white/50">Price</p>
          <p className="text-white font-medium">
            {listing.price} XRP {listing.pricePerKg ? "/kg" : "total"}
          </p>
        </div>
      </div>

      <div className="text-xs text-white/40 mb-4">
        <p>Created: {new Date(listing.createdAt).toLocaleDateString()}</p>
        {listing.updatedAt && listing.updatedAt !== listing.createdAt && (
          <p>Updated: {new Date(listing.updatedAt).toLocaleDateString()}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(listing)}
          className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-lg text-white text-sm font-medium transition-all"
        >
          View Details
        </button>
        <button
          onClick={() => onEdit(listing)}
          disabled={listing.status === "completed" || listing.status === "cancelled" || listing.status === "deleted"}
          className="py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-emerald-400 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(listing)}
          disabled={listing.status === "completed" || listing.status === "cancelled" || listing.status === "deleted"}
          className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}

