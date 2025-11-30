"use client";

import { motion } from 'framer-motion';
import CardSwap, { Card } from './CardSwap';
import ScrollReveal from './ScrollReveal';

const roles = [
  {
    id: 'seller',
    title: 'Seller',
    subtitle: 'Agricultural Producer',
    gradient: 'from-emerald-500 to-emerald-700',
    description: 'Certify your agricultural products with traceable NFTs on the XRPL blockchain.',
    features: [
      'NFT certificate creation',
      'Production history',
      'Authenticity proofs'
    ],
    href: '/seller'
  },
  {
    id: 'producer',
    title: 'Producer',
    subtitle: 'Agricultural Validator',
    gradient: 'from-blue-500 to-blue-700',
    description: 'Validate and certify seller offers with complete traceability.',
    features: [
      'Offer validation',
      'Certificate verification',
      'Traceability tracking'
    ],
    href: '/producer'
  },
  {
    id: 'transporter',
    title: 'Transporter',
    subtitle: 'Certified Logistics',
    gradient: 'from-purple-500 to-purple-700',
    description: 'Participate in the traceability chain by validating product transport.',
    features: [
      'Delivery validation',
      'Integrated GPS tracking',
      'Compliance proofs'
    ],
    href: '/transporter'
  }
];

const steps = [
  {
    title: 'Connect your XRPL wallet',
    description: 'Use Xaman, Crossmark or any XRPL-compatible wallet'
  },
  {
    title: 'Verify your identity',
    description: 'Submit your professional documents (license, business ID, etc.)'
  },
  {
    title: 'Receive your on-chain credential',
    description: 'A certification NFT is minted and linked to your address'
  },
  {
    title: 'Start using the platform',
    description: 'Create, buy or transport certified products'
  }
];

const CheckIcon = () => (
  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function RolesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section id="roles" className="relative min-h-screen flex items-center py-10 px-4">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Side - Explanation */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div>
              <motion.h2
                variants={itemVariants}
                className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
              >
                Join the
                <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  CertiChain Ecosystem
                </span>
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-white/70 text-lg leading-relaxed"
              >
                Every supply chain actor can become certified
                by validating their credentials on the XRPL blockchain.
              </motion.p>
            </div>

            {/* How to join */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <ShieldIcon />
                How to become a certified actor?
              </h3>

              <div className="space-y-6">
                {steps.map((item, idx) => (
                  <div key={idx} className="pl-2">
                    <ScrollReveal
                      baseOpacity={0}
                      enableBlur={true}
                      baseRotation={3}
                      blurStrength={8}
                      containerClassName=""
                      textClassName="text-white font-semibold text-lg"
                    >
                      {item.title}
                    </ScrollReveal>
                    <ScrollReveal
                      baseOpacity={0}
                      enableBlur={true}
                      baseRotation={2}
                      blurStrength={6}
                      containerClassName="mt-1"
                      textClassName="text-white/50 text-sm"
                    >
                      {item.description}
                    </ScrollReveal>
                  </div>
                ))}
              </div>

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-2 p-4"
              >
                <ShieldIcon />
                <p className="text-emerald-300 text-sm font-medium">
                  All credentials are verifiable on-chain and immutable
                </p>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Side - Card Swap */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-center"
          >
            <CardSwap
              width={350}
              height={400}
              cardDistance={60}
              verticalDistance={50}
              delay={8000}
              pauseOnHover={true}
              skewAmount={5}
              easing="elastic"
            >
              {roles.map((role) => (
                <Card key={role.id} className="p-6 flex flex-col">
                  {/* Subtitle */}
                  <p className="text-emerald-400 text-sm font-medium mb-2">
                    {role.subtitle}
                  </p>

                  {/* Title */}
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {role.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-white/70 text-base mb-6 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3">
                    {role.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckIcon />
                        <span className="text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </CardSwap>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
