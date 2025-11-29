"use client";

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Main Title */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Agricultural
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="block bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent"
            >
              Certification Marketplace
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            CertiChain revolutionizes agricultural product traceability through 
            NFTs and MPTokens on the XRP Ledger. Transparency, trust, and verifiable 
            certification for all supply chain actors.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
