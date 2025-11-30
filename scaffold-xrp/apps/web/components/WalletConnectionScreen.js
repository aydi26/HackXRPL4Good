"use client";

import { motion } from "framer-motion";
import WalletButton from "./landing/WalletButton";
import { useWallet } from "./providers/WalletProvider";

export default function WalletConnectionScreen({ title, subtitle, description, features, icon: Icon }) {
  const { isConnected } = useWallet();

  return (
    <div className="relative z-10 pt-32 pb-20 px-4 flex items-center justify-center min-h-screen">
      <div className="max-w-4xl mx-auto text-center bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-md">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          {Icon && <Icon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{title}</h1>
          <p className="text-emerald-400 text-lg font-medium mb-6">{subtitle}</p>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">{description}</p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
        >
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center justify-center gap-3 text-white/80">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{feature}</span>
            </div>
          ))}
        </motion.div>

        {!isConnected && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <p className="text-lg text-white/80 mb-6">
              Connect your XRPL wallet to get started.
            </p>
            <WalletButton />
          </motion.div>
        )}
      </div>
    </div>
  );
}
