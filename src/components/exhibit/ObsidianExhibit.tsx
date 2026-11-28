"use client";

import React, { useEffect, useLayoutEffect, useRef, useImperativeHandle, forwardRef } from "react";
import gsap from "gsap";
import { HistoricalMilestone } from "@/data/historicalMilestones";
import {
  AdaAnalyticalEngineArtifact,
  GraceCompilerApparatusArtifact,
  KatherineOrbitalInstrumentArtifact,
  RadiaSpanningTreeArtifact,
  FeiFeiVisualMatrixArtifact,
} from "./PioneerArtifacts";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ObsidianExhibitHandle {
  playEntrance: () => void;
  playExit: () => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export interface ObsidianExhibitProps {
  milestone: HistoricalMilestone;
  variant?: "sculpted-relief" | "spatial-artifact";
  layoutMode?: "monument-only" | "full-showcase";
  progress?: number; // 0 (compact folded folio) to 1 (fully unfurled architectural monument)
  interactive?: boolean;
  prefersReducedMotion?: boolean;
  onStateChange?: (isOpen: boolean) => void;
  onProgressChange?: (progress: number) => void;
  onMetricsChange?: (metrics: {
    fps: number;
    frameTimeMs: number;
    stageSeparationPx: number;
    finRotationDeg: number;
    railScaleY: number;
    exhibitWidthPx: number;
  }) => void;
  className?: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Pioneer Theme Definition
 * Defines the complete, bespoke visual identity for each historical pioneer,
 * influencing obsidian undertones, internal luminescence, structural SVGs,
 * seam flares, technical diagrams, and editorial typography.
 */
export interface PioneerTheme {
  id: string;
  name: string;
  field: string;
  accentColor: string;
  secondaryAccent: string;
  goldTrim: string;
  goldHighlight: string;
  bronzeDeep: string;
  obsidianStops: [string, string, string, string];
  flameRgb: { r: number; g: number; b: number };
  flameSecondaryRgb: { r: number; g: number; b: number };
  seamGlowRgb: { r: number; g: number; b: number };
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  attributionColor: string;
  dividerGrad: string;
  headerTag: string;
  headerSub: string;
}

export const PIONEER_THEMES: Record<string, PioneerTheme> = {
  "PION-01": {
    id: "PION-01",
    name: "Ada Lovelace",
    field: "Algorithmic Logic & Mathematics",
    accentColor: "#1595D0",
    secondaryAccent: "#38BDF8",
    goldTrim: "#1595D0",
    goldHighlight: "#60A5FA",
    bronzeDeep: "#0F3D5E",
    obsidianStops: ["#070B12", "#0B1320", "#111D2E", "#080C14"],
    flameRgb: { r: 21, g: 149, b: 208 },
    flameSecondaryRgb: { r: 212, g: 163, b: 90 },
    seamGlowRgb: { r: 96, g: 165, b: 250 },
    badgeBg: "bg-sky-400/10",
    badgeBorder: "border-sky-400/35",
    badgeText: "text-sky-300",
    attributionColor: "#60A5FA",
    dividerGrad: "linear-gradient(90deg, transparent 0%, #1595D0 30%, #38BDF8 70%, transparent 100%)",
    headerTag: "JACQUARD LOOM MATRIX · 1843",
    headerSub: "NOTE G",
  },
  "PION-04": {
    id: "PION-04",
    name: "Margaret Hamilton",
    field: "Systems & Fault-Tolerant Architectures",
    accentColor: "#1595D0",
    secondaryAccent: "#38BDF8",
    goldTrim: "#1595D0",
    goldHighlight: "#60A5FA",
    bronzeDeep: "#0F3D5E",
    obsidianStops: ["#070A10", "#0C1320", "#131D2E", "#090E16"],
    flameRgb: { r: 21, g: 149, b: 208 },
    flameSecondaryRgb: { r: 56, g: 189, b: 248 },
    seamGlowRgb: { r: 56, g: 189, b: 248 },
    badgeBg: "bg-sky-400/10",
    badgeBorder: "border-sky-400/35",
    badgeText: "text-sky-300",
    attributionColor: "#38BDF8",
    dividerGrad: "linear-gradient(90deg, transparent 0%, #1595D0 30%, #38BDF8 70%, transparent 100%)",
    headerTag: "APOLLO AGC CORE ROPE MEMORY · 1969",
    headerSub: "MIT-IL",
  },
  "PION-02": {
    id: "PION-02",
    name: "Grace Hopper",
    field: "Compilers & High-Level Languages",
    accentColor: "#278F9B",
    secondaryAccent: "#5EEAD4",
    goldTrim: "#278F9B",
    goldHighlight: "#5EEAD4",
    bronzeDeep: "#134E4A",
    obsidianStops: ["#060B0E", "#0A151A", "#102028", "#070E12"],
    flameRgb: { r: 39, g: 143, b: 155 },
    flameSecondaryRgb: { r: 94, g: 234, b: 212 },
    seamGlowRgb: { r: 94, g: 234, b: 212 },
    badgeBg: "bg-teal-400/10",
    badgeBorder: "border-teal-400/35",
    badgeText: "text-teal-300",
    attributionColor: "#5EEAD4",
    dividerGrad: "linear-gradient(90deg, transparent 0%, #278F9B 30%, #5EEAD4 70%, transparent 100%)",
    headerTag: "A-0 COMPILER CODEX · 1952",
    headerSub: "UNIVAC I",
  },
  "PION-03": {
    id: "PION-03",
    name: "Katherine Johnson",
    field: "Orbital Mechanics & Celestial Navigation",
    accentColor: "#C96C8E",
    secondaryAccent: "#F472B6",
    goldTrim: "#C96C8E",
    goldHighlight: "#F9A8D4",
    bronzeDeep: "#6B2142",
    obsidianStops: ["#0B070C", "#160D17", "#211423", "#0D080E"],
    flameRgb: { r: 201, g: 108, b: 142 },
    flameSecondaryRgb: { r: 244, g: 114, b: 182 },
    seamGlowRgb: { r: 249, g: 168, b: 212 },
    badgeBg: "bg-pink-400/10",
    badgeBorder: "border-pink-400/35",
    badgeText: "text-pink-300",
    attributionColor: "#F9A8D4",
    dividerGrad: "linear-gradient(90deg, transparent 0%, #C96C8E 30%, #F472B6 70%, transparent 100%)",
    headerTag: "ORBITAL TRAJECTORY CALCULATION · 1962",
    headerSub: "MERCURY-ATLAS 6 / APOLLO 11",
  },
  "PION-05": {
    id: "PION-05",
    name: "Radia Perlman",
    field: "Distributed Systems & Routing Protocols",
    accentColor: "#278F9B",
    secondaryAccent: "#2DD4BF",
    goldTrim: "#278F9B",
    goldHighlight: "#5EEAD4",
    bronzeDeep: "#134E4A",
    obsidianStops: ["#060B0E", "#0A151A", "#102028", "#070E12"],
    flameRgb: { r: 39, g: 143, b: 155 },
    flameSecondaryRgb: { r: 45, g: 212, b: 191 },
    seamGlowRgb: { r: 94, g: 234, b: 212 },
    badgeBg: "bg-teal-400/10",
    badgeBorder: "border-teal-400/35",
    badgeText: "text-teal-300",
    attributionColor: "#5EEAD4",
    dividerGrad: "linear-gradient(90deg, transparent 0%, #278F9B 30%, #2DD4BF 70%, transparent 100%)",
    headerTag: "SPANNING TREE PROTOCOL · 1985",
    headerSub: "IEEE 802.1D BRIDGES",
  },
  "PION-06": {
    id: "PION-06",
    name: "Fei-Fei Li",
    field: "Computer Vision & Cognitive Intelligence",
    accentColor: "#ED247A",
    secondaryAccent: "#F472B6",
    goldTrim: "#ED247A",
    goldHighlight: "#FDA4AF",
    bronzeDeep: "#831843",
    obsidianStops: ["#0C060A", "#170B14", "#23101D", "#0E070C"],
    flameRgb: { r: 237, g: 36, b: 122 },
    flameSecondaryRgb: { r: 244, g: 114, b: 182 },
    seamGlowRgb: { r: 244, g: 114, b: 182 },
    badgeBg: "bg-pink-500/10",
    badgeBorder: "border-pink-500/35",
    badgeText: "text-pink-300",
    attributionColor: "#FDA4AF",
    dividerGrad: "linear-gradient(90deg, transparent 0%, #ED247A 30%, #F472B6 70%, transparent 100%)",
    headerTag: "IMAGENET ONTOLOGY MATRIX · 2009",
    headerSub: "WORDNET VISUAL TAXONOMY",
  },
};

export function getPioneerTheme(milestoneId: string, accentOverride?: string): PioneerTheme {
  const base = PIONEER_THEMES[milestoneId] || PIONEER_THEMES["PION-01"];
  if (!accentOverride || accentOverride === base.accentColor) {
    return base;
  }
  const rgb = hexToRgb(accentOverride);
  return {
    ...base,
    accentColor: accentOverride,
    flameSecondaryRgb: rgb,
    dividerGrad: `linear-gradient(90deg, transparent 0%, ${base.goldTrim} 30%, ${accentOverride} 70%, transparent 100%)`,
  };
}

/**
 * ObsidianFlameCanvas
 * Paints the deep, translucent subterranean luminescence of genuine volcanic obsidian glass.
 * Imbued with subtle mineral flow ribbons using pioneer-specific undertones,
 * with zero wire strokes and an immaculate central reading protection shield.
 */
export const ObsidianFlameCanvas: React.FC<{
  theme: PioneerTheme;
  progress?: number;
  liveProgressRef?: React.MutableRefObject<number>;
  wakeRef?: React.MutableRefObject<(() => void) | null>;
  prefersReducedMotion?: boolean;
}> = ({ theme, progress = 1, liveProgressRef, wakeRef, prefersReducedMotion = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number = 0;
    let observer: IntersectionObserver | null = null;
    let resizeObs: ResizeObserver | null = null;
    const startTime = performance.now();
    const rgb = theme.flameRgb;
    const secRgb = theme.flameSecondaryRgb;
    const parentEl = canvas.parentElement;
    let cachedW = parentEl ? parentEl.clientWidth || 560 : 560;
    let cachedH = parentEl ? parentEl.clientHeight || 540 : 540;

    if (parentEl && typeof ResizeObserver !== "undefined") {
      resizeObs = new ResizeObserver((entries) => {
        for (const entry of entries) {
          cachedW = Math.max(1, Math.round(entry.contentRect.width));
          cachedH = Math.max(1, Math.round(entry.contentRect.height));
        }
      });
      resizeObs.observe(parentEl);
    }

    // Cache static obsidian backdrop + reading shield + polish sheen per resize
    let staticBgCanvas: HTMLCanvasElement | null = null;
    let staticOverlayCanvas: HTMLCanvasElement | null = null;
    let cachedStaticW = 0;
    let cachedStaticH = 0;
    let cachedStaticDpr = 0;

    const ensureStaticLayers = (w: number, h: number, dpr: number) => {
      if (
        staticBgCanvas &&
        staticOverlayCanvas &&
        cachedStaticW === w &&
        cachedStaticH === h &&
        cachedStaticDpr === dpr
      ) {
        return;
      }
      cachedStaticW = w;
      cachedStaticH = h;
      cachedStaticDpr = dpr;

      staticBgCanvas = document.createElement("canvas");
      staticBgCanvas.width = Math.round(w * dpr);
      staticBgCanvas.height = Math.round(h * dpr);
      const bgCtx = staticBgCanvas.getContext("2d");
      if (bgCtx) {
        bgCtx.scale(dpr, dpr);
        const bgGrad = bgCtx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, theme.obsidianStops[0]);
        bgGrad.addColorStop(0.35, theme.obsidianStops[1]);
        bgGrad.addColorStop(0.70, theme.obsidianStops[2]);
        bgGrad.addColorStop(1, theme.obsidianStops[3]);
        bgCtx.fillStyle = bgGrad;
        bgCtx.fillRect(0, 0, w, h);
      }

      staticOverlayCanvas = document.createElement("canvas");
      staticOverlayCanvas.width = Math.round(w * dpr);
      staticOverlayCanvas.height = Math.round(h * dpr);
      const ovCtx = staticOverlayCanvas.getContext("2d");
      if (ovCtx) {
        ovCtx.scale(dpr, dpr);
        const readingVeil = ovCtx.createRadialGradient(w * 0.5, h * 0.50, 60, w * 0.5, h * 0.50, w * 0.55);
        readingVeil.addColorStop(0, "rgba(8, 11, 15, 0.75)");
        readingVeil.addColorStop(0.60, "rgba(8, 11, 15, 0.50)");
        readingVeil.addColorStop(1, "rgba(8, 11, 15, 0)");
        ovCtx.fillStyle = readingVeil;
        ovCtx.fillRect(0, 0, w, h);

        const sheenGrad = ovCtx.createLinearGradient(0, 0, w * 0.6, h * 0.45);
        sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
        sheenGrad.addColorStop(0.12, "rgba(255, 255, 255, 0.015)");
        sheenGrad.addColorStop(0.24, "rgba(255, 255, 255, 0)");
        sheenGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ovCtx.fillStyle = sheenGrad;
        ovCtx.fillRect(0, 0, w, h);
      }
    };

    const render = (now: number) => {
      const w = cachedW;
      const h = cachedH;

      const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      ensureStaticLayers(w, h, dpr);

      ctx.save();
      if (staticBgCanvas) {
        ctx.drawImage(staticBgCanvas, 0, 0, canvas.width, canvas.height);
      }
      ctx.scale(dpr, dpr);

      const time = prefersReducedMotion ? 0 : (now - startTime) * 0.00018;

      // 2. Subterranean Internal Luminescence (Dual-Chroma Mineral Core)
      ctx.save();
      const internalLightGrad = ctx.createRadialGradient(
        w * 0.35 + Math.sin(time * 0.8) * 30,
        h * 0.40 + Math.cos(time * 0.7) * 20,
        25,
        w * 0.5,
        h * 0.5,
        w * 0.65
      );
      internalLightGrad.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`);
      internalLightGrad.addColorStop(0.35, `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, 0.06)`);
      internalLightGrad.addColorStop(0.70, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02)`);
      internalLightGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = internalLightGrad;
      ctx.globalCompositeOperation = "screen";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // 3. Procedural Laminar Flow-Bands (Ultra-Soft, Diffuse Volcanic Strata)
      const bands = [
        { y0: -20, thickness: 95, amp: 14, freq: 0.006, phase: 0.3, intensity: 0.18 },
        { y0: 240, thickness: 110, amp: 18, freq: 0.005, phase: 1.8, intensity: 0.16 },
        { y0: 440, thickness: 90, amp: 12, freq: 0.007, phase: 3.2, intensity: 0.12 },
      ];

      const slope = 0.28;
      const numSteps = 32;

      for (const b of bands) {
        const upperPts: { x: number; y: number }[] = [];
        const lowerPts: { x: number; y: number }[] = [];

        for (let s = 0; s <= numSteps; s++) {
          const x = (s / numSteps) * (w + 140) - 70;
          const wave =
            Math.sin(x * b.freq + b.phase + time) * b.amp +
            Math.sin(x * b.freq * 2.1 + b.phase * 1.3 - time * 0.5) * (b.amp * 0.25);

          const centerY = b.y0 + x * slope + wave;
          const localThickness = b.thickness * (1 + 0.20 * Math.sin(x * 0.010 + b.phase));

          upperPts.push({ x, y: centerY - localThickness / 2 });
          lowerPts.push({ x, y: centerY + localThickness / 2 });
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(upperPts[0].x, upperPts[0].y);
        for (let i = 1; i < upperPts.length; i++) ctx.lineTo(upperPts[i].x, upperPts[i].y);
        for (let i = lowerPts.length - 1; i >= 0; i--) ctx.lineTo(lowerPts[i].x, lowerPts[i].y);
        ctx.closePath();

        const ribbonGrad = ctx.createLinearGradient(0, b.y0 - 30, w, b.y0 + w * slope + 30);
        ribbonGrad.addColorStop(0, `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, 0)`);
        ribbonGrad.addColorStop(0.30, `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, ${0.04 * b.intensity})`);
        ribbonGrad.addColorStop(0.50, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.09 * b.intensity})`);
        ribbonGrad.addColorStop(0.70, `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, ${0.04 * b.intensity})`);
        ribbonGrad.addColorStop(1, `rgba(${secRgb.r}, ${secRgb.g}, ${secRgb.b}, 0)`);
        ctx.fillStyle = ribbonGrad;
        ctx.globalCompositeOperation = "screen";
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      // 4 & 5. Cached Reading Shield & Vitreous Specular Polish
      if (staticOverlayCanvas) {
        ctx.drawImage(staticOverlayCanvas, 0, 0, canvas.width, canvas.height);
      }

      const activeProgress = liveProgressRef ? liveProgressRef.current : progressRef.current;

      // Performance Optimization (animation-performance & modern-web-guidance):
      // Only request next frame if:
      // 1. Not prefersReducedMotion (reduced motion gets exactly 1 static frame)
      // 2. Visible in viewport via IntersectionObserver
      // 3. activeProgress > 0.05 (closed monument cards run zero rAF frames)
      if (!prefersReducedMotion && isVisibleRef.current && activeProgress > 0.05) {
        animId = requestAnimationFrame(render);
      } else {
        animId = 0;
      }
    };

    const wakeLoop = () => {
      const activeProgress = liveProgressRef ? liveProgressRef.current : progressRef.current;
      if (!prefersReducedMotion && isVisibleRef.current && activeProgress > 0.05 && !animId) {
        animId = requestAnimationFrame(render);
      }
    };
    if (wakeRef) wakeRef.current = wakeLoop;

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            isVisibleRef.current = entry.isIntersecting;
            if (entry.isIntersecting) wakeLoop();
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas);
    }

    render(performance.now());

    return () => {
      if (wakeRef && wakeRef.current === wakeLoop) wakeRef.current = null;
      if (animId) cancelAnimationFrame(animId);
      if (observer) observer.disconnect();
      if (resizeObs) resizeObs.disconnect();
    };
  }, [theme, prefersReducedMotion, liveProgressRef, wakeRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-xs"
      style={{ zIndex: 1 }}
    />
  );
};

/* ========================================================================= */
/* BESPOKE UPPER MANTLES (PIONEER-SPECIFIC SILHOUETTE & GEOMETRY)            */
/* ========================================================================= */

/**
 * AdaLovelaceUpperMantle (PION-01)
 * Stepped gear-crenellated shoulders with conchoidal chamfer bevels,
 * 6 Jacquard registration pegs, and interlocking cog horizon teeth.
 */
const AdaLovelaceUpperMantle: React.FC<{ theme: PioneerTheme }> = ({ theme }) => (
  <svg
    viewBox="0 0 640 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto"
    preserveAspectRatio="none"
    role="img"
    aria-label="Ada Lovelace Jacquard gear mantle"
  >
    <defs>
      <linearGradient id={`ada-upper-granite-${theme.id}`} x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor={theme.obsidianStops[0]} />
        <stop offset="35%" stopColor={theme.obsidianStops[1]} />
        <stop offset="70%" stopColor={theme.obsidianStops[2]} />
        <stop offset="100%" stopColor={theme.obsidianStops[3]} />
      </linearGradient>
      <linearGradient id={`ada-upper-bevel-${theme.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E293B" stopOpacity="0.5" />
        <stop offset="50%" stopColor={theme.obsidianStops[0]} />
        <stop offset="100%" stopColor="#030406" />
      </linearGradient>
      <linearGradient id={`ada-upper-aureate-${theme.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={theme.bronzeDeep} stopOpacity="0.2" />
        <stop offset="25%" stopColor={theme.goldTrim} />
        <stop offset="50%" stopColor={theme.goldHighlight} />
        <stop offset="75%" stopColor={theme.goldTrim} />
        <stop offset="100%" stopColor={theme.bronzeDeep} />
      </linearGradient>
    </defs>

    {/* 1. Base Stepped Gear Shell */}
    <polygon
      points="0,64 18,24 90,24 110,14 220,14 250,6 320,0 390,6 420,14 530,14 550,24 622,24 640,64 460,64 420,56 350,56 330,64 310,64 290,56 220,56 180,64"
      fill={`url(#ada-upper-granite-${theme.id})`}
    />
    {/* 2. Faceted Chamfer Shell */}
    <polygon
      points="18,24 90,24 110,14 220,14 250,6 320,0 390,6 420,14 530,14 550,24 622,24 610,28 544,28 524,18 416,18 386,10 320,5 254,10 224,18 116,18 96,28 30,28"
      fill={`url(#ada-upper-bevel-${theme.id})`}
      opacity="0.85"
    />
    {/* 3. Aureate Gold Fissure Seam */}
    <polyline
      points="24,28 94,28 114,18 222,18 252,10 320,4 388,10 418,18 526,18 546,28 616,28"
      stroke={`url(#ada-upper-aureate-${theme.id})`}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 4. Fine Conchoidal Razor Highlight Rim */}
    <polyline
      points="1,63 19,25 91,25 111,15 221,15 251,7 320,1 389,7 419,15 529,15 549,25 621,25 639,63"
      stroke="rgba(255, 255, 255, 0.45)"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 5. Interlocking Center Horizon Teeth Highlight */}
    <polyline
      points="180,64 220,56 290,56 310,64 330,64 350,56 420,56 460,64"
      stroke={`url(#ada-upper-aureate-${theme.id})`}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Jacquard Punch Pattern Registration Markers */}
    {[220, 260, 300, 340, 380, 420].map((cx, idx) => (
      <circle key={idx} cx={cx} cy="42" r="1.8" fill={theme.goldTrim} opacity="0.75" />
    ))}
  </svg>
);

/**
 * MargaretHamiltonUpperMantle (PION-04)
 * Apollo Command Module aerodynamic canopy with sweeping orbital trajectory arcs,
 * core rope memory channels, and lunar attitude horizon teeth.
 */
export const MargaretHamiltonUpperMantle: React.FC<{ theme: PioneerTheme }> = ({ theme }) => (
  <svg
    viewBox="0 0 640 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto"
    preserveAspectRatio="none"
    role="img"
    aria-label="Margaret Hamilton Apollo guidance canopy"
  >
    <defs>
      <linearGradient id="margaret-upper-granite" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor={theme.obsidianStops[0]} />
        <stop offset="35%" stopColor={theme.obsidianStops[1]} />
        <stop offset="70%" stopColor={theme.obsidianStops[2]} />
        <stop offset="100%" stopColor={theme.obsidianStops[3]} />
      </linearGradient>
      <linearGradient id="margaret-upper-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1C2E3D" stopOpacity="0.5" />
        <stop offset="50%" stopColor={theme.obsidianStops[0]} />
        <stop offset="100%" stopColor="#020408" />
      </linearGradient>
      <linearGradient id="margaret-upper-amber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={theme.bronzeDeep} stopOpacity="0.2" />
        <stop offset="30%" stopColor={theme.accentColor} />
        <stop offset="50%" stopColor={theme.goldHighlight} />
        <stop offset="70%" stopColor={theme.accentColor} />
        <stop offset="100%" stopColor={theme.bronzeDeep} />
      </linearGradient>
    </defs>

    {/* 1. Tapered Aerodynamic Apollo Guidance Canopy */}
    <polygon
      points="0,64 32,20 80,20 140,8 260,8 320,0 380,8 500,8 560,20 608,20 640,64 450,64 400,52 360,52 340,64 300,64 280,52 240,52 190,64"
      fill="url(#margaret-upper-granite)"
    />
    {/* 2. Faceted Chamfer Shell */}
    <polygon
      points="32,20 80,20 140,8 260,8 320,0 380,8 500,8 560,20 608,20 596,24 552,24 494,12 376,12 320,4 264,12 146,12 88,24 44,24"
      fill="url(#margaret-upper-bevel)"
      opacity="0.85"
    />
    {/* 3. Sweeping Orbital Flight Trajectory Arc */}
    <path
      d="M 44,24 Q 320,-4 596,24"
      stroke="url(#margaret-upper-amber)"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    {/* 4. Secondary Telemetry Arc */}
    <path
      d="M 90,32 Q 320,10 550,32"
      stroke={theme.accentColor}
      strokeWidth="0.8"
      strokeDasharray="4 3"
      opacity="0.65"
      fill="none"
    />
    {/* 5. Razor Specular Edge */}
    <polyline
      points="1,63 33,21 81,21 141,9 261,9 320,1 379,9 499,9 559,21 607,21 639,63"
      stroke="rgba(255, 255, 255, 0.40)"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* 6. Interlocking Guidance Teeth Highlight */}
    <polyline
      points="190,64 240,52 280,52 300,64 340,64 360,52 400,52 450,64"
      stroke="url(#margaret-upper-amber)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* MIT-IL Navigation Coordinate Ticks */}
    {[240, 280, 320, 360, 400].map((cx, idx) => (
      <line
        key={idx}
        x1={cx}
        y1="40"
        x2={cx}
        y2="46"
        stroke={theme.secondaryAccent}
        strokeWidth="1.2"
        opacity="0.8"
      />
    ))}
  </svg>
);

