"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import GridScan from "./landing/GridScan";
import CardNav from "./landing/CardNav";
import Footer from "./landing/Footer";
import WalletButton from "./landing/WalletButton";

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

export default function AccessDeniedScreen({ 
  requiredCredential,
  walletAddress,
  title = "Access Denied",
  subtitle = "Missing Required Credential"
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#ef4444"
          gridScale={0.1}
          lineStyle="solid"
          lineJitter={0.1}
          enablePost={true}
          bloomIntensity={1.2}
          bloomThreshold={0.3}
          bloomSmoothing={0.9}
          chromaticAberration={0.002}
          noiseIntensity={0.015}
          scanColor="#f87171"
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full"
        >
          {/* Error Card */}
          <div className="bg-gradient-to-br from-red-950/40 to-red-900/20 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 shadow-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-red-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              {title}
            </h1>
            <p className="text-red-300 text-center mb-6">
              {subtitle}
            </p>

            {/* Details */}
            <div className="bg-black/30 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Wallet Address</span>
                <span className="text-white font-mono text-sm">
                  {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : "Not connected"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Required Credential</span>
                <span className="text-red-400 font-semibold text-sm uppercase">
                  {requiredCredential}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5 animate-pulse" />
                  Not Found
                </span>
              </div>
            </div>

            {/* Message */}
            <p className="text-gray-400 text-sm text-center mb-6">
              Your wallet does not have the required <span className="text-red-400 font-semibold">{requiredCredential}</span> credential 
              to access this section. Please contact an issuer to obtain the necessary credential.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/"
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-center transition-colors"
              >
                Go Home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl font-medium transition-colors border border-red-500/30"
              >
                Retry
              </button>
            </div>
          </div>

          {/* Help Link */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Need help? <a href="#" className="text-red-400 hover:text-red-300 underline">Contact Support</a>
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
