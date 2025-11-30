/**
 * Unauthorized Access Page
 * 
 * Displayed when a user attempts to access a protected route
 * without possessing the required credential.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CREDENTIAL_INFO, CREDENTIAL_TYPES } from "../../lib/credentials";
import GridScan from "../../components/landing/GridScan";
import Footer from "../../components/landing/Footer";

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get required credential type from URL
  const requiredType = searchParams.get("required");
  const credentialInfo = requiredType ? CREDENTIAL_INFO[requiredType] : null;

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

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-8xl mb-6"
            >
              🚫
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Unauthorized Access
            </h1>
            
            <p className="text-xl text-white/60">
              You do not possess the required credential to access this section.
            </p>
          </div>

          {/* Card principale */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="p-8 rounded-2xl bg-white/5 border border-red-500/20 backdrop-blur-sm"
          >
            {/* Required Credential */}
            {credentialInfo && (
              <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-white/40 mb-3 text-center">
                  Credential required for this section:
                </p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-4xl">{credentialInfo.icon}</span>
                  <div>
                    <p className="text-xl font-bold text-white">
                      {credentialInfo.name}
                    </p>
                    <p className="text-white/50">
                      {credentialInfo.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* How to obtain a credential */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                How to obtain a credential?
              </h2>
              
              <div className="space-y-4">
                <Step 
                  number={1} 
                  title="Contact an auditor"
                  description="Get in touch with an audit company partnered with CertiChain."
                />
                <Step 
                  number={2} 
                  title="Pass the audit"
                  description="The auditor will verify your activity and compliance for the desired role."
                />
                <Step 
                  number={3} 
                  title="Address transmission"
                  description="Once validated, the auditor transmits your wallet address to us."
                />
                <Step 
                  number={4} 
                  title="Credential issuance"
                  description="We create the Verifiable Credential on the XRPL ledger, linked to your wallet."
                />
              </div>
            </div>

            {/* Available credential types */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white/80 mb-4 text-center">
                Available credential types
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(CREDENTIAL_TYPES).map((type) => {
                  const info = CREDENTIAL_INFO[type];
                  return (
                    <div
                      key={type}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3"
                    >
                      <span className="text-2xl">{info.icon}</span>
                      <span className="text-white/80 text-sm">{info.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/")}
                className="px-8 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors font-medium"
              >
                ← Back to home
              </button>
              <button
                onClick={() => router.push("/contact")}
                className="px-8 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
              >
                Contact an auditor
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

/**
 * Step component
 */
function Step({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
        <span className="text-emerald-400 font-bold text-sm">{number}</span>
      </div>
      <div>
        <h4 className="text-white font-medium">{title}</h4>
        <p className="text-white/50 text-sm">{description}</p>
      </div>
    </div>
  );
}
