"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const PRODUCT_TYPES = ["Apple", "Grape", "Orange", "Lemon", "Strawberry", "Tomato", "Potato", "Carrot"];

export default function SellerCreateListingForm({ onSubmit, isLoading }) {
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

  // Generate lot number
  const generateLotNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LOT-${year}-${random}`;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      const file = files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
          setErrors({ ...errors, certificate: "Please upload an image or PDF file" });
          return;
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ ...errors, certificate: "File size must be less than 5MB" });
          return;
        }
        setFormData({ ...formData, certificate: file });
        setErrors({ ...errors, certificate: "" });
        
        // Create preview for images
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
    } else if (name === "lotNumber" && !value) {
      // Auto-generate lot number if empty
      setFormData({ ...formData, [name]: generateLotNumber() });
    } else {
      setFormData({ ...formData, [name]: value });
      // Clear error when user types
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
    if (!formData.certificate) newErrors.certificate = "Certificate is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const isFormValid = formData.productType && formData.weight && formData.date && 
                     formData.lotNumber && formData.labo && formData.price && formData.certificate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
    >
      <h2 className="text-2xl font-bold text-white/50 mb-6">Create New Listing</h2>
      
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
              <option key={type} value={type} className="bg-[#0a0a0f]">{type}</option>
            ))}
          </select>
          {errors.productType && (
            <p className="text-red-400 text-sm mt-1">{errors.productType}</p>
          )}
        </div>

        {/* Weight */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Weight (kg) <span className="text-emerald-400">*</span>
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="e.g., 1000"
            min="0"
            step="0.01"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {errors.weight && (
            <p className="text-red-400 text-sm mt-1">{errors.weight}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Date <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            name="date"
            value={formData.date}
            onChange={handleChange}
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {errors.date && (
            <p className="text-red-400 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Lot Number */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Lot Number <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            name="lotNumber"
            value={formData.lotNumber}
            onChange={handleChange}
            placeholder="Auto-generated if empty"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {errors.lotNumber && (
            <p className="text-red-400 text-sm mt-1">{errors.lotNumber}</p>
          )}
        </div>

        {/* Laboratory */}
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

        {/* Price */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            <span>
              Price {formData.pricePerKg ? "per kg" : "total"} (XRP) <span className="text-emerald-400">*</span>
            </span>
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.000001"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <label className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={formData.pricePerKg}
                onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.checked })}
                className="w-4 h-4 text-emerald-500 bg-white/5 border-white/10 rounded focus:ring-emerald-500"
              />
              <span className="text-white/80 text-sm">Per kg</span>
            </label>
          </div>
          {errors.price && (
            <p className="text-red-400 text-sm mt-1">{errors.price}</p>
          )}
        </div>

        {/* Certificate Upload */}
        <div>
          <label className="block text-white/80 font-medium mb-2">
            Certificate <span className="text-emerald-400">*</span>
          </label>
          <div className="space-y-3">
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
            {certificatePreview && (
              <div className="mt-3">
                {certificatePreview === "pdf" ? (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-white/80">PDF certificate uploaded</p>
                  </div>
                ) : (
                  <img
                    src={certificatePreview}
                    alt="Certificate preview"
                    className="max-w-full h-48 object-cover rounded-lg border border-white/10"
                  />
                )}
              </div>
            )}
          </div>
          {errors.certificate && (
            <p className="text-red-400 text-sm mt-1">{errors.certificate}</p>
          )}
        </div>

        {/* Summary */}
        {isFormValid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
          >
            <h3 className="text-white font-semibold mb-2">Listing Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-white/60">Product:</span>
                <span className="text-white ml-2">{formData.productType}</span>
              </div>
              <div>
                <span className="text-white/60">Weight:</span>
                <span className="text-white ml-2">{formData.weight} kg</span>
              </div>
              <div>
                <span className="text-white/60">Lot:</span>
                <span className="text-white ml-2">{formData.lotNumber}</span>
              </div>
              <div>
                <span className="text-white/60">Price:</span>
                <span className="text-white ml-2">
                  {formData.price} XRP {formData.pricePerKg ? "/kg" : "total"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
            !isFormValid || isLoading
              ? "bg-white/5 text-white/30 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          {isLoading ? "Creating Listing..." : "Create Listing"}
        </button>
      </form>
    </motion.div>
  );
}
