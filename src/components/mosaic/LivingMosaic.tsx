"use client";

import React, { useEffect, useRef } from "react";
import { Sparkles, Calendar, Code, Heart, Users, ArrowUpRight, Shield } from "lucide-react";

interface LivingMosaicProps {
  focusedRegion: string | null;
  setFocusedRegion: (regionId: string | null) => void;
  onNavigateFacet?: (regionId: string) => void;
}

interface MosaicRegionConfig {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
  teaser: string;
  pathD: string;
  labelX: number;
  labelY: number;
  labelWidth: number;
  labelHeight: number;
  textureId?: string;
  textureUrl?: string;
}

export const LivingMosaic: React.FC<LivingMosaicProps> = ({
  focusedRegion,
  setFocusedRegion,
  onNavigateFacet,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const findRegionId = (target: EventTarget | null): string | null => {
      if (!(target instanceof Element)) return null;

      // The card marker sits in the HTML subtree inside foreignObject. Resolve
      // focus from that marker instead of walking back through an SVG <g>.
      const card = target.closest<HTMLElement>('[data-testid^="mosaic-card-"]');
      return card
        ?.getAttribute("data-testid")
        ?.replace("mosaic-card-", "") ?? null;
    };

    // Capture at document level so focus events are observed even when the
    // browser's SVG/foreignObject focus path does not bubble to the section.
    const handleFocusIn = (event: FocusEvent) => {
      const regionId = findRegionId(event.target);
      if (regionId) setFocusedRegion(regionId);
    };
    const handleFocusOut = (event: FocusEvent) => {
      setFocusedRegion(findRegionId(event.relatedTarget));
    };

    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("focusout", handleFocusOut, true);
    return () => {
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("focusout", handleFocusOut, true);
    };
  }, [setFocusedRegion]);

  /**
   * CANONICAL BUTTERFLY MOSAIC GEOMETRY (viewBox="0 0 1200 700")
   * 
   * Formed as an organic butterfly with broad left and right wings, distinct upper forewings
   * and lower hindwings, a narrow central waist, and shared curved seams.
   * Multiple natural junctions eliminate any circular or radial spokes.
   * 
   * Left Wing:
   *   - About ACM-W (Upper Forewing, apex at (280, 70))
   *   - Projects & Tech (Mid Hindwing lobe)
   *   - Team & Leadership (Lower Ventral Hindwing lobe, reaching (280, 640))
   * Right Wing:
   *   - Events & Flagships (Upper Forewing, apex at (920, 70))
   *   - Outreach & CSpathshala (Mid Hindwing lobe)
   *   - Join Us · The Future (Lower Ventral Hindwing lobe, reaching (920, 640) with outward thread continuation)
   * Central Waist:
   *   - Narrow central corridor with top cleft at (600, 160) and tail cleft at (600, 570)
   */
  const REGIONS: MosaicRegionConfig[] = [
    {
      id: "about",
      name: "About ACM-W",
      subtitle: "Charter #108544",
      category: "CHAPTER IDENTITY",
      icon: <Users className="w-3.5 h-3.5 text-[#1595D0]" />,
      accentColor: "#1595D0",
      glowColor: "rgba(21, 149, 208, 0.45)",
      teaser: "Mentorship, technical fellowships, and leadership in computing.",
      // Left Forewing (1200x700)
      pathD: "M 600 360 C 600 300, 600 210, 600 160 C 490 120, 380 70, 280 70 C 170 70, 70 120, 60 210 C 60 270, 80 320, 110 360 C 190 370, 280 360, 360 360 C 440 360, 520 360, 600 360 Z",
      labelX: 300,
      labelY: 205,
      labelWidth: 220,
      labelHeight: 130,
      textureId: "archiveTexture",
    },
    {
      id: "events",
      name: "Events & Flagships",
      subtitle: "YŪGO'26 & Chapter Events",
      category: "FLAGSHIPS & HACKATHONS",
      icon: <Calendar className="w-3.5 h-3.5 text-[#ED247A]" />,
      accentColor: "#ED247A",
      glowColor: "rgba(237, 36, 122, 0.45)",
      teaser: "YŪGO'26, Code in Tandem, WISE, and CS Pathshala workshops.",
      // Right Forewing (1200x700)
      pathD: "M 600 360 C 600 300, 600 210, 600 160 C 710 120, 820 70, 920 70 C 1030 70, 1130 120, 1140 210 C 1140 270, 1120 320, 1090 360 C 1010 370, 920 360, 840 360 C 760 360, 680 360, 600 360 Z",
      labelX: 900,
      labelY: 205,
      labelWidth: 220,
      labelHeight: 130,
      textureId: "eventsTexture",
    },
    {
      id: "projects",
      name: "Projects & Tech",
      subtitle: "Technical Portfolio",
      category: "SYSTEMS ARCHITECTURE",
      icon: <Code className="w-3.5 h-3.5 text-[#1595D0]" />,
      accentColor: "#1595D0",
      glowColor: "rgba(21, 149, 208, 0.45)",
      teaser: "Orderbook, IIsy in-network ML, and TCP Sniffer.",
      // Left Mid Hindwing (1200x700)
      pathD: "M 600 360 C 520 360, 440 360, 360 360 C 280 360, 190 370, 110 360 C 70 410, 60 460, 90 510 C 160 520, 240 500, 340 480 C 440 460, 520 440, 600 360 Z",
      labelX: 245,
      labelY: 430,
      labelWidth: 200,
      labelHeight: 100,
      textureId: "technicalTexture",
    },
    {
      id: "outreach",
      name: "Outreach & CSpathshala",
      subtitle: "Rural Computing Initiative",
      category: "COMMUNITY IMPACT",
      icon: <Heart className="w-3.5 h-3.5 text-[#278F9B]" />,
      accentColor: "#278F9B",
      glowColor: "rgba(39, 143, 155, 0.45)",
      teaser: "Unplugged CS Pathshala workshops in rural and government schools.",
      // Right Mid Hindwing (1200x700)
      pathD: "M 600 360 C 680 360, 760 360, 840 360 C 920 360, 1010 370, 1090 360 C 1130 410, 1140 460, 1110 510 C 1040 520, 960 500, 860 480 C 760 460, 680 440, 600 360 Z",
      labelX: 955,
      labelY: 430,
      labelWidth: 200,
      labelHeight: 100,
      textureId: "outreachTexture",
    },
    {
      id: "team",
      name: "Team & Leadership",
      subtitle: "Five Gazette editions",
      category: "CHAPTER GOVERNANCE",
      icon: <Shield className="w-3.5 h-3.5 text-[#C96C8E]" />,
      accentColor: "#C96C8E",
      glowColor: "rgba(201, 108, 142, 0.45)",
      teaser: "Faculty coordination and chapter governance.",
      // Left Ventral Hindwing (1200x700)
      pathD: "M 600 360 C 520 440, 440 460, 340 480 C 240 500, 160 520, 90 510 C 120 580, 180 630, 280 640 C 370 650, 470 620, 530 570 C 570 540, 590 510, 600 480 C 600 440, 600 400, 600 360 Z",
      labelX: 330,
      labelY: 560,
      labelWidth: 200,
      labelHeight: 110,
      textureId: "governanceTexture",
    },
    {
      id: "join-us",
      name: "Join Us · The Future",
      subtitle: "Membership & Pathways",
      category: "HORIZON & COMMUNITY",
      icon: <Sparkles className="w-3.5 h-3.5 text-[#ED247A]" />,
      accentColor: "#ED247A",
      glowColor: "rgba(237, 36, 122, 0.45)",
      teaser: "Student chapter registration and global ACM membership.",
      // Right Ventral Hindwing (1200x700)
      pathD: "M 600 360 C 680 440, 760 460, 860 480 C 960 500, 1040 520, 1110 510 C 1080 580, 1020 630, 920 640 C 830 650, 730 620, 670 570 C 630 540, 610 510, 600 480 C 600 440, 600 400, 600 360 Z",
      labelX: 870,
      labelY: 560,
      labelWidth: 200,
      labelHeight: 110,
      textureId: "horizonTexture",
    },
  ];

  const outerSilhouettePath = `
    M 600 160
    C 490 120 380 70 280 70
    C 170 70 70 120 60 210
    C 60 270 80 320 110 360
    C 70 410 60 460 90 510
    C 120 580 180 630 280 640
    C 370 650 470 620 530 570
    C 570 540 590 510 600 480
    C 610 510 630 540 670 570
    C 730 620 830 650 920 640
    C 1020 630 1080 580 1110 510
    C 1140 460 1130 410 1090 360
    C 1120 320 1140 270 1140 210
    C 1130 120 1030 70 920 70
    C 820 70 710 120 600 160
    Z
  `.replace(/\\s+/g, " ").trim();

  return (
    <section
      id="main-content"
      aria-label="The Living Mosaic"
      data-focused-region={focusedRegion ?? ""}
      ref={containerRef}
      className="mosaic-atmosphere relative w-full min-h-[85vh] py-6 sm:py-10 px-4 sm:px-8 max-w-[1600px] mx-auto flex flex-col justify-center"
    >
      {/* ========================================================================= */}
      {/* DESKTOP & TABLET: THE CANONICAL BUTTERFLY MOSAIC WITH WING SILHOUETTE      */}
      {/* ========================================================================= */}
      <div
        data-testid="mosaic-canvas"
        className="hidden md:block relative w-[92%] aspect-[12/7] max-w-[1320px] mx-auto rounded-3xl p-2 select-none"
      >
        {/* Subtle Ambient Radial Backlight behind the wings */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(21,149,208,0.08)_0%,rgba(39,143,155,0.04)_40%,transparent_75%)] pointer-events-none" />

        {/* Master SVG Canvas */}
        <svg
          viewBox="0 0 1200 700"
          className="w-full h-full overflow-visible"
          role="region"
          aria-label="SSN ACM-W abstract butterfly-like six-region chapter mosaic"
          data-testid="mosaic-svg"
        >
          <defs>
            <filter id="mosaicEdgeBloom" x="-18%" y="-18%" width="136%" height="136%">
              <feGaussianBlur stdDeviation="2.2" result="edgeSoftness" />
              <feMerge>
                <feMergeNode in="edgeSoftness" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="mosaicBase-about" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#172634" />
              <stop offset="58%" stopColor="#101B27" />
              <stop offset="100%" stopColor="#0C1722" />
            </linearGradient>
            <linearGradient id="mosaicBase-events" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1A2C30" />
              <stop offset="52%" stopColor="#102229" />
              <stop offset="100%" stopColor="#0C171F" />
            </linearGradient>
            <linearGradient id="mosaicBase-projects" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#172B39" />
              <stop offset="55%" stopColor="#101F2C" />
              <stop offset="100%" stopColor="#0B1722" />
            </linearGradient>
            <linearGradient id="mosaicBase-outreach" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2A2921" />
              <stop offset="52%" stopColor="#1B2224" />
              <stop offset="100%" stopColor="#111A21" />
            </linearGradient>
            <linearGradient id="mosaicBase-team" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#222B31" />
              <stop offset="54%" stopColor="#151F28" />
              <stop offset="100%" stopColor="#0E1923" />
            </linearGradient>
            <linearGradient id="mosaicBase-join-us" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2A2A23" />
              <stop offset="48%" stopColor="#1C2428" />
              <stop offset="100%" stopColor="#101A24" />
            </linearGradient>

            {/* Events: celebratory diamond lattice and pulse nodes in canonical ACM-W Pink (#ED247A). */}
            <pattern id="eventsPattern" patternUnits="userSpaceOnUse" width="120" height="90">
              <path d="M 60 10 L 110 45 L 60 80 L 10 45 Z" fill="none" stroke="#ED247A" strokeWidth="0.8" strokeOpacity="0.18" />
              <circle cx="60" cy="45" r="4" fill="#ED247A" fillOpacity="0.32" />
              <path d="M 10 45 H 110 M 60 10 V 80" stroke="#ED247A" strokeWidth="0.5" strokeOpacity="0.12" strokeDasharray="3 3" />
            </pattern>

            {/* Chapter identity: archival ruling, a quiet seal and editorial guide lines. */}
            <pattern id="archivePattern" patternUnits="userSpaceOnUse" width="118" height="92">
              <path d="M 12 16 H 106 M 12 24 H 76 M 12 32 H 94 M 12 72 H 106" fill="none" stroke="#1595D0" strokeWidth="0.8" strokeOpacity="0.16" />
              <circle cx="82" cy="52" r="17" fill="none" stroke="#1595D0" strokeWidth="0.8" strokeOpacity="0.22" />
              <circle cx="82" cy="52" r="11" fill="none" stroke="#F5F8FA" strokeWidth="0.6" strokeOpacity="0.18" />
              <path d="M 82 39 V 65 M 69 52 H 95" stroke="#1595D0" strokeWidth="0.55" strokeOpacity="0.16" />
            </pattern>

            {/* Projects: abstract circuit routes and nodes; no invented system diagrams or metrics. */}
            <pattern id="technicalPattern" patternUnits="userSpaceOnUse" width="148" height="112">
              <path d="M 8 24 H 42 V 52 H 78 M 78 52 V 82 H 132 M 42 52 H 24 V 88 H 62 M 98 18 V 42 H 132" fill="none" stroke="#1595D0" strokeWidth="1" strokeOpacity="0.22" />
              <path d="M 8 24 H 42 M 98 18 H 132" fill="none" stroke="#F5F8FA" strokeWidth="0.6" strokeOpacity="0.13" />
              <circle cx="42" cy="52" r="3" fill="#1595D0" fillOpacity="0.42" />
              <circle cx="78" cy="52" r="2.5" fill="#278F9B" fillOpacity="0.38" />
              <circle cx="132" cy="82" r="2.5" fill="#1595D0" fillOpacity="0.38" />
              <rect x="89" y="67" width="18" height="12" rx="2" fill="none" stroke="#1595D0" strokeWidth="0.65" strokeOpacity="0.16" />
            </pattern>

            {/* Team: fine woven diamond lattice, restrained to remain behind the card. */}
            <pattern id="governancePattern" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M 22 0 L 44 22 L 22 44 L 0 22 Z M 22 10 L 34 22 L 22 34 L 10 22 Z" fill="none" stroke="#C96C8E" strokeWidth="0.7" strokeOpacity="0.20" />
              <circle cx="22" cy="22" r="2" fill="#F5F8FA" fillOpacity="0.16" />
            </pattern>

            {/* Outreach: connected learning nodes rather than a repeated dot grid. */}
            <pattern id="outreachPattern" width="104" height="92" patternUnits="userSpaceOnUse">
              <path d="M 16 20 L 52 44 L 88 20 M 52 44 L 30 78 M 52 44 L 82 76" fill="none" stroke="#278F9B" strokeWidth="0.8" strokeOpacity="0.20" />
              <circle cx="16" cy="20" r="4" fill="none" stroke="#278F9B" strokeWidth="0.9" strokeOpacity="0.3" />
              <circle cx="52" cy="44" r="5" fill="#278F9B" fillOpacity="0.17" stroke="#278F9B" strokeWidth="0.7" strokeOpacity="0.3" />
              <circle cx="88" cy="20" r="4" fill="none" stroke="#278F9B" strokeWidth="0.9" strokeOpacity="0.3" />
              <circle cx="30" cy="78" r="3" fill="#F5F8FA" fillOpacity="0.18" />
              <circle cx="82" cy="76" r="3" fill="#F5F8FA" fillOpacity="0.18" />
            </pattern>

            {/* Join Us: horizon contours and a path opening toward the edge of the canvas. */}
            <pattern id="horizonPattern" patternUnits="userSpaceOnUse" width="180" height="126">
              <path d="M 8 34 C 48 8 92 8 132 34 S 168 60 176 42 M 8 62 C 48 36 92 36 132 62 S 168 88 176 70 M 8 90 C 48 64 92 64 132 90 S 168 116 176 98" fill="none" stroke="#ED247A" strokeWidth="0.8" strokeOpacity="0.20" />
              <path d="M 22 112 H 158" stroke="#1595D0" strokeWidth="0.7" strokeOpacity="0.16" />
            </pattern>
          </defs>

          {/* Interactive Lobe Segments */}
          {REGIONS.map((region) => {
            return (
              <g
                key={region.id}
                id={`mosaic-region-${region.id}`}
                data-testid={`mosaic-region-${region.id}`}
                className="group cursor-pointer transition-opacity duration-300"
                style={{
                  opacity: focusedRegion && focusedRegion !== region.id ? 0.32 : 1,
                }}
                onPointerEnter={() => setFocusedRegion(region.id)}
                onPointerLeave={(event) => {
                  const activeElement = event.currentTarget.ownerDocument.activeElement;
                  const activeRegion = activeElement?.closest<SVGGElement>(
                    '[data-testid^="mosaic-region-"]'
                  );
                  const activeRegionId = activeRegion
                    ?.getAttribute("data-testid")
                    ?.replace("mosaic-region-", "");
                  setFocusedRegion(activeRegionId ?? null);
                }}
                onFocusCapture={() => setFocusedRegion(region.id)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setFocusedRegion(null);
                  }
                }}
                onClick={() => onNavigateFacet && onNavigateFacet(region.id)}
              >
                {/* Dark Base Fill with Subtle Hover Highlight */}
                <path
                  d={region.pathD}
                  fill={`url(#mosaicBase-${region.id})`}
                  className="transition-opacity duration-500"
                />
                <path
                  d={region.pathD}
                  fill={region.glowColor}
                  fillOpacity={focusedRegion === region.id ? 0.20 : 0.045}
                  className="pointer-events-none transition-all duration-500"
                />

                {/* Outer Seam Stroke with Restrained Gold/Teal Tint */}
                <path
                  d={region.pathD}
                  fill="none"
                  stroke={region.accentColor}
                  strokeWidth="2"
                  strokeOpacity="0.35"
                  className="transition-all duration-300 group-hover:stroke-opacity-80 group-hover:stroke-width-2.5"
                />

                {/* Region-specific illustrative artwork, clipped by each original lobe path. */}
                {region.textureId && (
                  <path
                    d={region.pathD}
                    fill={`url(#${region.textureId.replace("Texture", "Pattern")})`}
                    fillOpacity={focusedRegion === region.id ? 0.92 : 0.72}
                    className="pointer-events-none transition-opacity duration-500"
                  />
                )}

                {/* 100% Contained Card Box inside Assigned Lobe */}
                <foreignObject
                  x={region.labelX - region.labelWidth / 2}
                  y={region.labelY - region.labelHeight / 2}
                  width={region.labelWidth}
                  height={region.labelHeight}
                  className="pointer-events-auto"
                >
                  <div
                    data-testid={`mosaic-card-${region.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNavigateFacet) onNavigateFacet(region.id);
                    }}
                    className="relative w-full h-full flex flex-col justify-between p-2 rounded-xl bg-[#0D131C]/95 backdrop-blur-md border border-[#233147] transition-all duration-300 shadow-xl cursor-pointer overflow-hidden"
                    style={{
                      borderColor: focusedRegion === region.id ? region.accentColor : undefined,
                      boxShadow: focusedRegion === region.id ? `0 0 24px ${region.glowColor}` : undefined,
                    }}
                  >
                    {/* Metallic corner brackets */}
                    <div
                      className="pointer-events-none absolute top-1 left-1 w-2 h-2 border-t border-l transition-colors"
                      style={{ borderColor: `${region.accentColor}66` }}
                    />
                    <div
                      className="pointer-events-none absolute top-1 right-1 w-2 h-2 border-t border-r transition-colors"
                      style={{ borderColor: `${region.accentColor}66` }}
                    />
                    <div
                      className="pointer-events-none absolute bottom-1 left-1 w-2 h-2 border-b border-l transition-colors"
                      style={{ borderColor: `${region.accentColor}66` }}
                    />
                    <div
                      className="pointer-events-none absolute bottom-1 right-1 w-2 h-2 border-b border-r transition-colors"
                      style={{ borderColor: `${region.accentColor}66` }}
                    />

                    {/* Interactive subtle radial highlight */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(ellipse at 30% 35%, ${region.glowColor}, transparent 65%)`,
                      }}
                    />

                    {/* Eyebrow & Category Beacon */}
                    <div className="relative z-10 flex items-center justify-between gap-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: region.accentColor }}
                        />
                        <span
                          className="text-[8px] font-mono font-semibold tracking-wider uppercase truncate"
                          style={{ color: region.accentColor }}
                        >
                          {region.category}
                        </span>
                      </div>
                      <span
                        className="p-0.5 rounded bg-black/60 border border-white/15 shrink-0 transition-all"
                        style={{ borderColor: focusedRegion === region.id ? region.accentColor : undefined }}
                      >
                        {region.icon}
                      </span>
                    </div>

                    {/* Editorial Title & Concise Teaser */}
                    <div className="relative z-10 my-0.5">
                      <h2 className="text-[10px] font-serif font-bold text-white tracking-tight leading-tight whitespace-normal line-clamp-1 group-hover:text-white transition-colors">
                        {region.name}
                      </h2>
                      <p className="text-[8.5px] font-sans text-[#F5F8FA]/75 line-clamp-1 mt-0.5 leading-tight">
                        {region.teaser}
                      </p>
                    </div>

                    {/* Navigation Action Buttons */}
                    <div className="relative z-10 flex items-center justify-between pt-0.5 border-t border-[#F5F8FA]/10 text-[8px] font-mono">
                      <span className="text-[#F5F8FA]/50 truncate max-w-[90px]">
                        {region.subtitle}
                      </span>
                      <button
                        type="button"
                        aria-label={`Open ${region.name} facet (${region.category})`}
                        onFocus={() => setFocusedRegion(region.id)}
                        onBlur={(event) => {
                          const nextTarget = event.relatedTarget as Element | null;
                          const nextRegion = nextTarget?.closest<SVGGElement>(
                            '[data-testid^="mosaic-region-"]'
                          );
                          const nextRegionId = nextRegion
                            ?.getAttribute("data-testid")
                            ?.replace("mosaic-region-", "");
                          setFocusedRegion(nextRegionId ?? null);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigateFacet) onNavigateFacet(region.id);
                        }}
                        className="relative flex items-center gap-1 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D131C] touch-manipulation before:absolute before:inset-[-6px] before:content-['']"
                        style={{ color: region.accentColor }}
                      >
                        <span>Open Facet</span>
                        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Complete outer contour: a quiet warm edge with a soft optical underlight. */}
          <path
            d={outerSilhouettePath}
            fill="none"
            stroke="#1595D0"
            strokeWidth="8"
            strokeOpacity="0.08"
            strokeLinejoin="round"
            filter="url(#mosaicEdgeBloom)"
            className="pointer-events-none"
          />
          <path
            d={outerSilhouettePath}
            fill="none"
            stroke="#1595D0"
            strokeWidth="2.4"
            strokeOpacity="0.68"
            strokeLinejoin="round"
            className="pointer-events-none"
            data-testid="mosaic-outer-perimeter"
          />
          <path
            d={outerSilhouettePath}
            fill="none"
            stroke="#F5F8FA"
            strokeWidth="1"
            strokeOpacity="0.30"
            strokeLinejoin="round"
            className="mosaic-perimeter-highlight pointer-events-none"
            data-testid="mosaic-perimeter-highlight"
          />

          {/* A stable, crafted central junction. The original lobe seams provide
              the structural connections; no extra dotted spine or pulse loop is needed. */}
          <g className="pointer-events-none" data-testid="mosaic-central-junction">
            <circle cx="600" cy="360" r="23" fill="#0D131C" fillOpacity="0.84" stroke="#1595D0" strokeWidth="1.2" strokeOpacity="0.38" />
            <circle cx="600" cy="360" r="13" fill="#0D131C" stroke="#F5F8FA" strokeWidth="2.2" strokeOpacity="0.8" />
            <circle cx="600" cy="360" r="4" fill="#ED247A" />
          </g>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE ADAPTATION (<768px): DIRECT FULL-SCREEN FACET DESTINATIONS         */}
      {/* High contrast, >48px touch targets, full ARIA, zero drawer readers        */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-4 relative">
        {/* Keep the original six-lobe butterfly-like composition visible on phones.
            Navigation labels remain full-size CSS controls immediately below it. */}
        <div
          data-testid="mosaic-mobile-silhouette"
          className="relative mx-auto w-full max-w-[520px] px-1"
        >
          <svg
            viewBox="0 0 1200 700"
            className="w-full h-auto overflow-visible"
            role="img"
            aria-label="Abstract butterfly-like Mosaic with six connected chapter regions"
          >
            {REGIONS.map((region) => (
              <path
                key={region.id}
                d={region.pathD}
                fill={region.accentColor}
                fillOpacity={focusedRegion === region.id ? 0.28 : 0.13}
                stroke={region.accentColor}
                strokeWidth="5"
                strokeOpacity={focusedRegion === region.id ? 0.95 : 0.58}
                pointerEvents="none"
                data-testid={`mosaic-mobile-region-${region.id}`}
              />
            ))}
            <path
              d={outerSilhouettePath}
              fill="none"
              stroke="#1595D0"
              strokeWidth="7"
              strokeOpacity="0.72"
              strokeLinejoin="round"
              pointerEvents="none"
            />
            <path
              d="M 600 0 C 600 105 600 245 600 360"
              fill="none"
              stroke="#1595D0"
              strokeWidth="7"
              strokeLinecap="round"
              strokeOpacity="0.85"
              pointerEvents="none"
            />
            <circle cx="600" cy="360" r="16" fill="#0D131C" stroke="#1595D0" strokeWidth="7" />
            <circle cx="600" cy="360" r="6" fill="#ED247A" />
          </svg>
        </div>

        {REGIONS.map((region) => {
          return (
            <div
              key={region.id}
              className="relative rounded-2xl border border-[#233147] transition-all duration-300 p-4 sm:p-5 bg-[#0D131C]/95 backdrop-blur-md shadow-lg overflow-hidden group"
              style={{
                borderColor: `${region.accentColor}40`,
              }}
            >
              {/* Metallic corner brackets */}
              <div
                className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 border-t border-l transition-colors"
                style={{ borderColor: `${region.accentColor}66` }}
              />
              <div
                className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 border-t border-r transition-colors"
                style={{ borderColor: `${region.accentColor}66` }}
              />
              <div
                className="pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l transition-colors"
                style={{ borderColor: `${region.accentColor}66` }}
              />
              <div
                className="pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r transition-colors"
                style={{ borderColor: `${region.accentColor}66` }}
              />

              <button
                type="button"
                className="w-full min-h-[48px] flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0] rounded-xl"
                onClick={() => onNavigateFacet && onNavigateFacet(region.id)}
                aria-label={`Open ${region.name}: ${region.subtitle}`}
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div
                    className="p-3 rounded-xl bg-black/60 border shrink-0 transition-colors"
                    style={{ borderColor: `${region.accentColor}40` }}
                  >
                    {region.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ backgroundColor: region.accentColor }}
                      />
                      <span
                        className="text-[9.5px] font-mono tracking-wider font-semibold uppercase truncate"
                        style={{ color: region.accentColor }}
                      >
                        {region.category}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg text-[#F5F8FA] font-bold leading-tight truncate group-hover:text-white transition-colors">
                      {region.name}
                    </h3>
                    <p className="text-xs font-sans text-[#F5F8FA]/70 line-clamp-1 mt-1 leading-snug">
                      {region.teaser}
                    </p>
                  </div>
                </div>

                <span
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-semibold flex items-center gap-1 shrink-0 transition-all"
                  style={{ color: region.accentColor, borderColor: `${region.accentColor}40` }}
                >
                  <span>Open</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
