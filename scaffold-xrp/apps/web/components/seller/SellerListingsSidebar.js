"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SellerListingCard from "./SellerListingCard";

const STATUS_FILTERS = [
  { value: "all", label: "All Listings" },
  { value: "pending", label: "Pending" },
  { value: "producer-validated", label: "Validated" },
  { value: "producer-transporter-validated", label: "Ready for Transport" },
  { value: "transport-accepted", label: "Transport Accepted" },
  { value: "in-transit", label: "In Transit" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

export default function SellerListingsSidebar({ listings, onView, onEdit, onDelete }) {
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredListings = statusFilter === "all" 
    ? listings 
    : listings.filter(listing => listing.status === statusFilter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit max-h-[calc(100vh-10rem)] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-4">My Listings</h2>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {STATUS_FILTERS.map(filter => (
            <option key={filter.value} value={filter.value} className="bg-[#0a0a0f]">
              {filter.label}
            </option>
          ))}
        </select>

        <p className="text-white/60 text-sm mt-2">
          {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Listings */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <AnimatePresence>
          {filteredListings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No listings found</p>
            </div>
          ) : (
            filteredListings.map(listing => (
              <SellerListingCard
                key={listing.id}
                listing={listing}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
