"use client";

import { motion } from "framer-motion";
import WalletButton from "./landing/WalletButton";

export default function WalletConnectionScreen({ 
  title, 
  subtitle, 
  description, 
  features = [], 
  icon: Icon 
}) {
  return (
    <div className="relative z-10 pt-32 pb-20 px-4 flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        {/* Icon */}
        {Icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <Icon />
            </div>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-white mb-3"
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-emerald-400 text-lg font-medium mb-4"
        >
          {subtitle}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-white/70 text-lg mb-8 leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Features List */}
        {features.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left"
          >
            <h3 className="text-white font-semibold text-lg mb-4">Key Features:</h3>
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Wallet Connection Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-white/60 text-sm mb-2">Connect your XRPL wallet to get started</p>
          <div className="flex justify-center">
            <WalletButton />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

