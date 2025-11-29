"use client";

import { motion } from 'framer-motion';
import LogoLoop from './LogoLoop';

const partnerLogos = [
  { 
    node: (
      <svg className="h-5 w-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
    href: 'https://github.com/XRPL-Commons/scaffold-xrp',
    title: 'GitHub'
  },
  { 
    node: (
      <svg className="h-5 w-5 text-white/60" viewBox="0 0 120 120" fill="currentColor">
        <path d="M60 0L0 30v60l60 30 60-30V30L60 0zM60 10l50 25v50L60 110 10 85V35l50-25z"/>
        <path d="M60 25L25 42.5v35L60 95l35-17.5v-35L60 25zm0 10l25 12.5v25L60 85 35 72.5v-25L60 35z"/>
      </svg>
    ),
    href: 'https://www.xrpl-commons.org/',
    title: 'XRPL Commons'
  },
  { 
    node: (
      <svg className="h-5 w-5 text-white/60" viewBox="0 0 180 180" fill="currentColor">
        <mask id="nextMask" style={{maskType: 'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
          <circle cx="90" cy="90" r="90" fill="black"/>
        </mask>
        <g mask="url(#nextMask)">
          <circle cx="90" cy="90" r="90" fill="currentColor"/>
          <path d="M149.508 157.52L69.142 54H54v71.97h12.114V69.384l73.885 95.461a90.304 90.304 0 009.509-7.325z" fill="#0a0a0f"/>
          <rect x="115" y="54" width="12" height="72" fill="#0a0a0f"/>
        </g>
      </svg>
    ),
    title: 'Next.js'
  },
];

export default function Footer() {
  return (
    <footer className="relative">
      {/* Logo Loop */}
      <div className="py-6">
        <LogoLoop
          logos={partnerLogos}
          speed={40}
          direction="left"
          logoHeight={20}
          gap={80}
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