/**
 * GraceHopperUpperMantle (PION-02)
 * Block-structured subroutine canopy with modular compilation steps,
 * flowchart chevron brackets, and binary address notches.
 */
const GraceHopperUpperMantle: React.FC<{ theme: PioneerTheme }> = ({ theme }) => (
  <svg
    viewBox="0 0 640 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto"
    preserveAspectRatio="none"
    role="img"
    aria-label="Grace Hopper compiler subroutine canopy"
  >
    <defs>
      <linearGradient id="grace-upper-granite" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor={theme.obsidianStops[0]} />
        <stop offset="35%" stopColor={theme.obsidianStops[1]} />
        <stop offset="70%" stopColor={theme.obsidianStops[2]} />
        <stop offset="100%" stopColor={theme.obsidianStops[3]} />
      </linearGradient>
      <linearGradient id="grace-upper-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E284A" stopOpacity="0.5" />
        <stop offset="50%" stopColor={theme.obsidianStops[0]} />
        <stop offset="100%" stopColor="#030510" />
      </linearGradient>
      <linearGradient id="grace-upper-amber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={theme.bronzeDeep} stopOpacity="0.2" />
        <stop offset="30%" stopColor={theme.goldTrim} />
        <stop offset="50%" stopColor={theme.goldHighlight} />
        <stop offset="70%" stopColor={theme.accentColor} />
        <stop offset="100%" stopColor={theme.bronzeDeep} />
      </linearGradient>
    </defs>

    {/* 1. Block-Structured Subroutine Shell with Modular Steps */}
    <polygon
      points="0,64 24,18 72,18 72,28 144,28 144,12 240,12 240,4 320,0 400,4 400,12 496,12 496,28 568,28 568,18 616,18 640,64 470,64 430,54 370,54 350,64 290,64 270,54 210,54 170,64"
      fill="url(#grace-upper-granite)"
    />
    {/* 2. Faceted Chamfer Shell */}
    <polygon
      points="24,18 72,18 72,28 144,28 144,12 240,12 240,4 320,0 400,4 400,12 496,12 496,28 568,28 568,18 616,18 604,22 560,22 560,32 488,32 488,16 396,16 396,8 320,3 244,8 244,16 152,16 152,32 80,32 80,22 36,22"
      fill="url(#grace-upper-bevel)"
      opacity="0.85"
    />
    {/* 3. Symbolic Translation Chevron Inlay */}
    <polyline
      points="36,22 78,22 78,32 150,32 150,16 242,16 242,8 320,3 398,8 398,16 490,16 490,32 562,32 562,22 604,22"
      stroke="url(#grace-upper-amber)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 4. Fine Conchoidal Razor Highlight Rim */}
    <polyline
      points="1,63 25,19 73,19 73,29 145,29 145,13 241,13 241,5 320,1 399,5 399,13 495,13 495,29 567,29 567,19 615,19 639,63"
      stroke="rgba(255, 255, 255, 0.40)"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* 5. Interlocking Center Horizon Teeth Highlight */}
    <polyline
      points="170,64 210,54 270,54 290,64 350,64 370,54 430,54 470,64"
      stroke="url(#grace-upper-amber)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* UNIVAC I Memory Block Index Registers */}
    {[210, 270, 330, 390, 430].map((cx, idx) => (
      <rect
        key={idx}
        x={cx - 5}
        y="42"
        width="10"
        height="3"
        fill={theme.accentColor}
        opacity="0.75"
        rx="0.5"
      />
    ))}
  </svg>
);

export const BespokeUpperMantle: React.FC<{ theme: PioneerTheme }> = ({ theme }) => {
  return (
    <div className="relative w-full overflow-visible select-none pointer-events-none -mb-1 z-30">
      {theme.id === "PION-02" ? (
        <GraceHopperUpperMantle theme={theme} />
      ) : (
        <AdaLovelaceUpperMantle theme={theme} />
      )}
    </div>
  );
};

/* ========================================================================= */
/* BESPOKE LOWER PLINTHS (PIONEER-SPECIFIC SILHOUETTE & GEOMETRY)            */
/* ========================================================================= */

/**
 * AdaLovelaceLowerPlinth (PION-01)
 * Inverted stepped gear foundation plinth with complementary interlocking tooth horizon.
 */
