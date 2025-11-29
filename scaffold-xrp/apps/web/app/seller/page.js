"use client";

import { motion } from 'framer-motion';
import GridScan from "../../components/landing/GridScan";
import CardNav from "../../components/landing/CardNav";
import Footer from "../../components/landing/Footer";
import WalletButton from "../../components/landing/WalletButton";

export default function SellerPage() {
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
    <a href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <span className="text-white font-bold text-sm">C</span>
      </div>
      <span className="text-white font-semibold text-lg tracking-tight">CertiChain</span>
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
      {/* GridScan Background */}
      <div className="fixed inset-0 z-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#392e4e"
          gridScale={0.1}
          lineStyle="solid"
          lineJitter={0.1}
          enablePost={true}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
          scanColor="#48dd40"
          scanOpacity={0.4}
          scanDirection="pingpong"
          scanSoftness={2}
          scanGlow={0.5}
          scanDuration={2.0}
          scanDelay={2.0}
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
