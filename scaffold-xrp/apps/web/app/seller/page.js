"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GridScan from "../../components/landing/GridScan";
import CardNav from "../../components/landing/CardNav";
import Footer from "../../components/landing/Footer";
import WalletButton from "../../components/landing/WalletButton";
import WalletConnectionScreen from "../../components/WalletConnectionScreen";
import SellerCreateListingForm from "../../components/seller/SellerCreateListingForm";
import SellerListingsSidebar from "../../components/seller/SellerListingsSidebar";
import SellerListingDetails from "../../components/seller/SellerListingDetails";
import SellerEditModal from "../../components/seller/SellerEditModal";
import DeleteConfirmationModal from "../../components/seller/DeleteConfirmationModal";
import { useWallet } from "../../components/providers/WalletProvider";

// Bypass wallet check - set to false to require wallet connection
const BYPASS_WALLET_CHECK = false;

export default function SellerPage() {
  const { isConnected, accountInfo, isSessionRestored } = useWallet();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(true);

  // Check if user can access (bypass or connected)
  // Attendre que la session soit restaurée avant de vérifier l'accès
  const canAccess = BYPASS_WALLET_CHECK || (isSessionRestored && (isConnected || accountInfo));

  const navItems = [
    {
      label: "Seller",
      description: "Certify your products",
      bgColor: "rgba(6, 78, 59, 0.6)",
      textColor: "#ecfdf5",
      href: "/seller"
    },
    {
      label: "Producer", 
      description: "Validate offers",
      bgColor: "rgba(6, 95, 70, 0.6)",
      textColor: "#ecfdf5",
      href: "/producer"
    },
    {
      label: "Transporter",
      description: "Deliver with traceability",
      bgColor: "rgba(4, 120, 87, 0.6)",
      textColor: "#ecfdf5",
      href: "/transporter"
    }
  ];

  const logo = (
    <a href="/" className="text-white font-semibold text-lg tracking-tight hover:text-emerald-300 transition-colors">
      CertiChain
    </a>
  );

  // Load listings from localStorage or API
  useEffect(() => {
    const savedListings = localStorage.getItem("sellerListings");
    if (savedListings) {
      try {
        setListings(JSON.parse(savedListings));
      } catch (e) {
        console.error("Error loading listings:", e);
      }
    }
  }, []);

  // Save listings to localStorage
  const saveListings = (newListings) => {
    setListings(newListings);
    localStorage.setItem("sellerListings", JSON.stringify(newListings));
  };

  const handleCreateListing = async (formData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create listing object
      const newListing = {
        id: `listing-${Date.now()}`,
        productType: formData.productType,
        weight: formData.weight,
        date: formData.date,
        lotNumber: formData.lotNumber,
        labo: formData.labo,
        price: formData.price,
        pricePerKg: formData.pricePerKg,
        certificate: formData.certificate,
        certificateUrl: formData.certificate ? URL.createObjectURL(formData.certificate) : null,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        producerValidation: null,
        transporterValidation: null
      };

      const updatedListings = [newListing, ...listings];
      saveListings(updatedListings);
      
      // Reset form
      setShowCreateForm(false);
      setTimeout(() => setShowCreateForm(true), 100);

      // Show success message (you can add a toast component here)
      alert("Listing created successfully!");
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to create listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditListing = (listing) => {
    setSelectedListing(listing);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (listingId, formData) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedListings = listings.map(listing => {
        if (listing.id === listingId) {
          return {
            ...listing,
            ...formData,
            certificateUrl: formData.certificate 
              ? URL.createObjectURL(formData.certificate) 
              : listing.certificateUrl,
            updatedAt: new Date().toISOString()
          };
        }
        return listing;
      });

      saveListings(updatedListings);
      setShowEditModal(false);
      setSelectedListing(null);
      alert("Listing updated successfully!");
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Failed to update listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = (listing) => {
    setListingToDelete(listing);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (listingId) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedListings = listings.map(listing => {
        if (listing.id === listingId) {
          return {
            ...listing,
            status: "deleted",
            updatedAt: new Date().toISOString()
          };
        }
        return listing;
      });

      saveListings(updatedListings);
      setShowDeleteModal(false);
      setListingToDelete(null);
      alert("Listing deleted successfully!");
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    setShowDetails(true);
  };

  if (!canAccess) {
    const SellerIcon = () => (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );

    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
        <div className="fixed inset-0 z-0">
          <GridScan
            sensitivity={0.55}
            lineThickness={1}
            linesColor="#10b981"
            gridScale={0.1}
            lineStyle="solid"
            lineJitter={0.1}
            enablePost={true}
            bloomIntensity={1.2}
            bloomThreshold={0.3}
            bloomSmoothing={0.9}
            chromaticAberration={0.002}
            noiseIntensity={0.015}
            scanColor="#34d399"
            scanOpacity={0.6}
            scanDirection="pingpong"
            scanSoftness={2.5}
            scanGlow={1.2}
            scanPhaseTaper={0.9}
            scanDuration={6.0}
            scanDelay={4.0}
          />
        </div>

        <CardNav 
          items={navItems}
          logo={logo}
          baseColor="rgba(0, 0, 0, 0.6)"
          menuColor="#fff"
          className="backdrop-blur-md"
        />

        <div className="fixed top-[2em] right-[5%] z-[100]">
          <WalletButton />
        </div>

        <div className="relative z-10">
          <WalletConnectionScreen
            title="Seller Dashboard"
            subtitle="Agricultural Producer"
            description="Create and manage your product listings on the XRPL blockchain. Certify your agricultural products with traceable NFTs and build trust with your customers."
            features={[
              "Create product listings with certificates",
              "Manage all your listings in one place",
              "Track validation status from producers",
              "Update or delete listings as needed",
              "View complete transaction history"
            ]}
            icon={SellerIcon}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* GridScan Background */}
      <div className="fixed inset-0 z-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#10b981"
          gridScale={0.1}
          lineStyle="solid"
          lineJitter={0.1}
          enablePost={true}
          bloomIntensity={1.2}
          bloomThreshold={0.3}
          bloomSmoothing={0.9}
          chromaticAberration={0.002}
          noiseIntensity={0.015}
          scanColor="#34d399"
          scanOpacity={0.6}
          scanDirection="pingpong"
          scanSoftness={2.5}
          scanGlow={1.2}
          scanPhaseTaper={0.9}
          scanDuration={6.0}
          scanDelay={4.0}
        />
      </div>

      {/* Navigation */}
      <CardNav 
        items={navItems}
        logo={logo}
        baseColor="rgba(0, 0, 0, 0.6)"
        menuColor="#fff"
        className="backdrop-blur-md"
      />

      {/* Wallet Button */}
      <div className="fixed top-[2em] right-[5%] z-[100]">
        <WalletButton />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Seller Dashboard
            </h1>
            <p className="text-emerald-400 text-lg font-medium">Create and manage your product listings</p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Create Form - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              {showCreateForm && (
                <SellerCreateListingForm
                  onCreateListing={handleCreateListing}
                  isLoading={isLoading}
                />
              )}
            </div>

            {/* Sidebar - Takes 1 column */}
            <div className="lg:col-span-1">
              <SellerListingsSidebar
                listings={listings}
                onView={handleViewDetails}
                onEdit={handleEditListing}
                onDelete={handleDeleteListing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetails && selectedListing && (
          <SellerListingDetails
            listing={selectedListing}
            onClose={() => {
              setShowDetails(false);
              setSelectedListing(null);
            }}
            onEdit={handleEditListing}
            onDelete={handleDeleteListing}
          />
        )}

        {showEditModal && selectedListing && (
          <SellerEditModal
            listing={selectedListing}
            onClose={() => {
              setShowEditModal(false);
              setSelectedListing(null);
            }}
            onSave={handleSaveEdit}
            isLoading={isLoading}
          />
        )}

        {showDeleteModal && listingToDelete && (
          <DeleteConfirmationModal
            listing={listingToDelete}
            onClose={() => {
              setShowDeleteModal(false);
              setListingToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
