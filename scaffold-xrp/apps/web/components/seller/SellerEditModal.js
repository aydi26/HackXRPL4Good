"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PRODUCT_TYPES = ["Apple", "Grape", "Orange", "Lemon", "Strawberry", "Tomato", "Potato", "Carrot"];

export default function SellerEditModal({ listing, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    productType: "",
    weight: "",
    date: "",
    lotNumber: "",
    labo: "",
    price: "",
    pricePerKg: true,
    certificate: null
  });

  const [errors, setErrors] = useState({});
  const [certificatePreview, setCertificatePreview] = useState(null);

  useEffect(() => {
    if (listing) {
      setFormData({
        productType: listing.productType || "",
        weight: listing.weight || "",
        date: listing.date || "",
        lotNumber: listing.lotNumber || "",
        labo: listing.labo || "",
        price: listing.price || "",
        pricePerKg: listing.pricePerKg !== undefined ? listing.pricePerKg : true,
        certificate: null
      });
      setCertificatePreview(listing.certificateUrl || null);
    }
  }, [listing]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      const file = files[0];
      if (file) {
        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
          setErrors({ ...errors, certificate: "Please upload an image or PDF file" });
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ ...errors, certificate: "File size must be less than 5MB" });
          return;
        }
        setFormData({ ...formData, certificate: file });
        setErrors({ ...errors, certificate: "" });
        
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setCertificatePreview(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          setCertificatePreview("pdf");
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" });
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.productType) newErrors.productType = "Product type is required";
    if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = "Weight must be greater than 0";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.lotNumber) newErrors.lotNumber = "Lot number is required";
    if (!formData.labo) newErrors.labo = "Laboratory is required";
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Price must be greater than 0";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(listing.id, formData);
    }
  };

  if (!listing) return null;

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
        className="bg-[#0a0a0f] border border-white/20 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Listing</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Type */}
          <div>
            <label className="block text-white/80 font-medium mb-2">Product Type *</label>
            <select
              name="productType"
              value={formData.productType}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select product type</option>
              {PRODUCT_TYPES.map(type => (
                <option key={type} value={type} className="bg-[#0a0a0f]">{type}</option>
              ))}
            </select>
            {errors.productType && <p className="text-red-400 text-sm mt-1">{errors.productType}</p>}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-white/80 font-medium mb-2">Weight (kg) *</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {errors.weight && <p className="text-red-400 text-sm mt-1">{errors.weight}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-white/80 font-medium mb-2">Date *</label>
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              pattern="\d{4}-\d{2}-\d{2}"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Laboratory */}
          <div>
            <label className="block text-white/80 font-medium mb-2">Laboratory *</label>
            <input
              type="text"
              name="labo"
              value={formData.labo}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
            />
            {errors.labo && <p className="text-red-400 text-sm mt-1">{errors.labo}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-white/80 font-medium mb-2">
              Price {formData.pricePerKg ? "per kg" : "total"} (XRP) *
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.000001"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <label className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.checked })}
                  className="w-4 h-4 text-emerald-500"
                />
                <span className="text-white/80 text-sm">Per kg</span>
              </label>
            </div>
            {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
          </div>

          {/* Certificate */}
          <div>
            <label className="block text-white/80 font-medium mb-2">Certificate (optional)</label>
            <label className="block">
              <input
                type="file"
                name="certificate"
                accept="image/*,application/pdf"
                onChange={handleChange}
                className="hidden"
              />
              <div className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white cursor-pointer hover:bg-white/10 transition-colors focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
                <span className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold hover:bg-emerald-500/30 transition-colors">
                  Choose a file
                </span>
                {formData.certificate && (
                  <span className="ml-4 text-white/80 text-sm">
                    {formData.certificate.name}
                  </span>
                )}
                {!formData.certificate && (
                  <span className="ml-4 text-white/40 text-sm">
                    No file chosen
                  </span>
                )}
              </div>
            </label>
            {certificatePreview && certificatePreview !== "pdf" && (
              <img
                src={certificatePreview}
                alt="Preview"
                className="mt-3 max-w-full h-32 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
