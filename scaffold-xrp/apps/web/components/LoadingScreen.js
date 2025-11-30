"use client";

import { motion } from "framer-motion";
import GridScan from "./landing/GridScan";
import CardNav from "./landing/CardNav";
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
    label: "Labo",
    description: "Validate products",
    bgColor: "rgba(6, 182, 212, 0.6)",
    textColor: "#ecfeff",
    href: "/labo"
  }
];

const logo = (
  <a href="/" className="text-white font-semibold text-lg tracking-tight hover:text-emerald-300 transition-colors">
    CertiChain
  </a>
);

export default function LoadingScreen({ 
  message = "Connecting to wallet...",
  subMessage = "Please wait while we verify your connection"
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Background */}
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Spinner */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20" />
              {/* Spinning ring */}
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
              {/* Inner glow */}
              <div className="absolute inset-2 w-16 h-16 rounded-full bg-emerald-500/10 animate-pulse" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-emerald-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-semibold text-white mb-2">
            {message}
          </h2>
          <p className="text-gray-400 text-sm">
            {subMessage}
          </p>

          {/* Progress dots */}
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
