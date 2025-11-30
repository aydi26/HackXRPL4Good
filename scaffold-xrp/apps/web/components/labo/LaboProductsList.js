"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LaboProductCard from "./LaboProductCard";

const STATUS_FILTERS = [
  { value: "all", label: "All Products" },
  { value: "pending", label: "Pending Validation" },
  { value: "labo-validated", label: "Validated" },
  { value: "rejected", label: "Rejected" }
];

export default function LaboProductsList({ products, onView, onValidate, onReject, onDecrypt }) {
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter products
  const filteredProducts = statusFilter === "all" 
    ? products 
    : products.filter(product => product.laboStatus === statusFilter);

  // Prioritize pending products
  const prioritizedProducts = [
    ...filteredProducts.filter(p => p.laboStatus === "pending"),
    ...filteredProducts.filter(p => p.laboStatus !== "pending")
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          {STATUS_FILTERS.map(filter => (
            <option key={filter.value} value={filter.value} className="bg-[#0a0a0f]">
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {/* Products Count */}
      <div className="text-white/60 text-sm">
        {prioritizedProducts.length} product{prioritizedProducts.length !== 1 ? "s" : ""} found
        {prioritizedProducts.filter(p => p.laboStatus === "pending").length > 0 && (
          <span className="text-cyan-400 ml-2">
            ({prioritizedProducts.filter(p => p.laboStatus === "pending").length} pending validation)
          </span>
        )}
      </div>

      {/* Products Grid */}
      {prioritizedProducts.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-white/60">No products found for validation</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {prioritizedProducts.map(product => (
              <LaboProductCard
                key={product.id}
                product={product}
                onView={onView}
                onValidate={onValidate}
                onReject={onReject}
                onDecrypt={onDecrypt}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
