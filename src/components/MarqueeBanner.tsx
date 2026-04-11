import React from "react";
import { ClipboardList } from "lucide-react";

const MarqueeText = () => (
  <span className="text-amber-900 font-semibold text-sm md:text-base flex items-center gap-2 mx-8 shrink-0">
    <ClipboardList className="w-5 h-5 text-amber-600 shrink-0" />
    📋 Scrutiny-selected teams list — Visible till <strong>14th April 2026</strong>.
  </span>
);

const MarqueeGroup = () => (
  <>
    <MarqueeText />
    <MarqueeText />
    <MarqueeText />
    <MarqueeText />
  </>
);

const MarqueeBanner = () => {
  return (
    <div className="bg-amber-100 py-3 overflow-hidden flex z-40 relative shadow-sm border-b border-amber-300">
      {/* 
        This container is exactly twice the width of the content thanks to the duplicates.
        By translating exactly -50% in tailwind.config.ts it loops flawlessly with zero overlap.
      */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-default">
        <MarqueeGroup />
        <MarqueeGroup />
      </div>
    </div>
  );
};

export default MarqueeBanner;
