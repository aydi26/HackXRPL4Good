"use client";

import { motion } from 'framer-motion';
import LogoLoop from './LogoLoop';

const partnerLogos = [
  { src: 'https://xrpl.org/img/logo.svg', alt: 'XRPL' },
  { src: 'https://xumm.app/assets/icons/xaman-logo-text.svg', alt: 'Xaman' },
  { src: 'https://crossmark.io/assets/crossmark-logo.svg', alt: 'Crossmark' },
  { src: 'https://www.ripple.com/wp-content/uploads/2022/03/ripple-logo.svg', alt: 'Ripple' },
  { src: 'https://gemwallet.app/img/gemwallet-logo.svg', alt: 'GemWallet' },
];

export default function Footer() {
  return (
    <footer className="relative">
      {/* Logo Loop */}
      <div className="py-8">
        <LogoLoop
          logos={partnerLogos}
          speed={60}
          direction="left"
          logoHeight={24}
          gap={64}
          pauseOnHover={true}
          fadeOut={true}
          fadeOutColor="#0a0a0f"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="text-lg font-bold text-white">CertiChain</span>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/50 text-sm text-center"
          >
            <p>© {new Date().getFullYear()} CertiChain. Built for{' '}
              <a
                href="https://xrpl.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                XRPL Hackathon
              </a>
            </p>
          </motion.div>

          {/* XRPL Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center gap-2 text-sm"
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-300">Powered by XRP Ledger</span>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
