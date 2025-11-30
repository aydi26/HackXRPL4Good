"use client";

import "./globals.css";
import { WalletProvider } from "../components/providers/WalletProvider";
import { CredentialProvider } from "../components/providers/CredentialProvider";
import ErrorBoundary from "../components/ErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f]">
        <ErrorBoundary>
          <WalletProvider>
            <CredentialProvider>
              {children}
            </CredentialProvider>
          </WalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
