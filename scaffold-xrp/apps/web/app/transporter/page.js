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
import TransporterOffersList from "../../components/transporter/TransporterOffersList";
import TransporterOfferDetails from "../../components/transporter/TransporterOfferDetails";
import TransporterAcceptRejectModal from "../../components/transporter/TransporterAcceptRejectModal";
import { useWallet } from "../../components/providers/WalletProvider";
import { useCredentialContext } from "../../components/providers/CredentialProvider";

// Required credential for this page
const REQUIRED_CREDENTIAL = "TRANSPORTER";

export default function TransporterPage() {
  const { isConnected, accountInfo, isReady, isAutoConnecting } = useWallet();
  const { hasAccess, isLoading: isCredentialLoading, isInitialized: isCredentialInitialized } = useCredentialContext();
  
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAcceptRejectModal, setShowAcceptRejectModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  // Check credential access
  const hasTransporterCredential = hasAccess("transporter");

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

  // Load offers from marketplace (all listings from all sellers)
  useEffect(() => {
    // Load all marketplace listings
    const marketplaceListings = localStorage.getItem("marketplaceListings");
    
    if (marketplaceListings) {
      try {
        const allListings = JSON.parse(marketplaceListings);
        // Convert listings to transport offers (only producer-validated and ready)
        // Transporters can see all listings that are ready for transport
        const transportOffers = allListings
          .filter(listing => 
            listing.isPublic !== false &&
            (listing.status === "producer-validated" || 
            listing.status === "producer-transporter-validated" ||
            listing.status === "transport-accepted" ||
            listing.status === "in-transit" ||
            listing.status === "completed")
          )
          .map(listing => ({
            id: listing.id,
            productType: listing.productType,
            weight: listing.weight,
            date: listing.date,
            lotNumber: listing.lotNumber,
            price: listing.price,
            pricePerKg: listing.pricePerKg,
            labo: listing.labo,
            distance: Math.floor(Math.random() * 500) + 50, // Placeholder distance
            transportPrice: (Math.random() * 10 + 5).toFixed(2), // Placeholder transport price
            sellerValidated: true,
            producerValidated: listing.status !== "pending",
            producerValidation: listing.producerValidation,
            transporterValidation: listing.transporterValidation,
            sellerAddress: listing.sellerAddress || "unknown",
            sellerName: listing.sellerName || "Seller",
            status: listing.status === "producer-validated" 
              ? "ready-for-transport"
              : listing.status === "producer-transporter-validated"
              ? "ready-for-transport"
              : listing.status === "transport-accepted"
              ? "transport-accepted"
              : listing.status === "in-transit"
              ? "in-transit"
              : listing.status === "completed"
              ? "completed"
              : "ready-for-transport",
            createdAt: listing.createdAt
          }));
        setOffers(transportOffers);
      } catch (e) {
        console.error("Error loading transport offers:", e);
      }
    } else {
      // Fallback: try old sellerListings for backward compatibility
      const savedListings = localStorage.getItem("sellerListings");
      if (savedListings) {
        try {
          const listings = JSON.parse(savedListings);
          const transportOffers = listings
            .filter(listing => 
              listing.status === "producer-validated" || 
              listing.status === "producer-transporter-validated" ||
              listing.status === "transport-accepted" ||
              listing.status === "in-transit" ||
              listing.status === "completed"
            )
            .map(listing => ({
              id: listing.id,
              productType: listing.productType,
              weight: listing.weight,
              date: listing.date,
              lotNumber: listing.lotNumber,
              price: listing.price,
              pricePerKg: listing.pricePerKg,
              labo: listing.labo,
              distance: Math.floor(Math.random() * 500) + 50,
              transportPrice: (Math.random() * 10 + 5).toFixed(2),
              sellerValidated: true,
              producerValidated: listing.status !== "pending",
              producerValidation: listing.producerValidation,
              transporterValidation: listing.transporterValidation,
              sellerAddress: listing.sellerAddress || "unknown",
              sellerName: listing.sellerName || "Seller",
              status: listing.status === "producer-validated" 
                ? "ready-for-transport"
                : listing.status === "producer-transporter-validated"
                ? "ready-for-transport"
                : listing.status === "transport-accepted"
                ? "transport-accepted"
                : listing.status === "in-transit"
                ? "in-transit"
                : listing.status === "completed"
                ? "completed"
                : "ready-for-transport",
              createdAt: listing.createdAt
            }));
          setOffers(transportOffers);
        } catch (e) {
          console.error("Error loading transport offers:", e);
        }
      }
    }
  }, []);

  const handleAcceptOffer = (offer) => {
    setSelectedOffer(offer);
    setActionType("accept");
    setShowAcceptRejectModal(true);
  };

  const handleRejectOffer = (offer) => {
    setSelectedOffer(offer);
    setActionType("reject");
    setShowAcceptRejectModal(true);
  };

  const handleConfirmAction = async (offerId, action, reason) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update marketplace listings
      const marketplaceListings = localStorage.getItem("marketplaceListings");
      if (marketplaceListings) {
        try {
          const allListings = JSON.parse(marketplaceListings);
          const updatedListings = allListings.map(listing => {
            if (listing.id === offerId) {
              return {
                ...listing,
                status: action === "accept" ? "producer-transporter-validated" : "cancelled",
                transporterValidation: {
                  status: action === "accept" ? "accepted" : "rejected",
                  reason: reason || null,
                  date: new Date().toISOString()
                },
                updatedAt: new Date().toISOString()
              };
            }
            return listing;
          });
          localStorage.setItem("marketplaceListings", JSON.stringify(updatedListings));
          
          // Update local offers state
          const updatedOffers = offers.map(offer => {
            if (offer.id === offerId) {
              return {
                ...offer,
                status: action === "accept" ? "transport-accepted" : "rejected",
                transporterValidation: {
                  status: action === "accept" ? "accepted" : "rejected",
                  reason: reason || null,
                  date: new Date().toISOString()
                }
              };
            }
            return offer;
          });
          setOffers(updatedOffers);
        } catch (e) {
          console.error("Error updating marketplace listings:", e);
        }
      }

      setShowAcceptRejectModal(false);
      setSelectedOffer(null);
      setActionType(null);
      alert(`Transport ${action === "accept" ? "accepted" : "rejected"} successfully!`);
    } catch (error) {
      console.error("Error processing transport offer:", error);
      alert(`Failed to ${action} transport. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (offer) => {
    setSelectedOffer(offer);
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
    const TransporterIcon = () => (
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
            title="Transporter Dashboard"
            subtitle="Certified Logistics"
            description="Accept and manage transport missions on the XRPL blockchain. Validate deliveries, maintain product traceability, and ensure the integrity of the supply chain from origin to destination."
            features={[
              "View transport-ready listings",
              "Accept or reject transport missions",
              "Track delivery status",
              "Maintain complete traceability",
              "Validate product integrity"
            ]}
            icon={TransporterIcon}
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

  // STATE 4: No transporter credential - access denied
  if (!hasTransporterCredential) {
    return (
      <AccessDeniedScreen 
        requiredCredential={REQUIRED_CREDENTIAL}
        walletAddress={accountInfo?.address}
        title="Access Denied"
        subtitle="Transporter Credential Required"
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Transporter Dashboard</h1>
            <p className="text-purple-400 text-lg font-medium">Accept and manage transport missions</p>
          </motion.div>

          {/* Offers List */}
          <TransporterOffersList
            offers={offers}
            onView={handleViewDetails}
            onAccept={handleAcceptOffer}
            onReject={handleRejectOffer}
          />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetails && selectedOffer && (
          <TransporterOfferDetails
            offer={selectedOffer}
            onClose={() => {
              setShowDetails(false);
              setSelectedOffer(null);
            }}
            onAccept={handleAcceptOffer}
            onReject={handleRejectOffer}
          />
        )}
        {showAcceptRejectModal && selectedOffer && (
          <TransporterAcceptRejectModal
            offer={selectedOffer}
            action={actionType}
            onClose={() => {
              setShowAcceptRejectModal(false);
              setSelectedOffer(null);
              setActionType(null);
            }}
            onConfirm={handleConfirmAction}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
