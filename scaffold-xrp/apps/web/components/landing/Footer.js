"use client";

import { motion } from 'framer-motion';
import LogoLoop from './LogoLoop';

// Partner logos using SVG nodes - all white
const XRPLLogo = () => (
  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 16.5h-2.25l-2.25-3-2.25 3H7.5l3.375-4.5L7.5 7.5h2.25l2.25 3 2.25-3h2.25l-3.375 4.5 3.375 4.5z"/>
  </svg>
);

const BlockchainLogo = () => (
  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const SecureLogo = () => (
  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const TraceLogo = () => (
  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const CertifiedLogo = () => (
  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4"/>
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

const partnerLogos = [
  { node: <XRPLLogo />, title: "XRPL", href: "https://xrpl.org" },
  { node: <BlockchainLogo />, title: "Blockchain" },
  { node: <SecureLogo />, title: "Secure" },
  { node: <TraceLogo />, title: "Traceable" },
  { node: <CertifiedLogo />, title: "Certified" },
  { node: <XRPLLogo />, title: "XRPL", href: "https://xrpl.org" },
  { node: <BlockchainLogo />, title: "Blockchain" },
  { node: <SecureLogo />, title: "Secure" },
];

export default function Footer() {
  return (
    <footer className="relative bg-black/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Logo Loop Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div style={{ height: '50px', position: 'relative', overflow: 'hidden' }}>
            <LogoLoop
              logos={partnerLogos}
              speed={80}
              direction="left"
              logoHeight={32}
              gap={60}
              hoverSpeed={20}
              scaleOnHover
              fadeOut
              fadeOutColor="#0b0b0b"
              ariaLabel="Technology partners"
            />
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
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
