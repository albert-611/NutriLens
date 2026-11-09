import React from "react";
import { GlowCard } from "./spotlight-card";

export function Default() {
  return (
    <div className="w-screen h-screen flex flex-row items-center justify-center gap-10 custom-cursor bg-slate-950 p-6">
      <GlowCard glowColor="green" size="md">
        <div className="flex flex-col justify-between h-full text-white">
          <h3 className="font-bold text-lg">Green Glow Spotlight</h3>
          <p className="text-xs text-slate-300">Hover your cursor near the card edges to see the green spotlight border glow.</p>
        </div>
      </GlowCard>
      <GlowCard glowColor="green" size="md">
        <div className="flex flex-col justify-between h-full text-white">
          <h3 className="font-bold text-lg">Local Wet Market</h3>
          <p className="text-xs text-slate-300">Savar & Ashulia daily market price grounded records.</p>
        </div>
      </GlowCard>
      <GlowCard glowColor="green" size="md">
        <div className="flex flex-col justify-between h-full text-white">
          <h3 className="font-bold text-lg">Plate Scanner</h3>
          <p className="text-xs text-slate-300">Bangla dish intelligence with dual language aliases.</p>
        </div>
      </GlowCard>
    </div>
  );
}

export default Default;

