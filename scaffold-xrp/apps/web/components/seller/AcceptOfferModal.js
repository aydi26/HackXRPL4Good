"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../providers/WalletProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

/**
 * Modal for accepting an offer and creating/transferring MPToken
 */
export default function AcceptOfferModal({ offer, onClose, onSuccess }) {
  const { walletManager, accountInfo } = useWallet();
  const [step, setStep] = useState(1); // 1: confirm, 2: creating, 3: transferring, 4: success
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAccept = async () => {
    if (!walletManager || !accountInfo?.address) {
      setError("Wallet not connected");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Get MPT creation transaction from backend
      setStep(2);
      console.log("📝 Getting MPT creation transaction...");

      const createResponse = await fetch(`${API_URL}/api/mpt/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerAddress: accountInfo.address,
          nftId: offer.nftId,
          buyerAddress: offer.buyerAddress,
          buyerPublicKey: offer.buyerPublicKey,
          lotNumber: `LOT-${Date.now()}`,
          price: offer.offeredPrice
        })
      });

      if (!createResponse.ok) {
        const errData = await createResponse.json();
        throw new Error(errData.error || "Failed to prepare MPT creation");
      }

      const createData = await createResponse.json();
      console.log("✅ MPT transaction prepared:", createData);

      // Step 2: Sign and submit the create transaction
      console.log("🔐 Signing MPT creation transaction...");
      const createResult = await walletManager.signAndSubmit(createData.createTx);
      
      const createTxResult = createResult.result || createResult;
      if (createTxResult.meta?.TransactionResult !== "tesSUCCESS" &&
          createTxResult.engine_result !== "tesSUCCESS") {
        throw new Error(`MPT creation failed: ${createTxResult.meta?.TransactionResult || createTxResult.engine_result}`);
      }

      // Extract MPT ID from result
      let mptIssuanceId = null;
      const affectedNodes = createTxResult.meta?.AffectedNodes || [];
      for (const node of affectedNodes) {
        if (node.CreatedNode?.LedgerEntryType === "MPTokenIssuance") {
          mptIssuanceId = node.CreatedNode.LedgerIndex;
          break;
        }
      }

      if (!mptIssuanceId) {
        throw new Error("Could not find MPT ID in transaction result");
      }

      console.log("✅ MPT created:", mptIssuanceId);

      // Step 3: Transfer the MPToken to buyer
      setStep(3);
      console.log("📤 Preparing MPT transfer...");

      const transferResponse = await fetch(`${API_URL}/api/mpt/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: accountInfo.address,
          receiverAddress: offer.buyerAddress,
          mptIssuanceId: mptIssuanceId,
          amount: "1"
        })
      });

      if (!transferResponse.ok) {
        const errData = await transferResponse.json();
        throw new Error(errData.error || "Failed to prepare MPT transfer");
      }

      const transferData = await transferResponse.json();

      // Sign and submit transfer
      console.log("🔐 Signing MPT transfer transaction...");
      const transferResult = await walletManager.signAndSubmit(transferData.transaction);
      
      const transferTxResult = transferResult.result || transferResult;
      if (transferTxResult.meta?.TransactionResult !== "tesSUCCESS" &&
          transferTxResult.engine_result !== "tesSUCCESS") {
        throw new Error(`MPT transfer failed: ${transferTxResult.meta?.TransactionResult || transferTxResult.engine_result}`);
      }

      console.log("✅ MPT transferred to buyer");

      // Step 4: Success
      setStep(4);
      setResult({
        mptIssuanceId,
        createTxHash: createTxResult.hash || createResult.hash,
        transferTxHash: transferTxResult.hash || transferResult.hash,
        buyerAddress: offer.buyerAddress
      });

      // Notify parent
      onSuccess?.({
        ...offer,
        mptIssuanceId,
        status: "accepted"
      });

    } catch (err) {
      console.error("Error accepting offer:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0f0f18] border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {step === 4 ? "✅ Offer Accepted!" : "Accept Offer"}
            </h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Confirmation */}
          {step === 1 && (
            <>
              {/* Offer Summary */}
              <div className="p-4 bg-white/5 rounded-xl mb-6">
                <h3 className="text-white font-medium mb-3">Offer Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Product:</span>
                    <span className="text-white">{offer.productType || "Product NFT"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Offered Price:</span>
                    <span className="text-emerald-400 font-bold">{offer.offeredPrice} XRP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Buyer:</span>
                    <span className="text-white font-mono text-xs">
                      {offer.buyerAddress?.slice(0, 8)}...{offer.buyerAddress?.slice(-6)}
                    </span>
                  </div>
                  {offer.nftId && (
                    <div className="flex justify-between">
                      <span className="text-white/50">NFT ID:</span>
                      <span className="text-white font-mono text-xs">
                        {offer.nftId.slice(0, 12)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* What will happen */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6">
                <h4 className="text-emerald-400 font-medium mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  What happens when you accept
                </h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>1. A MPToken will be created for this sale</li>
                  <li>2. The MPToken will be transferred to the buyer</li>
                  <li>3. You'll need to sign 2 transactions in your wallet</li>
                </ul>
              </div>
            </>
          )}

          {/* Step 2-3: Processing */}
          {(step === 2 || step === 3) && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {step === 2 ? (
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  )}
                </div>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">
                {step === 2 ? "Creating MPToken..." : "Transferring to Buyer..."}
              </h3>
              <p className="text-white/50 text-sm">
                {step === 2 
                  ? "Please sign the transaction in your wallet" 
                  : "Almost done! Sign the transfer transaction"
                }
              </p>
              
              {/* Progress steps */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-emerald-500" : "bg-white/20"}`}></div>
                <div className={`w-8 h-0.5 ${step >= 3 ? "bg-emerald-500" : "bg-white/20"}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 3 ? "bg-emerald-500" : "bg-white/20"}`}></div>
                <div className={`w-8 h-0.5 ${step >= 4 ? "bg-emerald-500" : "bg-white/20"}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 4 ? "bg-emerald-500" : "bg-white/20"}`}></div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && result && (
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">
                Sale Completed!
              </h3>
              <p className="text-white/50 text-sm mb-6">
                The MPToken has been created and transferred to the buyer.
              </p>
              
              {/* Transaction details */}
              <div className="p-4 bg-white/5 rounded-xl text-left space-y-2">
                <div>
                  <p className="text-white/50 text-xs">MPT ID</p>
                  <p className="text-white font-mono text-xs break-all">{result.mptIssuanceId}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">Buyer</p>
                  <p className="text-white font-mono text-xs">{result.buyerAddress}</p>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <a
                    href={`https://testnet.xrpl.org/transactions/${result.transferTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 text-sm hover:underline flex items-center gap-1"
                  >
                    View on Explorer
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-red-400 font-medium text-sm">Error</p>
                  <p className="text-red-300/70 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept & Create MPToken
              </button>
            </>
          )}
          
          {step === 4 && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
