"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function LaboValidationModal({ product, action, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = useState("");
  const [validationNotes, setValidationNotes] = useState("");

  const isValidate = action === "validate";

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(product.id, action, isValidate ? validationNotes : reason);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a0f] border border-white/20 rounded-2xl p-6 md:p-8 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isValidate ? "text-cyan-400" : "text-red-400"}`}>
            {isValidate ? "Validate Product" : "Reject Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Summary */}
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
          <h3 className="text-white font-semibold mb-2">{product.productType}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-white/50">Lot</p>
              <p className="text-white">{product.lotNumber}</p>
            </div>
            <div>
              <p className="text-white/50">Weight</p>
              <p className="text-white">{product.weight} kg</p>
            </div>
            <div>
              <p className="text-white/50">Seller</p>
              <p className="text-white">{product.sellerName || "Unknown"}</p>
            </div>
            <div>
              <p className="text-white/50">Lieu</p>
              <p className="text-white">{product.labo || "N/A"}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isValidate ? (
            <>
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-cyan-400 text-sm">
                  By validating this product, you certify that it meets all quality and safety standards required by the laboratory.
                </p>
              </div>
              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Validation Notes (optional)
                </label>
                <textarea
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Add any notes about this validation..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">
                  Please provide a reason for rejecting this product. This will be recorded on the blockchain.
                </p>
              </div>
              <div>
                <label className="block text-white/80 font-medium mb-2">
                  Rejection Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  rows={3}
                  required={!isValidate}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || (!isValidate && !reason.trim())}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                isLoading || (!isValidate && !reason.trim())
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : isValidate
                  ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {isValidate ? "✓ Confirm Validation" : "✗ Confirm Rejection"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
