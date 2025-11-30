"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProducerOfferCard from "./ProducerOfferCard";

const STATUS_FILTERS = [
  { value: "all", label: "All Offers" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" }
];

export default function ProducerOffersList({ offers, onView, onAccept, onReject }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Filter offers
  const filteredOffers = statusFilter === "all" 
    ? offers 
    : offers.filter(offer => offer.status === statusFilter);

  // Sort offers
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === "price-high") {
      return parseFloat(b.price) - parseFloat(a.price);
    } else if (sortBy === "price-low") {
      return parseFloat(a.price) - parseFloat(b.price);
    }
    return 0;
  });

  // Prioritize pending offers
  const prioritizedOffers = [
    ...sortedOffers.filter(o => o.status === "pending"),
    ...sortedOffers.filter(o => o.status !== "pending")
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {STATUS_FILTERS.map(filter => (
            <option key={filter.value} value={filter.value} className="bg-[#0a0a0f]">
              {filter.label}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="newest" className="bg-[#0a0a0f]">Newest First</option>
          <option value="oldest" className="bg-[#0a0a0f]">Oldest First</option>
          <option value="price-high" className="bg-[#0a0a0f]">Price: High to Low</option>
          <option value="price-low" className="bg-[#0a0a0f]">Price: Low to High</option>
        </select>
      </div>

      {/* Offers Count */}
      <div className="text-white/60 text-sm">
        {prioritizedOffers.length} offer{prioritizedOffers.length !== 1 ? "s" : ""} found
        {statusFilter === "pending" && prioritizedOffers.length > 0 && (
          <span className="text-emerald-400 ml-2">
            ({prioritizedOffers.filter(o => o.status === "pending").length} pending)
          </span>
        )}
      </div>

      {/* Offers Grid */}
      {prioritizedOffers.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/60">No offers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {prioritizedOffers.map(offer => (
              <ProducerOfferCard
                key={offer.id}
                offer={offer}
                onView={onView}
                onAccept={onAccept}
                onReject={onReject}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
