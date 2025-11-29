"use client";

import "./globals.css";
import { WalletProvider } from "../components/providers/WalletProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f]">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
