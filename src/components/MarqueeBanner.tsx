import React from "react";
import { AlertCircle, Lock, CalendarClock } from "lucide-react";

const MarqueeTextClosed = () => (
  <span className="text-red-900 font-semibold text-sm md:text-base flex items-center gap-2 mx-8 shrink-0">
    <Lock className="w-5 h-5 text-red-600 shrink-0" />
    🚫 Team Registration is now CLOSED — No new registrations will be accepted.
  </span>
);

const MarqueeTextDeadline = () => (
  <span className="text-red-900 font-semibold text-sm md:text-base flex items-center gap-2 mx-8 shrink-0">
    <CalendarClock className="w-5 h-5 text-red-600 shrink-0" />
    ⏰ Solution Submission Last Date: <span className="font-black underline underline-offset-2 ml-1">9 April 2026</span> — Submit your solution before the deadline!
  </span>
);

const MarqueeGroup = () => (
  <>
    <MarqueeTextClosed />
    <MarqueeTextDeadline />
    <MarqueeTextClosed />
    <MarqueeTextDeadline />
  </>
);

const MarqueeBanner = () => {
  return (
    <div className="bg-red-100 py-3 overflow-hidden flex z-40 relative shadow-sm border-b border-red-300">
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
