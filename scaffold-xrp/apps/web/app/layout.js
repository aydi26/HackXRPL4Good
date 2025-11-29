"use client";

import "./globals.css";
import { WalletProvider } from "../components/providers/WalletProvider";
import { CredentialProvider } from "../components/providers/CredentialProvider";
import { WalletInitializer } from "../components/WalletInitializer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f]">
        <WalletProvider>
          <WalletInitializer>
            <CredentialProvider>
              {children}
            </CredentialProvider>
          </WalletInitializer>
        </WalletProvider>
      </body>
    </html>
  );
}
