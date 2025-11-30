"use client";

import { useState } from "react";
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

const generateLotNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `LOT-${year}-${random}`;
};

export default function SellerCreateListingForm({ onCreateListing, isLoading }) {
  const [formData, setFormData] = useState({
    productType: "",
    weight: "",
    date: "",
    lotNumber: generateLotNumber(),
    labo: "",
    certificate: null,
    price: "",
    pricePerKg: true
  });

  const [errors, setErrors] = useState({});
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [certificateError, setCertificateError] = useState("");

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
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate < today) return "Date cannot be in the past";
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setCertificateError("Please upload a JPEG, PNG, or PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCertificateError("File size must be less than 5MB");
      return;
    }

    setCertificateError("");
    setFormData(prev => ({ ...prev, certificate: file }));

    // Create preview for images
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
    
    // Validate all fields
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

    if (!formData.certificate) {
      newErrors.certificate = "Certificate is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call parent handler
    if (onCreateListing) {
      await onCreateListing(formData);
    }
  };

  const isFormValid = () => {
    return (
      formData.productType &&
      formData.weight &&
      formData.date &&
      formData.lotNumber &&
      formData.labo &&
      formData.certificate &&
      formData.price &&
      Object.keys(errors).length === 0
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Create New Listing</h2>
      
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

        {/* Weight and Date Row */}
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
              placeholder="e.g., 1000"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [color-scheme:dark]"
              style={{ colorScheme: 'dark' }}
            />
            {errors.date && (
              <p className="text-red-400 text-sm mt-1">{errors.date}</p>
            )}
          </div>
        </div>

        {/* Lot Number and Laboratory Row */}
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
              placeholder="LOT-2025-XXXX"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

        {/* Certificate Upload */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Certificate <span className="text-emerald-400">*</span>
          </label>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleFileChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {certificateError && (
              <p className="text-red-400 text-sm">{certificateError}</p>
            )}
            {errors.certificate && (
              <p className="text-red-400 text-sm">{errors.certificate}</p>
            )}
            {certificatePreview && (
              <div className="mt-3">
                <p className="text-white/60 text-sm mb-2">Preview:</p>
                <img
                  src={certificatePreview}
                  alt="Certificate preview"
                  className="max-w-full h-48 object-contain rounded-lg border border-white/10"
                />
              </div>
            )}
            {formData.certificate && !certificatePreview && (
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-emerald-400 text-sm">
                  ✓ File uploaded: {formData.certificate.name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Price <span className="text-emerald-400">*</span>
          </label>
          <div className="space-y-3">
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
              placeholder={formData.pricePerKg ? "e.g., 0.5" : "e.g., 500"}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {errors.price && (
              <p className="text-red-400 text-sm mt-1">{errors.price}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
            isFormValid() && !isLoading
              ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
              : "bg-white/10 text-white/50 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating listing...
            </span>
          ) : (
            "Publish Listing"
          )}
        </button>
      </form>
    </motion.div>
  );
}

