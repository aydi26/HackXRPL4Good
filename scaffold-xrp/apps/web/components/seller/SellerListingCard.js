"use client";

import { motion } from "framer-motion";

const STATUS_COLORS = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "producer-validated": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "producer-transporter-validated": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "transport-accepted": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "in-transit": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  deleted: "bg-gray-500/20 text-gray-400 border-gray-500/30"
};

const STATUS_LABELS = {
  pending: "Pending",
  "producer-validated": "Validated",
  "producer-transporter-validated": "Ready for Transport",
  "transport-accepted": "Transport Accepted",
  "in-transit": "In Transit",
  completed: "Completed",
  cancelled: "Cancelled",
  deleted: "Deleted"
};

export default function SellerListingCard({ listing, onView, onEdit, onDelete }) {
  const statusColor = STATUS_COLORS[listing.status] || STATUS_COLORS.pending;
  const statusLabel = STATUS_LABELS[listing.status] || listing.status;

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

      <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
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

      <div className="text-xs text-white/40 mb-3">
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
        {listing.status !== "deleted" && listing.status !== "completed" && (
          <>
            <button
              onClick={() => onEdit(listing)}
              className="py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg text-blue-400 text-sm font-medium transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(listing)}
              className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 text-sm font-medium transition-all"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
