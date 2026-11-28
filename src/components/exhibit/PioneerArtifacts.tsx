"use client";

import React from "react";
import { PioneerTheme } from "./ObsidianExhibit";

/* ========================================================================= */
/* 1. ADA LOVELACE — THE ANALYTICAL ENGINE (PION-01)                         */
/* Mechanical calculating columns, milled brass digit wheels, punched cards  */
/* ========================================================================= */

export const AdaAnalyticalEngineArtifact: React.FC<{
  upperAssemblyRef: React.RefObject<HTMLDivElement | null>;
  lowerAssemblyRef: React.RefObject<HTMLDivElement | null>;
  centerHubRef: React.RefObject<HTMLDivElement | null>;
  leftShellRef: React.RefObject<HTMLDivElement | null>;
  rightShellRef: React.RefObject<HTMLDivElement | null>;
  theme: PioneerTheme;
}> = ({ upperAssemblyRef, lowerAssemblyRef, centerHubRef, leftShellRef, rightShellRef, theme }) => {
  return (
    <div className="relative w-[210px] h-[520px] flex flex-col items-center justify-center select-none pointer-events-none">
      {/* 1. UPPER ASSEMBLY: Punched Card Feed Hopper & Transmission Bevel Gears */}
      <div ref={upperAssemblyRef} className="flex flex-col items-center origin-bottom z-35 w-full">
        <svg viewBox="0 0 200 95" className="w-[200px] h-[95px] overflow-visible">
          <defs>
            <linearGradient id="ada-brass-gear" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5F8FA" />
              <stop offset="30%" stopColor={theme.goldHighlight} />
              <stop offset="70%" stopColor={theme.goldTrim} />
              <stop offset="100%" stopColor={theme.bronzeDeep} />
            </linearGradient>
            <linearGradient id="ada-iron-bracket" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1C2430" />
              <stop offset="50%" stopColor="#0B1017" />
              <stop offset="100%" stopColor="#05080C" />
            </linearGradient>
          </defs>

          {/* Cascading Punched Card Chain (Jacquard Loom Tape) */}
          <g transform="translate(30, 2)">
            {/* Card 1 */}
            <rect x="0" y="0" width="140" height="20" rx="1.5" fill="#151A22" stroke={theme.goldTrim} strokeWidth="1" />
            {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 130].map((cx, i) => (
              <rect
                key={i}
                x={cx - 2}
                y={i % 3 === 0 ? "4" : i % 3 === 1 ? "8" : "12"}
                width="4"
                height="4"
                rx="0.5"
                fill={i % 2 === 0 ? theme.goldHighlight : "#04070C"}
                stroke={theme.goldTrim}
                strokeWidth="0.6"
              />
            ))}
            {/* Card Ribbon Fold Link */}
            <line x1="0" y1="20" x2="140" y2="20" stroke={theme.bronzeDeep} strokeWidth="1.2" strokeDasharray="3 2" />
          </g>

          {/* Heavy Cast-Bronze Hopper Feed Housing */}
          <polygon points="18,22 182,22 170,68 30,68" fill="url(#ada-iron-bracket)" stroke={theme.goldTrim} strokeWidth="1.4" />
          <line x1="30" y1="68" x2="170" y2="68" stroke={theme.goldHighlight} strokeWidth="1.8" />

          {/* Victorian Nameplate Plaque */}
          <rect x="42" y="32" width="116" height="15" rx="1" fill="#080D14" stroke={theme.goldTrim} strokeWidth="1" />
          <text x="100" y="42" fill={theme.goldHighlight} fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
            ANALYTICAL ENGINE · 1843
          </text>

          {/* Upper Escapement Transmission Gear Cogs (Left & Right) */}
          <g transform="translate(60, 68)">
            <circle r="16" fill="#0A0E14" stroke="url(#ada-brass-gear)" strokeWidth="2" />
            <circle r="8" fill="url(#ada-brass-gear)" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line key={deg} x1="0" y1="-16" x2="0" y2="-20" stroke={theme.goldHighlight} strokeWidth="2" transform={`rotate(${deg})`} />
            ))}
          </g>

          <g transform="translate(140, 68)">
            <circle r="16" fill="#0A0E14" stroke="url(#ada-brass-gear)" strokeWidth="2" />
            <circle r="8" fill="url(#ada-brass-gear)" />
            {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
              <line key={deg} x1="0" y1="-16" x2="0" y2="-20" stroke={theme.goldHighlight} strokeWidth="2" transform={`rotate(${deg})`} />
            ))}
          </g>

          {/* Central Meshing Bevel Pinion */}
          <circle cx="100" cy="68" r="9" fill="#04070C" stroke={theme.goldTrim} strokeWidth="1.5" />
          <circle cx="100" cy="68" r="3" fill={theme.goldHighlight} />
        </svg>

        {/* Transmission Shaft with Bearing Collars */}
        <div
          className="w-[180px] h-[18px] bg-gradient-to-r from-[#0C121A] via-[#1E293B] to-[#0C121A] border-y flex items-center justify-around px-3 my-0.5 shadow-md"
          style={{ borderColor: `${theme.goldTrim}99` }}
        >
          {[20, 60, 100, 140, 160].map((x) => (
            <div
              key={x}
              className="w-2.5 h-3.5 rounded-xs flex items-center justify-center border"
              style={{ backgroundColor: theme.bronzeDeep, borderColor: theme.goldTrim }}
            >
              <div className="w-1 h-1 rounded-full bg-[#F5F8FA]" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. CENTER HUB: Master Analytical Digit Gear Wheel (Horizon Rotary Anchor) */}
      <div
        ref={centerHubRef}
        className="relative w-16 h-12 rounded-full border-2 bg-[#04070C] z-45 flex items-center justify-center cursor-pointer my-0.5 overflow-hidden"
        style={{
          borderColor: theme.goldTrim,
          boxShadow: `0 0 28px ${theme.accentColor}d8`,
        }}
      >
        <div
          className="w-11 h-11 rounded-full border border-dashed flex items-center justify-center bg-[#0B1018]"
          style={{ borderColor: `${theme.goldHighlight}cc` }}
        >
          <div
            className="w-7 h-7 rounded-full border flex items-center justify-center bg-[#151D28]"
            style={{ borderColor: theme.goldTrim }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: theme.goldHighlight, boxShadow: `0 0 12px ${theme.goldHighlight}` }}
            />
          </div>
        </div>
        {/* 12-Hour Digit Escapement Ticks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <div
            key={deg}
            className="absolute w-[1.5px] h-2 pointer-events-none origin-bottom"
            style={{ backgroundColor: theme.goldHighlight, transform: `rotate(${deg}deg) translateY(-14px)` }}
          />
        ))}
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none" style={{ backgroundColor: `${theme.goldTrim}cc` }} />
        <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-[1px] pointer-events-none" style={{ backgroundColor: `${theme.goldTrim}cc` }} />
      </div>

      {/* 3. BILATERAL CALCULATING COLUMNS (The Store & The Mill) */}
      <div className="relative w-[184px] h-[196px] flex justify-between z-35 my-0.5">
        {/* Left Column Shell: THE STORE (Vertical Memory Storage Columns) */}
        <div
          ref={leftShellRef}
          className="w-[90px] h-[196px] flex flex-col justify-between overflow-hidden shadow-2xl origin-left bg-[#0A0E15] border-l-2 border-t border-b"
          style={{ borderColor: `${theme.goldTrim}b3` }}
        >
          {/* Column Header */}
          <div
            className="py-1 px-1.5 bg-[#121924] border-b flex items-center justify-between"
            style={{ borderColor: `${theme.goldTrim}66` }}
          >
            <span className="text-[8px] font-mono font-black tracking-widest uppercase" style={{ color: theme.goldHighlight }}>
              THE STORE
            </span>
            <span className="text-[7px] font-mono" style={{ color: theme.secondaryAccent }}>MEM-COL</span>
          </div>

          {/* 5 Stacked Milled Digit Gear Wheels with Numbered Dials */}
          <div className="flex-1 flex flex-col justify-around py-1 px-1.5 bg-gradient-to-r from-[#070B10] to-[#0E1520]">
            {[
              { num: 9, varName: "V₁", teeth: "|||||" },
              { num: 4, varName: "V₂", teeth: "||||" },
              { num: 1, varName: "V₃", teeth: "|||" },
              { num: 0, varName: "V₄", teeth: "|||||" },
              { num: 7, varName: "V₅", teeth: "||||" },
            ].map((wheel, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-y py-0.5 bg-[#111722] px-1 rounded-xs"
                style={{ borderColor: `${theme.bronzeDeep}80` }}
              >
                <span className="text-[7px] font-mono font-bold" style={{ color: theme.goldHighlight }}>{wheel.varName}</span>
                {/* Milled Digit Gear Cog Surface */}
                <div
                  className="w-10 h-4 rounded-xs border border-white/25 flex items-center justify-center shadow-inner"
                  style={{ background: `linear-gradient(90deg, ${theme.bronzeDeep}, ${theme.goldHighlight}, ${theme.bronzeDeep})` }}
                >
                  <span className="text-[9px] font-mono text-[#04070C] font-black tracking-wider">
                    [ {wheel.num} ]
                  </span>
                </div>
                <div
                  className="w-2 h-2 rounded-full border bg-black flex items-center justify-center"
                  style={{ borderColor: `${theme.goldTrim}99` }}
                >
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.goldHighlight }} />
                </div>
              </div>
            ))}
          </div>

          <div
            className="py-0.5 bg-[#141C28] text-center border-t"
            style={{ borderColor: `${theme.goldTrim}66` }}
          >
            <span className="text-[7px] font-mono text-slate-300 tracking-wider">50-DIGIT REGISTER</span>
          </div>
        </div>

        {/* Right Column Shell: THE MILL (Arithmetic Calculating Unit) */}
        <div
          ref={rightShellRef}
          className="w-[90px] h-[196px] flex flex-col justify-between overflow-hidden shadow-2xl origin-right bg-[#0A0E15] border-r-2 border-t border-b"
          style={{ borderColor: `${theme.goldTrim}b3` }}
        >
          {/* Column Header */}
          <div
            className="py-1 px-1.5 bg-[#121924] border-b flex items-center justify-between"
            style={{ borderColor: `${theme.goldTrim}66` }}
          >
            <span className="text-[7px] font-mono" style={{ color: theme.secondaryAccent }}>OP-MILL</span>
            <span className="text-[8px] font-mono font-black tracking-widest uppercase" style={{ color: theme.goldHighlight }}>
              THE MILL
            </span>
          </div>

          {/* Arithmetic Operation Racks & Transfer Pinions */}
          <div className="flex-1 flex flex-col justify-around py-1 px-1.5 bg-gradient-to-l from-[#070B10] to-[#0E1520]">
            {[
              { op: "[×] MULT", stat: "ACTIVE", cycle: "C-01" },
              { op: "[÷] DIV", stat: "READY", cycle: "C-02" },
              { op: "[+] ADD", stat: "ACCUM", cycle: "C-03" },
              { op: "[-] SUB", stat: "BORROW", cycle: "C-04" },
              { op: "[=] RES", stat: "BERNOULLI", cycle: "NOTE-G" },
            ].map((rack, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-y py-0.5 bg-[#111722] px-1 rounded-xs"
                style={{ borderColor: `${theme.bronzeDeep}80` }}
              >
                <div
                  className="w-2 h-2 rounded-full border bg-black flex items-center justify-center"
                  style={{ borderColor: `${theme.goldTrim}99` }}
                >
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.secondaryAccent }} />
                </div>
                {/* Steel Calculating Rack */}
                <div
                  className="w-11 h-4 bg-gradient-to-r from-[#1E293B] via-[#334155] to-[#1E293B] rounded-xs border flex items-center justify-center"
                  style={{ borderColor: `${theme.goldTrim}4d` }}
                >
                  <span className="text-[7.5px] font-mono font-bold tracking-tight" style={{ color: theme.goldHighlight }}>
                    {rack.op}
                  </span>
                </div>
                <span className="text-[6.5px] font-mono text-slate-400">{rack.cycle}</span>
              </div>
            ))}
          </div>

          <div
            className="py-0.5 bg-[#141C28] text-center border-t"
            style={{ borderColor: `${theme.goldTrim}66` }}
          >
            <span className="text-[7px] font-mono text-slate-300 tracking-wider">VARIABLE CYCLER</span>
          </div>
        </div>
      </div>

      {/* 4. LOWER ASSEMBLY: Heavy Cast-Metal Plinth & Interlocking Escapement */}
      <div ref={lowerAssemblyRef} className="flex flex-col items-center origin-top z-35 w-full">
        <svg viewBox="0 0 200 95" className="w-[200px] h-[95px] overflow-visible">
          {/* Lower Pinion Coupling Racks */}
          <line x1="20" y1="8" x2="180" y2="8" stroke={theme.goldTrim} strokeWidth="1.5" />
          {[30, 55, 80, 100, 120, 145, 170].map((x) => (
            <circle key={x} cx={x} cy="8" r="3.5" fill="#04070C" stroke={theme.goldHighlight} strokeWidth="1" />
          ))}

          {/* Heavy Inverted Plinth Foundation Housing */}
          <polygon points="26,14 174,14 190,58 10,58" fill="url(#ada-iron-bracket)" stroke={theme.bronzeDeep} strokeWidth="1.8" />
          <line x1="16" y1="24" x2="184" y2="24" stroke={theme.goldTrim} strokeWidth="1.2" />

          {/* Stepped Gear Escapement Teeth */}
          <polygon points="40,58 52,74 76,74 88,58 112,58 124,74 148,74 160,58" fill="#0A0E14" stroke={theme.goldTrim} strokeWidth="1.5" />

          {/* Base Foundation Footing with Hand-Crank Axle Mount */}
          <rect x="30" y="74" width="140" height="18" rx="2" fill="#05080C" stroke={theme.goldTrim} strokeWidth="1.2" />
          <circle cx="100" cy="83" r="6" fill={theme.bronzeDeep} stroke={theme.goldHighlight} strokeWidth="1.2" />
          <circle cx="100" cy="83" r="2" fill="#F5F8FA" />
          <text x="100" y="90" fill={theme.goldTrim} fontSize="5.5" fontFamily="monospace" textAnchor="middle">
            DRIVE AXLE
          </text>
        </svg>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 2. GRACE HOPPER — THE COMPILER APPARATUS (PION-02)                        */
