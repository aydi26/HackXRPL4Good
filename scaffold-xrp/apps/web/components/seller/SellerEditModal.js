"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PRODUCT_TYPES = [
  "Apple",
  "Grape",
  "Orange",
  "Banana",
  "Strawberry",
  "Tomato",
  "Potato",
  "Carrot",
  "Lettuce",
  "Other"
];

export default function SellerEditModal({ listing, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    productType: "",
    weight: "",
    date: "",
    lotNumber: "",
    labo: "",
    certificate: null,
    price: "",
    pricePerKg: true
  });

  const [errors, setErrors] = useState({});
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [certificateError, setCertificateError] = useState("");

  useEffect(() => {
    if (listing) {
      setFormData({
        productType: listing.productType || "",
        weight: listing.weight || "",
        date: listing.date ? new Date(listing.date).toISOString().split("T")[0] : "",
        lotNumber: listing.lotNumber || "",
        labo: listing.labo || "",
        certificate: null,
        price: listing.price || "",
        pricePerKg: listing.pricePerKg !== undefined ? listing.pricePerKg : true
      });
      if (listing.certificateUrl) {
        setCertificatePreview(listing.certificateUrl);
      }
    }
  }, [listing]);

  const validateField = (name, value) => {
    switch (name) {
      case "productType":
        return value ? "" : "Product type is required";
      case "weight":
        if (!value) return "Weight is required";
        if (isNaN(value) || parseFloat(value) <= 0) return "Weight must be a positive number";
        return "";
      case "date":
        if (!value) return "Date is required";
        return "";
      case "lotNumber":
        return value ? "" : "Lot number is required";
      case "labo":
        return value ? "" : "Laboratory is required";
      case "price":
        if (!value) return "Price is required";
        if (isNaN(value) || parseFloat(value) <= 0) return "Price must be a positive number";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setCertificateError("Please upload a JPEG, PNG, or PDF file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCertificateError("File size must be less than 5MB");
      return;
    }

    setCertificateError("");
    setFormData(prev => ({ ...prev, certificate: file }));

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificatePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setCertificatePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== "certificate" && key !== "pricePerKg") {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    
    // Validate labo separately
    if (!formData.labo) {
      newErrors.labo = "Laboratory is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (onSave) {
      await onSave(listing.id, formData);
    }
  };

  const isFormValid = () => {
    return (
      formData.productType &&
      formData.weight &&
      formData.date &&
      formData.lotNumber &&
      formData.labo &&
      formData.price &&
      Object.keys(errors).length === 0
    );
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Type */}
          <div>
            <label className="block text-white/80 font-medium mb-2">
              Product Type <span className="text-emerald-400">*</span>
            </label>
            <select
              name="productType"
              value={formData.productType}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select product type</option>
              {PRODUCT_TYPES.map(type => (
                <option key={type} value={type} className="bg-[#0a0a0f]">
                  {type}
                </option>
              ))}
            </select>
            {errors.productType && (
              <p className="text-red-400 text-sm mt-1">{errors.productType}</p>
            )}
          </div>

          {/* Weight and Date */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Weight (kg) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {errors.weight && (
                <p className="text-red-400 text-sm mt-1">{errors.weight}</p>
              )}
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2">
                Date <span className="text-emerald-400">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
                style={{ colorScheme: 'dark' }}
              />
              {errors.date && (
                <p className="text-red-400 text-sm mt-1">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Lot Number and Laboratory */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 font-medium mb-2">
                Lot Number <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                name="lotNumber"
                value={formData.lotNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {errors.lotNumber && (
                <p className="text-red-400 text-sm mt-1">{errors.lotNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2">
                Laboratory <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                name="labo"
                value={formData.labo}
                onChange={handleChange}
                placeholder="Enter laboratory name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {errors.labo && (
                <p className="text-red-400 text-sm mt-1">{errors.labo}</p>
              )}
            </div>
          </div>

          {/* Certificate */}
          <div>
            <label className="block text-white/80 font-medium mb-2">
              Certificate {certificatePreview ? "(Optional to change)" : ""}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {certificateError && (
              <p className="text-red-400 text-sm mt-1">{certificateError}</p>
            )}
            {certificatePreview && (
              <div className="mt-3">
                <p className="text-white/60 text-sm mb-2">Current/New Preview:</p>
                <img
                  src={certificatePreview}
                  alt="Certificate preview"
                  className="max-w-full h-48 object-contain rounded-lg border border-white/10"
                />
              </div>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-white/80 font-medium mb-2">
              Price <span className="text-emerald-400">*</span>
            </label>
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center gap-2 text-white/70">
                <input
                  type="radio"
                  name="pricePerKg"
                  checked={formData.pricePerKg}
                  onChange={() => setFormData(prev => ({ ...prev, pricePerKg: true }))}
                  className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Price per kg (XRP)</span>
              </label>
              <label className="flex items-center gap-2 text-white/70">
                <input
                  type="radio"
                  name="pricePerKg"
                  checked={!formData.pricePerKg}
                  onChange={() => setFormData(prev => ({ ...prev, pricePerKg: false }))}
                  className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Total price (XRP)</span>
              </label>
            </div>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.000001"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {errors.price && (
              <p className="text-red-400 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                isFormValid() && !isLoading
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
                  : "bg-white/10 text-white/50 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

