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
import MarketplaceListingCard from "../../components/buyer/MarketplaceListingCard";
import ListingDetailsModal from "../../components/buyer/ListingDetailsModal";
import { useWallet } from "../../components/providers/WalletProvider";
import { useCredentialContext } from "../../components/providers/CredentialProvider";
import { fetchMarketplaceListings } from "../../lib/nftMarketplace";

// Required credential for this page
const REQUIRED_CREDENTIAL = "BUYER";

export default function BuyerPage() {
  const { isConnected, accountInfo, isReady, isAutoConnecting } = useWallet();
  const { hasAccess, isLoading: isCredentialLoading, isInitialized: isCredentialInitialized } = useCredentialContext();

  // Marketplace listings state
  const [listings, setListings] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [listingsError, setListingsError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Check credential access
  const hasBuyerCredential = hasAccess("buyer");

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

  // Fetch listings from XRPL when user has access
  useEffect(() => {
    const loadListings = async () => {
      if (!hasBuyerCredential) return;
      
      setIsLoadingListings(true);
      setListingsError(null);
      
      try {
        // Fetch NFT listings from XRPL by scanning seller credentials
        const result = await fetchMarketplaceListings();
        console.log("Fetched marketplace data:", result);
        
        // Update sellers list
        setSellers(result.sellers || []);
        
        // Update listings
        if (result.listings && result.listings.length > 0) {
          setListings(result.listings);
        } else {
          // Fallback to localStorage if no NFTs found on-chain
          const localListings = localStorage.getItem("marketplaceListings");
          if (localListings) {
            try {
              const parsed = JSON.parse(localListings);
              const available = parsed.filter(l => l.isPublic !== false && l.status !== "deleted");
              setListings(available);
              console.log("Using localStorage fallback:", available.length, "listings");
            } catch (e) {
              console.error("Error parsing local listings:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching listings:", error);
        setListingsError(error.message);
        
        // Fallback to localStorage on error
        const localListings = localStorage.getItem("marketplaceListings");
        if (localListings) {
          try {
            const parsed = JSON.parse(localListings);
            const available = parsed.filter(l => l.isPublic !== false && l.status !== "deleted");
            setListings(available);
            console.log("Fallback to localStorage due to error:", available.length, "listings");
          } catch (e) {
            console.error("Error parsing local listings:", e);
          }
        }
      } finally {
        setIsLoadingListings(false);
      }
    };

    loadListings();
  }, [hasBuyerCredential]);

  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setShowDetails(true);
  };

  const handleBuyListing = (listing) => {
    // TODO: Implement purchase flow with XRPL payment
    alert(`Purchase flow for "${listing.productType}" coming soon!\n\nPrice: ${listing.price} XRP`);
  };

  const handleRefresh = async () => {
    setIsLoadingListings(true);
    setListingsError(null);
    try {
      const result = await fetchMarketplaceListings();
      setSellers(result.sellers || []);
      if (result.listings && result.listings.length > 0) {
        setListings(result.listings);
      }
    } catch (error) {
      console.error("Error refreshing listings:", error);
      setListingsError(error.message);
    } finally {
      setIsLoadingListings(false);
    }
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
    const BuyerIcon = () => (
      <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
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
            title="Buyer Dashboard"
            subtitle="Verified Consumer"
            description="Buy with confidence. Every product is certified and traceable on the blockchain. Know exactly where your food comes from and support verified producers."
            features={[
              "Verify product authenticity on blockchain",
              "Secure purchases with XRPL transactions",
              "Track your orders in real-time",
              "Access complete purchase history",
              "Rate and review products"
            ]}
            icon={BuyerIcon}
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

  // STATE 4: No buyer credential - access denied
  if (!hasBuyerCredential) {
    return (
      <AccessDeniedScreen 
        requiredCredential={REQUIRED_CREDENTIAL}
        walletAddress={accountInfo?.address}
        title="Access Denied"
        subtitle="Buyer Credential Required"
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
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Marketplace
                </h1>
                <p className="text-blue-400 text-lg font-medium">
                  {listings.length} certified products from {sellers.length} verified sellers
                </p>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isLoadingListings}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <svg 
                  className={`w-5 h-5 ${isLoadingListings ? "animate-spin" : ""}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoadingListings ? "Loading..." : "Refresh"}
              </button>
            </div>
          </motion.div>

          {/* Verified Sellers Section */}
          {sellers.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
            >
              <h3 className="text-emerald-400 text-sm font-medium mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Sellers on XRPL ({sellers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {sellers.map((seller, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 bg-white/5 rounded-lg text-white/70 text-sm font-mono"
                  >
                    {seller.slice(0, 8)}...{seller.slice(-6)}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoadingListings && listings.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-white/60 text-lg">Scanning XRPL for verified sellers...</p>
              <p className="text-white/40 text-sm mt-2">Fetching CredentialCreate transactions from issuer</p>
            </motion.div>
          )}

          {/* Error State */}
          {listingsError && listings.length === 0 && !isLoadingListings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-white/60 text-lg mb-2">Failed to load listings</p>
              <p className="text-white/40 text-sm mb-4">{listingsError}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoadingListings && listings.length === 0 && !listingsError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-white/60 text-xl mb-2">No listings available</p>
              <p className="text-white/40 text-sm">Check back later for new certified products</p>
            </motion.div>
          )}

          {/* Listings Grid */}
          {listings.length > 0 && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {listings.map((listing, idx) => (
                <MarketplaceListingCard
                  key={listing.nftId || listing.id || idx}
                  listing={listing}
                  onView={handleViewListing}
                  onBuy={handleBuyListing}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Listing Details Modal */}
      <AnimatePresence>
        {showDetails && selectedListing && (
          <ListingDetailsModal
            listing={selectedListing}
            onClose={() => {
              setShowDetails(false);
              setSelectedListing(null);
            }}
            onBuy={handleBuyListing}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