/* UNIVAC I magnetic tape transport console, twin spinning reels, vacuum bays*/
/* ========================================================================= */

export const GraceCompilerApparatusArtifact: React.FC<{
  upperAssemblyRef: React.RefObject<HTMLDivElement | null>;
  lowerAssemblyRef: React.RefObject<HTMLDivElement | null>;
  centerHubRef: React.RefObject<HTMLDivElement | null>;
  leftShellRef: React.RefObject<HTMLDivElement | null>;
  rightShellRef: React.RefObject<HTMLDivElement | null>;
  theme: PioneerTheme;
}> = ({ upperAssemblyRef, lowerAssemblyRef, centerHubRef, leftShellRef, rightShellRef, theme }) => {
  return (
    <div className="relative w-[210px] h-[520px] flex flex-col items-center justify-center select-none pointer-events-none">
      {/* 1. UPPER ASSEMBLY: Magnetic Supply Tape Reel with 3 Iconic Spoke Cutouts */}
      <div ref={upperAssemblyRef} className="flex flex-col items-center origin-bottom z-35 w-full">
        <svg viewBox="0 0 200 115" className="w-[200px] h-[115px] overflow-visible">
          <defs>
            <radialGradient id="univac-reel-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1C2840" />
              <stop offset="60%" stopColor="#0B1320" />
              <stop offset="90%" stopColor="#050810" />
              <stop offset="100%" stopColor={theme.goldTrim} />
            </radialGradient>
          </defs>

          {/* Tape Console Upper Bridge Header */}
          <rect x="25" y="4" width="150" height="14" rx="2" fill="#0B1320" stroke={theme.goldTrim} strokeWidth="1" />
          <text x="100" y="14" fill={theme.secondaryAccent} fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
            UNIVAC I · MAGNETIC TAPE SERVO
          </text>

          {/* Big Circular Supply Reel (120px diameter) */}
          <g transform="translate(100, 68)">
            {/* Outer Rim with Theme Trim */}
            <circle r="46" fill="url(#univac-reel-grad)" stroke={theme.goldTrim} strokeWidth="2" />
            {/* Dark Magnetic Tape Wound Band */}
            <circle r="41" fill="none" stroke={theme.bronzeDeep} strokeWidth="6" />
            <circle r="36" fill="#080E18" stroke={theme.secondaryAccent} strokeWidth="0.8" strokeDasharray="4 3" />

            {/* 3 Iconic Circular Spoke Cutouts of 1950s Mainframe Tape Drives */}
            {[0, 120, 240].map((deg) => (
              <circle
                key={deg}
                cx={22 * Math.cos((deg * Math.PI) / 180)}
                cy={22 * Math.sin((deg * Math.PI) / 180)}
                r="11"
                fill="#04070C"
                stroke={theme.goldTrim}
                strokeWidth="1.4"
              />
            ))}

            {/* Center Reel Lock Nut */}
            <circle r="12" fill="#0F172A" stroke={theme.goldHighlight} strokeWidth="1.6" />
            <circle r="5" fill={theme.goldHighlight} />
          </g>

          {/* Tape Tension Guides Feeding Downward */}
          <path d="M 54,68 L 54,110 L 80,110" stroke={theme.secondaryAccent} strokeWidth="1.5" fill="none" />
          <path d="M 146,68 L 146,110 L 120,110" stroke={theme.secondaryAccent} strokeWidth="1.5" fill="none" />
          <circle cx="54" cy="110" r="3" fill={theme.goldTrim} />
          <circle cx="146" cy="110" r="3" fill={theme.goldTrim} />
        </svg>
      </div>

      {/* 2. CENTER HUB: Magnetic Read/Write Head Assembly & A-0 Gateway */}
      <div
        ref={centerHubRef}
        className="relative w-16 h-12 rounded-full border-2 bg-[#04070C] z-45 flex items-center justify-center cursor-pointer my-0.5 overflow-hidden"
        style={{ borderColor: theme.goldTrim, boxShadow: `0 0 28px ${theme.accentColor}cc` }}
      >
        <div className="w-11 h-11 rounded-full border border-dashed flex items-center justify-center bg-[#070D18]" style={{ borderColor: `${theme.secondaryAccent}cc` }}>
          <div className="w-7 h-7 rounded-xs border flex items-center justify-center bg-[#0D1628]" style={{ borderColor: theme.goldTrim }}>
            <span className="text-[8px] font-mono font-black" style={{ color: theme.goldHighlight }}>A-0</span>
          </div>
        </div>
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none" style={{ backgroundColor: `${theme.secondaryAccent}cc` }} />
        <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-[1px] pointer-events-none" style={{ backgroundColor: `${theme.secondaryAccent}cc` }} />
      </div>

      {/* 3. BILATERAL VACUUM BUFFER COLUMNS */}
      <div className="relative w-[184px] h-[196px] flex justify-between z-35 my-0.5">
        {/* Left Vacuum Column: Instruction Buffer & Subroutine Vault */}
        <div
          ref={leftShellRef}
          className="w-[90px] h-[196px] flex flex-col justify-between overflow-hidden shadow-2xl origin-left bg-[#050A12] border-l-2 border-t border-b"
          style={{ borderColor: `${theme.goldTrim}b3` }}
        >
          {/* Glass Vacuum Tube Framing */}
          <div className="py-1 px-1.5 bg-[#0C1524] border-b flex items-center justify-between" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[8px] font-mono font-bold" style={{ color: theme.secondaryAccent }}>VACUUM-A</span>
            <span className="text-[7px] font-mono font-bold" style={{ color: theme.goldHighlight }}>29.2 inHg</span>
          </div>

          {/* Looping Tape Buffer in Glass Column */}
          <div className="flex-1 relative flex flex-col justify-around py-1 px-1.5 bg-gradient-to-r from-[#03060A] to-[#0A1220]">
            {/* Visual Tape Loop */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 90 150">
              <path d="M 20,0 L 20,110 Q 45,145 70,110 L 70,0" stroke={theme.secondaryAccent} strokeWidth="2.5" fill="none" opacity="0.85" />
              <path d="M 20,0 L 20,110 Q 45,145 70,110 L 70,0" stroke={theme.goldTrim} strokeWidth="1" fill="none" strokeDasharray="3 3" />
            </svg>

            {/* Instruction Registry Labels */}
            {["CALL_SUB_01", "FETCH_PARAM", "RESOLVE_REL", "INLINE_CODE", "EXEC_LOOP"].map((code, idx) => (
              <div key={idx} className="relative z-10 flex items-center justify-between text-[7px] font-mono py-0.5 px-1 bg-[#09111C]/80 border border-white/5 rounded-xs">
                <span className="font-bold" style={{ color: theme.goldHighlight }}>{code}</span>
                <span className="text-[6.5px]" style={{ color: theme.secondaryAccent }}>0x0{idx * 4}</span>
              </div>
            ))}
          </div>

          <div className="py-0.5 bg-[#0C1524] text-center border-t" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono text-slate-300">A-0 SUBROUTINE BUS</span>
          </div>
        </div>

        {/* Right Vacuum Column: Binary Symbolic Buffer & FLOW-MATIC Registry */}
        <div
          ref={rightShellRef}
          className="w-[90px] h-[196px] flex flex-col justify-between overflow-hidden shadow-2xl origin-right bg-[#050A12] border-r-2 border-t border-b"
          style={{ borderColor: `${theme.goldTrim}b3` }}
        >
          <div className="py-1 px-1.5 bg-[#0C1524] border-b flex items-center justify-between" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono font-bold" style={{ color: theme.goldHighlight }}>29.2 inHg</span>
            <span className="text-[8px] font-mono font-bold" style={{ color: theme.secondaryAccent }}>VACUUM-B</span>
          </div>

          <div className="flex-1 relative flex flex-col justify-around py-1 px-1.5 bg-gradient-to-l from-[#03060A] to-[#0A1220]">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 90 150">
              <path d="M 20,0 L 20,110 Q 45,145 70,110 L 70,0" stroke={theme.secondaryAccent} strokeWidth="2.5" fill="none" opacity="0.85" />
              <path d="M 20,0 L 20,110 Q 45,145 70,110 L 70,0" stroke={theme.goldTrim} strokeWidth="1" fill="none" strokeDasharray="3 3" />
            </svg>

            {["REG_ADDR_A", "TAPE_SEEK", "BYTE_PUNCH", "FLOW_MATIC", "COBOL_ROOT"].map((code, idx) => (
              <div key={idx} className="relative z-10 flex items-center justify-between text-[7px] font-mono py-0.5 px-1 bg-[#09111C]/80 border border-white/5 rounded-xs">
                <span className="text-[6.5px]" style={{ color: theme.secondaryAccent }}>CH_{idx}</span>
                <span className="font-bold" style={{ color: theme.goldHighlight }}>{code}</span>
              </div>
            ))}
          </div>

          <div className="py-0.5 bg-[#0C1524] text-center border-t" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono text-slate-300">SYMBOLIC TRANSLATION</span>
          </div>
        </div>
      </div>

      {/* 4. LOWER ASSEMBLY: Lower Magnetic Take-up Tape Reel */}
      <div ref={lowerAssemblyRef} className="flex flex-col items-center origin-top z-35 w-full">
        <svg viewBox="0 0 200 115" className="w-[200px] h-[115px] overflow-visible">
          {/* Tape Tension Rollers leading from columns into bottom reel */}
          <path d="M 80,5 L 54,5 L 54,45" stroke={theme.secondaryAccent} strokeWidth="1.5" fill="none" />
          <path d="M 120,5 L 146,5 L 146,45" stroke={theme.secondaryAccent} strokeWidth="1.5" fill="none" />
          <circle cx="54" cy="5" r="3" fill={theme.goldTrim} />
          <circle cx="146" cy="5" r="3" fill={theme.goldTrim} />

          {/* Lower Take-Up Reel (Matching 120px diameter) */}
          <g transform="translate(100, 48)">
            <circle r="46" fill="url(#univac-reel-grad)" stroke={theme.goldTrim} strokeWidth="2" />
            <circle r="41" fill="none" stroke={theme.bronzeDeep} strokeWidth="6" />
            <circle r="36" fill="#080E18" stroke={theme.secondaryAccent} strokeWidth="0.8" strokeDasharray="4 3" />

            {[60, 180, 300].map((deg) => (
              <circle
                key={deg}
                cx={22 * Math.cos((deg * Math.PI) / 180)}
                cy={22 * Math.sin((deg * Math.PI) / 180)}
                r="11"
                fill="#04070C"
                stroke={theme.goldTrim}
                strokeWidth="1.4"
              />
            ))}

            <circle r="12" fill="#0F172A" stroke={theme.goldHighlight} strokeWidth="1.6" />
            <circle r="5" fill={theme.goldHighlight} />
          </g>

          {/* Console Foundation Footing */}
          <rect x="25" y="98" width="150" height="15" rx="2" fill="#060A12" stroke={theme.goldTrim} strokeWidth="1.2" />
          <text x="100" y="108" fill={theme.goldTrim} fontSize="6" fontFamily="monospace" textAnchor="middle">
            HOPPER A-0 SERVO UNIT
          </text>
        </svg>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 3. KATHERINE JOHNSON — THE ORBITAL INSTRUMENT (PION-03)                   */
/* Celestial Armillary Sphere, Polar Gyro Gimbals, Earth Trajectory Globe     */
/* ========================================================================= */

export const KatherineOrbitalInstrumentArtifact: React.FC<{
  upperAssemblyRef: React.RefObject<HTMLDivElement | null>;
  lowerAssemblyRef: React.RefObject<HTMLDivElement | null>;
  centerHubRef: React.RefObject<HTMLDivElement | null>;
  leftShellRef: React.RefObject<HTMLDivElement | null>;
  rightShellRef: React.RefObject<HTMLDivElement | null>;
  theme: PioneerTheme;
}> = ({ upperAssemblyRef, lowerAssemblyRef, centerHubRef, leftShellRef, rightShellRef, theme }) => {
  return (
    <div className="relative w-[210px] h-[520px] flex flex-col items-center justify-center select-none pointer-events-none">
      {/* 1. UPPER ASSEMBLY: Polar Zenith Arch & Inclination Sighting Vernier */}
      <div ref={upperAssemblyRef} className="flex flex-col items-center origin-bottom z-35 w-full">
        <svg viewBox="0 0 200 100" className="w-[200px] h-[100px] overflow-visible">
          {/* Zenith Sighting Telescope & Polar Axis */}
          <line x1="100" y1="2" x2="100" y2="34" stroke={theme.goldHighlight} strokeWidth="2.5" />
          <circle cx="100" cy="4" r="3.5" fill="#FFF4D9" stroke={theme.goldTrim} strokeWidth="1" />

          {/* Sighting Crosshairs at Polar Zenith */}
          <line x1="90" y1="12" x2="110" y2="12" stroke={theme.secondaryAccent} strokeWidth="1.5" />
          <circle cx="100" cy="12" r="5" fill="none" stroke={theme.secondaryAccent} strokeWidth="1" />

          {/* Grand Polar Celestial Inclination Gimbal Ring */}
          <path d="M 15,85 Q 100,10 185,85" stroke={theme.goldTrim} strokeWidth="3" fill="none" />
          <path d="M 28,87 Q 100,24 172,87" stroke={theme.accentColor} strokeWidth="1.2" strokeDasharray="4 3" fill="none" />

          {/* Degree Calibration Ticks (0° to 180° Celestial Arc) */}
          {[40, 55, 70, 85, 100, 115, 130, 145, 160].map((x) => (
            <line key={x} x1={x} y1="46" x2={x} y2="54" stroke={theme.goldHighlight} strokeWidth="1.2" />
          ))}

          {/* Nameplate Plaque */}
          <rect x="45" y="66" width="110" height="15" rx="1.5" fill="#080D14" stroke={theme.goldTrim} strokeWidth="1" />
          <text x="100" y="77" fill={theme.goldHighlight} fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
            PROJECT MERCURY · NASA 1962
          </text>
        </svg>
      </div>

      {/* 2. CENTER HUB: 3D Earth Celestial Sphere with Friendship 7 Capsule Orbit */}
      <div
        ref={centerHubRef}
        className="relative w-16 h-12 rounded-full border-2 bg-[#04070C] z-45 flex items-center justify-center cursor-pointer my-0.5 overflow-hidden"
        style={{ borderColor: theme.goldTrim, boxShadow: `0 0 30px ${theme.accentColor}cc` }}
      >
        <div
          className="w-11 h-11 rounded-full border border-dashed flex items-center justify-center bg-[#0B0712]"
          style={{ borderColor: theme.secondaryAccent }}
        >
          {/* Orbital Globe Sphere */}
          <div
            className="relative w-8 h-8 rounded-full border flex items-center justify-center shadow-inner"
            style={{
              background: `linear-gradient(45deg, ${theme.bronzeDeep}, ${theme.accentColor}, ${theme.goldHighlight})`,
              borderColor: theme.goldHighlight,
            }}
          >
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/60" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 border border-white/45 rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full z-10" style={{ backgroundColor: theme.goldHighlight, boxShadow: `0 0 8px ${theme.goldHighlight}` }} />
          </div>
        </div>
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none" style={{ backgroundColor: `${theme.secondaryAccent}cc` }} />
        <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-[1px] pointer-events-none" style={{ backgroundColor: `${theme.secondaryAccent}cc` }} />
      </div>

      {/* 3. BILATERAL ORBITAL FLIGHT VECTOR RINGS */}
      <div className="relative w-[184px] h-[196px] flex justify-between z-35 my-0.5">
        {/* Left Ring: Mercury-Atlas 6 Orbital Insertion Vector */}
        <div
          ref={leftShellRef}
          className="w-[90px] h-[196px] flex flex-col justify-between overflow-hidden shadow-2xl origin-left bg-[#0C070E] border-l-2 border-t border-b"
          style={{ borderColor: `${theme.goldTrim}b3` }}
        >
          <div className="py-1 px-1.5 bg-[#160C1A] border-b flex items-center justify-between" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[8px] font-mono font-bold" style={{ color: theme.secondaryAccent }}>MA-6 ORBIT</span>
            <span className="text-[7px] font-mono" style={{ color: theme.goldHighlight }}>INC: 32.5°</span>
          </div>

          <div className="flex-1 flex flex-col justify-around py-1 px-1.5 bg-gradient-to-r from-[#08040A] to-[#140A17]">
            {[
              { label: "V_0 INJECT", val: "7.84 km/s" },
              { label: "APOGEE", val: "267.4 km" },
              { label: "PERIGEE", val: "161.0 km" },
              { label: "PERIOD", val: "88.5 min" },
              { label: "AZIMUTH", val: "72.05° NOM" },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between text-[7.5px] font-mono py-0.5 px-1 bg-[#140A16] border rounded-xs" style={{ borderColor: `${theme.goldTrim}25` }}>
                <span className="text-slate-300">{stat.label}</span>
                <span className="font-bold" style={{ color: theme.secondaryAccent }}>{stat.val}</span>
              </div>
            ))}
          </div>

          <div className="py-0.5 bg-[#160C1A] text-center border-t" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono text-slate-300">FRIENDSHIP 7 TRAJECTORY</span>
          </div>
        </div>

        {/* Right Ring: Apollo 11 Lunar Return Corridor Vector */}
        <div
          ref={rightShellRef}
          className="w-[90px] h-[196px] flex flex-col justify-between overflow-hidden shadow-2xl origin-right bg-[#0C070E] border-r-2 border-t border-b"
          style={{ borderColor: `${theme.goldTrim}b3` }}
        >
          <div className="py-1 px-1.5 bg-[#160C1A] border-b flex items-center justify-between" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono" style={{ color: theme.goldHighlight }}>γ = -6.5°</span>
            <span className="text-[8px] font-mono font-bold" style={{ color: theme.secondaryAccent }}>LUNAR RETURN</span>
          </div>

          <div className="flex-1 flex flex-col justify-around py-1 px-1.5 bg-gradient-to-l from-[#08040A] to-[#140A17]">
            {[
              { label: "CORRIDOR", val: "± 1.0° GATE" },
              { label: "TLI BURNOUT", val: "10.84 km/s" },
              { label: "RE-ENTRY", val: "40,000 km/h" },
              { label: "DESCENT", val: "MANUAL CHECK" },
              { label: "STATUS", val: "SPLASHDOWN" },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between text-[7.5px] font-mono py-0.5 px-1 bg-[#140A16] border rounded-xs" style={{ borderColor: `${theme.goldTrim}25` }}>
                <span className="font-bold" style={{ color: theme.goldHighlight }}>{stat.val}</span>
                <span className="text-slate-300">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="py-0.5 bg-[#160C1A] text-center border-t" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono text-slate-300">PRECISION RE-ENTRY MATRIX</span>
          </div>
        </div>
      </div>

      {/* 4. LOWER ASSEMBLY: Celestial Nadir Mounting Cradle & Gimbal Tripod */}
      <div ref={lowerAssemblyRef} className="flex flex-col items-center origin-top z-35 w-full">
        <svg viewBox="0 0 200 100" className="w-[200px] h-[100px] overflow-visible">
          {/* Lower Gimbal Cradle Arc */}
          <path d="M 15,15 Q 100,90 185,15" stroke={theme.goldTrim} strokeWidth="3" fill="none" />
          <path d="M 28,13 Q 100,76 172,13" stroke={theme.accentColor} strokeWidth="1.2" strokeDasharray="4 3" fill="none" />

          {/* Sighting Nadir Counterweight & Azimuth Gimbal Bearings */}
          <circle cx="100" cy="55" r="7" fill="#080D14" stroke={theme.goldHighlight} strokeWidth="1.8" />
          <circle cx="100" cy="55" r="2.5" fill="#FFF4D9" />

          {/* Heavy Brass Tripod Mounting Base */}
          <polygon points="45,65 155,65 175,90 25,90" fill="#060A10" stroke={theme.goldTrim} strokeWidth="1.4" />
          <text x="100" y="82" fill={theme.goldHighlight} fontSize="6.5" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
            CELESTIAL NAVIGATION GIMBAL
          </text>
        </svg>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 4. RADIA PERLMAN — THE SPANNING TREE NETWORK (PION-05)                    */
/* Hexagonal Bridge Mesh, Active Loop-Free Topology, Root Bridge Priority CPU */
/* ========================================================================= */

export const RadiaSpanningTreeArtifact: React.FC<{
  upperAssemblyRef: React.RefObject<HTMLDivElement | null>;
  lowerAssemblyRef: React.RefObject<HTMLDivElement | null>;
  centerHubRef: React.RefObject<HTMLDivElement | null>;
  leftShellRef: React.RefObject<HTMLDivElement | null>;
  rightShellRef: React.RefObject<HTMLDivElement | null>;
  theme: PioneerTheme;
}> = ({ upperAssemblyRef, lowerAssemblyRef, centerHubRef, leftShellRef, rightShellRef, theme }) => {
  return (
    <div className="relative w-[210px] h-[520px] flex flex-col items-center justify-center select-none pointer-events-none">
      {/* 1. UPPER ASSEMBLY: Hexagonal Bridge Cluster Apex with Packet Routes */}
      <div ref={upperAssemblyRef} className="flex flex-col items-center origin-bottom z-35 w-full">
        <svg viewBox="0 0 200 100" className="w-[200px] h-[100px] overflow-visible">
          {/* Hexagonal Bridge Network Framework */}
          <polygon points="100,8 175,45 175,95 25,95 25,45" fill="#06120D" stroke={theme.goldTrim} strokeWidth="1.8" />

          {/* Active Spanning Tree Forwarding Links (Teal Solid) */}
          <line x1="100" y1="8" x2="45" y2="70" stroke="#14B8A6" strokeWidth="2.5" />
          <line x1="100" y1="8" x2="155" y2="70" stroke="#14B8A6" strokeWidth="2.5" />

          {/* Redundant Loop Circuit (Blocked Path) */}
          <line x1="45" y1="70" x2="155" y2="70" stroke={theme.secondaryAccent} strokeWidth="1.5" strokeDasharray="5 3" />
          <circle cx="100" cy="70" r="7" fill="#04070C" stroke={theme.goldHighlight} strokeWidth="1.5" />
          <line x1="96" y1="66" x2="104" y2="74" stroke={theme.goldHighlight} strokeWidth="1.5" />
          <line x1="96" y1="74" x2="104" y2="66" stroke={theme.goldHighlight} strokeWidth="1.5" />

          {/* Bridge Apex Nodes with LEDs */}
          <circle cx="100" cy="8" r="6" fill="#0B2017" stroke={theme.goldHighlight} strokeWidth="2" />
          <circle cx="100" cy="8" r="2" fill={theme.secondaryAccent} />

          <circle cx="45" cy="70" r="5" fill="#0B2017" stroke={theme.goldTrim} strokeWidth="1.5" />
          <circle cx="155" cy="70" r="5" fill="#0B2017" stroke={theme.goldTrim} strokeWidth="1.5" />

          {/* Nameplate Header */}
          <rect x="40" y="80" width="120" height="15" rx="1.5" fill="#040906" stroke={theme.goldTrim} strokeWidth="1" />
          <text x="100" y="90" fill={theme.secondaryAccent} fontSize="6.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
            IEEE 802.1D · SPANNING TREE
          </text>
        </svg>
      </div>

      {/* 2. CENTER HUB: Root Bridge Priority Diamond Processor */}
      <div
        ref={centerHubRef}
        className="relative w-16 h-12 rounded-full border-2 bg-[#04070C] z-45 flex items-center justify-center cursor-pointer my-0.5 overflow-hidden"
        style={{ borderColor: theme.goldTrim, boxShadow: `0 0 30px ${theme.accentColor}cc` }}
      >
        <div className="w-11 h-11 rounded-full border border-dashed flex items-center justify-center bg-[#041418]" style={{ borderColor: theme.secondaryAccent }}>
          {/* Diamond Root Bridge Core */}
          <div
            className="w-7 h-7 rotate-45 border-2 bg-[#082428] flex items-center justify-center"
            style={{ borderColor: theme.goldHighlight, boxShadow: `0 0 12px ${theme.accentColor}` }}
          >
            <span className="-rotate-45 text-[7px] font-mono font-black" style={{ color: theme.goldHighlight }}>ROOT</span>
          </div>
        </div>
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none" style={{ backgroundColor: `${theme.secondaryAccent}cc` }} />
        <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-[1px] pointer-events-none" style={{ backgroundColor: `${theme.secondaryAccent}cc` }} />
      </div>

      {/* 3. BILATERAL SWITCH PORT FABRICS (Forwarding Ports vs Blocked Ports) */}
      <div className="relative w-[184px] h-[196px] flex justify-between z-35 my-0.5">
        {/* Left Switch Bank: Active Forwarding Bridge Ports */}
        <div
          ref={leftShellRef}
          className="w-[90px] h-[196px] flex flex-col justify-between overflow-hidden shadow-2xl origin-left bg-[#040E0D] border-l-2 border-t border-b"
          style={{ borderColor: `${theme.goldTrim}b3` }}
        >
          <div className="py-1 px-1.5 bg-[#082022] border-b flex items-center justify-between" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[8px] font-mono font-bold" style={{ color: theme.secondaryAccent }}>FORWARDING</span>
            <span className="text-[7px] font-mono" style={{ color: theme.goldHighlight }}>ACTIVE</span>
          </div>

          {/* 5 Forwarding RJ-45 Bridge Ports with Activity LEDs */}
          <div className="flex-1 flex flex-col justify-around py-1 px-1.5 bg-gradient-to-r from-[#020808] to-[#071B1E]">
            {[
              { port: "P1: ROOT", state: "FWD", cost: "COST: 4" },
              { port: "P2: DESIG", state: "FWD", cost: "COST: 4" },
              { port: "P3: DESIG", state: "FWD", cost: "COST: 19" },
              { port: "BPDU_TX", state: "HELLO", cost: "2.0 SEC" },
              { port: "TOPO_CHG", state: "SYNC", cost: "0 STORM" },
            ].map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-[7.5px] font-mono py-0.5 px-1 bg-[#081C1E] border rounded-xs" style={{ borderColor: `${theme.goldTrim}33` }}>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.secondaryAccent }} />
                  <span className="font-bold" style={{ color: theme.goldHighlight }}>{p.port}</span>
                </div>
                <span className="text-[6.5px] text-slate-300">{p.cost}</span>
              </div>
            ))}
          </div>

          <div className="py-0.5 bg-[#082022] text-center border-t" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono text-slate-300">ACYCLIC SPANNING TREE</span>
          </div>
        </div>

        {/* Right Switch Bank: Blocked Standby Ports (Loop Elimination Gates) */}
        <div
          ref={rightShellRef}
          className="w-[90px] h-[196px] flex flex-col justify-between overflow-hidden shadow-2xl origin-right bg-[#040E0D] border-r-2 border-t border-b"
          style={{ borderColor: `${theme.goldTrim}b3` }}
        >
          <div className="py-1 px-1.5 bg-[#082022] border-b flex items-center justify-between" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono" style={{ color: theme.secondaryAccent }}>SAFE</span>
            <span className="text-[8px] font-mono font-bold" style={{ color: theme.goldHighlight }}>BLOCKING</span>
          </div>

          {/* 5 Blocked Alternate Ports with LEDs */}
          <div className="flex-1 flex flex-col justify-around py-1 px-1.5 bg-gradient-to-l from-[#020808] to-[#071B1E]">
            {[
              { port: "P4: ALTRN", state: "BLK", note: "LOOP SHED" },
              { port: "P5: BACKUP", state: "BLK", note: "STANDBY" },
              { port: "LOOP_CHK", state: "SAFE", note: "NO CYCLE" },
              { port: "MAX_AGE", state: "20s", note: "TIMER OK" },
              { port: "CONSENSUS", state: "STP", note: "100% NOM" },
            ].map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-[7.5px] font-mono py-0.5 px-1 bg-[#081C1E] border rounded-xs" style={{ borderColor: `${theme.goldTrim}33` }}>
                <span className="text-[6.5px] text-slate-300">{p.note}</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold" style={{ color: theme.goldHighlight }}>{p.port}</span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.goldTrim }} />
                </div>
              </div>
            ))}
          </div>

          <div className="py-0.5 bg-[#082022] text-center border-t" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono text-slate-300">LOOP PREVENTION SHIELD</span>
          </div>
        </div>
      </div>

      {/* 4. LOWER ASSEMBLY: Foundation Mesh Network Plinth & Bus Channels */}
      <div ref={lowerAssemblyRef} className="flex flex-col items-center origin-top z-35 w-full">
        <svg viewBox="0 0 200 100" className="w-[200px] h-[100px] overflow-visible">
          {/* Lower Network Mesh Convergence Apex */}
          <polygon points="25,5 175,5 175,55 100,92 25,55" fill="#06120D" stroke={theme.goldTrim} strokeWidth="1.8" />
          <line x1="45" y1="30" x2="100" y2="92" stroke="#14B8A6" strokeWidth="2.5" />
          <line x1="155" y1="30" x2="100" y2="92" stroke="#14B8A6" strokeWidth="2.5" />

          {/* Root Priority Anchor Nut */}
          <circle cx="100" cy="92" r="6" fill="#0B2017" stroke={theme.goldHighlight} strokeWidth="2" />
          <circle cx="100" cy="92" r="2" fill="#2DD4BF" />

          {/* Switch Pedestal Plate */}
          <rect x="40" y="10" width="120" height="15" rx="1.5" fill="#040906" stroke={theme.goldTrim} strokeWidth="1" />
          <text x="100" y="20" fill={theme.goldHighlight} fontSize="6" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
            ROUTER CHASSIS · IEEE 802.1D
          </text>
        </svg>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 5. FEI-FEI LI — THE IMAGENET VISUAL MATRIX (PION-06)                      */
/* Optical Camera Lens Hood, 8-Blade Mechanical Aperture, Visual Mosaic Grid */
/* ========================================================================= */

export const FeiFeiVisualMatrixArtifact: React.FC<{
  upperAssemblyRef: React.RefObject<HTMLDivElement | null>;
  lowerAssemblyRef: React.RefObject<HTMLDivElement | null>;
  centerHubRef: React.RefObject<HTMLDivElement | null>;
  leftShellRef: React.RefObject<HTMLDivElement | null>;
  rightShellRef: React.RefObject<HTMLDivElement | null>;
  theme: PioneerTheme;
}> = ({ upperAssemblyRef, lowerAssemblyRef, centerHubRef, leftShellRef, rightShellRef, theme }) => {
  return (
    <div className="relative w-[210px] h-[520px] flex flex-col items-center justify-center select-none pointer-events-none">
      {/* 1. UPPER ASSEMBLY: Flared Optical Lens Barrel & Knurled Aperture Ring */}
      <div ref={upperAssemblyRef} className="flex flex-col items-center origin-bottom z-35 w-full">
        <svg viewBox="0 0 200 100" className="w-[200px] h-[100px] overflow-visible">
          <defs>
            <linearGradient id="feifei-lens-glass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E1020" />
              <stop offset="40%" stopColor="#3B1238" />
              <stop offset="80%" stopColor="#120512" />
              <stop offset="100%" stopColor="#050105" />
            </linearGradient>
          </defs>

          {/* Flared Camera Sun Hood */}
          <polygon points="25,95 175,95 192,30 8,30" fill="url(#feifei-lens-glass)" stroke={theme.goldTrim} strokeWidth="1.8" />

          {/* Knurled Aperture Ring Grip Ribs */}
          <rect x="35" y="8" width="130" height="22" rx="2" fill="#0C040C" stroke={theme.goldHighlight} strokeWidth="1.2" />
          {[42, 54, 66, 78, 90, 100, 112, 124, 136, 148, 158].map((x) => (
            <line key={x} x1={x} y1="10" x2={x} y2="28" stroke={theme.accentColor} strokeWidth="1.2" />
          ))}

          {/* Aperture Scale Markings (f/1.4, f/2, f/2.8, f/4, f/5.6, f/8, f/16) */}
          <text x="100" y="24" fill={theme.goldHighlight} fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
            f/1.4 · 50mm OPTICAL APERTURE
          </text>

          {/* Curving Glass Lens Element Reflection */}
          <path d="M 30,55 Q 100,35 170,55" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" fill="none" />
          <circle cx="100" cy="65" r="18" fill="#080208" stroke={theme.goldTrim} strokeWidth="1.2" strokeDasharray="4 3" />

          {/* Nameplate */}
          <rect x="45" y="76" width="110" height="15" rx="1.5" fill="#050105" stroke={theme.goldTrim} strokeWidth="1" />
          <text x="100" y="86" fill={theme.goldHighlight} fontSize="6" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
            IMAGENET · 14.2M VISUAL CORPUS
          </text>
        </svg>
      </div>

      {/* 2. CENTER HUB: 8-Blade Mechanical Camera Iris Aperture */}
      <div
        ref={centerHubRef}
        className="relative w-16 h-12 rounded-full border-2 bg-[#04070C] z-45 flex items-center justify-center cursor-pointer my-0.5 overflow-hidden"
        style={{ borderColor: theme.goldTrim, boxShadow: `0 0 30px ${theme.accentColor}cc` }}
      >
        <div
          className="w-11 h-11 rounded-full border border-dashed flex items-center justify-center bg-[#150710]"
          style={{ borderColor: theme.secondaryAccent }}
        >
          {/* 8-Blade Aperture Center */}
          <svg viewBox="0 0 32 32" className="w-8 h-8 overflow-visible">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="16"
                y1="16"
                x2="28"
                y2="10"
                stroke={theme.goldTrim}
                strokeWidth="1.5"
                transform={`rotate(${deg} 16 16)`}
              />
            ))}
            <circle cx="16" cy="16" r="4.5" fill={theme.accentColor} />
          </svg>
        </div>
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none" style={{ backgroundColor: `${theme.goldTrim}cc` }} />
        <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-[1px] pointer-events-none" style={{ backgroundColor: `${theme.goldTrim}cc` }} />
      </div>

      {/* 3. BILATERAL VISUAL CLASSIFICATION MATRIX (Image Mosaic vs Synset Hierarchy) */}
      <div className="relative w-[184px] h-[196px] flex justify-between z-35 my-0.5">
        {/* Left Visual Bank: 6 Image Mosaic Tiles with Bounding Box Reticles */}
        <div
          ref={leftShellRef}
          className="w-[90px] h-[196px] flex flex-col justify-between overflow-hidden shadow-2xl origin-left bg-[#0A0408] border-l-2 border-t border-b"
          style={{ borderColor: `${theme.goldTrim}b3` }}
        >
          <div className="py-1 px-1.5 bg-[#1C0A18] border-b flex items-center justify-between" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[8px] font-mono font-bold" style={{ color: theme.goldHighlight }}>14.2M TILES</span>
            <span className="text-[7px] font-mono" style={{ color: theme.secondaryAccent }}>MOSAIC</span>
          </div>

          {/* 6 Grid Image Bounding Box Tiles */}
          <div className="flex-1 grid grid-cols-2 gap-1 p-1 bg-gradient-to-r from-[#060205] to-[#120510]">
            {[
              { tag: "DOG.N.01", icon: "CANINE" },
              { tag: "BIRD.N.01", icon: "AVIAN" },
              { tag: "AUTO.N.01", icon: "VEHICLE" },
              { tag: "FLWR.N.01", icon: "FLORA" },
              { tag: "SEAT.N.01", icon: "CHAIR" },
              { tag: "FACE.N.01", icon: "HUMAN" },
            ].map((tile, idx) => (
              <div key={idx} className="relative border bg-[#160614] rounded-xs flex flex-col justify-between p-1" style={{ borderColor: `${theme.goldTrim}4d` }}>
                <span className="text-[6.5px] font-mono font-bold" style={{ color: theme.goldHighlight }}>{tile.icon}</span>
                {/* Bounding Box Reticle */}
                <div className="w-full h-3.5 border border-dashed flex items-center justify-center bg-black/40" style={{ borderColor: `${theme.secondaryAccent}b3` }}>
                  <span className="text-[5.5px] font-mono" style={{ color: theme.secondaryAccent }}>BOX</span>
                </div>
                <span className="text-[5.5px] font-mono text-slate-400">{tile.tag}</span>
              </div>
            ))}
          </div>

          <div className="py-0.5 bg-[#1C0A18] text-center border-t" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono text-slate-300">BOUNDING BOX LOCALIZATION</span>
          </div>
        </div>

        {/* Right Visual Bank: WordNet Synset Categorical Taxonomy */}
        <div
          ref={rightShellRef}
          className="w-[90px] h-[196px] flex flex-col justify-between overflow-hidden shadow-2xl origin-right bg-[#0A0408] border-r-2 border-t border-b"
          style={{ borderColor: `${theme.goldTrim}b3` }}
        >
          <div className="py-1 px-1.5 bg-[#1C0A18] border-b flex items-center justify-between" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono" style={{ color: theme.secondaryAccent }}>WORDNET</span>
            <span className="text-[8px] font-mono font-bold" style={{ color: theme.goldHighlight }}>21.8K SYNSET</span>
          </div>

          {/* Synset Classification Tree Nodes */}
          <div className="flex-1 flex flex-col justify-around py-1 px-1.5 bg-gradient-to-l from-[#060205] to-[#120510]">
            {[
              { level: "ROOT: ENTITY", depth: "L0", conf: "1.00" },
              { level: "↳ OBJECT", depth: "L1", conf: "0.98" },
              { level: "  ↳ ORGANISM", depth: "L2", conf: "0.95" },
              { level: "    ↳ MAMMAL", depth: "L3", conf: "0.91" },
              { level: "      ↳ RETRIEVER", depth: "L4", conf: "TOP-1" },
            ].map((node, idx) => (
              <div key={idx} className="flex items-center justify-between text-[7px] font-mono py-0.5 px-1 bg-[#160614] border rounded-xs" style={{ borderColor: `${theme.goldTrim}33` }}>
                <span className="font-bold" style={{ color: theme.goldHighlight }}>{node.level}</span>
                <span className="font-semibold" style={{ color: theme.secondaryAccent }}>{node.conf}</span>
              </div>
            ))}
          </div>

          <div className="py-0.5 bg-[#1C0A18] text-center border-t" style={{ borderColor: `${theme.goldTrim}66` }}>
            <span className="text-[7px] font-mono text-slate-300">ILSVRC CLASSIFICATION</span>
          </div>
        </div>
      </div>

      {/* 4. LOWER ASSEMBLY: Precision Camera Sensor Mount Plinth */}
      <div ref={lowerAssemblyRef} className="flex flex-col items-center origin-top z-35 w-full">
        <svg viewBox="0 0 200 100" className="w-[200px] h-[100px] overflow-visible">
          {/* Flared Camera Bayonet Body Ring */}
          <polygon points="8,10 192,10 175,75 25,75" fill="url(#feifei-lens-glass)" stroke={theme.goldTrim} strokeWidth="1.8" />

          {/* Sensor Mount Data Contacts */}
          {[45, 60, 75, 90, 100, 115, 130, 145].map((x) => (
            <circle key={x} cx={x} cy="30" r="3" fill={theme.accentColor} stroke={theme.goldHighlight} strokeWidth="0.8" />
          ))}

          {/* CMOS Visual Sensor Chip Area */}
          <rect x="55" y="42" width="90" height="25" rx="1.5" fill="#0A0208" stroke={theme.goldHighlight} strokeWidth="1.2" />
          <text x="100" y="58" fill={theme.secondaryAccent} fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
            FULL-FRAME VISION SENSOR
          </text>

          {/* Base Stand Footing */}
          <rect x="35" y="75" width="130" height="18" rx="2" fill="#050105" stroke={theme.goldTrim} strokeWidth="1.2" />
          <text x="100" y="87" fill={theme.goldTrim} fontSize="6" fontFamily="monospace" textAnchor="middle">
            STANFORD VISION LAB · 2009
          </text>
        </svg>
      </div>
    </div>
  );
};
