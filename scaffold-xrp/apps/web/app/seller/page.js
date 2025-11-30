"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GridScan from "../../components/landing/GridScan";
import CardNav from "../../components/landing/CardNav";
import Footer from "../../components/landing/Footer";
import WalletButton from "../../components/landing/WalletButton";
import WalletConnectionScreen from "../../components/WalletConnectionScreen";
import LoadingScreen from "../../components/LoadingScreen";
import AccessDeniedScreen from "../../components/AccessDeniedScreen";
import SellerCreateListingForm from "../../components/seller/SellerCreateListingForm";
import SellerListingsSidebar from "../../components/seller/SellerListingsSidebar";
import SellerListingDetails from "../../components/seller/SellerListingDetails";
import SellerEditModal from "../../components/seller/SellerEditModal";
import DeleteConfirmationModal from "../../components/seller/DeleteConfirmationModal";
import { useWallet } from "../../components/providers/WalletProvider";
import { useCredentialContext } from "../../components/providers/CredentialProvider";

// Required credential for this page
const REQUIRED_CREDENTIAL = "SELLER";

export default function SellerPage() {
  const { isConnected, accountInfo, isReady, isAutoConnecting } = useWallet();
  const { hasAccess, isLoading: isCredentialLoading, isInitialized: isCredentialInitialized } = useCredentialContext();
  
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(true);

  // Check credential access
  const hasSellerCredential = hasAccess("seller");

  const navItems = [
    {
      label: "Seller",
      description: "Certify your products",
      bgColor: "rgba(6, 78, 59, 0.6)",
      textColor: "#ecfdf5",
      href: "/seller"
    },
    {
      label: "Buyer", 
      description: "Buy certified products",
      bgColor: "rgba(6, 95, 70, 0.6)",
      textColor: "#ecfdf5",
      href: "/buyer"
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

  // Load listings from marketplace (shared storage) and filter by current seller
  useEffect(() => {
    // Load all marketplace listings
    const marketplaceListings = localStorage.getItem("marketplaceListings");
    if (marketplaceListings) {
      try {
        const allListings = JSON.parse(marketplaceListings);
        // Filter to show only current seller's listings
        const sellerAddress = accountInfo?.address || "current-seller";
        const sellerListings = allListings.filter(
          listing => listing.sellerAddress === sellerAddress
        );
        setListings(sellerListings);
      } catch (e) {
        console.error("Error loading listings:", e);
      }
    } else {
      // Also check old sellerListings for migration
      const savedListings = localStorage.getItem("sellerListings");
      if (savedListings) {
        try {
          const oldListings = JSON.parse(savedListings);
          // Migrate to marketplace format
          const marketplaceListings = oldListings.map(listing => ({
            ...listing,
            sellerAddress: accountInfo?.address || "current-seller",
            sellerName: accountInfo?.walletName || "Seller"
          }));
          localStorage.setItem("marketplaceListings", JSON.stringify(marketplaceListings));
          setListings(oldListings);
        } catch (e) {
          console.error("Error migrating listings:", e);
        }
      }
    }
  }, [accountInfo]);

  // Save listings to marketplace (shared storage)
  const saveListings = (newListings) => {
    // Clean listings before saving (remove File objects that can't be serialized)
    const cleanedListings = newListings.map(listing => {
      const cleaned = { ...listing };
      delete cleaned.certificate; // Remove File object if present
      return cleaned;
    });
    
    setListings(cleanedListings);
    
    // Get all marketplace listings
    const marketplaceListings = localStorage.getItem("marketplaceListings");
    let allListings = [];
    
    if (marketplaceListings) {
      try {
        allListings = JSON.parse(marketplaceListings);
        // Clean existing listings too
        allListings = allListings.map(listing => {
          const cleaned = { ...listing };
          delete cleaned.certificate;
          return cleaned;
        });
      } catch (e) {
        console.error("Error parsing marketplace listings:", e);
      }
    }
    
    // Get current seller address
    const sellerAddress = accountInfo?.address || "current-seller";
    
    // Remove old listings from this seller
    allListings = allListings.filter(
      listing => listing.sellerAddress !== sellerAddress
    );
    
    // Add updated listings from this seller
    allListings = [...allListings, ...cleanedListings];
    
    // Save to marketplace
    localStorage.setItem("marketplaceListings", JSON.stringify(allListings));
    
    // Also keep sellerListings for backward compatibility
    localStorage.setItem("sellerListings", JSON.stringify(cleanedListings));
  };

  const handleCreateListing = async (formData) => {
    setIsLoading(true);
    
    try {
      // TODO: In production, this should:
      // 1. Upload certificate image to IPFS via backend API
      // 2. Create NFT metadata and upload to IPFS
      // 3. Mint NFT on XRPL Ledger using walletManager
      // 4. Store listing with NFT Token ID

      // For now, simulate the process
      // In production, replace this with actual NFT minting:
      /*
      const { createMarketplaceListing, prepareNFTMetadata } = await import("../../lib/marketplaceService");
      
      // 1. Upload certificate to IPFS (via backend)
      const formDataToSend = new FormData();
      formDataToSend.append("image", formData.certificate);
      const uploadResponse = await fetch("/api/ipfs/upload", {
        method: "POST",
        body: formDataToSend,
      });
      const uploadData = await uploadResponse.json();
      
      // 2. Prepare NFT metadata
      const metadata = prepareNFTMetadata(formData, uploadData.cid);
      const metadataFormData = new FormData();
      metadataFormData.append("jsonData", JSON.stringify(metadata));
      const metadataResponse = await fetch("/api/ipfs/upload-json", {
        method: "POST",
        body: metadataFormData,
      });
      const metadataData = await metadataResponse.json();
      
      // 3. Mint NFT (requires wallet secret - should be done via backend for security)
      const mintResult = await createMarketplaceListing(
        formData,
        accountInfo.address,
        walletManager.getSecret(), // This should be handled securely via backend
        metadataData.ipfsUrl
      );
      */

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Convert certificate to base64 for persistence in localStorage
      let certificateUrl = null;
      let certificateType = null;
      if (formData.certificate) {
        if (formData.certificate.type.startsWith("image/")) {
          // Convert image to base64
          certificateUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(formData.certificate);
          });
          certificateType = "image";
        } else if (formData.certificate.type === "application/pdf") {
          // For PDFs, we'll store a placeholder or convert to base64
          certificateUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(formData.certificate);
          });
          certificateType = "pdf";
        }
      }

      // Create listing object for marketplace
      // In production, this will include the NFT Token ID from minting
      const newListing = {
        id: `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productType: formData.productType,
        weight: formData.weight,
        date: formData.date,
        lotNumber: formData.lotNumber,
        labo: formData.labo,
        price: formData.price,
        pricePerKg: formData.pricePerKg,
        certificateUrl: certificateUrl,
        certificateType: certificateType,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        producerValidation: null,
        transporterValidation: null,
        // Marketplace information
        sellerAddress: accountInfo?.address || "unknown",
        sellerName: accountInfo?.walletName || "Seller",
        isPublic: true, // All listings are public in the marketplace
        // NFT information (will be populated after minting)
        nftTokenId: null, // Will be set after NFT minting
        txHash: null, // Will be set after NFT minting
      };

      // Clean listings before saving (remove File objects that can't be serialized)
      const cleanedListings = listings.map(listing => {
        const cleaned = { ...listing };
        delete cleaned.certificate; // Remove File object
        return cleaned;
      });

      const updatedListings = [newListing, ...cleanedListings];
      saveListings(updatedListings);
      
      // Reset form
      setShowCreateForm(false);
      setTimeout(() => setShowCreateForm(true), 100);

      // Show success message
      alert("Listing created successfully! NFT will be minted when backend integration is complete.");
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

      const sellerAddress = accountInfo?.address || "current-seller";
      
      // Convert certificate to base64 if a new one is uploaded
      let certificateUrl = null;
      let certificateType = null;
      if (formData.certificate) {
        if (formData.certificate.type.startsWith("image/")) {
          certificateUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(formData.certificate);
          });
          certificateType = "image";
        } else if (formData.certificate.type === "application/pdf") {
          certificateUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(formData.certificate);
          });
          certificateType = "pdf";
        }
      }
      
      // Update in local listings
      const updatedListings = listings.map(listing => {
        if (listing.id === listingId) {
          const updatedListing = {
            ...listing,
            productType: formData.productType,
            weight: formData.weight,
            date: formData.date,
            lotNumber: formData.lotNumber,
            labo: formData.labo,
            price: formData.price,
            pricePerKg: formData.pricePerKg,
            certificateUrl: certificateUrl || listing.certificateUrl,
            certificateType: certificateType || listing.certificateType,
            updatedAt: new Date().toISOString(),
            sellerAddress: sellerAddress,
            sellerName: accountInfo?.walletName || listing.sellerName || "Seller"
          };
          // Remove certificate file object as it can't be serialized
          delete updatedListing.certificate;
          return updatedListing;
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

      const sellerAddress = accountInfo?.address || "current-seller";
      
      // Update in local listings
      const updatedListings = listings.map(listing => {
        if (listing.id === listingId) {
          return {
            ...listing,
            status: "deleted",
            updatedAt: new Date().toISOString(),
            isPublic: false // Remove from public marketplace
          };
        }
        return listing;
      });

      saveListings(updatedListings);
      
      // Also update marketplace to remove deleted listing
      const marketplaceListings = localStorage.getItem("marketplaceListings");
      if (marketplaceListings) {
        try {
          const allListings = JSON.parse(marketplaceListings);
          const updatedMarketplace = allListings.map(listing => {
            if (listing.id === listingId) {
              return {
                ...listing,
                status: "deleted",
                updatedAt: new Date().toISOString(),
                isPublic: false
              };
            }
            return listing;
          });
          localStorage.setItem("marketplaceListings", JSON.stringify(updatedMarketplace));
        } catch (e) {
          console.error("Error updating marketplace:", e);
        }
      }

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

  // STATE 1: Wallet manager not ready yet OR autoConnecting
  if (!isReady || isAutoConnecting) {
    return (
      <LoadingScreen 
        message="Connecting to wallet..."
        subMessage="Please wait while we restore your session"
      />
    );
  }

  // STATE 2: Wallet not connected - show connection screen
  if (!isConnected || !accountInfo) {
    const SellerIcon = () => (
      <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  // STATE 3: Credentials are loading
  if (isCredentialLoading || !isCredentialInitialized) {
    return (
      <LoadingScreen 
        message="Verifying credentials..."
        subMessage="Checking your access permissions on XRPL"
      />
    );
  }

  // STATE 4: No seller credential - access denied
  if (!hasSellerCredential) {
    return (
      <AccessDeniedScreen 
        requiredCredential={REQUIRED_CREDENTIAL}
        walletAddress={accountInfo?.address}
        title="Access Denied"
        subtitle="Seller Credential Required"
      />
    );
  }

  // STATE 5: Has access - show the page

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
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Seller Dashboard</h1>
            <p className="text-emerald-400 text-lg font-medium">Create and manage your product listings</p>
          </motion.div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Area */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {showCreateForm && (
                  <SellerCreateListingForm
                    key="create-form"
                    onSubmit={handleCreateListing}
                    isLoading={isLoading}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
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