const AdaLovelaceLowerPlinth: React.FC<{ theme: PioneerTheme }> = ({ theme }) => (
  <svg
    viewBox="0 0 640 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto"
    preserveAspectRatio="none"
    role="img"
    aria-label="Ada Lovelace Jacquard gear plinth"
  >
    <defs>
      <linearGradient id={`ada-lower-granite-${theme.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={theme.obsidianStops[0]} />
        <stop offset="35%" stopColor={theme.obsidianStops[1]} />
        <stop offset="70%" stopColor={theme.obsidianStops[2]} />
        <stop offset="100%" stopColor={theme.obsidianStops[3]} />
      </linearGradient>
      <linearGradient id={`ada-lower-bevel-${theme.id}`} x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1E293B" stopOpacity="0.5" />
        <stop offset="50%" stopColor={theme.obsidianStops[0]} />
        <stop offset="100%" stopColor="#030406" />
      </linearGradient>
      <linearGradient id={`ada-lower-aureate-${theme.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={theme.bronzeDeep} stopOpacity="0.2" />
        <stop offset="25%" stopColor={theme.goldTrim} />
        <stop offset="50%" stopColor={theme.goldHighlight} />
        <stop offset="75%" stopColor={theme.goldTrim} />
        <stop offset="100%" stopColor={theme.bronzeDeep} />
      </linearGradient>
    </defs>

    {/* 1. Base Foundation Shell */}
    <polygon
      points="0,0 180,0 220,8 290,8 310,0 330,0 350,8 420,8 460,0 640,0 622,40 550,40 530,50 420,50 390,58 320,64 250,58 220,50 110,50 90,40 18,40"
      fill={`url(#ada-lower-granite-${theme.id})`}
    />
    {/* 2. Faceted Chamfer Shell */}
    <polygon
      points="18,40 90,40 110,50 220,50 250,58 320,64 390,58 420,50 530,50 550,40 622,40 610,36 544,36 524,46 416,46 386,54 320,59 254,54 224,46 116,46 96,36 30,36"
      fill={`url(#ada-lower-bevel-${theme.id})`}
      opacity="0.85"
    />
    {/* 3. Aureate Gold Seam */}
    <polyline
      points="24,36 94,36 114,46 222,46 252,54 320,60 388,54 418,46 526,46 546,36 616,36"
      stroke={`url(#ada-lower-aureate-${theme.id})`}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 4. Fine Razor Highlight Rim */}
    <polyline
      points="1,1 19,39 91,39 111,49 221,49 251,57 320,63 389,57 419,49 529,49 549,39 621,39 639,1"
      stroke="rgba(255, 255, 255, 0.40)"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* 5. Interlocking Center Horizon Teeth Highlight */}
    <polyline
      points="180,0 220,8 290,8 310,0 330,0 350,8 420,8 460,0"
      stroke={`url(#ada-lower-aureate-${theme.id})`}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * MargaretHamiltonLowerPlinth (PION-04)
 * Apollo lunar descent engine plinth with radar telemetry notches and complementary guidance horizon.
 */
export const MargaretHamiltonLowerPlinth: React.FC<{ theme: PioneerTheme }> = ({ theme }) => (
  <svg
    viewBox="0 0 640 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto"
    preserveAspectRatio="none"
    role="img"
    aria-label="Margaret Hamilton Apollo guidance plinth"
  >
    <defs>
      <linearGradient id="margaret-lower-granite" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={theme.obsidianStops[0]} />
        <stop offset="35%" stopColor={theme.obsidianStops[1]} />
        <stop offset="70%" stopColor={theme.obsidianStops[2]} />
        <stop offset="100%" stopColor={theme.obsidianStops[3]} />
      </linearGradient>
      <linearGradient id="margaret-lower-bevel" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1C2E3D" stopOpacity="0.5" />
        <stop offset="50%" stopColor={theme.obsidianStops[0]} />
        <stop offset="100%" stopColor="#020408" />
      </linearGradient>
      <linearGradient id="margaret-lower-amber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={theme.bronzeDeep} stopOpacity="0.2" />
        <stop offset="30%" stopColor={theme.accentColor} />
        <stop offset="50%" stopColor={theme.goldHighlight} />
        <stop offset="70%" stopColor={theme.accentColor} />
        <stop offset="100%" stopColor={theme.bronzeDeep} />
      </linearGradient>
    </defs>

    {/* 1. Base Descent Engine Plinth */}
    <polygon
      points="0,0 190,0 240,12 280,12 300,0 340,0 360,12 400,12 450,0 640,0 608,44 560,44 500,56 380,56 320,64 260,56 140,56 80,44 32,44"
      fill="url(#margaret-lower-granite)"
    />
    {/* 2. Faceted Chamfer Shell */}
    <polygon
      points="32,44 80,44 140,56 260,56 320,64 380,56 500,56 560,44 608,44 596,40 552,40 494,52 376,52 320,59 264,52 146,52 88,40 44,40"
      fill="url(#margaret-lower-bevel)"
      opacity="0.85"
    />
    {/* 3. Telemetry Return Arc */}
    <path
      d="M 44,40 Q 320,68 596,40"
      stroke="url(#margaret-lower-amber)"
      strokeWidth="1.8"
      strokeLinecap="round"
      fill="none"
    />
    {/* 4. Fine Razor Highlight Rim */}
    <polyline
      points="1,1 33,43 81,43 141,55 261,55 320,63 379,55 499,55 559,43 607,43 639,1"
      stroke="rgba(255, 255, 255, 0.40)"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* 5. Interlocking Center Horizon Teeth Highlight */}
    <polyline
      points="190,0 240,12 280,12 300,0 340,0 360,12 400,12 450,0"
      stroke="url(#margaret-lower-amber)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * GraceHopperLowerPlinth (PION-02)
 * Subroutine foundation plinth with complementary compilation steps and memory register blocks.
 */
const GraceHopperLowerPlinth: React.FC<{ theme: PioneerTheme }> = ({ theme }) => (
  <svg
    viewBox="0 0 640 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto"
    preserveAspectRatio="none"
    role="img"
    aria-label="Grace Hopper compiler subroutine plinth"
  >
    <defs>
      <linearGradient id="grace-lower-granite" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={theme.obsidianStops[0]} />
        <stop offset="35%" stopColor={theme.obsidianStops[1]} />
        <stop offset="70%" stopColor={theme.obsidianStops[2]} />
        <stop offset="100%" stopColor={theme.obsidianStops[3]} />
      </linearGradient>
      <linearGradient id="grace-lower-bevel" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1E284A" stopOpacity="0.5" />
        <stop offset="50%" stopColor={theme.obsidianStops[0]} />
        <stop offset="100%" stopColor="#030510" />
      </linearGradient>
      <linearGradient id="grace-lower-amber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={theme.bronzeDeep} stopOpacity="0.2" />
        <stop offset="30%" stopColor={theme.goldTrim} />
        <stop offset="50%" stopColor={theme.goldHighlight} />
        <stop offset="70%" stopColor={theme.accentColor} />
        <stop offset="100%" stopColor={theme.bronzeDeep} />
      </linearGradient>
    </defs>

    {/* 1. Base Subroutine Foundation Plinth */}
    <polygon
      points="0,0 170,0 210,10 270,10 290,0 350,0 370,10 430,10 470,0 640,0 616,46 568,46 568,36 496,36 496,52 400,52 400,60 320,64 240,60 240,52 144,52 144,36 72,36 72,46 24,46"
      fill="url(#grace-lower-granite)"
    />
    {/* 2. Faceted Chamfer Shell */}
    <polygon
      points="24,46 72,46 72,36 144,36 144,52 240,52 240,60 320,64 400,60 400,52 496,52 496,36 568,36 568,46 616,46 604,42 560,42 560,32 488,32 488,48 396,48 396,56 320,60 244,56 244,48 152,48 152,32 80,32 80,42 36,42"
      fill="url(#grace-lower-bevel)"
      opacity="0.85"
    />
    {/* 3. Symbolic Translation Chevron Inlay */}
    <polyline
      points="36,42 78,42 78,32 150,32 150,48 242,48 242,56 320,60 398,56 398,48 490,48 490,32 562,32 562,42 604,42"
      stroke="url(#grace-lower-amber)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* 4. Fine Razor Highlight Rim */}
    <polyline
      points="1,1 25,45 73,45 73,35 145,35 145,51 241,51 241,59 320,63 399,59 399,51 495,51 495,35 567,35 567,45 615,45 639,1"
      stroke="rgba(255, 255, 255, 0.40)"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* 5. Interlocking Center Horizon Teeth Highlight */}
    <polyline
      points="170,0 210,10 270,10 290,0 350,0 370,10 430,10 470,0"
      stroke="url(#grace-lower-amber)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

export const BespokeLowerPlinth: React.FC<{ theme: PioneerTheme }> = ({ theme }) => {
  return (
    <div className="relative w-full overflow-visible select-none pointer-events-none -mt-1 z-30">
      {theme.id === "PION-02" ? (
        <GraceHopperLowerPlinth theme={theme} />
      ) : (
        <AdaLovelaceLowerPlinth theme={theme} />
      )}
    </div>
  );
};

/* ========================================================================= */
/* BESPOKE CENTRAL ANCHOR ESCUTCHEONS                                        */
/* ========================================================================= */

/**
 * Escutcheon for Ada Lovelace: Analytical Engine Milled Digit Gear
 */
const AdaDialEscutcheon: React.FC<{ theme: PioneerTheme }> = ({ theme }) => (
  <svg
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-12 h-12 -ml-3"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id={`ada-dial-aureate-core-${theme.id}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF4D9" />
        <stop offset="45%" stopColor={theme.goldHighlight} />
        <stop offset="80%" stopColor={theme.goldTrim} />
        <stop offset="100%" stopColor={theme.bronzeDeep} />
      </radialGradient>
    </defs>
    <g transform="translate(27, 27)">
      <circle r="22" fill={theme.obsidianStops[0]} stroke={theme.goldTrim} strokeWidth="1.5" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="0"
          y1="-22"
          x2="0"
          y2="-26"
          stroke={theme.goldTrim}
          strokeWidth="2"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle r="14" fill={theme.obsidianStops[1]} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      <circle r="6" fill={`url(#ada-dial-aureate-core-${theme.id})`} />
      <circle r="2" fill="#FFFFFF" />
    </g>
  </svg>
);

/**
 * Escutcheon for Margaret Hamilton: Apollo AGC Navigational Reticle
 */
export const MargaretReticleEscutcheon: React.FC<{ theme: PioneerTheme }> = ({ theme }) => (
  <svg
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-12 h-12 -ml-3"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="margaret-reticle-core" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#E0F2FE" />
        <stop offset="45%" stopColor={theme.secondaryAccent} />
        <stop offset="80%" stopColor={theme.accentColor} />
        <stop offset="100%" stopColor={theme.obsidianStops[0]} />
      </radialGradient>
    </defs>
    <g transform="translate(27, 27)">
      {/* Outer Hexagonal Telemetry Ring */}
      <polygon
        points="0,-24 21,-12 21,12 0,24 -21,12 -21,-12"
        fill={theme.obsidianStops[0]}
        stroke={theme.accentColor}
        strokeWidth="1.5"
      />
      {/* Attitude Concentric Guidance Rings */}
      <circle r="16" stroke={theme.secondaryAccent} strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
      <circle r="10" stroke={theme.goldTrim} strokeWidth="1" opacity="0.7" />
      {/* Crosshair Attitude Indicator */}
      <line x1="-24" y1="0" x2="24" y2="0" stroke={theme.secondaryAccent} strokeWidth="1.2" />
      <line x1="0" y1="-24" x2="0" y2="24" stroke={theme.secondaryAccent} strokeWidth="1.2" />
      {/* Central Navigational Node */}
      <circle r="5" fill="url(#margaret-reticle-core)" />
      <circle r="1.5" fill="#FFFFFF" />
    </g>
  </svg>
);

/**
 * Escutcheon for Grace Hopper: A-0 Symbol Translation Gateway
 */
const GraceTranslationEscutcheon: React.FC<{ theme: PioneerTheme }> = ({ theme }) => (
  <svg
    viewBox="0 0 54 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-12 h-12 -ml-3"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="grace-symbol-core" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FEF3C7" />
        <stop offset="50%" stopColor={theme.goldHighlight} />
        <stop offset="85%" stopColor={theme.goldTrim} />
        <stop offset="100%" stopColor={theme.bronzeDeep} />
      </radialGradient>
    </defs>
    <g transform="translate(27, 27)">
      {/* Outer Square Subroutine Border */}
      <rect
        x="-18"
        y="-18"
        width="36"
        height="36"
        fill={theme.obsidianStops[0]}
        stroke={theme.goldTrim}
        strokeWidth="1.5"
        rx="2"
      />
      {/* Diagonal Symbolic Branch Paths */}
      <line x1="-14" y1="-14" x2="14" y2="14" stroke={theme.accentColor} strokeWidth="1.2" />
      <line x1="-14" y1="14" x2="14" y2="-14" stroke={theme.accentColor} strokeWidth="1.2" />
      {/* 4 Corner Subroutine Pins */}
      {[-12, 12].map((x) =>
        [-12, 12].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill={theme.secondaryAccent} />
        ))
      )}
      {/* Central Translation Gateway Core */}
      <circle r="7" fill="url(#grace-symbol-core)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <circle r="2" fill="#FFFFFF" />
    </g>
  </svg>
);

/* ========================================================================= */
/* STATE-DEPENDENT STRUCTURAL RAILS (SYMMETRICAL ARCHITECTURAL ENCLOSURE)    */
/* ========================================================================= */

/**
 * LeftArchitecturalHingeSpine
 * Master structural pier anchoring the left flank of the exhibit to the timeline.
 * Completely concealed when closed (p = 0): knuckles meet at center, rods have scaleY = 0.
 * Emerges progressively from the central anchor as p advances from 0.20 to 0.70.
 */
export const LeftArchitecturalHingeSpine: React.FC<{
  theme: PioneerTheme;
  spineWrapperRef?: React.RefObject<HTMLDivElement | null>;
  dialRef: React.RefObject<HTMLDivElement | null>;
  topKnuckleRef: React.RefObject<HTMLDivElement | null>;
  bottomKnuckleRef: React.RefObject<HTMLDivElement | null>;
  upperRodRef: React.RefObject<HTMLDivElement | null>;
  lowerRodRef: React.RefObject<HTMLDivElement | null>;
}> = ({ theme, spineWrapperRef, dialRef, topKnuckleRef, bottomKnuckleRef, upperRodRef, lowerRodRef }) => {
  return (
    <div
      ref={spineWrapperRef}
      aria-hidden="true"
      className="absolute -left-3 top-0 bottom-0 w-6 z-30 pointer-events-none flex flex-col justify-between items-center select-none obsidian-left-spine"
    >
      {/* 1. Top Hinge Knuckle (Travels vertically with upper mantle: y: halfHeight -> 0) */}
      <div
        ref={topKnuckleRef}
        className="w-5 h-8 rounded-xs border shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0 z-10"
        style={{
          backgroundColor: theme.obsidianStops[1],
          borderColor: `${theme.goldTrim}80`,
        }}
      >
        <div
          className="w-2 h-2 rounded-full border border-white/40"
          style={{ backgroundColor: theme.goldHighlight }}
        />
      </div>

      {/* 2. Upper Structural Rail Rod (Expands from center upward: scaleY: 0 -> 1.0) */}
      <div
        ref={upperRodRef}
        className="w-[3px] flex-1 origin-bottom"
        style={{
          background: `linear-gradient(to top, ${theme.goldHighlight}, ${theme.goldTrim}, ${theme.bronzeDeep})`,
        }}
      />

      {/* 3. Center Anchor Escutcheon (Positioned at center horizon) */}
      <div
        ref={dialRef}
        className="relative my-auto flex items-center justify-center shrink-0 z-20"
      >
        {theme.id === "PION-02" ? (
          <GraceTranslationEscutcheon theme={theme} />
        ) : theme.id === "PION-04" ? (
          <MargaretReticleEscutcheon theme={theme} />
        ) : (
          <AdaDialEscutcheon theme={theme} />
        )}
      </div>

      {/* 4. Lower Structural Rail Rod (Expands from center downward: scaleY: 0 -> 1.0) */}
      <div
        ref={lowerRodRef}
        className="w-[3px] flex-1 origin-top"
        style={{
          background: `linear-gradient(to bottom, ${theme.goldHighlight}, ${theme.goldTrim}, ${theme.bronzeDeep})`,
        }}
      />

      {/* 5. Bottom Hinge Knuckle (Travels vertically with lower plinth: y: -halfHeight -> 0) */}
      <div
        ref={bottomKnuckleRef}
        className="w-5 h-8 rounded-xs border shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0 z-10"
        style={{
          backgroundColor: theme.obsidianStops[1],
          borderColor: `${theme.goldTrim}80`,
        }}
      >
        <div
          className="w-2 h-2 rounded-full border border-white/40"
          style={{ backgroundColor: theme.goldHighlight }}
        />
      </div>
    </div>
  );
};

/**
 * RightArchitecturalLatchPier
 * Complementary structural pier anchoring the right flank of the exhibit.
 * Provides deliberate, symmetrical structural framing.
 * Completely concealed when closed (p = 0): latch shoes meet at center, guide rods have scaleY = 0.
 * Widens smoothly from 268px closed width to 640px open width as exhibit unfurls.
 */
