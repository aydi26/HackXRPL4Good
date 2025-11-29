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
      label: "Transporter",
      description: "Deliver with traceability",
      bgColor: "rgba(4, 120, 87, 0.6)",
      textColor: "#ecfdf5",
      href: "/transporter"
    }
  ];

  const logo = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
        <span className="text-white font-bold text-sm">C</span>
      </div>
      <span className="text-white font-semibold text-lg tracking-tight">CertiChain</span>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
      {/* GridScan Background - Fixed Layer */}
      <div className="fixed inset-0 z-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#08862cff"
          gridScale={0.1}
          lineStyle="solid"
          lineJitter={0.1}
          enablePost={true}
          bloomIntensity={0}
          bloomThreshold={0}
          bloomSmoothing={0}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
          scanColor="#48dd40"
          scanOpacity={0.4}
          scanDirection="pingpong"
          scanSoftness={2}
          scanGlow={0.5}
          scanPhaseTaper={0.9}
          scanDuration={2.0}
          scanDelay={2.0}
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
