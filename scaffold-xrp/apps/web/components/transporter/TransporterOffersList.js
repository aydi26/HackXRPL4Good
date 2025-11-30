"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TransporterOfferCard from "./TransporterOfferCard";

const STATUS_FILTERS = [
  { value: "all", label: "All Missions" },
  { value: "ready-for-transport", label: "Ready for Transport" },
  { value: "transport-accepted", label: "Transport Accepted" },
  { value: "in-transit", label: "In Transit" },
  { value: "completed", label: "Completed" }
];

export default function TransporterOffersList({ offers, onView, onAccept, onReject }) {
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter offers
  const filteredOffers = statusFilter === "all" 
    ? offers 
    : offers.filter(offer => offer.status === statusFilter);

  // Prioritize ready-for-transport offers
  const prioritizedOffers = [
    ...filteredOffers.filter(o => o.status === "ready-for-transport"),
    ...filteredOffers.filter(o => o.status !== "ready-for-transport")
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
      </div>

      {/* Offers Count */}
      <div className="text-white/60 text-sm">
        {prioritizedOffers.length} mission{prioritizedOffers.length !== 1 ? "s" : ""} found
        {prioritizedOffers.filter(o => o.status === "ready-for-transport").length > 0 && (
          <span className="text-emerald-400 ml-2">
            ({prioritizedOffers.filter(o => o.status === "ready-for-transport").length} ready)
          </span>
        )}
      </div>

      {/* Offers Grid */}
      {prioritizedOffers.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/60">No transport missions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {prioritizedOffers.map(offer => (
              <TransporterOfferCard
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
