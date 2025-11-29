"use client";

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const steps = [
    {
      number: '01',
      title: 'Connect Your Wallet',
      description: 'Use your XRPL wallet to securely connect to the CertiChain platform.',
      icon: '👛',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      number: '02',
      title: 'Verify Your Identity',
      description: 'Submit your documents and information for validation. Our system verifies your legitimacy as a certified actor.',
      icon: '🔍',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      number: '03',
      title: 'Receive Your Credential NFT',
      description: 'Once approved, receive an on-chain certification NFT that proves your verified status and authorizations.',
      icon: '🎫',
      color: 'from-purple-500 to-pink-500',
    },
    {
      number: '04',
      title: 'Create and Track Your Products',
      description: 'Mint MPTokens for your agricultural products. Each token contains the complete and verifiable product history.',
      icon: '🌾',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-sm font-medium mb-6"
          >
            How It Works
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Certification in{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              4 Steps
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            From connection to complete certification, discover CertiChain's simple and secure process
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-8 relative">
          {/* Connection Lines for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent -translate-y-1/2" />
          <div className="hidden md:block absolute top-0 left-1/2 w-0.5 h-full bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent -translate-x-1/2" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 50, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.6 }}
              className="relative group"
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 h-full">
                {/* Number Badge */}
                <div className={`absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white font-bold text-lg">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="text-6xl mb-6 mt-4 transform group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow indicator */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute bottom-8 -right-4 text-emerald-500/50">
                    {idx % 2 === 0 ? (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mt-20"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <p className="text-lg text-white/80 max-w-md">
              Join the CertiChain ecosystem and participate in the agricultural certification revolution
            </p>
            <motion.a
              href="#roles"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              Choose My Role
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
