"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SellerListingCard from "./SellerListingCard";

const STATUS_FILTERS = [
  { value: "all", label: "All Listings" },
  { value: "pending", label: "Pending Validation" },
  { value: "producer-validated", label: "Producer Validated" },
  { value: "producer-transporter-validated", label: "Ready for Transport" },
  { value: "in-transit", label: "In Transit" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

export default function SellerListingsSidebar({ listings, onView, onEdit, onDelete }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(true);

  const filteredListings = statusFilter === "all"
    ? listings
    : listings.filter(listing => listing.status === statusFilter);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit max-h-[calc(100vh-200px)] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">My Listings</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4"
          >
            {/* Filter */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Filter by Status</label>
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
            </div>

            {/* Listings */}
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
              {filteredListings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/50 text-sm">No listings found</p>
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
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-white/60 text-sm">
                Total: <span className="text-white font-medium">{filteredListings.length}</span> listing(s)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