export const RightArchitecturalLatchPier: React.FC<{
  theme: PioneerTheme;
  pierWrapperRef: React.RefObject<HTMLDivElement | null>;
  topShoeRef: React.RefObject<HTMLDivElement | null>;
  bottomShoeRef: React.RefObject<HTMLDivElement | null>;
  upperRodRef: React.RefObject<HTMLDivElement | null>;
  lowerRodRef: React.RefObject<HTMLDivElement | null>;
}> = ({ theme, pierWrapperRef, topShoeRef, bottomShoeRef, upperRodRef, lowerRodRef }) => {
  return (
    <div
      ref={pierWrapperRef}
      aria-hidden="true"
      className="absolute -right-3 top-0 bottom-0 w-6 z-30 pointer-events-none flex flex-col justify-between items-center select-none obsidian-right-pier"
    >
      {/* 1. Top Latch Shoe (Travels vertically with upper mantle: y: halfHeight -> 0) */}
      <div
        ref={topShoeRef}
        className="w-5 h-8 rounded-xs border shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0 z-10"
        style={{
          backgroundColor: theme.obsidianStops[1],
          borderColor: `${theme.goldTrim}80`,
        }}
      >
        <div
          className="w-2 h-2 rounded-xs border border-white/40"
          style={{ backgroundColor: theme.accentColor }}
        />
      </div>

      {/* 2. Upper Guide Rod (Expands from center upward: scaleY: 0 -> 1.0) */}
      <div
        ref={upperRodRef}
        className="w-[2.5px] flex-1 origin-bottom"
        style={{
          background: `linear-gradient(to top, ${theme.goldHighlight}, ${theme.goldTrim}, ${theme.bronzeDeep})`,
        }}
      />

      {/* 3. Center Registration Latch Node (Positioned at center horizon) */}
      <div className="relative my-auto flex items-center justify-center shrink-0 z-20">
        <div
          className="w-7 h-7 rounded-xs border shadow-[0_4px_12px_rgba(0,0,0,0.9)] flex items-center justify-center"
          style={{
            backgroundColor: theme.obsidianStops[0],
            borderColor: `${theme.goldTrim}90`,
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full border border-white/50"
            style={{ backgroundColor: theme.goldHighlight }}
          />
        </div>
      </div>

      {/* 4. Lower Guide Rod (Expands from center downward: scaleY: 0 -> 1.0) */}
      <div
        ref={lowerRodRef}
        className="w-[2.5px] flex-1 origin-top"
        style={{
          background: `linear-gradient(to bottom, ${theme.goldHighlight}, ${theme.goldTrim}, ${theme.bronzeDeep})`,
        }}
      />

      {/* 5. Bottom Latch Shoe (Travels vertically with lower plinth: y: -halfHeight -> 0) */}
      <div
        ref={bottomShoeRef}
        className="w-5 h-8 rounded-xs border shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0 z-10"
        style={{
          backgroundColor: theme.obsidianStops[1],
          borderColor: `${theme.goldTrim}80`,
        }}
      >
        <div
          className="w-2 h-2 rounded-xs border border-white/40"
          style={{ backgroundColor: theme.accentColor }}
        />
      </div>
    </div>
  );
};

/**
 * SideGuideRails
 * Integrated vertical guide rails framing the left and right flanks of the reading monument.
 * Symmetrical, deliberate framing matching the architectural monument style.
 */
export const SideGuideRails: React.FC<{ theme: PioneerTheme }> = ({ theme }) => {
  return (
    <>
      {/* Left Framing Rail */}
      <div className="absolute left-0 top-0 bottom-0 w-3 z-20 pointer-events-none flex flex-col justify-between py-6">
        <div
          className="w-full h-full flex flex-col justify-around items-center"
          style={{
            background: `linear-gradient(to right, ${theme.obsidianStops[1]}, transparent)`,
            borderRight: `1px solid ${theme.goldTrim}40`,
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-1.5 h-[1.5px]"
              style={{ backgroundColor: `${theme.goldTrim}60` }}
            />
          ))}
        </div>
      </div>
      {/* Right Framing Rail */}
      <div className="absolute right-0 top-0 bottom-0 w-3 z-20 pointer-events-none flex flex-col justify-between py-6">
        <div
          className="w-full h-full flex flex-col justify-around items-center"
          style={{
            background: `linear-gradient(to left, ${theme.obsidianStops[1]}, transparent)`,
            borderLeft: `1px solid ${theme.goldTrim}40`,
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-1.5 h-[1.5px]"
              style={{ backgroundColor: `${theme.goldTrim}60` }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

/* ========================================================================= */
/* SUPPORTING ARCHIVAL ARTIFACTS (BESPOKE HISTORICAL SCHEMATICS)             */
/* ========================================================================= */

/**
 * AdaLovelaceArchivalArtifact (PION-01)
 * Note G (1843) Analytical Engine Mill & Store Gear Train + Bernoulli Computing Table.
 */
const AdaLovelaceArchivalArtifact: React.FC<{ theme: PioneerTheme }> = ({ theme }) => {
  return (
    <div
      className="my-5 py-4 border-y select-none"
      style={{ borderColor: `${theme.goldTrim}35` }}
    >
      <div
        className="flex items-center justify-between border-b pb-2 mb-3"
        style={{ borderColor: `${theme.goldTrim}25` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono tracking-widest uppercase font-semibold"
            style={{ color: theme.goldTrim }}
          >
            ARCHIVAL SPECIFICATION · NOTE G (1843)
          </span>
        </div>
        <span className="text-xs font-mono text-slate-300">
          ANALYTICAL ENGINE MILL & STORE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: Analytical Engine Gear Train Schematic */}
        <div className="flex flex-col items-center">
          <svg
            viewBox="0 0 240 100"
            fill="none"
            className="w-full h-auto max-h-24"
            role="img"
            aria-label="Analytical Engine gear train memory store and mill mechanical schematic"
          >
            <line x1="20" y1="50" x2="220" y2="50" stroke={theme.bronzeDeep} strokeWidth="2.5" />
            <line x1="20" y1="49" x2="220" y2="49" stroke={theme.goldTrim} strokeWidth="0.8" />

            {/* Cog Gear 1: Store (Memory) */}
            <g transform="translate(65, 50)">
              <circle r="34" stroke={theme.goldTrim} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
              <circle r="22" stroke="#CBD5E1" strokeWidth="1" opacity="0.6" />
              <circle r="6" fill={theme.goldHighlight} />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="0"
                  y1="-34"
                  x2="0"
                  y2="-38"
                  stroke={theme.goldTrim}
                  strokeWidth="2"
                  transform={`rotate(${deg})`}
                />
              ))}
              <text x="0" y="3" fill="#F5F8FA" fontSize="7" fontFamily="monospace" textAnchor="middle">
                STORE
              </text>
            </g>

            {/* Transfer Pinion Gear */}
            <g transform="translate(120, 50)">
              <circle r="14" stroke={theme.bronzeDeep} strokeWidth="1.5" />
              <circle r="4" fill={theme.goldTrim} />
              <text x="0" y="2" fill={theme.goldTrim} fontSize="6" fontFamily="monospace" textAnchor="middle">
                VAR
              </text>
            </g>

            {/* Cog Gear 2: Mill (Processor) */}
            <g transform="translate(175, 50)">
              <circle r="34" stroke={theme.goldTrim} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
              <circle r="22" stroke="#CBD5E1" strokeWidth="1" opacity="0.6" />
              <circle r="6" fill={theme.goldHighlight} />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="0"
                  y1="-34"
                  x2="0"
                  y2="-38"
                  stroke={theme.goldTrim}
                  strokeWidth="2"
                  transform={`rotate(${deg})`}
                />
              ))}
              <text x="0" y="3" fill="#F5F8FA" fontSize="7" fontFamily="monospace" textAnchor="middle">
                MILL
              </text>
            </g>
          </svg>
          <span className="text-xs font-mono text-slate-300 mt-1 text-center">
            Mechanical Symbol Manipulation System
          </span>
        </div>

        {/* Right: Note G Bernoulli Sequence Table Matrix */}
        <div className="font-mono text-xs leading-snug">
          <div
            className="font-semibold border-b border-white/10 pb-1 mb-1.5 flex justify-between"
            style={{ color: theme.goldTrim }}
          >
            <span>OPERATION CARDS</span>
            <span className="text-slate-400">VARIABLE ROSTER</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>1: [×] V₂ × V₃ → V₄</span>
              <span className="text-slate-400">1st Product</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>2: [÷] V₄ / V₁ → V₅</span>
              <span className="text-slate-400">Bernoulli Term</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>3: [+] V₅ + V₇ → V₈</span>
              <span className="text-slate-400">Cumulative Sum</span>
            </div>
            <div
              className="pt-1 text-xs font-semibold border-t border-white/10 flex justify-between"
              style={{ color: theme.goldTrim }}
            >
              <span>Result: B₁ = -1/2</span>
              <span>Loop: Note G</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * MargaretHamiltonArchivalArtifact (PION-04)
 * Apollo AGC Core Rope Memory & Priority Executive Preemption.
 */
export const MargaretHamiltonArchivalArtifact: React.FC<{ theme: PioneerTheme }> = ({ theme }) => {
  return (
    <div
      className="my-5 py-4 border-y select-none"
      style={{ borderColor: `${theme.goldTrim}35` }}
      role="img"
      aria-label="Apollo AGC core rope memory ferrite cores and asynchronous priority executive schematic"
    >
      <div
        className="flex items-center justify-between border-b pb-2 mb-3"
        style={{ borderColor: `${theme.goldTrim}25` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono tracking-widest uppercase font-semibold"
            style={{ color: theme.goldTrim }}
          >
            ARCHIVAL SPECIFICATION · MIT-IL (1969)
          </span>
        </div>
        <span className="text-xs font-mono text-slate-300">
          ASYNC PRIORITY EXECUTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: Apollo AGC Core Rope Memory & Priority Bus Schematic */}
        <div className="flex flex-col items-center">
          <svg
            viewBox="0 0 240 100"
            fill="none"
            className="w-full h-auto max-h-24"
            role="img"
            aria-label="Apollo AGC core rope memory ferrite rings and asynchronous executive priority bus schematic"
          >
            {/* Bus carrier rails in bronze and gold highlight */}
            <line x1="20" y1="50" x2="220" y2="50" stroke={theme.bronzeDeep} strokeWidth="2.5" />
            <line x1="20" y1="49" x2="220" y2="49" stroke={theme.goldTrim} strokeWidth="0.8" />

            {/* Core Ring 1: Priority Scheduler Node */}
            <g transform="translate(65, 50)">
              <circle r="34" stroke={theme.goldTrim} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
              <circle r="22" stroke="#CBD5E1" strokeWidth="1" opacity="0.6" />
              <circle r="6" fill={theme.goldHighlight} />
              <line x1="-24" y1="-24" x2="24" y2="24" stroke={theme.goldTrim} strokeWidth="1.5" />
              <text x="0" y="3" fill="#F5F8FA" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
                SCHED
              </text>
            </g>

            {/* Coupling Pinion Node */}
            <g transform="translate(120, 50)">
              <circle r="14" stroke={theme.bronzeDeep} strokeWidth="1.5" />
              <circle r="4" fill={theme.goldTrim} />
              <text x="0" y="2" fill={theme.goldTrim} fontSize="6" fontFamily="monospace" textAnchor="middle">
                AGC
              </text>
            </g>

            {/* Core Ring 2: 1201/1202 Recovery Executive */}
            <g transform="translate(175, 50)">
              <circle r="34" stroke={theme.goldTrim} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
              <circle r="22" stroke="#CBD5E1" strokeWidth="1" opacity="0.6" />
              <circle r="6" fill={theme.goldHighlight} />
              <line x1="-24" y1="24" x2="24" y2="-24" stroke={theme.goldTrim} strokeWidth="1.5" />
              <text x="0" y="3" fill="#F5F8FA" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
                EXEC
              </text>
            </g>
          </svg>
          <span className="text-xs font-mono text-slate-300 mt-1 text-center">
            Asynchronous Task Overload Recovery System
          </span>
        </div>

        {/* Right: Radar Overload & Priority Queue Table Matrix */}
        <div className="font-mono text-xs leading-snug">
          <div
            className="font-semibold border-b border-white/10 pb-1 mb-1.5 flex justify-between"
            style={{ color: theme.goldTrim }}
          >
            <span>OPERATION QUEUE</span>
            <span className="text-slate-400">PRIORITY ROSTER</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>1: [P0] Descent Engine Throttling</span>
              <span className="text-slate-400">Active · Nominal</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>2: [P1] Attitude Guidance Matrix</span>
              <span className="text-slate-400">Active · Nominal</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>3: [P4] Radar Cycles (1202 Alarm)</span>
              <span className="text-slate-400">Shed · Non-Critical</span>
            </div>
            <div
              className="pt-1 text-xs font-semibold border-t border-white/10 flex justify-between"
              style={{ color: theme.goldTrim }}
            >
              <span>Result: Landing Nominal</span>
              <span>Loop: Priority Exec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * GraceHopperArchivalArtifact (PION-02)
 * A-0 Compiler Specification (1952) · Symbolic Subroutine Call Hierarchy & Machine Code Translation.
 */
const GraceHopperArchivalArtifact: React.FC<{ theme: PioneerTheme }> = ({ theme }) => {
  return (
    <div
      className="my-5 py-4 border-y select-none"
      style={{ borderColor: `${theme.goldTrim}35` }}
    >
      <div
        className="flex items-center justify-between border-b pb-2 mb-3"
        style={{ borderColor: `${theme.goldTrim}25` }}
      >
        <span
          className="text-xs font-mono tracking-widest uppercase font-semibold"
          style={{ color: theme.goldHighlight }}
        >
          A-0 COMPILER SPECIFICATION (1952)
        </span>
        <span className="text-xs font-mono text-slate-300">SYMBOLIC COMPILATION MATRIX</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: Symbolic Translation Flowchart Vector Diagram */}
        <div className="flex flex-col items-center">
          <svg
            viewBox="0 0 240 100"
            fill="none"
            className="w-full h-auto max-h-24"
            role="img"
            aria-label="A-0 compiler symbolic translation and subroutine architecture schematic"
          >
            {/* Step 1: Pseudo-Code Input */}
            <rect x="10" y="15" width="55" height="28" rx="2" fill={theme.obsidianStops[1]} stroke={theme.accentColor} strokeWidth="1.2" />
            <text x="37" y="28" fill="#F5F8FA" fontSize="6" fontFamily="monospace" textAnchor="middle">
              PSEUDO
            </text>
            <text x="37" y="36" fill={theme.secondaryAccent} fontSize="5" fontFamily="monospace" textAnchor="middle">
              ROUTINE
            </text>

            {/* Arrow 1 */}
            <line x1="65" y1="29" x2="85" y2="29" stroke={theme.goldTrim} strokeWidth="1.5" />
            <polygon points="85,29 80,26 80,32" fill={theme.goldTrim} />

            {/* Step 2: A-0 Subroutine Library Search */}
            <polygon points="115,10 145,29 115,48 85,29" fill={theme.obsidianStops[0]} stroke={theme.goldTrim} strokeWidth="1.4" />
            <text x="115" y="28" fill={theme.goldHighlight} fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              A-0
            </text>
            <text x="115" y="35" fill="#CBD5E1" fontSize="4.5" fontFamily="monospace" textAnchor="middle">
              LOOKUP
            </text>

            {/* Arrow 2 */}
            <line x1="145" y1="29" x2="165" y2="29" stroke={theme.goldTrim} strokeWidth="1.5" />
            <polygon points="165,29 160,26 160,32" fill={theme.goldTrim} />

            {/* Step 3: Absolute Machine Tape Output */}
            <rect x="165" y="15" width="65" height="28" rx="2" fill={theme.obsidianStops[1]} stroke={theme.secondaryAccent} strokeWidth="1.2" />
            <text x="197" y="28" fill="#F5F8FA" fontSize="6" fontFamily="monospace" textAnchor="middle">
              UNIVAC I
            </text>
            <text x="197" y="36" fill={theme.goldHighlight} fontSize="5" fontFamily="monospace" textAnchor="middle">
              BINARY TAPE
            </text>

            {/* Lower Inlining Bus */}
            <path d="M 37,43 L 37,75 L 197,75 L 197,43" stroke={theme.bronzeDeep} strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
            <text x="117" y="84" fill={theme.goldTrim} fontSize="5.5" fontFamily="monospace" textAnchor="middle">
              Subroutine Inlining & Memory Allocation
            </text>
          </svg>
          <span className="text-xs font-mono text-slate-300 mt-1 text-center">
            First High-Level Machine Independence System
          </span>
        </div>

        {/* Right: Subroutine Registry Matrix */}
        <div className="font-mono text-xs leading-snug">
          <div
            className="font-semibold border-b border-white/10 pb-1 mb-1.5 flex justify-between"
            style={{ color: theme.goldTrim }}
          >
            <span>SUBROUTINE CALL</span>
            <span className="text-slate-400">UNIVAC REGISTRY</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-blue-300">1: [CALL] A-001 (Sine)</span>
              <span className="text-slate-400">Addr: 0x0120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-300">2: [CALL] A-004 (Float Add)</span>
              <span className="text-slate-400">Addr: 0x0180</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-300">3: [RESOLVE] Relocations</span>
              <span className="text-slate-400">Tape Pass #2</span>
            </div>
            <div
              className="pt-1 text-xs font-semibold border-t border-white/10 flex justify-between"
              style={{ color: theme.goldHighlight }}
            >
              <span>Status: Compiled Executable</span>
              <span>Subroutines: 12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * KatherineJohnsonArchivalArtifact (PION-03)
 * NASA TM X-514 (1960/1962) Mercury-Atlas 6 Orbit & Apollo 11 Lunar Return Corridor.
 */
export const KatherineJohnsonArchivalArtifact: React.FC<{ theme: PioneerTheme }> = ({ theme }) => {
  return (
    <div
      className="my-5 py-4 border-y select-none"
      style={{ borderColor: `${theme.goldTrim}35` }}
      role="img"
      aria-label="Katherine Johnson orbital trajectory mechanics and re-entry corridor schematic"
    >
      <div
        className="flex items-center justify-between border-b pb-2 mb-3"
        style={{ borderColor: `${theme.goldTrim}25` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono tracking-widest uppercase font-semibold"
            style={{ color: theme.goldTrim }}
          >
            ARCHIVAL SPECIFICATION · NASA TM X-514 (1962)
          </span>
        </div>
        <span className="text-xs font-mono text-slate-300">
          ORBITAL TRAJECTORY & AZIMUTH
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: Polar Trajectory Plane & Re-entry Corridor */}
        <div className="flex flex-col items-center">
          <svg
            viewBox="0 0 240 100"
            fill="none"
            className="w-full h-auto max-h-24"
            role="img"
            aria-label="Mercury-Atlas orbital trajectory and re-entry angle flight path schematic"
          >
            <line x1="20" y1="50" x2="220" y2="50" stroke={theme.bronzeDeep} strokeWidth="2.5" />
            <line x1="20" y1="49" x2="220" y2="49" stroke={theme.goldTrim} strokeWidth="0.8" />

            {/* Earth Center Sphere */}
            <g transform="translate(65, 50)">
              <circle r="26" fill={theme.obsidianStops[0]} stroke={theme.goldTrim} strokeWidth="1.2" />
              <circle r="16" stroke={theme.accentColor} strokeWidth="1" strokeDasharray="3 2" opacity="0.75" />
              <circle r="4" fill={theme.goldHighlight} />
              <text x="0" y="3" fill="#F5F8FA" fontSize="6" fontFamily="monospace" textAnchor="middle">
                EARTH
              </text>
            </g>

            {/* Elliptical Transfer Node */}
            <g transform="translate(120, 50)">
              <circle r="14" stroke={theme.bronzeDeep} strokeWidth="1.5" />
              <circle r="4" fill={theme.goldTrim} />
              <text x="0" y="2" fill={theme.goldTrim} fontSize="6" fontFamily="monospace" textAnchor="middle">
                MA-6
              </text>
            </g>

            {/* Re-entry Corridor Target Node */}
            <g transform="translate(175, 50)">
              <circle r="34" stroke={theme.goldTrim} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
              <path d="M -24,-12 Q 0,0 24,12" stroke={theme.secondaryAccent} strokeWidth="1.5" fill="none" />
              <circle r="4" cx="0" cy="0" fill={theme.goldHighlight} />
              <text x="0" y="16" fill="#F5F8FA" fontSize="6" fontFamily="monospace" textAnchor="middle">
                RET -6.5°
              </text>
            </g>
          </svg>
          <span className="text-xs font-mono text-slate-300 mt-1 text-center">
            Manual Verification Matches Digital Integration
          </span>
        </div>

        {/* Right: Trajectory & Azimuth Parameters Table */}
        <div className="font-mono text-xs leading-snug">
          <div
            className="font-semibold border-b border-white/10 pb-1 mb-1.5 flex justify-between"
            style={{ color: theme.goldTrim }}
          >
            <span>TRAJECTORY ROSTER</span>
            <span className="text-slate-400">FLIGHT VALUE</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>1: [INJ] V_0: 7.84 km/s</span>
              <span className="text-slate-400">Orbit Insertion</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>2: [AZ] Azimuth: 72.05°</span>
              <span className="text-slate-400">Inc: 32.5° Nom</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>3: [CORR] Corridor: -6.5°</span>
              <span className="text-slate-400">Safe Re-entry</span>
            </div>
            <div
              className="pt-1 text-xs font-semibold border-t border-white/10 flex justify-between"
              style={{ color: theme.goldTrim }}
            >
              <span>Result: Splashdown Nominal</span>
              <span>Loop: Friendship 7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * RadiaPerlmanArchivalArtifact (PION-05)
 * IEEE 802.1D Spanning Tree Protocol (1985) · Acyclic Graph Consensus & Root Bridge Roster.
 */
export const RadiaPerlmanArchivalArtifact: React.FC<{ theme: PioneerTheme }> = ({ theme }) => {
  return (
    <div
      className="my-5 py-4 border-y select-none"
      style={{ borderColor: `${theme.goldTrim}35` }}
      role="img"
      aria-label="IEEE 802.1D Spanning Tree Protocol root bridge and loop-free topology schematic"
    >
      <div
        className="flex items-center justify-between border-b pb-2 mb-3"
        style={{ borderColor: `${theme.goldTrim}25` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono tracking-widest uppercase font-semibold"
            style={{ color: theme.goldTrim }}
          >
            ARCHIVAL SPECIFICATION · IEEE 802.1D (1985)
          </span>
        </div>
        <span className="text-xs font-mono text-slate-300">
          SPANNING TREE PROTOCOL (STP)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: Bridge Mesh & Acyclic Tree Vector Diagram */}
        <div className="flex flex-col items-center">
          <svg
            viewBox="0 0 240 100"
            fill="none"
            className="w-full h-auto max-h-24"
            role="img"
            aria-label="Root bridge election and port state forwarding blocking topology"
          >
            <line x1="20" y1="50" x2="220" y2="50" stroke={theme.bronzeDeep} strokeWidth="2.5" />
            <line x1="20" y1="49" x2="220" y2="49" stroke={theme.goldTrim} strokeWidth="0.8" />

            {/* Root Bridge Node B1 */}
            <g transform="translate(65, 50)">
              <circle r="30" stroke={theme.goldTrim} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
              <circle r="20" stroke="#CBD5E1" strokeWidth="1" opacity="0.6" />
              <circle r="6" fill={theme.goldHighlight} />
              <text x="0" y="3" fill="#F5F8FA" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
                ROOT B1
              </text>
            </g>

            {/* Designated Link Pinion */}
            <g transform="translate(120, 50)">
              <circle r="14" stroke={theme.bronzeDeep} strokeWidth="1.5" />
              <circle r="4" fill={theme.goldTrim} />
              <text x="0" y="2" fill={theme.goldTrim} fontSize="6" fontFamily="monospace" textAnchor="middle">
                BPDU
              </text>
            </g>

            {/* Blocked Alternate Node (Loop Elimination) */}
            <g transform="translate(175, 50)">
              <circle r="30" stroke={theme.goldTrim} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
              <line x1="-15" y1="-15" x2="15" y2="15" stroke="#F59E0B" strokeWidth="1.8" />
              <line x1="-15" y1="15" x2="15" y2="-15" stroke="#F59E0B" strokeWidth="1.8" />
              <text x="0" y="24" fill="#F5F8FA" fontSize="6" fontFamily="monospace" textAnchor="middle">
                BLOCK LOOP
              </text>
            </g>
          </svg>
          <span className="text-xs font-mono text-slate-300 mt-1 text-center">
            Deterministic Loop-Free Distributed Consensus
          </span>
        </div>

        {/* Right: Port State & BPDU Cost Table */}
        <div className="font-mono text-xs leading-snug">
          <div
            className="font-semibold border-b border-white/10 pb-1 mb-1.5 flex justify-between"
            style={{ color: theme.goldTrim }}
          >
            <span>PORT IDENTIFIER</span>
            <span className="text-slate-400">STATE / COST</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>1: [B1] Root Bridge Priority</span>
              <span className="text-slate-400">0x8000.00 Nom</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>2: [P1] Forwarding Root Port</span>
              <span className="text-slate-400">Cost: 4 (1Gb)</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>3: [P3] Redundant Loop Shed</span>
              <span className="text-slate-400">Blocked · Safe</span>
            </div>
            <div
              className="pt-1 text-xs font-semibold border-t border-white/10 flex justify-between"
              style={{ color: theme.goldTrim }}
            >
              <span>Result: Broadcast Storm 0</span>
              <span>Loop: Algorithmic STP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * FeiFeiLiArchivalArtifact (PION-06)
 * ImageNet CVPR (2009) · WordNet Ontological Synset Tree & Visual Representation Matrix.
 */
export const FeiFeiLiArchivalArtifact: React.FC<{ theme: PioneerTheme }> = ({ theme }) => {
  return (
    <div
      className="my-5 py-4 border-y select-none"
      style={{ borderColor: `${theme.goldTrim}35` }}
      role="img"
      aria-label="ImageNet 14 million image ontological taxonomy and feature extraction matrix"
    >
      <div
        className="flex items-center justify-between border-b pb-2 mb-3"
        style={{ borderColor: `${theme.goldTrim}25` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono tracking-widest uppercase font-semibold"
            style={{ color: theme.goldTrim }}
          >
            ARCHIVAL SPECIFICATION · CVPR (2009)
          </span>
        </div>
        <span className="text-xs font-mono text-slate-300">
          IMAGENET SYNSET TAXONOMY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: WordNet Tree & Feature Pyramid Schematic */}
        <div className="flex flex-col items-center">
          <svg
            viewBox="0 0 240 100"
            fill="none"
            className="w-full h-auto max-h-24"
            role="img"
            aria-label="Ontological WordNet tree and convolutional feature pyramid schematic"
          >
            <line x1="20" y1="50" x2="220" y2="50" stroke={theme.bronzeDeep} strokeWidth="2.5" />
            <line x1="20" y1="49" x2="220" y2="49" stroke={theme.goldTrim} strokeWidth="0.8" />

            {/* Root Synset: Entity Node */}
            <g transform="translate(65, 50)">
              <circle r="30" stroke={theme.goldTrim} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
              <circle r="18" stroke="#CBD5E1" strokeWidth="1" opacity="0.6" />
              <circle r="6" fill={theme.goldHighlight} />
              <text x="0" y="3" fill="#F5F8FA" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
                ENTITY
              </text>
            </g>

            {/* Hierarchical Bifurcation Pinion */}
            <g transform="translate(120, 50)">
              <circle r="14" stroke={theme.bronzeDeep} strokeWidth="1.5" />
              <circle r="4" fill={theme.goldTrim} />
              <text x="0" y="2" fill={theme.goldTrim} fontSize="6" fontFamily="monospace" textAnchor="middle">
                TREE
              </text>
            </g>

            {/* Fine-Grained Categorical Leaf Node */}
            <g transform="translate(175, 50)">
              <circle r="30" stroke={theme.goldTrim} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
              <polygon points="175,35 185,55 165,55" fill={theme.accentColor} opacity="0.8" transform="translate(-175,-50)" />
              <text x="0" y="16" fill="#F5F8FA" fontSize="6" fontFamily="monospace" textAnchor="middle">
                21.8K SYN
              </text>
            </g>
          </svg>
          <span className="text-xs font-mono text-slate-300 mt-1 text-center">
            Foundational Scale for Deep Visual Intelligence
          </span>
        </div>

        {/* Right: Synset Scale & Classification Matrix Table */}
        <div className="font-mono text-xs leading-snug">
          <div
            className="font-semibold border-b border-white/10 pb-1 mb-1.5 flex justify-between"
            style={{ color: theme.goldTrim }}
          >
            <span>DATASET ATTRIBUTE</span>
            <span className="text-slate-400">BENCHMARK</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>1: [CORPUS] 14,197,122 Images</span>
              <span className="text-slate-400">Hand-Annotated</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>2: [SYNSET] 21,841 Categories</span>
              <span className="text-slate-400">WordNet Roster</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.secondaryAccent }}>3: [CHALLENGE] ILSVRC 2012</span>
              <span className="text-slate-400">Top-5 AlexNet</span>
            </div>
            <div
              className="pt-1 text-xs font-semibold border-t border-white/10 flex justify-between"
              style={{ color: theme.goldTrim }}
            >
              <span>Result: Deep Learning Era</span>
              <span>Loop: ImageNet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Bespoke Historical Artifact Header
 */
export const ArtifactHeader: React.FC<{ theme: PioneerTheme }> = ({ theme }) => {
  if (theme.id === "PION-01") {
    return (
      <div className="flex items-center justify-between px-6 py-2.5 bg-black/40 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono tracking-widest uppercase font-semibold"
            style={{ color: theme.goldTrim }}
          >
            {theme.headerTag}
          </span>
          <span className="text-xs font-mono text-slate-300 font-medium">{theme.headerSub}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-85">
          {[1, 0, 1, 1, 0, 1, 1, 0].map((bit, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-xs ${
                bit === 1
                  ? "border"
                  : "bg-black/80 border border-white/15"
              }`}
              style={{
                backgroundColor: bit === 1 ? theme.goldTrim : undefined,
                borderColor: bit === 1 ? theme.goldHighlight : undefined,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (theme.id === "PION-04") {
    return (
      <div className="flex items-center justify-between px-6 py-2.5 bg-black/40 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono tracking-widest uppercase font-semibold"
            style={{ color: theme.goldTrim }}
          >
            {theme.headerTag}
          </span>
          <span className="text-xs font-mono text-slate-300 font-medium">{theme.headerSub}</span>
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((coreIdx) => (
            <div
              key={coreIdx}
              className="w-3.5 h-2 rounded-full border relative flex items-center justify-center bg-black/40"
              style={{ borderColor: `${theme.goldTrim}80` }}
            >
              <div
                className="w-4 h-[1px] absolute transform -rotate-12"
                style={{ backgroundColor: theme.goldHighlight }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (theme.id === "PION-03") {
    return (
      <div className="flex items-center justify-between px-6 py-2.5 bg-black/40 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono tracking-widest uppercase font-semibold"
            style={{ color: theme.goldTrim }}
          >
            {theme.headerTag}
          </span>
          <span className="text-xs font-mono text-slate-300 font-medium">{theme.headerSub}</span>
        </div>
        <div className="flex items-center gap-2">
          {["AZ: 72.05°", "INC: 32.5°", "γ: -6.5°"].map((stat, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
              style={{
                backgroundColor: `${theme.accentColor}20`,
                borderColor: `${theme.accentColor}60`,
                color: theme.secondaryAccent,
              }}
            >
              {stat}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (theme.id === "PION-05") {
    return (
      <div className="flex items-center justify-between px-6 py-2.5 bg-black/40 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono tracking-widest uppercase font-semibold"
            style={{ color: theme.goldTrim }}
          >
            {theme.headerTag}
          </span>
          <span className="text-xs font-mono text-slate-300 font-medium">{theme.headerSub}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {["ROOT: B1", "PORT-1: FWD", "PORT-3: BLK"].map((label, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
              style={{
                backgroundColor: `${theme.accentColor}20`,
                borderColor: `${theme.accentColor}60`,
                color: theme.secondaryAccent,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (theme.id === "PION-06") {
    return (
      <div className="flex items-center justify-between px-6 py-2.5 bg-black/40 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono tracking-widest uppercase font-semibold"
            style={{ color: theme.goldTrim }}
          >
            {theme.headerTag}
          </span>
          <span className="text-xs font-mono text-slate-300 font-medium">{theme.headerSub}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {["L1-CONV", "L2-POOL", "21K-SYNSET"].map((label, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
              style={{
                backgroundColor: `${theme.accentColor}20`,
                borderColor: `${theme.accentColor}60`,
                color: theme.secondaryAccent,
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-6 py-2.5 bg-black/40 border-b border-white/10 select-none">
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-mono tracking-widest uppercase font-semibold"
          style={{ color: theme.goldHighlight }}
        >
          {theme.headerTag}
        </span>
        <span className="text-xs font-mono text-slate-300 font-medium">{theme.headerSub}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {["SUB_01", "SUB_02", "CALL_RET"].map((label, idx) => (
          <span
            key={idx}
            className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
            style={{
              backgroundColor: `${theme.accentColor}20`,
              borderColor: `${theme.accentColor}60`,
              color: theme.secondaryAccent,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* DARKER SATURN V SVG MATERIAL PALETTE (OBSIDIAN LOOM DNA)                  */
/* Smoked aerospace titanium, obsidian roll black, smoked capsule metal,     */
/* volcanic dark bronze F-1 engine bells with glowing throats, gold edges.   */
/* ========================================================================= */

export const SaturnVRocketSVGDefs: React.FC = () => (
  <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
    <defs>
      {/* Smoked Titanium Specular Cylinder Lighting */}
      <linearGradient id="saturn-dark-fuselage" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#080E16" />
        <stop offset="18%" stopColor="#1C2A3D" />
        <stop offset="38%" stopColor="#3E546B" />
        <stop offset="55%" stopColor="#647E99" />
        <stop offset="78%" stopColor="#25374C" />
        <stop offset="100%" stopColor="#0E1622" />
      </linearGradient>

      {/* Deep Obsidian Basalt Roll Pattern Quadrants */}
      <linearGradient id="saturn-dark-roll-black" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#020407" />
        <stop offset="25%" stopColor="#080D14" />
        <stop offset="50%" stopColor="#16202C" />
        <stop offset="75%" stopColor="#090E16" />
        <stop offset="100%" stopColor="#020407" />
      </linearGradient>

      {/* Smoked Command Module Metallic Polish & Thermal Shield */}
      <linearGradient id="saturn-dark-cm-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#556E84" />
        <stop offset="35%" stopColor="#2A3D52" />
        <stop offset="70%" stopColor="#141E2A" />
        <stop offset="100%" stopColor="#080E14" />
      </linearGradient>

      {/* Dark Volcanic Bronze & Smoked Graphite F-1 Engine Bell */}
      <linearGradient id="saturn-dark-f1-bronze" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#120A04" />
        <stop offset="22%" stopColor="#301A07" />
        <stop offset="42%" stopColor="#8C5E24" />
        <stop offset="68%" stopColor="#3D220B" />
        <stop offset="88%" stopColor="#120A04" />
        <stop offset="100%" stopColor="#261407" />
      </linearGradient>

      {/* Smoked Titanium Aerodynamic Stabilization Fin Gradient */}
      <linearGradient id="saturn-dark-fin-titanium" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2E3F53" />
        <stop offset="40%" stopColor="#1B2837" />
        <stop offset="75%" stopColor="#0D1622" />
        <stop offset="100%" stopColor="#05090E" />
      </linearGradient>
    </defs>
  </svg>
);

/* ========================================================================= */
/* MAIN OBSIDIAN EXHIBIT EXPORT                                              */
/* ========================================================================= */

export const ObsidianExhibit = forwardRef<ObsidianExhibitHandle, ObsidianExhibitProps>(
  (
    {
      milestone,
      variant = "spatial-artifact",
      layoutMode = "monument-only",
      progress: controlledProgress,
      interactive = true,
      prefersReducedMotion = false,
      onStateChange,
      onProgressChange,
      onMetricsChange,
      className = "",
    },
    ref
  ) => {
    const isInitiallyClosed =
      !prefersReducedMotion &&
      (controlledProgress !== undefined ? controlledProgress : 0) <= 0.05;

    const containerRef = useRef<HTMLDivElement>(null);
    const dialRef = useRef<HTMLDivElement>(null);
    const monumentWrapperRef = useRef<HTMLDivElement>(null);
    const scrollSheetRef = useRef<HTMLDivElement>(null);
    const upperMantleRef = useRef<HTMLDivElement>(null);
    const lowerPlinthRef = useRef<HTMLDivElement>(null);
    const sideRailsRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const emergenceConduitRef = useRef<SVGPathElement>(null);
    const centerSeamGlowRef = useRef<HTMLDivElement>(null);

    // Structural Rail Refs: Left Hinge Spine
    const leftSpineWrapperRef = useRef<HTMLDivElement>(null);
    const leftTopKnuckleRef = useRef<HTMLDivElement>(null);
    const leftBottomKnuckleRef = useRef<HTMLDivElement>(null);
    const leftUpperRodRef = useRef<HTMLDivElement>(null);
    const leftLowerRodRef = useRef<HTMLDivElement>(null);

    // Structural Rail Refs: Right Architectural Latch Pier
    const rightPierWrapperRef = useRef<HTMLDivElement>(null);
    const rightTopShoeRef = useRef<HTMLDivElement>(null);
    const rightBottomShoeRef = useRef<HTMLDivElement>(null);
    const rightUpperRodRef = useRef<HTMLDivElement>(null);
    const rightLowerRodRef = useRef<HTMLDivElement>(null);

    // Rocket Transformation Refs (Active for Margaret Hamilton / PION-04 Apollo 11)
    const rocketRootRef = useRef<HTMLDivElement>(null);
    const upperRocketAssemblyRef = useRef<HTMLDivElement>(null);
    const lowerRocketAssemblyRef = useRef<HTMLDivElement>(null);
    const rocketHubRef = useRef<HTMLDivElement>(null);
    const leftFuselageShellRef = useRef<HTMLDivElement>(null);
    const rightFuselageShellRef = useRef<HTMLDivElement>(null);
    const finLeftRef = useRef<HTMLDivElement>(null);
    const finRightRef = useRef<HTMLDivElement>(null);
    const centralCleavageSeamRef = useRef<HTMLDivElement>(null);

    const animTimeline = useRef<gsap.core.Timeline | null>(null);
    const liveProgressRef = useRef<number>(prefersReducedMotion ? 1 : (controlledProgress ?? 0));
    const wakeFlameRef = useRef<(() => void) | null>(null);
    const lastMetricsTimeRef = useRef<number>(0);
    const onMetricsChangeRef = useRef(onMetricsChange);
    const onProgressChangeRef = useRef(onProgressChange);

    useEffect(() => {
      onMetricsChangeRef.current = onMetricsChange;
    }, [onMetricsChange]);

    useEffect(() => {
      onProgressChangeRef.current = onProgressChange;
    }, [onProgressChange]);

    const theme = getPioneerTheme(milestone.id, milestone.accentColor);

    // Setup Master Bilateral Center-Outward Unfolding GSAP Timeline
    useIsomorphicLayoutEffect(() => {
      const dial = dialRef.current;
      const monument = monumentWrapperRef.current;
      const sheet = scrollSheetRef.current;
      const upperMantle = upperMantleRef.current;
      const lowerPlinth = lowerPlinthRef.current;
      const sideRails = sideRailsRef.current;
      const content = contentRef.current;
      const conduit = emergenceConduitRef.current;
      const seamGlow = centerSeamGlowRef.current;

      const leftTopKnuckle = leftTopKnuckleRef.current;
      const leftBottomKnuckle = leftBottomKnuckleRef.current;
      const leftUpperRod = leftUpperRodRef.current;
      const leftLowerRod = leftLowerRodRef.current;

      const rightPier = rightPierWrapperRef.current;
      const rightTopShoe = rightTopShoeRef.current;
      const rightBottomShoe = rightBottomShoeRef.current;
      const rightUpperRod = rightUpperRodRef.current;
      const rightLowerRod = rightLowerRodRef.current;

      // Rocket elements
      const rocketRoot = rocketRootRef.current;
      const upperAssembly = upperRocketAssemblyRef.current;
      const lowerAssembly = lowerRocketAssemblyRef.current;
      const hub = rocketHubRef.current;
      const leftShell = leftFuselageShellRef.current;
      const rightShell = rightFuselageShellRef.current;
      const finL = finLeftRef.current;
      const finR = finRightRef.current;
      const cleavageSeam = centralCleavageSeamRef.current;

      if (
        !dial ||
        !monument ||
        !sheet ||
        !upperMantle ||
        !lowerPlinth ||
        !sideRails ||
        !content ||
        !leftTopKnuckle ||
        !leftBottomKnuckle ||
        !leftUpperRod ||
        !leftLowerRod ||
        !rightPier ||
        !rightTopShoe ||
        !rightBottomShoe ||
        !rightUpperRod ||
        !rightLowerRod
      ) {
        return;
      }

      if (prefersReducedMotion) {
        monument.classList.remove("obsidian-closed-init");
        gsap.set(
          [
            monument,
            sheet,
            upperMantle,
            lowerPlinth,
            sideRails,
            content,
            leftTopKnuckle,
            leftBottomKnuckle,
            leftUpperRod,
            leftLowerRod,
            rightPier,
            rightTopShoe,
            rightBottomShoe,
            rightUpperRod,
            rightLowerRod,
          ],
          {
            clearProps: "all",
            opacity: 1,
          }
        );
        if (rocketRoot) {
          gsap.set(rocketRoot, { opacity: 0, pointerEvents: "none" });
        }
        return;
      }

      const sheetHeight = sheet.offsetHeight || 520;
      const halfHeight = sheetHeight / 2;
      // Bounded vertical disassembly travel: artifact sub-assemblies already sit ~170px from center,
      // so travel stays tightly flush inside the settled card's mantle/plinth edges (zero overshoot).
      const deltaY = Math.max(48, Math.min(78, Math.round(halfHeight - 188)));

      const tl = gsap.timeline({
        paused: true,
        onUpdate: () => {
          const prog = tl.progress();
          const wasOpen = liveProgressRef.current > 0.05;
          liveProgressRef.current = prog;
          if (!wasOpen && prog > 0.05) {
            wakeFlameRef.current?.();
          }
          onProgressChangeRef.current?.(prog);

          const now = performance.now();
          if (now - lastMetricsTimeRef.current > 80 && onMetricsChangeRef.current) {
            lastMetricsTimeRef.current = now;
            onMetricsChangeRef.current({
              fps: 60,
              frameTimeMs: 16.6,
              stageSeparationPx: Math.round(prog * deltaY * 2),
              finRotationDeg: Math.round(prog * 90),
              railScaleY: parseFloat(Math.min(Math.max((prog - 0.18) / 0.42, 0), 1).toFixed(2)),
              exhibitWidthPx: Math.round(268 + prog * 372),
            });
          }
        },
        onComplete: () => {
          onProgressChangeRef.current?.(1);
          onStateChange?.(true);
        },
        onReverseComplete: () => {
          onProgressChangeRef.current?.(0);
          onStateChange?.(false);
        },
      });

      const hasArtifact = !!(
        rocketRoot &&
        upperAssembly &&
        lowerAssembly &&
        hub &&
        leftShell &&
        rightShell
      );

      if (hasArtifact) {
        // =====================================================================
        // SIX-PIONEER BOUNDED BAYVERSE CHOREOGRAPHED TRANSFORMATION (2.55s)
        // 0.00-0.78s: Closed artifact showcase hold + signature idle prime
        // 0.78-1.05s: Detent unlatch & pioneer cleavage seam ignition
        // 0.98-1.72s: Bounded pioneer-unique 3D disassembly aligned to card bounds
        // 1.56-2.18s: Frame lock + pioneer-signature clipPath slab unfold
        // 2.05-2.55s: Editorial typography bloom
        // =====================================================================
        gsap.set(rocketRoot, { opacity: 1, pointerEvents: "none" });
        gsap.set(upperAssembly, { x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1, opacity: 1 });
        gsap.set(lowerAssembly, { x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1, opacity: 1 });
        gsap.set(hub, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });
        gsap.set(leftShell, { x: 0, y: 0, rotateY: 0, rotateZ: 0, skewX: 0, scale: 1, opacity: 1 });
        gsap.set(rightShell, { x: 0, y: 0, rotateY: 0, rotateZ: 0, skewX: 0, scale: 1, opacity: 1 });
        if (finL) gsap.set(finL, { rotateZ: 0, x: 0 });
        if (finR) gsap.set(finR, { rotateZ: 0, x: 0 });

        interface PioneerChoreo {
          primeHubRot: number;
          primeHubScale: number;
          primeEase: string;
          primeTiltZ: number;
          hubRotation: number;
          hubScale: number;
          upperX: number;
          upperY: number;
          upperRotX: number;
          upperRotZ: number;
          lowerX: number;
          lowerY: number;
          lowerRotX: number;
          lowerRotZ: number;
          shellX: number;
          shellY: number;
          shellRotateY: number;
          shellRotateZ: number;
          shellSkewX: number;
          shellScale: number;
          assemblyEase: string;
          clipFrom: string;
          clipTo: string;
          monumentRotX: number;
          monumentRotY: number;
          monumentRotZ: number;
        }

        const CHOREO_PROFILES: Record<string, PioneerChoreo> = {
          // 1. Ada Lovelace — Clockwork Jacquard Escapement & 105° Brass Folio Door Hinge
          "PION-01": {
            primeHubRot: 48,
            primeHubScale: 1.07,
            primeEase: "steps(4)",
            primeTiltZ: 0,
            hubRotation: 360,
            hubScale: 1.16,
            upperX: 0,
            upperY: -deltaY * 1.0,
            upperRotX: 0,
            upperRotZ: 0,
            lowerX: 0,
            lowerY: deltaY * 1.0,
            lowerRotX: 0,
            lowerRotZ: 0,
            shellX: 158,
            shellY: 0,
            shellRotateY: 105,
            shellRotateZ: 0,
            shellSkewX: 0,
            shellScale: 0.96,
            assemblyEase: "power3.out",
            clipFrom: "inset(50% 0% 50% 0%)",
            clipTo: "inset(0% 0% 0% 0%)",
            monumentRotX: 5,
            monumentRotY: 4,
            monumentRotZ: 0,
          },
          // 2. Grace Hopper — Linear UNIVAC Magnetic Tape Cassette Shear & Ribbon Wipe
          "PION-02": {
            primeHubRot: -45,
            primeHubScale: 1.05,
            primeEase: "power2.inOut",
            primeTiltZ: 5,
            hubRotation: 180,
            hubScale: 1.10,
            upperX: 0,
            upperY: -deltaY * 0.95,
            upperRotX: 0,
            upperRotZ: -10,
            lowerX: 0,
            lowerY: deltaY * 0.95,
            lowerRotX: 0,
            lowerRotZ: 10,
            shellX: 172,
            shellY: 0,
            shellRotateY: 0,
            shellRotateZ: 0,
            shellSkewX: 4,
            shellScale: 0.94,
            assemblyEase: "power3.inOut",
            clipFrom: "inset(0% 50% 0% 50%)",
            clipTo: "inset(0% 0% 0% 0%)",
            monumentRotX: 0,
            monumentRotY: -5,
            monumentRotZ: 0,
          },
          // 3. Katherine Johnson — Celestial Orbital Gimbal Inclination Sweep & Radar Iris
          "PION-03": {
            primeHubRot: 60,
            primeHubScale: 1.08,
            primeEase: "sine.inOut",
            primeTiltZ: -10,
            hubRotation: 270,
            hubScale: 1.18,
            upperX: 38,
            upperY: -deltaY * 0.98,
            upperRotX: 0,
            upperRotZ: 14,
            lowerX: -38,
            lowerY: deltaY * 0.98,
            lowerRotX: 0,
            lowerRotZ: 14,
            shellX: 152,
            shellY: -44,
            shellRotateY: 50,
            shellRotateZ: 24,
            shellSkewX: 0,
            shellScale: 0.98,
            assemblyEase: "power2.inOut",
            clipFrom: "circle(4% at 50% 50%)",
            clipTo: "circle(85% at 50% 50%)",
            monumentRotX: 6,
            monumentRotY: 0,
            monumentRotZ: -2,
          },
          // 4. Margaret Hamilton — Saturn V Multi-Stage Igniter Blast & 95° Strut Fins
          "PION-04": {
            primeHubRot: 15,
            primeHubScale: 1.04,
            primeEase: "power1.inOut",
            primeTiltZ: 0,
            hubRotation: 45,
            hubScale: 1.12,
            upperX: 0,
            upperY: -deltaY * 1.04,
            upperRotX: 0,
            upperRotZ: 0,
            lowerX: 0,
            lowerY: deltaY * 1.02,
            lowerRotX: 0,
            lowerRotZ: 0,
            shellX: 165,
            shellY: 0,
            shellRotateY: 78,
            shellRotateZ: 0,
            shellSkewX: 0,
            shellScale: 0.98,
            assemblyEase: "power3.out",
            clipFrom: "inset(0% 0% 100% 0%)",
            clipTo: "inset(0% 0% 0% 0%)",
            monumentRotX: 8,
            monumentRotY: 0,
            monumentRotZ: 0,
          },
          // 5. Radia Perlman — 90° Orthogonal Spanning-Tree Bridge Gate & Quad Snap
          "PION-05": {
            primeHubRot: 90,
            primeHubScale: 1.07,
            primeEase: "steps(2)",
            primeTiltZ: 0,
            hubRotation: 180,
            hubScale: 1.14,
            upperX: 0,
            upperY: -deltaY * 0.96,
            upperRotX: 64,
            upperRotZ: 0,
            lowerX: 0,
            lowerY: deltaY * 0.96,
            lowerRotX: -64,
            lowerRotZ: 0,
            shellX: 156,
            shellY: 0,
            shellRotateY: 90,
            shellRotateZ: 0,
            shellSkewX: 0,
            shellScale: 0.98,
            assemblyEase: "expo.inOut",
            clipFrom: "inset(48% 48% 48% 48%)",
            clipTo: "inset(0% 0% 0% 0%)",
            monumentRotX: 0,
            monumentRotY: 6,
            monumentRotZ: 0,
          },
          // 6. Fei-Fei Li — Optical Aperture Iris & 45° Prism Diamond Petal Burst
          "PION-06": {
            primeHubRot: 45,
            primeHubScale: 1.12,
            primeEase: "power2.out",
            primeTiltZ: 8,
            hubRotation: 225,
            hubScale: 1.22,
            upperX: -34,
            upperY: -deltaY * 0.96,
            upperRotX: 12,
            upperRotZ: -14,
            lowerX: 34,
            lowerY: deltaY * 0.96,
            lowerRotX: -12,
            lowerRotZ: 14,
            shellX: 152,
            shellY: 36,
            shellRotateY: 46,
            shellRotateZ: -20,
            shellSkewX: 0,
            shellScale: 1.02,
            assemblyEase: "power3.out",
            clipFrom: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            clipTo: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            monumentRotX: 4,
            monumentRotY: 4,
            monumentRotZ: 2,
          },
        };
        const profile = CHOREO_PROFILES[milestone.id] || CHOREO_PROFILES["PION-01"];

        // Card starts completely folded & hidden so Beat 0 shows ONLY the closed physical artifact
        gsap.set(upperMantle, {
          y: halfHeight,
          scaleX: 0.42,
          rotateX: -14,
          opacity: 0,
          transformOrigin: "left bottom",
        });
        gsap.set(lowerPlinth, {
          y: -halfHeight,
          scaleX: 0.42,
          rotateX: 14,
          opacity: 0,
          transformOrigin: "left top",
        });
        gsap.set(leftTopKnuckle, { y: halfHeight });
        gsap.set(leftBottomKnuckle, { y: -halfHeight });
        gsap.set(leftUpperRod, { scaleY: 0, opacity: 0 });
        gsap.set(leftLowerRod, { scaleY: 0, opacity: 0 });
        gsap.set(leftSpineWrapperRef.current, { opacity: 0, rotation: 0 });
        gsap.set(dial, { rotation: 0, opacity: 0, transformOrigin: "center center" });
        gsap.set(rightPier, { x: -372, opacity: 0 });
        gsap.set(rightTopShoe, { y: halfHeight });
        gsap.set(rightBottomShoe, { y: -halfHeight });
        gsap.set(rightUpperRod, { scaleY: 0, opacity: 0 });
        gsap.set(rightLowerRod, { scaleY: 0, opacity: 0 });
        gsap.set(sheet, { clipPath: profile.clipFrom, opacity: 0 });
        gsap.set(sideRails, { scaleY: 0.12, opacity: 0, transformOrigin: "center center" });
        gsap.set(content, { opacity: 0, y: 10 });
        gsap.set(monument, {
          rotateY: profile.monumentRotY,
          rotateX: profile.monumentRotX,
          rotateZ: profile.monumentRotZ,
          transformOrigin: "left center",
        });

        // BEAT 0 (0.00s -> 0.95s): Closed Artifact Showcase Hold & Signature Prime
        // Note: rocketRoot stays opacity: 1 at progress 0 so closed artifacts never vanish!
        if (conduit) {
          tl.fromTo(
            conduit,
            { strokeDashoffset: 40, opacity: 0.45 },
            { strokeDashoffset: 0, opacity: 1, duration: 0.30, ease: "power2.out" },
            0.00
          );
        }
        tl.to(
          rocketRoot,
          { opacity: 1, scale: 1.02, duration: 0.32, ease: "power2.out" },
          0.00
        );
        tl.to(
          hub,
          {
            rotation: profile.primeHubRot,
            scale: profile.primeHubScale,
            duration: 0.65,
            ease: profile.primeEase,
          },
          0.22
        );
        tl.to(
          upperAssembly,
          {
            rotateZ: profile.primeTiltZ,
            y: -5,
            duration: 0.62,
            ease: "sine.inOut",
          },
          0.24
        );
        tl.to(
          lowerAssembly,
          {
            rotateZ: -profile.primeTiltZ,
            y: 5,
            duration: 0.62,
            ease: "sine.inOut",
          },
          0.24
        );

        // BEAT 1 (0.95s -> 1.38s): Cleavage & Mechanism Unlatch
        tl.to(
          hub,
          {
            rotation: profile.hubRotation,
            scale: profile.hubScale,
            duration: 0.38,
            ease: "power3.out",
          },
          0.95
        );
        if (cleavageSeam) {
          tl.fromTo(
            cleavageSeam,
            { opacity: 0, scaleY: 0.15 },
            { opacity: 1, scaleY: 1.08, duration: 0.22, ease: "power2.out" },
            0.95
          );
          tl.to(cleavageSeam, { opacity: 0, duration: 0.26, ease: "power2.out" }, 1.22);
        }
        if (seamGlow) {
          tl.fromTo(
            seamGlow,
            { opacity: 0.2, scaleY: 1 },
            { opacity: 1, scaleY: 2.3, duration: 0.22, ease: "power2.out" },
            0.95
          );
          tl.to(seamGlow, { opacity: 0, duration: 0.26, ease: "power2.out" }, 1.22);
        }

        // BEAT 2 (1.28s -> 2.30s): Bounded Pioneer-Signature Mechanical Disassembly
        tl.to(
          upperAssembly,
          {
            x: profile.upperX,
            y: profile.upperY,
            rotateX: profile.upperRotX,
            rotateZ: profile.upperRotZ,
            duration: 0.92,
            ease: profile.assemblyEase,
          },
          1.28
        );
        tl.to(
          lowerAssembly,
          {
            x: profile.lowerX,
            y: profile.lowerY,
            rotateX: profile.lowerRotX,
            rotateZ: profile.lowerRotZ,
            duration: 0.92,
            ease: profile.assemblyEase,
          },
          1.28
        );
        tl.to(
          hub,
          {
            x: -182,
            duration: 0.88,
            ease: profile.assemblyEase,
          },
          1.32
        );
        tl.to(
          leftShell,
          {
            x: -profile.shellX,
            y: profile.shellY,
            rotateY: -profile.shellRotateY,
            rotateZ: -profile.shellRotateZ,
            skewX: -profile.shellSkewX,
            scale: profile.shellScale,
            duration: 0.92,
            ease: profile.assemblyEase,
          },
          1.32
        );
        tl.to(
          rightShell,
          {
            x: profile.shellX,
            y: -profile.shellY,
            rotateY: profile.shellRotateY,
            rotateZ: profile.shellRotateZ,
            skewX: profile.shellSkewX,
            scale: profile.shellScale,
            duration: 0.92,
            ease: profile.assemblyEase,
          },
          1.32
        );
        if (finL) {
          tl.fromTo(
            finL,
            { rotateZ: 0, x: 0, transformOrigin: "left bottom" },
            { rotateZ: -95, x: -58, duration: 0.84, ease: "power2.out" },
            1.35
          );
        }
        if (finR) {
          tl.fromTo(
            finR,
            { rotateZ: 0, x: 0, transformOrigin: "right bottom" },
            { rotateZ: 95, x: 58, duration: 0.84, ease: "power2.out" },
            1.35
          );
        }

        // BEAT 3 (2.12s -> 3.00s): Architectural Frame Locks Around Disassembled Cavity & Slab Unfolds
        tl.to(
          upperMantle,
          { y: 0, scaleX: 1.0, rotateX: 0, opacity: 1, duration: 0.80, ease: "power3.inOut" },
          2.12
        );
        tl.to(
          lowerPlinth,
          { y: 0, scaleX: 1.0, rotateX: 0, opacity: 1, duration: 0.80, ease: "power3.inOut" },
          2.12
        );
        tl.to(leftTopKnuckle, { y: 0, duration: 0.80, ease: "power3.inOut" }, 2.12);
        tl.to(leftBottomKnuckle, { y: 0, duration: 0.80, ease: "power3.inOut" }, 2.12);
        tl.to(leftUpperRod, { scaleY: 1.0, opacity: 0.8, duration: 0.76, ease: "power3.inOut" }, 2.16);
        tl.to(leftLowerRod, { scaleY: 1.0, opacity: 0.8, duration: 0.76, ease: "power3.inOut" }, 2.16);
        tl.to(leftSpineWrapperRef.current, { opacity: 1, duration: 0.65, ease: "power2.out" }, 2.18);
        tl.to(dial, { opacity: 1, rotation: 45, duration: 0.72, ease: "power2.out" }, 2.18);
        tl.to(rightPier, { x: 0, opacity: 1, duration: 0.80, ease: "power3.inOut" }, 2.12);
        tl.to(rightTopShoe, { y: 0, duration: 0.80, ease: "power3.inOut" }, 2.12);
        tl.to(rightBottomShoe, { y: 0, duration: 0.80, ease: "power3.inOut" }, 2.12);
        tl.to(rightUpperRod, { scaleY: 1.0, opacity: 0.75, duration: 0.76, ease: "power3.inOut" }, 2.16);
        tl.to(rightLowerRod, { scaleY: 1.0, opacity: 0.75, duration: 0.76, ease: "power3.inOut" }, 2.16);

        // Pioneer-Unique ClipPath Slab Emergence
        tl.fromTo(
          sheet,
          { clipPath: profile.clipFrom, opacity: 0 },
          { clipPath: profile.clipTo, opacity: 1, duration: 0.76, ease: "power3.inOut" },
          2.24
        );
        tl.to(sideRails, { scaleY: 1.0, opacity: 1, duration: 0.64, ease: "power3.out" }, 2.30);
        tl.to(monument, { rotateY: 0, rotateX: 0, rotateZ: 0, duration: 0.76, ease: "power3.out" }, 2.24);

        // Disassembled artifact shells dissolve smoothly into the frame once codex locks open
        tl.to(
          [upperAssembly, lowerAssembly, hub, leftShell, rightShell, rocketRoot],
          { opacity: 0, duration: 0.45, ease: "power2.out" },
          2.48
        );

        // BEAT 4 (2.82s -> 3.45s): Editorial Typography & Archival Bloom
        tl.to(
          content,
          { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
          2.82
        );
        tl.set({}, {}, 3.45);
      } else {
        // =====================================================================
        // STANDARD FOLIO POD UNROLLING (Ada Lovelace, Grace Hopper, etc.)
        // =====================================================================
        // 1. Emergence Conduit Pulse from Timeline Thread
        if (conduit) {
          tl.fromTo(
            conduit,
            { strokeDashoffset: 40, opacity: 0.3 },
            { strokeDashoffset: 0, opacity: 1, duration: 0.14, ease: "power2.out" },
            0.00
          );
        }

        // 2. Rotary Chrono-Escutcheon Activation
        tl.fromTo(
          dial,
          { rotation: 0, transformOrigin: "center center" },
          { rotation: 45, duration: 0.16, ease: "power3.out" },
          0.10
        );

        // 3. Center Fracture Seam Ignition
        if (seamGlow) {
          tl.fromTo(
            seamGlow,
            { opacity: 0.2, scaleY: 1 },
            { opacity: 1, scaleY: 2.2, duration: 0.10, ease: "power2.out" },
            0.12
          );
          tl.to(seamGlow, { opacity: 0, duration: 0.16, ease: "power2.in" }, 0.22);
        }

        // 4. Primary Vertical Center-Outward Expansion
        tl.fromTo(
          upperMantle,
          { y: halfHeight, scaleX: 0.42, rotateX: -14, opacity: 0.98, transformOrigin: "left bottom" },
          { y: 0, scaleX: 1.0, rotateX: 0, opacity: 1, duration: 0.50, ease: "power3.inOut" },
          0.22
        );

        tl.fromTo(
          lowerPlinth,
          { y: -halfHeight, scaleX: 0.42, rotateX: 14, opacity: 0.98, transformOrigin: "left top" },
          { y: 0, scaleX: 1.0, rotateX: 0, opacity: 1, duration: 0.50, ease: "power3.inOut" },
          0.22
        );

        tl.fromTo(
          leftTopKnuckle,
          { y: halfHeight },
          { y: 0, duration: 0.50, ease: "power3.inOut" },
          0.22
        );
        tl.fromTo(
          leftBottomKnuckle,
          { y: -halfHeight },
          { y: 0, duration: 0.50, ease: "power3.inOut" },
          0.22
        );
        tl.fromTo(
          leftUpperRod,
          { scaleY: 0, opacity: 0 },
          { scaleY: 1.0, opacity: 0.8, duration: 0.48, ease: "power3.inOut" },
          0.24
        );
        tl.fromTo(
          leftLowerRod,
          { scaleY: 0, opacity: 0 },
          { scaleY: 1.0, opacity: 0.8, duration: 0.48, ease: "power3.inOut" },
          0.24
        );

        tl.fromTo(
          rightPier,
          { x: -372 },
          { x: 0, duration: 0.50, ease: "power3.inOut" },
          0.22
        );
        tl.fromTo(
          rightTopShoe,
          { y: halfHeight },
          { y: 0, duration: 0.50, ease: "power3.inOut" },
          0.22
        );
        tl.fromTo(
          rightBottomShoe,
          { y: -halfHeight },
          { y: 0, duration: 0.50, ease: "power3.inOut" },
          0.22
        );
        tl.fromTo(
          rightUpperRod,
          { scaleY: 0, opacity: 0 },
          { scaleY: 1.0, opacity: 0.75, duration: 0.48, ease: "power3.inOut" },
          0.24
        );
        tl.fromTo(
          rightLowerRod,
          { scaleY: 0, opacity: 0 },
          { scaleY: 1.0, opacity: 0.75, duration: 0.48, ease: "power3.inOut" },
          0.24
        );

        tl.fromTo(
          sheet,
          { clipPath: "inset(50% 58% 50% 0%)", opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 0.50, ease: "power3.inOut" },
          0.22
        );

        tl.fromTo(
          sideRails,
          { scaleY: 0.12, opacity: 0, transformOrigin: "center center" },
          { scaleY: 1.0, opacity: 1, duration: 0.45, ease: "power3.out" },
          0.28
        );

        if (variant === "spatial-artifact") {
          tl.fromTo(
            monument,
            { rotateY: 3, rotateX: 6, transformOrigin: "left center" },
            { rotateY: 0, rotateX: 0, duration: 0.50, ease: "power3.out" },
            0.22
          );
        }

        tl.fromTo(
          content,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" },
          0.68
        );
      }

      animTimeline.current = tl;
      const initialProgress = controlledProgress !== undefined ? controlledProgress : 0;
      liveProgressRef.current = prefersReducedMotion ? 1 : initialProgress;
      tl.progress(initialProgress, true);
      if (liveProgressRef.current > 0.05) wakeFlameRef.current?.();
      monument.classList.remove("obsidian-closed-init");

      return () => {
        tl.kill();
      };
    }, [milestone, variant, prefersReducedMotion, onStateChange]);

    // Handle controlled progress updates from master scroll or test slider
    useEffect(() => {
      if (
        controlledProgress !== undefined &&
        animTimeline.current &&
        !prefersReducedMotion &&
        !animTimeline.current.isActive()
      ) {
        liveProgressRef.current = controlledProgress;
        if (controlledProgress > 0.05) wakeFlameRef.current?.();
        animTimeline.current.pause().progress(controlledProgress, true);
      }
    }, [controlledProgress, prefersReducedMotion]);

    // Imperative API
    useImperativeHandle(ref, () => ({
      playEntrance: () => {
        if (animTimeline.current) {
          animTimeline.current.timeScale(1).play(0);
        }
      },
      playExit: () => {
        if (animTimeline.current && animTimeline.current.progress() > 0) {
          animTimeline.current.timeScale(2.2).reverse();
        }
      },
      setProgress: (p: number) => {
        liveProgressRef.current = p;
        if (p > 0.05) wakeFlameRef.current?.();
        if (animTimeline.current) animTimeline.current.pause().progress(p, true);
      },
      reset: () => {
        liveProgressRef.current = 0;
        if (animTimeline.current) animTimeline.current.pause(0);
      },
    }));

    const toggleOpen = () => {
      if (!interactive || prefersReducedMotion) return;
      if (animTimeline.current) {
        const curP = animTimeline.current.progress();
        if (curP > 0.5) {
          animTimeline.current.timeScale(1.5).reverse();
        } else if (curP < 0.28 && animTimeline.current.isActive()) {
          // Skip remainder of showcase dwell immediately on deliberate user click
          animTimeline.current.timeScale(1).play(0.95);
        } else {
          animTimeline.current.timeScale(1).play();
        }
      }
    };

    const monumentContent = (
      <>
          {/* Pioneer Physical Artifact Transformation Stage (All 6 Pioneers) */}
          <div
            ref={rocketRootRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 obsidian-artifact-root"
            aria-hidden="true"
          >
            {milestone.id === "PION-04" ? (
              <div className="relative w-[180px] h-[520px] flex flex-col items-center justify-center">
                {/* 1. UPPER ASSEMBLY (LES, CSM, S-IVB Stage) in Darker Smoked Titanium Palette */}
                <div
                  ref={upperRocketAssemblyRef}
                  className="flex flex-col items-center origin-bottom z-35"
                >
                  {/* Launch Escape System (LES) Tower & Probe */}
                  <svg
                    viewBox="0 0 44 76"
                    className="w-11 h-[76px] overflow-visible"
                  >
                    <line x1="22" y1="0" x2="22" y2="26" stroke="#FCD34D" strokeWidth="1.5" />
                    <circle cx="22" cy="2" r="2.2" fill="#F59E0B" />
                    <polygon points="19,24 25,24 26,34 18,34" fill="#991B1B" />
                    <line x1="18" y1="34" x2="8" y2="72" stroke="#647E99" strokeWidth="1.2" />
                    <line x1="26" y1="34" x2="36" y2="72" stroke="#647E99" strokeWidth="1.2" />
                    <line x1="20" y1="34" x2="16" y2="72" stroke="#334155" strokeWidth="0.8" />
                    <line x1="24" y1="34" x2="28" y2="72" stroke="#334155" strokeWidth="0.8" />
                    <line x1="17" y1="44" x2="27" y2="44" stroke="#475569" strokeWidth="0.8" />
                    <line x1="15" y1="54" x2="29" y2="54" stroke="#475569" strokeWidth="0.8" />
                    <line x1="12" y1="64" x2="32" y2="64" stroke="#475569" strokeWidth="0.8" />
                    <polygon points="8,72 36,72 40,76 4,76" fill="url(#saturn-dark-fuselage)" />
                  </svg>

                  {/* Apollo Command & Service Module (CSM) */}
                  <svg
                    viewBox="0 0 68 58"
                    className="w-17 h-[58px] overflow-visible -mt-0.5"
                  >
                    <polygon points="18,0 50,0 60,20 8,20" fill="url(#saturn-dark-cm-metallic)" />
                    <rect x="8" y="20" width="52" height="3" fill="#020407" rx="1" />
                    <rect x="10" y="23" width="48" height="24" fill="url(#saturn-dark-fuselage)" />
                    <rect x="14" y="26" width="6" height="18" fill="#1C2A3D" opacity="0.8" />
                    <rect x="48" y="26" width="6" height="18" fill="#1C2A3D" opacity="0.8" />
                    <polygon points="6,31 10,33 10,37 6,39" fill="#D97706" />
                    <polygon points="62,31 58,33 58,37 62,39" fill="#D97706" />
                    <polygon points="10,47 58,47 66,58 2,58" fill="url(#saturn-dark-fuselage)" />
                  </svg>

                  {/* S-IVB Third Stage with Deep Obsidian Optical Tracking Roll Pattern */}
                  <svg
                    viewBox="0 0 76 52"
                    className="w-[76px] h-[52px] overflow-visible -mt-0.5"
                  >
                    <rect x="0" y="0" width="76" height="52" fill="url(#saturn-dark-fuselage)" />
                    <rect x="0" y="6" width="38" height="18" fill="url(#saturn-dark-roll-black)" />
                    <rect x="38" y="24" width="38" height="18" fill="url(#saturn-dark-roll-black)" />
                    <text
                      x="38"
                      y="49"
                      textAnchor="middle"
                      fill="#FCD34D"
                      fontSize="5.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      letterSpacing="1"
                    >
                      S-IVB STAGE
                    </text>
                    <line x1="72" y1="0" x2="72" y2="52" stroke="#278F9B" strokeWidth="1.8" />
                  </svg>
                </div>

                {/* 2. S-IVB INSTRUMENT UNIT HUB (AGC Guidance Computer Reticle) */}
                <div
                  ref={rocketHubRef}
                  className="relative w-14 h-11 rounded-full border-2 bg-[#04070C] z-45 flex items-center justify-center cursor-pointer my-0.5 overflow-hidden"
                  style={{ borderColor: theme.goldTrim, boxShadow: `0 0 24px ${theme.accentColor}cc` }}
                >
                  <div className="w-10 h-10 rounded-full border border-dashed flex items-center justify-center" style={{ borderColor: `${theme.goldHighlight}cc` }}>
                    <div className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ borderColor: theme.goldTrim }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.goldHighlight, boxShadow: `0 0 12px ${theme.goldHighlight}` }} />
                    </div>
                  </div>
                  <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-[1px] pointer-events-none" style={{ backgroundColor: `${theme.goldTrim}b3` }} />
                  <div className="absolute inset-y-1 left-1/2 -translate-x-1/2 w-[1px] pointer-events-none" style={{ backgroundColor: `${theme.goldTrim}b3` }} />
                </div>

                {/* 3. BILATERAL S-II / S-IC FUSELAGE SHELLS */}
                <div className="relative w-[76px] h-[190px] flex justify-center z-35 my-0.5">
                  <div
                    ref={leftFuselageShellRef}
                    className="w-[38px] h-[190px] flex flex-col justify-between overflow-hidden shadow-2xl origin-left"
                    style={{
                      background:
                        "linear-gradient(90deg, #080E16 0%, #16202C 25%, #2A3B4F 65%, #465F7B 90%, #1F2E3E 100%)",
                      borderLeft: "1px solid rgba(255,255,255,0.25)",
                      borderTop: "1px solid rgba(255,255,255,0.15)",
                      borderBottom: "1px solid rgba(0,0,0,0.9)",
                    }}
                  >
                    <div className="h-24 p-1.5 flex items-center justify-center border-b border-black/40">
                      <span className="text-[7.5px] font-mono text-[#FCD34D] font-extrabold -rotate-90 tracking-[0.25em] whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        UNITED STATES
                      </span>
                    </div>
                    <div className="h-24 p-1.5 flex flex-col items-center justify-around bg-gradient-to-r from-[#16202C] to-[#25374C]">
                      <div className="w-6 h-3.5 border border-black/40 bg-red-700 flex flex-col justify-between p-[0.5px]">
                        <div className="w-3 h-1.5 bg-blue-950 self-start flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-white" />
                        </div>
                        <div className="w-full h-[1px] bg-white" />
                        <div className="w-full h-[1px] bg-white" />
                        <div className="w-full h-[1px] bg-white" />
                      </div>
                      <span className="text-[8.5px] font-mono text-[#FCD34D] font-black tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        USA
                      </span>
                    </div>
                  </div>

                  <div
                    ref={rightFuselageShellRef}
                    className="w-[38px] h-[190px] flex flex-col justify-between overflow-hidden shadow-2xl origin-right"
                    style={{
                      background:
                        "linear-gradient(270deg, #080E16 0%, #16202C 25%, #2A3B4F 65%, #465F7B 90%, #1F2E3E 100%)",
                      borderRight: "1px solid rgba(255,255,255,0.25)",
                      borderTop: "1px solid rgba(255,255,255,0.15)",
                      borderBottom: "1px solid rgba(0,0,0,0.9)",
                    }}
                  >
                    <div className="h-24 flex">
                      <div className="w-1/2 h-full bg-[#020407]" />
                      <div className="w-1/2 h-full bg-[#25374C]" />
                    </div>
                    <div className="h-24 flex flex-col justify-between border-t border-black/40">
                      <div className="w-full h-10 bg-[#020407]" />
                      <div className="w-full h-14 bg-[#1E2E40] flex items-center justify-center">
                        <span className="text-[7.5px] font-mono text-[#FCD34D] font-bold tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          S-IC
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    ref={centralCleavageSeamRef}
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2.5px] pointer-events-none z-40 opacity-0"
                    style={{
                      background: "linear-gradient(to bottom, #38BDF8, #FFFFFF, #278F9B)",
                      boxShadow: "0 0 14px #38BDF8, 0 0 28px #278F9B",
                    }}
                  />
                </div>

                {/* 4. LOWER ROCKET ASSEMBLY */}
                <div
                  ref={lowerRocketAssemblyRef}
                  className="flex flex-col items-center origin-top z-35"
                >
                  <div className="relative w-[150px] h-[48px] flex justify-between pointer-events-none">
                    <div
                      ref={finLeftRef}
                      className="w-[34px] h-[48px]"
                    >
                      <svg viewBox="0 0 34 48" className="w-full h-full overflow-visible">
                        <polygon
                          points="34,0 34,48 0,48 10,18"
                          fill="url(#saturn-dark-fin-titanium)"
                          stroke="#647E99"
                          strokeWidth="0.8"
                        />
                        <line x1="10" y1="18" x2="34" y2="48" stroke="#FCD34D" strokeWidth="1" />
                      </svg>
                    </div>

                    <div className="w-[76px] h-[24px] bg-gradient-to-b from-[#1C2A3D] to-[#080E16] border-x border-slate-700/80" />

                    <div
                      ref={finRightRef}
                      className="w-[34px] h-[48px]"
                    >
                      <svg viewBox="0 0 34 48" className="w-full h-full overflow-visible">
                        <polygon
                          points="0,0 0,48 34,48 24,18"
                          fill="url(#saturn-dark-fin-titanium)"
                          stroke="#647E99"
                          strokeWidth="0.8"
                        />
                        <line x1="24" y1="18" x2="0" y2="48" stroke="#FCD34D" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>

                  <div className="w-[124px] -mt-5 flex items-end justify-center gap-1">
                    {[0, 1, 2, 3, 4].map((bellIdx) => (
                      <svg
                        key={bellIdx}
                        viewBox="0 0 24 36"
                        className={`${
                          bellIdx === 2 ? "w-6 h-9 z-10" : "w-5 h-8 opacity-90"
                        } overflow-visible`}
                      >
                        <polygon
                          points="6,0 18,0 24,32 0,32"
                          fill="url(#saturn-dark-f1-bronze)"
                          stroke="#8C5E24"
                          strokeWidth="0.8"
                        />
                        <line x1="4" y1="10" x2="20" y2="10" stroke="#3D220B" strokeWidth="1.2" />
                        <line x1="2" y1="18" x2="22" y2="18" stroke="#3D220B" strokeWidth="1.2" />
                        <line x1="1" y1="26" x2="23" y2="26" stroke="#3D220B" strokeWidth="1.2" />
                        <ellipse cx="12" cy="32" rx="12" ry="3.5" fill="#04070C" />
                        <ellipse cx="12" cy="32" rx="7" ry="2" fill="#38BDF8" opacity="0.85" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ) : milestone.id === "PION-01" ? (
              <AdaAnalyticalEngineArtifact
                upperAssemblyRef={upperRocketAssemblyRef}
                lowerAssemblyRef={lowerRocketAssemblyRef}
                centerHubRef={rocketHubRef}
                leftShellRef={leftFuselageShellRef}
                rightShellRef={rightFuselageShellRef}
                theme={theme}
              />
            ) : milestone.id === "PION-02" ? (
              <GraceCompilerApparatusArtifact
                upperAssemblyRef={upperRocketAssemblyRef}
                lowerAssemblyRef={lowerRocketAssemblyRef}
                centerHubRef={rocketHubRef}
                leftShellRef={leftFuselageShellRef}
                rightShellRef={rightFuselageShellRef}
                theme={theme}
              />
            ) : milestone.id === "PION-03" ? (
              <KatherineOrbitalInstrumentArtifact
                upperAssemblyRef={upperRocketAssemblyRef}
                lowerAssemblyRef={lowerRocketAssemblyRef}
                centerHubRef={rocketHubRef}
                leftShellRef={leftFuselageShellRef}
                rightShellRef={rightFuselageShellRef}
                theme={theme}
              />
            ) : milestone.id === "PION-05" ? (
              <RadiaSpanningTreeArtifact
                upperAssemblyRef={upperRocketAssemblyRef}
                lowerAssemblyRef={lowerRocketAssemblyRef}
                centerHubRef={rocketHubRef}
                leftShellRef={leftFuselageShellRef}
                rightShellRef={rightFuselageShellRef}
                theme={theme}
              />
            ) : milestone.id === "PION-06" ? (
              <FeiFeiVisualMatrixArtifact
                upperAssemblyRef={upperRocketAssemblyRef}
                lowerAssemblyRef={lowerRocketAssemblyRef}
                centerHubRef={rocketHubRef}
                leftShellRef={leftFuselageShellRef}
                rightShellRef={rightFuselageShellRef}
                theme={theme}
              />
            ) : null}
          </div>
          {/* Master Architectural Hinge Spine at Left Flank (State-Dependent Rail) */}
          <LeftArchitecturalHingeSpine
            theme={theme}
            spineWrapperRef={leftSpineWrapperRef}
            dialRef={dialRef}
            topKnuckleRef={leftTopKnuckleRef}
            bottomKnuckleRef={leftBottomKnuckleRef}
            upperRodRef={leftUpperRodRef}
            lowerRodRef={leftLowerRodRef}
          />

          {/* Symmetrical Architectural Latch Pier at Right Flank (State-Dependent Rail) */}
          <RightArchitecturalLatchPier
            theme={theme}
            pierWrapperRef={rightPierWrapperRef}
            topShoeRef={rightTopShoeRef}
            bottomShoeRef={rightBottomShoeRef}
            upperRodRef={rightUpperRodRef}
            lowerRodRef={rightLowerRodRef}
          />

          {/* Center Seam Glow Flare (Ignites during activation & vertical cleavage) */}
          <div
            ref={centerSeamGlowRef}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-72 h-1 z-40 pointer-events-none rounded-full"
            style={{
              background: `linear-gradient(90deg, ${theme.goldHighlight} 0%, ${theme.goldTrim} 60%, transparent 100%)`,
              boxShadow: `0 0 16px ${theme.goldTrim}`,
              opacity: 0.2,
            }}
          />

          {/* Bespoke Upper Mantle (Translates Upward & Fans Out Laterally) */}
          <div
            ref={upperMantleRef}
            className="w-full obsidian-upper-mantle"
          >
            <BespokeUpperMantle theme={theme} />
          </div>

          {/* Central Reading Monolith Slab (Unrolls outward from center seam) */}
          <div
            ref={scrollSheetRef}
            className="relative mx-3 -mt-1 -mb-1 overflow-hidden rounded-xs obsidian-sheet"
            style={{
              background: theme.obsidianStops[0],
              boxShadow: `0 32px 80px rgba(0,0,0,0.96), 0 0 28px ${theme.accentColor}22, inset 0 1px 1px ${theme.goldHighlight}55, inset 0 -1px 2px rgba(0,0,0,0.95)`,
              borderTop: `1px solid ${theme.goldHighlight}99`,
              borderLeft: `1px solid ${theme.goldTrim}66`,
              borderRight: `1px solid ${theme.goldTrim}55`,
              borderBottom: `1px solid ${theme.goldTrim}80`,
            }}
          >
            {/* Procedural Subterranean Luminescence */}
            <ObsidianFlameCanvas
              theme={theme}
              progress={controlledProgress !== undefined ? controlledProgress : 0}
              liveProgressRef={liveProgressRef}
              wakeRef={wakeFlameRef}
              prefersReducedMotion={prefersReducedMotion}
            />

            {/* Symmetrical Integrated Side Guide Rails */}
            <div
              ref={sideRailsRef}
              aria-hidden="true"
              className="obsidian-side-rails"
            >
              <SideGuideRails theme={theme} />
            </div>

            {/* Vitreous Specular Polish Sheen Overlays */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 14%, transparent 32%)",
                zIndex: 2,
              }}
            />
            <div
              className="absolute top-0 inset-x-0 h-[1.5px] pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${theme.goldTrim}bb 20%, ${theme.goldHighlight} 50%, ${theme.goldTrim}bb 80%, transparent 100%)`,
                zIndex: 2,
              }}
            />

            {/* Bespoke Historical Artifact Header */}
            <div className="relative z-10">
              <ArtifactHeader theme={theme} />
            </div>

            {/* Editorial Content Container (Generous Breathing Room & Typographic Hierarchy) */}
            <div
              ref={contentRef}
              className="px-7 py-8 relative z-10 flex flex-col justify-between obsidian-content"
            >
              <div>
                {/* Category Header */}
                <div
                  className="flex items-center justify-between border-b pb-3 mb-4"
                  style={{ borderColor: `${theme.goldTrim}45` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs px-2.5 py-0.5 rounded border font-semibold tracking-wide ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
                    >
                      {milestone.yearLabel}
                    </span>
                    <span
                      className="text-xs font-mono uppercase tracking-wider"
                      style={{ color: theme.secondaryAccent }}
                    >
                      {milestone.accentField}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    {milestone.id}
                  </span>
                </div>

                {/* Main Historical Title in Warm Ivory Serif */}
                <h2 className="font-serif text-3xl lg:text-4xl font-normal tracking-tight leading-snug text-[#F5F2EB]">
                  {milestone.contributionTitle}
                </h2>

                {/* Architect Attribution Bathed in Theme Color */}
                <p
                  className="text-sm font-medium mt-1.5 mb-3.5"
                  style={{ color: theme.attributionColor }}
                >
                  Architect: {milestone.person}
                </p>

                {/* Restrained Chromatic Divider */}
                <div
                  className="h-[1.5px] w-full mb-5 rounded-full"
                  style={{
                    background: theme.dividerGrad,
                  }}
                />

                {/* Inlaid Archival Supporting Artifact Module */}
                {milestone.id === "PION-01" ? (
                  <AdaLovelaceArchivalArtifact theme={theme} />
                ) : milestone.id === "PION-04" ? (
                  <MargaretHamiltonArchivalArtifact theme={theme} />
                ) : milestone.id === "PION-02" ? (
                  <GraceHopperArchivalArtifact theme={theme} />
                ) : milestone.id === "PION-03" ? (
                  <KatherineJohnsonArchivalArtifact theme={theme} />
                ) : milestone.id === "PION-05" ? (
                  <RadiaPerlmanArchivalArtifact theme={theme} />
                ) : milestone.id === "PION-06" ? (
                  <FeiFeiLiArchivalArtifact theme={theme} />
                ) : null}

                {/* Historical Narrative in Warm Ivory Humanist Sans */}
                <p className="text-[15px] leading-[1.75] max-w-[62ch] text-[#EDE8DF] font-sans [text-wrap:pretty]">
                  {milestone.contributionSummary}
                </p>
              </div>

              {/* Primary Quotation Callout */}
              {milestone.quote && (
                <blockquote
                  className="mt-6 pt-4 border-t relative pl-4 italic text-[15px] font-serif leading-relaxed text-[#EDE8DF] [text-wrap:pretty]"
                  style={{ borderColor: `${theme.goldTrim}45` }}
                >
                  <span
                    className="absolute left-0 top-3 text-2xl font-serif leading-none select-none font-bold"
                    style={{ color: theme.goldTrim }}
                  >
                    “
                  </span>
                  {milestone.quote}
                </blockquote>
              )}
            </div>
          </div>

          {/* Bespoke Lower Plinth (Translates Downward & Fans Out Laterally) */}
          <div
            ref={lowerPlinthRef}
            className="w-full obsidian-lower-plinth"
          >
            <BespokeLowerPlinth theme={theme} />
          </div>
      </>
    );

    if (layoutMode === "monument-only") {
      return (
        <div
          ref={monumentWrapperRef}
          onClick={toggleOpen}
          className={`w-full max-w-[580px] min-h-[540px] flex flex-col justify-center relative select-text cursor-pointer ${
            isInitiallyClosed ? "obsidian-closed-init" : ""
          } ${className}`}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
          role="region"
          aria-label={`${milestone.person} sculptural obsidian exhibit`}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={(e) => {
            if (!interactive) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleOpen();
            }
          }}
        >
          {milestone.id === "PION-04" && <SaturnVRocketSVGDefs />}
          {monumentContent}
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={`relative w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-6 lg:gap-8 ${className}`}
        style={{ perspective: "1600px" }}
      >
        {milestone.id === "PION-04" && <SaturnVRocketSVGDefs />}

        {/* 1. LEFT: Historical Pioneer Portrait & Bio Identity (Separate from Exhibit) */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col justify-center items-center lg:items-start text-center lg:text-left select-none py-4">
          {milestone.cutoutUrl && (
            <div className="relative w-44 lg:w-52 aspect-[3/4] mb-4">
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B0F] via-transparent to-transparent z-10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={milestone.cutoutUrl}
                alt={milestone.person}
                className="w-full h-full object-contain object-bottom filter grayscale contrast-115 brightness-95 drop-shadow-[0_16px_28px_rgba(0,0,0,0.95)]"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
            >
              {milestone.yearLabel}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {milestone.id}
            </span>
          </div>

          <h3 className="font-serif text-2xl lg:text-3xl text-white font-medium tracking-tight">
            {milestone.person}
          </h3>

          <p
            className="text-xs font-mono uppercase tracking-wider mt-1 mb-3"
            style={{ color: theme.secondaryAccent }}
          >
            {milestone.accentField}
          </p>

          <p className="text-xs text-slate-300 leading-relaxed [text-wrap:pretty]">
            {milestone.id === "PION-01"
              ? "Mathematician and writer, chief collaborator with Charles Babbage on the Analytical Engine. Authored the seminal Note G containing the world's first published computer algorithm."
              : milestone.contributionSummary}
          </p>

          <div className="mt-4 pt-3 border-t border-[#1C2A3D]/60 flex items-center gap-2 text-xs font-mono text-slate-400">
            <span
              className="w-1.5 h-1.5 rounded-full border border-white/20"
              style={{ backgroundColor: theme.accentColor }}
            />
            <span>
              PRIMARY ARCHIVE: {milestone.verifiedSourceIds?.[1] || milestone.verifiedSourceIds?.[0] || milestone.id} ({milestone.yearLabel})
            </span>
          </div>
        </div>

        {/* 2. CENTRE: Living Luminous Thread & Contact Node */}
        <div className="hidden lg:flex w-16 shrink-0 flex-col items-center justify-center relative select-none">
          <div
            className="absolute top-0 bottom-0 w-[2.5px]"
            style={{
              background: `linear-gradient(to bottom, ${theme.goldTrim}4d, ${theme.goldHighlight}, ${theme.goldTrim}4d)`,
              boxShadow: `0 0 8px ${theme.goldTrim}`,
            }}
          />

          <div
            onClick={toggleOpen}
            className="relative z-20 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleOpen();
              }
            }}
            aria-label={`Toggle ${milestone.person} exhibit`}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{
                background: `linear-gradient(45deg, ${theme.goldTrim}, ${theme.goldHighlight})`,
                boxShadow: `0 0 14px ${theme.goldHighlight}`,
              }}
            />
          </div>

          <svg
            className="absolute left-1/2 top-1/2 -translate-y-1/2 w-10 h-10 overflow-visible pointer-events-none"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
          >
            <path
              ref={emergenceConduitRef}
              d="M 4,20 C 16,20 24,20 38,20"
              stroke={theme.goldTrim}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="40"
              strokeDashoffset="0"
            />
            <circle cx="38" cy="20" r="3" fill={theme.goldHighlight} />
          </svg>
        </div>

        {/* 3. RIGHT: Sculptural Vertically Unfurling Obsidian Exhibit Stage */}
        <div
          ref={monumentWrapperRef}
          onClick={toggleOpen}
          className={`flex-1 w-full max-w-2xl min-h-[560px] flex flex-col justify-center relative select-text cursor-pointer ${
            isInitiallyClosed ? "obsidian-closed-init" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "left center",
          }}
          role="region"
          aria-label={`${milestone.person} sculptural obsidian exhibit`}
        >
          {monumentContent}
        </div>
      </div>
    );
  }
);

ObsidianExhibit.displayName = "ObsidianExhibit";
