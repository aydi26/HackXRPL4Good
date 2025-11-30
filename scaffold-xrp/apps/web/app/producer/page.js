"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GridScan from "../../components/landing/GridScan";
import CardNav from "../../components/landing/CardNav";
import Footer from "../../components/landing/Footer";
import WalletButton from "../../components/landing/WalletButton";
import WalletConnectionScreen from "../../components/WalletConnectionScreen";
import ProducerOffersList from "../../components/producer/ProducerOffersList";
import ProducerOfferDetails from "../../components/producer/ProducerOfferDetails";
import ProducerAcceptRejectModal from "../../components/producer/ProducerAcceptRejectModal";
import { useWallet } from "../../components/providers/WalletProvider";

// Bypass wallet check - set to false to require wallet connection
const BYPASS_WALLET_CHECK = false;

export default function ProducerPage() {
  const { isConnected, accountInfo, isSessionRestored } = useWallet();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAcceptRejectModal, setShowAcceptRejectModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  // Check if user can access
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

  // Load offers from localStorage or API
  useEffect(() => {
    // Load seller listings and convert them to offers for producer
    const savedListings = localStorage.getItem("sellerListings");
    if (savedListings) {
      try {
        const listings = JSON.parse(savedListings);
        // Convert listings to offers (only pending and producer-validated)
        const producerOffers = listings
          .filter(listing => 
            listing.status === "pending" || 
            listing.status === "producer-validated" ||
            listing.status === "producer-transporter-validated"
          )
          .map(listing => ({
            id: listing.id,
            productType: listing.productType,
            weight: listing.weight,
            date: listing.date,
            lotNumber: listing.lotNumber,
            price: listing.price,
            pricePerKg: listing.pricePerKg,
            certificateUrl: listing.certificateUrl,
            sellerAddress: "rSeller123...", // Placeholder
            sellerName: "Seller Account", // Placeholder
            status: listing.status === "pending" ? "pending" : "accepted",
            createdAt: listing.createdAt,
            producerValidation: listing.producerValidation,
            traceabilityInfo: listing.traceabilityInfo || null
          }));
        setOffers(producerOffers);
      } catch (e) {
        console.error("Error loading offers:", e);
      }
    }

    // Also check for producer-specific offers
    const savedOffers = localStorage.getItem("producerOffers");
    if (savedOffers) {
      try {
        const producerOffers = JSON.parse(savedOffers);
        setOffers(prev => {
          // Merge with existing offers, avoiding duplicates
          const merged = [...prev];
          producerOffers.forEach(offer => {
            if (!merged.find(o => o.id === offer.id)) {
              merged.push(offer);
            }
          });
          return merged;
        });
      } catch (e) {
        console.error("Error loading producer offers:", e);
      }
    }
  }, []);

  // Save offers to localStorage
  const saveOffers = (newOffers) => {
    setOffers(newOffers);
    localStorage.setItem("producerOffers", JSON.stringify(newOffers));
  };

  const handleAccept = (offer) => {
    setSelectedOffer(offer);
    setActionType("accept");
    setShowAcceptRejectModal(true);
  };

  const handleReject = (offer) => {
    setSelectedOffer(offer);
    setActionType("reject");
    setShowAcceptRejectModal(true);
  };

  const handleConfirmAction = async (offerId, reason) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedOffers = offers.map(offer => {
        if (offer.id === offerId) {
          return {
            ...offer,
            status: actionType === "accept" ? "accepted" : "rejected",
            producerValidation: {
              status: actionType === "accept" ? "accepted" : "rejected",
              reason: reason || null,
              date: new Date().toISOString()
            }
          };
        }
        return offer;
      });

      // Also update the seller listings
      const savedListings = localStorage.getItem("sellerListings");
      if (savedListings) {
        try {
          const listings = JSON.parse(savedListings);
          const updatedListings = listings.map(listing => {
            if (listing.id === offerId) {
              return {
                ...listing,
                status: actionType === "accept" ? "producer-validated" : "cancelled",
                producerValidation: {
                  status: actionType === "accept" ? "accepted" : "rejected",
                  reason: reason || null,
                  date: new Date().toISOString()
                },
                updatedAt: new Date().toISOString()
              };
            }
            return listing;
          });
          localStorage.setItem("sellerListings", JSON.stringify(updatedListings));
        } catch (e) {
          console.error("Error updating listings:", e);
        }
      }

      saveOffers(updatedOffers);
      setShowAcceptRejectModal(false);
      setSelectedOffer(null);
      setActionType(null);
      alert(`Offer ${actionType === "accept" ? "accepted" : "rejected"} successfully!`);
    } catch (error) {
      console.error("Error processing offer:", error);
      alert(`Failed to ${actionType} offer. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (offer) => {
    setSelectedOffer(offer);
    setShowDetails(true);
  };

  if (!canAccess) {
    const ProducerIcon = () => (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            title="Producer Dashboard"
            subtitle="Agricultural Validator"
            description="Validate and certify seller offers on the XRPL blockchain. Review product listings, verify certificates, and maintain the integrity of the agricultural supply chain."
            features={[
              "Review seller product listings",
              "Validate certificates and documentation",
              "Accept or reject offers with reasons",
              "Track traceability information",
              "Maintain supply chain integrity"
            ]}
            icon={ProducerIcon}
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
              Producer Dashboard
            </h1>
            <p className="text-blue-400 text-lg font-medium">Validate and manage seller offers</p>
          </motion.div>

          {/* Offers List */}
          <ProducerOffersList
            offers={offers}
            onView={handleViewDetails}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetails && selectedOffer && (
          <ProducerOfferDetails
            offer={selectedOffer}
            onClose={() => {
              setShowDetails(false);
              setSelectedOffer(null);
            }}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}

        {showAcceptRejectModal && selectedOffer && (
          <ProducerAcceptRejectModal
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

