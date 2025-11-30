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
import LaboProductsList from "../../components/labo/LaboProductsList";
import LaboProductDetails from "../../components/labo/LaboProductDetails";
import LaboValidationModal from "../../components/labo/LaboValidationModal";
import LaboDecryptModal from "../../components/labo/LaboDecryptModal";
import { useWallet } from "../../components/providers/WalletProvider";
import { useCredentialContext } from "../../components/providers/CredentialProvider";
import { fetchNFTsFromBlockchain, decryptNFTImage } from "../../lib/laboService";

// Required credential for this page
const REQUIRED_CREDENTIAL = "LABO";

export default function LaboPage() {
  const { isConnected, accountInfo, isReady, isAutoConnecting } = useWallet();
  const { hasAccess, isLoading: isCredentialLoading, isInitialized: isCredentialInitialized } = useCredentialContext();
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [decryptError, setDecryptError] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Check credential access
  const hasLaboCredential = hasAccess("labo");

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
      label: "Labo",
      description: "Validate products",
      bgColor: "rgba(6, 182, 212, 0.6)",
      textColor: "#ecfeff",
      href: "/labo"
    }
  ];

  const logo = (
    <a href="/" className="text-white font-semibold text-lg tracking-tight hover:text-cyan-300 transition-colors">
      CertiChain
    </a>
  );

  // Load products from BLOCKCHAIN (not localStorage!)
  useEffect(() => {
    if (!hasLaboCredential) return;
    
    loadNFTsFromBlockchain();
  }, [hasLaboCredential]);

  // Function to load NFTs from blockchain
  const loadNFTsFromBlockchain = async () => {
    setIsLoadingNFTs(true);
    setLoadError(null);
    
    try {
      console.log("[Labo] Fetching NFTs from blockchain...");
      const result = await fetchNFTsFromBlockchain();
      
      if (result.success) {
        // Map blockchain NFTs to product format
        // Note: Image is NOT visible until decrypted!
        const laboProducts = result.nfts.map(nft => ({
          id: nft.id || nft.nftTokenId,
          nftTokenId: nft.nftTokenId,
          txHash: nft.txHash,
          sellerAddress: nft.sellerAddress,
          sellerName: nft.sellerAddress?.slice(0, 8) + "...",
          
          // Public data from NFT (not encrypted)
          productType: nft.publicData?.productType || "Unknown",
          weight: nft.publicData?.weight || "0",
          date: nft.publicData?.date || "",
          lotNumber: nft.publicData?.lotNumber || "",
          labo: nft.publicData?.labo || "",
          price: nft.publicData?.price || "0",
          
          // Encrypted data references
          uriHex: nft.uriHex,
          sealHex: nft.sealHex,
          i_secret: nft.i_secret, // Encrypted image link
          hasEncryptedData: nft.hasEncryptedImage || !!nft.sealHex,
          
          // Image NOT available until decrypted
          certificateUrl: null, // Will be set after decryption
          imageUrl: null, // Will be set after decryption
          
          // Status
          laboStatus: "pending",
          laboValidation: null,
          createdAt: nft.createdAt || new Date().toISOString(),
        }));
        
        console.log("[Labo] Loaded", laboProducts.length, "products from blockchain");
        setProducts(laboProducts);
      } else {
        throw new Error(result.error || "Failed to fetch NFTs");
      }
    } catch (error) {
      console.error("[Labo] Error loading NFTs:", error);
      setLoadError(error.message);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  const handleValidateProduct = (product) => {
    setSelectedProduct(product);
    setActionType("validate");
    setShowValidationModal(true);
  };

  const handleRejectProduct = (product) => {
    setSelectedProduct(product);
    setActionType("reject");
    setShowValidationModal(true);
  };

  const handleDecryptProduct = (product) => {
    setSelectedProduct(product);
    setDecryptedData(null);
    setDecryptError(null);
    setShowDecryptModal(true);
  };

  const handleConfirmValidation = async (productId, action, notes) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update marketplace listings
      const marketplaceListings = localStorage.getItem("marketplaceListings");
      if (marketplaceListings) {
        try {
          const allListings = JSON.parse(marketplaceListings);
          const updatedListings = allListings.map(listing => {
            if (listing.id === productId) {
              return {
                ...listing,
                status: action === "validate" ? "labo-validated" : "labo-rejected",
                laboValidation: {
                  status: action === "validate" ? "accepted" : "rejected",
                  notes: notes || null,
                  laboAddress: accountInfo?.address,
                  date: new Date().toISOString()
                },
                updatedAt: new Date().toISOString()
              };
            }
            return listing;
          });
          localStorage.setItem("marketplaceListings", JSON.stringify(updatedListings));
          
          // Update local products state
          const updatedProducts = products.map(product => {
            if (product.id === productId) {
              return {
                ...product,
                laboStatus: action === "validate" ? "labo-validated" : "rejected",
                laboValidation: {
                  status: action === "validate" ? "accepted" : "rejected",
                  notes: notes || null,
                  laboAddress: accountInfo?.address,
                  date: new Date().toISOString()
                }
              };
            }
            return product;
          });
          setProducts(updatedProducts);
        } catch (e) {
          console.error("Error updating marketplace listings:", e);
        }
      }

      setShowValidationModal(false);
      setSelectedProduct(null);
      setActionType(null);
      alert(`Product ${action === "validate" ? "validated" : "rejected"} successfully!`);
    } catch (error) {
      console.error("Error processing validation:", error);
      alert(`Failed to ${action} product. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrypt = async (product, privateKey) => {
    setIsDecrypting(true);
    setDecryptError(null);
    
    try {
      // Call backend to decrypt the data
      const response = await fetch("http://localhost:3002/api/decrypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          encryptedData: product.sealHex,
          privateKey: privateKey,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Decryption failed");
      }
      
      const result = await response.json();
      setDecryptedData(result.decryptedData);
      
    } catch (error) {
      console.error("Decryption error:", error);
      setDecryptError(error.message || "Failed to decrypt data. Please check your private key.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setDecryptedData(null);
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
    const LaboIcon = () => (
      <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    );

    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
        <div className="fixed inset-0 z-0">
          <GridScan
            sensitivity={0.55}
            lineThickness={1}
            linesColor="#06b6d4"
            gridScale={0.1}
            lineStyle="solid"
            lineJitter={0.1}
            enablePost={true}
            bloomIntensity={1.2}
            bloomThreshold={0.3}
            bloomSmoothing={0.9}
            chromaticAberration={0.002}
            noiseIntensity={0.015}
            scanColor="#22d3ee"
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
            title="Laboratory Dashboard"
            subtitle="Quality Certification"
            description="Validate and certify agricultural products on the XRPL blockchain. Decrypt confidential NFT data with your laboratory key and ensure product quality meets certification standards."
            features={[
              "View products pending validation",
              "Decrypt encrypted NFT data",
              "Validate or reject products",
              "Issue quality certifications",
              "Maintain complete audit trail"
            ]}
            icon={LaboIcon}
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

  // STATE 4: No labo credential - access denied
  if (!hasLaboCredential) {
    return (
      <AccessDeniedScreen 
        requiredCredential={REQUIRED_CREDENTIAL}
        walletAddress={accountInfo?.address}
        title="Access Denied"
        subtitle="Laboratory Credential Required"
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
          linesColor="#06b6d4"
          gridScale={0.1}
          lineStyle="solid"
          lineJitter={0.1}
          enablePost={true}
          bloomIntensity={1.2}
          bloomThreshold={0.3}
          bloomSmoothing={0.9}
          chromaticAberration={0.002}
          noiseIntensity={0.015}
          scanColor="#22d3ee"
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Laboratory Dashboard</h1>
            <p className="text-cyan-400 text-lg font-medium">Validate and certify products</p>
            
            {/* Labo Info */}
            <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg inline-block">
              <p className="text-white/60 text-sm">Connected as Laboratory</p>
              <p className="text-cyan-400 font-mono text-sm">{accountInfo?.address}</p>
            </div>
          </motion.div>

          {/* Products List */}
          <LaboProductsList
            products={products}
            onView={handleViewDetails}
            onValidate={handleValidateProduct}
            onReject={handleRejectProduct}
            onDecrypt={handleDecryptProduct}
          />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetails && selectedProduct && (
          <LaboProductDetails
            product={selectedProduct}
            decryptedData={decryptedData}
            onClose={() => {
              setShowDetails(false);
              setSelectedProduct(null);
              setDecryptedData(null);
            }}
            onValidate={handleValidateProduct}
            onReject={handleRejectProduct}
            onDecrypt={handleDecryptProduct}
          />
        )}
        {showValidationModal && selectedProduct && (
          <LaboValidationModal
            product={selectedProduct}
            action={actionType}
            onClose={() => {
              setShowValidationModal(false);
              setSelectedProduct(null);
              setActionType(null);
            }}
            onConfirm={handleConfirmValidation}
            isLoading={isLoading}
          />
        )}
        {showDecryptModal && selectedProduct && (
          <LaboDecryptModal
            product={selectedProduct}
            onClose={() => {
              setShowDecryptModal(false);
              setSelectedProduct(null);
              setDecryptedData(null);
              setDecryptError(null);
            }}
            onDecrypt={handleDecrypt}
            isLoading={isDecrypting}
            decryptedData={decryptedData}
            error={decryptError}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
