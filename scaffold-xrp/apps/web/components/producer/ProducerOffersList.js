"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProducerOfferCard from "./ProducerOfferCard";

const STATUS_FILTERS = [
  { value: "all", label: "All Offers" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" }
];

export default function ProducerOffersList({ offers, onView, onAccept, onReject }) {
  const [statusFilter, setStatusFilter] = useState("all");

  // Sort offers: pending first, then by date
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const filteredOffers = statusFilter === "all"
    ? sortedOffers
    : sortedOffers.filter(offer => offer.status === statusFilter);

  return (
    <div className="space-y-6">
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

      {/* Offers Grid */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/50 text-sm">No offers found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map(offer => (
            <ProducerOfferCard
              key={offer.id}
              offer={offer}
              onView={onView}
              onAccept={onAccept}
              onReject={onReject}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="text-white/60 text-sm">
          Total: <span className="text-white font-medium">{filteredOffers.length}</span> offer(s)
          {statusFilter === "all" && (
            <>
              {" "}• <span className="text-yellow-400">{offers.filter(o => o.status === "pending").length}</span> pending
            </>
          )}
        </p>
      </div>
    </div>
  );
}

