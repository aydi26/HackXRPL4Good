"use client";

import GridScan from "../components/landing/GridScan";
import CardNav from "../components/landing/CardNav";
import HeroSection from "../components/landing/HeroSection";
import RolesSection from "../components/landing/RolesSection";
import Footer from "../components/landing/Footer";
import WalletButton from "../components/landing/WalletButton";

export default function Home() {
  const navItems = [
    {
      label: "Seller",
      description: "Certify your products",
      bgColor: "rgba(6, 78, 59, 0.6)",
      textColor: "#ecfdf5",
      href: "/seller"
    },
    {
      label: "Buyer", 
      description: "Buy certified products",
      bgColor: "rgba(6, 95, 70, 0.6)",
      textColor: "#ecfdf5",
      href: "/buyer"
    },
    {
      label: "Labo",
      description: "Validate products",
      bgColor: "rgba(6, 182, 212, 0.6)",
      textColor: "#ecfeff",
      href: "/labo"
    }
  ];

  const logo = (
    <span className="text-white font-semibold text-lg tracking-tight">CertiChain</span>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* GridScan Background - Fixed Layer */}
      <div className="fixed inset-0 z-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#10b981"
          gridScale={0.1}
          lineStyle="solid"
          lineJitter={0.1}
          enablePost={true}
          bloomIntensity={1.2}
          bloomThreshold={0.3}
          bloomSmoothing={0.9}
          chromaticAberration={0.002}
          noiseIntensity={0.015}
          scanColor="#34d399"
          scanOpacity={0.6}
          scanDirection="pingpong"
          scanSoftness={2.5}
          scanGlow={1.2}
          scanPhaseTaper={0.9}
          scanDuration={6.0}
          scanDelay={4.0}
          enableWebcam={false}
          showPreview={false}
          enableGyro={false}
          scanOnClick={false}
          snapBackDelay={250}
        />
      </div>

      {/* Navigation - Fixed on top */}
      <CardNav 
        items={navItems}
        logo={logo}
        baseColor="rgba(0, 0, 0, 0.6)"
        menuColor="#fff"
        className="backdrop-blur-md"
      />

      {/* Wallet Connector - Positioned separately from CardNav to avoid modal clipping */}
      <div className="fixed top-[2em] right-[5%] z-[100]">
        <WalletButton />
      </div>

      {/* Main Content - Scrollable */}
      <div className="relative z-10 pt-24">
        <HeroSection />
        <RolesSection />
        <Footer />
      </div>
    </div>
  );
}
