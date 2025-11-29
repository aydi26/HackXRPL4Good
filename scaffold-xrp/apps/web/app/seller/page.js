"use client";

import { motion } from 'framer-motion';
import GridScan from "../../components/landing/GridScan";
import CardNav from "../../components/landing/CardNav";
import Footer from "../../components/landing/Footer";
import WalletButton from "../../components/landing/WalletButton";
import ProtectedRoute from "../../components/ProtectedRoute";

function SellerContent() {
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

  const features = [
    {
      title: 'Product Registration',
      description: 'Register your agricultural products on the blockchain with complete traceability.'
    },
    {
      title: 'NFT Certificates',
      description: 'Create NFT certificates that prove the authenticity and origin of your products.'
    },
    {
      title: 'Production History',
      description: 'Maintain a complete and immutable history of your production processes.'
    },
    {
      title: 'Quality Verification',
      description: 'Get your products verified by certified inspectors on the platform.'
    },
    {
      title: 'Direct Sales',
      description: 'Sell directly to verified buyers with secure XRPL transactions.'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Track your sales, certifications, and product performance in real-time.'
    }
  ];

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
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="mb-6">
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Seller
              </h1>
              <p className="text-emerald-400 text-lg font-medium">Agricultural Producer</p>
            </div>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Certify your agricultural products with traceable NFTs on the XRPL blockchain.
              Build trust with your customers through transparent certification.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + idx * 0.1, duration: 0.6 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all group"
              >
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <p className="text-lg text-white/80">
                Connect your wallet to start certifying your products
              </p>
              <p className="text-sm text-white/50">
                You'll need to verify your identity to become a certified seller
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SellerPage() {
  return (
    <ProtectedRoute requiredCredential="SELLER">
      <SellerContent />
    </ProtectedRoute>
  );
}
