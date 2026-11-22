"use client";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import gsap from "gsap";
import { HistoricalMilestone } from "../../data/historicalMilestones";
import { MilestoneThematicSymbol } from "./MilestoneThematicSymbols";

export interface CrystallineObsidianScrollHandle {
  playEntrance: () => void;
  playExit: () => void;
  resetStaged: () => void;
  toggleOpen: () => void;
}

interface CrystallineObsidianScrollProps {
  milestone: HistoricalMilestone;
  cardWidth?: number;
  cardHeight?: number;
  accentColor?: string;
  glowColor?: string;
  isExhibitionViewport?: boolean;
  prefersReducedMotion?: boolean;
  isActive?: boolean;
  onToggleOpen?: (isOpen: boolean) => void;
  className?: string;
}

/**
 * TurnedPommelFinial
 *
 * Classical lathe-turned architectural pommel finial for authentic scroll spindles.
 * Features:
 * - Turned cylindrical collar with metallic token ring
 * - Sculpted bulbous torus swelling with chiaroscuro highlights
 * - Faceted obsidian crystal core glowing with milestone accent
 * - Spherical terminal pommel tip
 */
const TurnedPommelFinial = ({
  side,
  accentColor,
}: {
  side: "left" | "right";
  accentColor: string;
}) => {
  const isLeft = side === "left";
  const safeId = accentColor.replace("#", "");
  return (
    <svg
      className={`w-6 h-9 shrink-0 ${isLeft ? "-mr-0.5" : "-ml-0.5"}`}
      viewBox="0 0 24 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.9))",
        transform: isLeft ? "scale(1.04)" : "scaleX(-1) scale(0.96)",
        transformOrigin: "center center",
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Turned Wood/Obsidian Cylinder Shading */}
        <linearGradient id={`finial-body-${side}-${safeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A6382" />
          <stop offset="22%" stopColor="#223347" />
          <stop offset="55%" stopColor="#0F1722" />
          <stop offset="85%" stopColor="#05080C" />
          <stop offset="100%" stopColor="#020305" />
        </linearGradient>
        {/* Metallic Token Collar Accent */}
        <linearGradient id={`finial-collar-${side}-${safeId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isLeft ? 0.95 : 0.75} />
          <stop offset="40%" stopColor={accentColor} />
          <stop offset="100%" stopColor="#0B131C" />
        </linearGradient>
      </defs>

      {/* Spindle Rod Connector Neck */}
      <rect x="18" y="11" width="6" height="14" fill={`url(#finial-body-${side}-${safeId})`} />
      <line x1="18" y1="11" x2="24" y2="11" stroke="rgba(245,248,250,0.5)" strokeWidth="0.8" />

      {/* Stepped Metallic Ring Collar */}
      <rect x="15" y="8" width="3.5" height="20" rx="1" fill={`url(#finial-collar-${side}-${safeId})`} />

      {/* Classical Turned Ogee / Torus Bulb */}
      <path
        d="M 15 9 C 11 9 6 12 6 18 C 6 24 11 27 15 27 Z"
        fill={`url(#finial-body-${side}-${safeId})`}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.6"
      />

      {/* Specular Rim Light on Top of Bulb */}
      <path
        d="M 14 10.5 C 11 10.5 7.5 13 7.5 18"
        stroke="rgba(245,248,250,0.5)"
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      {/* Inset Glowing Chromatic Crystal Core */}
      <ellipse
        cx="10.5"
        cy="18"
        rx="2.2"
        ry="4.5"
        fill={accentColor}
        fillOpacity="0.8"
        style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }}
      />
      <ellipse cx="10" cy="16.5" rx="0.8" ry="1.6" fill="#FFFFFF" fillOpacity="0.9" />

      {/* Terminal Spherical End-Pommel Cap */}
      <circle
        cx="4"
        cy="18"
        r="3.5"
        fill={`url(#finial-body-${side}-${safeId})`}
        stroke={`url(#finial-collar-${side}-${safeId})`}
        strokeWidth="0.8"
      />
      <circle cx="3.2" cy="16.8" r="1.1" fill="#FFFFFF" fillOpacity={isLeft ? 0.85 : 0.5} />
    </svg>
  );
};

/**
 * CrystallineObsidianScroll
 *
 * Sculptural, authentic pseudo-3D Rolled Obsidian Codex.
 * Discards flat rectangular AI-slop card borders in favor of an authentic manuscript:
 * - 32px cylindrical turned obsidian rollers with chiaroscuro radial gradients
 * - Protruding turned pommel finials extending laterally -24px beyond the sheet
 * - Physical parchment roll-curl overhang shadows (sheet visibly rolls around rollers)
 * - True single-tube rolled scroll closed state clasped by the Signet Seal medallion
 * - Character-by-character SplitText feather quill calligraphy with liquid light bloom
 * - Imperative slide handle (playEntrance, resetStaged) decoupled from scroll velocity
 */
export const CrystallineObsidianScroll = forwardRef<
  CrystallineObsidianScrollHandle,
  CrystallineObsidianScrollProps
>(
  (
    {
      milestone,
      cardWidth = 400,
      cardHeight = 440,
      accentColor = milestone.accentColor || "#1595D0",
      glowColor = milestone.glowColor || "rgba(21, 149, 208, 0.35)",
      isExhibitionViewport = true,
      prefersReducedMotion = false,
      isActive = false,
      onToggleOpen,
      className = "",
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const topRollerRef = useRef<HTMLDivElement>(null);
    const bottomRollerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<SVGSVGElement>(null);
    const crystalGlintRef = useRef<HTMLDivElement>(null);
    const closedTubeRef = useRef<HTMLDivElement>(null);

    // Calligraphy Containers
    const tier1BadgeRef = useRef<HTMLDivElement>(null);
    const tier2NameRef = useRef<HTMLHeadingElement>(null);
    const tier3TitleRef = useRef<HTMLHeadingElement>(null);
    const tier4SummaryRef = useRef<HTMLParagraphElement>(null);
    const tier5QuoteRef = useRef<HTMLQuoteElement>(null);

    const hasEnteredRef = useRef(false);
    const isTransitioningRef = useRef(false);
    const entranceTlRef = useRef<gsap.core.Timeline | null>(null);

    // Roll closed travel: half of cardHeight to meet flush in center
    const rollTravel = Math.max(140, Math.round(cardHeight * 0.44));

    // -------------------------------------------------------------------------
    // Staged / Reset State: Closed rolled tube waiting at station center
    // -------------------------------------------------------------------------
    const resetStaged = () => {
      hasEnteredRef.current = false;
      if (entranceTlRef.current) entranceTlRef.current.kill();

      if (prefersReducedMotion) {
        setIsOpen(true);
        return;
      }

      setIsOpen(false);

      if (topRollerRef.current && bottomRollerRef.current) {
        gsap.killTweensOf([topRollerRef.current, bottomRollerRef.current]);
        gsap.set(topRollerRef.current, { y: rollTravel, rotateX: 180, scaleX: 1, opacity: 1 });
        gsap.set(bottomRollerRef.current, { y: -rollTravel, rotateX: -180, scaleX: 1, opacity: 1 });
      }
      if (sheetRef.current) {
        gsap.killTweensOf(sheetRef.current);
        gsap.set(sheetRef.current, {
          clipPath: "inset(50% 0% 50% 0%)",
          opacity: 0,
        });
      }
      if (closedTubeRef.current) {
        gsap.killTweensOf(closedTubeRef.current);
        gsap.set(closedTubeRef.current, { opacity: 1, scaleY: 1, scaleX: 1 });
      }
      if (quillRef.current) {
        gsap.killTweensOf(quillRef.current);
        gsap.set(quillRef.current, { opacity: 0, scale: 0.65, x: 10, y: 16 });
      }

      // Reset character and word glyphs
      if (sheetRef.current) {
        const glyphs = sheetRef.current.querySelectorAll(".calligraphy-glyph");
        gsap.killTweensOf(glyphs);
        glyphs.forEach((el) => {
          gsap.set(el, { opacity: 0, y: 3 });
        });
      }
      if (tier1BadgeRef.current) {
        gsap.killTweensOf(tier1BadgeRef.current);
        gsap.set(tier1BadgeRef.current, { opacity: 0 });
      }
      if (tier5QuoteRef.current) {
        gsap.killTweensOf(tier5QuoteRef.current);
        gsap.set(tier5QuoteRef.current, { opacity: 0 });
      }
    };

    // -------------------------------------------------------------------------
    // Smooth Reversible Roll-Up Exit Sequence
    // -------------------------------------------------------------------------
    const playExit = () => {
      if (!isOpen && !hasEnteredRef.current) return;
      hasEnteredRef.current = false;
      if (entranceTlRef.current) entranceTlRef.current.kill();

      if (prefersReducedMotion) {
        setIsOpen(false);
        return;
      }

      isTransitioningRef.current = true;
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut", force3D: true },
        onComplete: () => {
          setIsOpen(false);
          isTransitioningRef.current = false;
        },
      });
      entranceTlRef.current = tl;

      const topRoller = topRollerRef.current;
      const bottomRoller = bottomRollerRef.current;
      const sheet = sheetRef.current;
      const quill = quillRef.current;
      const closedTube = closedTubeRef.current;
      const allGlyphs = sheet?.querySelectorAll(".calligraphy-glyph");

      // 1. Ancient Feather Quill lifts off gracefully and dissolves (0.0s -> 0.16s)
      if (quill) {
        tl.to(quill, { opacity: 0, y: "-=18", scale: 0.7, duration: 0.16, ease: "power2.in" }, 0);
      }

      // 2. Etched glyphs dissolve back into the obsidian stone (0.0s -> 0.16s)
      if (allGlyphs && allGlyphs.length > 0) {
        tl.to(allGlyphs, { opacity: 0, duration: 0.16, ease: "power2.in" }, 0);
      }
      if (tier1BadgeRef.current) {
        tl.to(tier1BadgeRef.current, { opacity: 0, duration: 0.16, ease: "power2.in" }, 0);
      }
      if (tier5QuoteRef.current) {
        tl.to(tier5QuoteRef.current, { opacity: 0, duration: 0.16, ease: "power2.in" }, 0);
      }

      // 3. Spindles roll inward to meet flush at center (0.10s -> 0.42s)
      if (topRoller && bottomRoller) {
        tl.to(
          topRoller,
          { y: rollTravel, rotateX: 180, duration: 0.32, ease: "power3.in" },
          0.10
        );
        tl.to(
          bottomRoller,
          { y: -rollTravel, rotateX: -180, duration: 0.32, ease: "power3.in" },
          0.10
        );
      }

      // 4. Volcanic obsidian sheet rolls closed into center (0.10s -> 0.40s)
      if (sheet) {
        tl.to(
          sheet,
          { clipPath: "inset(50% 0% 50% 0%)", opacity: 0, duration: 0.30, ease: "power3.in" },
          0.10
        );
      }

      // 5. Closed tube ribbon reappears and contracts horizontally to center (0.34s -> 0.52s)
      if (closedTube) {
        tl.to(closedTube, { opacity: 1, duration: 0.10 }, 0.34);
        tl.to(closedTube, { scaleX: 0.3, opacity: 0, duration: 0.16, ease: "power2.in" }, 0.38);
      }
      if (topRoller && bottomRoller) {
        tl.to([topRoller, bottomRoller], { scaleX: 0.3, opacity: 0, duration: 0.16, ease: "power2.in" }, 0.38);
      }
    };

    // -------------------------------------------------------------------------
    // Phased Symmetrical Center-Spreading Entrance Sequence with SplitText Calligraphy
    // -------------------------------------------------------------------------
    const playEntrance = (force = false) => {
      if (hasEnteredRef.current && !force) return;
      hasEnteredRef.current = true;
      setIsOpen(true);

      if (entranceTlRef.current) entranceTlRef.current.kill();

      const topRoller = topRollerRef.current;
      const bottomRoller = bottomRollerRef.current;
      const sheet = sheetRef.current;
      const quill = quillRef.current;
      const glint = crystalGlintRef.current;
      const closedTube = closedTubeRef.current;

      const t1 = tier1BadgeRef.current;
      const nameGlyphs = tier2NameRef.current?.querySelectorAll(".calligraphy-glyph");
      const titleGlyphs = tier3TitleRef.current?.querySelectorAll(".calligraphy-glyph");
      const summaryGlyphs = tier4SummaryRef.current?.querySelectorAll(".calligraphy-glyph");
      const quoteGlyphs = tier5QuoteRef.current?.querySelectorAll(".calligraphy-glyph");

      // Instantaneous Glyph Stealth: Guarantee 0% text visibility before writing begins
      const allGlyphs = sheet?.querySelectorAll(".calligraphy-glyph");
      if (allGlyphs && allGlyphs.length > 0) {
        gsap.set(allGlyphs, { opacity: 0, y: 3 });
      }
      if (t1) gsap.set(t1, { opacity: 0 });
      if (tier5QuoteRef.current) gsap.set(tier5QuoteRef.current, { opacity: 0 });
      if (quill) gsap.set(quill, { opacity: 0, scale: 0.65 });

      if (prefersReducedMotion) {
        if (topRoller) gsap.set(topRoller, { y: 0, rotateX: 0, scaleX: 1, opacity: 1 });
        if (bottomRoller) gsap.set(bottomRoller, { y: 0, rotateX: 0, scaleX: 1, opacity: 1 });
        if (sheet) gsap.set(sheet, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 });
        if (closedTube) gsap.set(closedTube, { opacity: 0 });
        if (quill) gsap.set(quill, { opacity: 0.85, x: 290, y: 220, scale: 0.85 });
        if (t1) gsap.set(t1, { opacity: 1 });
        if (tier5QuoteRef.current) gsap.set(tier5QuoteRef.current, { opacity: 1 });
        if (sheet) {
          const allG = sheet.querySelectorAll(".calligraphy-glyph");
          allG.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }));
        }
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "sine.inOut", force3D: true },
        onComplete: () => {
          isTransitioningRef.current = false;
        },
      });
      entranceTlRef.current = tl;

      // 1. CLOSED TUBE LATERAL EXPANSION:
      // Spindles and closed tube start at center and spread horizontally from center outwards to full width (0.0s -> 0.22s)
      if (closedTube) {
        tl.fromTo(
          closedTube,
          { scaleX: 0.25, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.22, ease: "power2.out" },
          0
        );
        tl.to(closedTube, { opacity: 0, duration: 0.16, ease: "power2.in" }, 0.22);
      }
      if (topRoller && bottomRoller) {
        tl.fromTo(
          [topRoller, bottomRoller],
          { scaleX: 0.25, opacity: 0.5 },
          { scaleX: 1, opacity: 1, duration: 0.22, ease: "power2.out" },
          0
        );
        // 2. PHYSICAL VERTICAL UNROLL: Spindles roll apart vertically (0.22s -> 0.66s)
        tl.fromTo(
          topRoller,
          { y: rollTravel, rotateX: 180 },
          { y: 0, rotateX: 0, duration: 0.44, ease: "power3.out" },
          0.22
        );
        tl.fromTo(
          bottomRoller,
          { y: -rollTravel, rotateX: -180 },
          { y: 0, rotateX: 0, duration: 0.44, ease: "power3.out" },
          0.22
        );
      }

      // 3. VOLCANIC OBSIDIAN SHEET UNFURLS VERTICALLY (0.22s -> 0.66s)
      if (sheet) {
        tl.fromTo(
          sheet,
          { clipPath: "inset(50% 0% 50% 0%)", opacity: 0 },
          { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 0.44, ease: "power3.out" },
          0.22
        );
      }

      // 4. SPECULAR CRYSTALLINE BEAM GLINT (0.34s -> 0.76s)
      if (glint) {
        tl.fromTo(
          glint,
          { x: "-120%", opacity: 0 },
          { x: "180%", opacity: 0.65, duration: 0.42, ease: "power2.inOut" },
          0.34
        );
      }

      // 5. ANCIENT SCRIBE FEATHER QUILL CALLIGRAPHY ENGINE (starts at 0.56s)
      if (quill) {
        // Ancient feather quill glides gracefully into writing posture
        tl.fromTo(
          quill,
          { x: 10, y: 8, opacity: 0, scale: 0.65, rotation: -18 },
          { x: 18, y: 18, opacity: 1, scale: 1, rotation: 8, duration: 0.22, ease: "power2.out" },
          0.56
        );

        // --- Tier 1: Archival Badge & Year ---
        let cursorTime = 0.66;
        tl.to(quill, { x: 200, y: 20, rotation: 10, duration: 0.24, ease: "none" }, cursorTime);
        if (t1) {
          tl.fromTo(
            t1,
            { opacity: 0 },
            { opacity: 1, duration: 0.24, ease: "power1.out", immediateRender: true },
            cursorTime
          );
        }
        cursorTime += 0.24;

        // --- Tier 2: Pioneer Name (Synchronized Character Inscription) ---
        // Smooth carriage return to line 2
        tl.to(quill, { x: 18, y: 56, rotation: -7, duration: 0.14, ease: "power2.out" }, cursorTime);
        cursorTime += 0.14;

        const nameCount = nameGlyphs ? nameGlyphs.length : 12;
        const nameDuration = Math.max(0.38, Math.min(0.58, nameCount * 0.032));
        tl.to(quill, { x: 285, y: 58, rotation: 8, duration: nameDuration, ease: "none" }, cursorTime);
        if (nameGlyphs && nameGlyphs.length > 0) {
          tl.fromTo(
            nameGlyphs,
            { opacity: 0, y: 3 },
            {
              opacity: 1,
              y: 0,
              stagger: (nameDuration - 0.04) / Math.max(1, nameGlyphs.length - 1),
              duration: 0.08,
              ease: "none",
              immediateRender: true,
            },
            cursorTime
          );
        }
        cursorTime += nameDuration;

        // --- Tier 3: Historical Contribution Title (Character Inscription) ---
        // Smooth carriage return to line 3
        tl.to(quill, { x: 18, y: 92, rotation: -6, duration: 0.14, ease: "power2.out" }, cursorTime);
        cursorTime += 0.14;

        const titleCount = titleGlyphs ? titleGlyphs.length : 20;
        const titleDuration = Math.max(0.36, Math.min(0.54, titleCount * 0.022));
        tl.to(quill, { x: 270, y: 94, rotation: 7, duration: titleDuration, ease: "none" }, cursorTime);
        if (titleGlyphs && titleGlyphs.length > 0) {
          tl.fromTo(
            titleGlyphs,
            { opacity: 0, y: 3 },
            {
              opacity: 1,
              y: 0,
              stagger: (titleDuration - 0.04) / Math.max(1, titleGlyphs.length - 1),
              duration: 0.08,
              ease: "none",
              immediateRender: true,
            },
            cursorTime
          );
        }
        cursorTime += titleDuration;

        // --- Tier 4: Archival Narrative Description (Word Inscription) ---
        // Smooth carriage return to line 4
        tl.to(quill, { x: 18, y: 130, rotation: -5, duration: 0.14, ease: "power2.out" }, cursorTime);
        cursorTime += 0.14;

        const summaryCount = summaryGlyphs ? summaryGlyphs.length : 14;
        const summaryDuration = Math.max(0.40, Math.min(0.60, summaryCount * 0.026));
        tl.to(quill, { x: 295, y: 138, rotation: 6, duration: summaryDuration, ease: "none" }, cursorTime);
        if (summaryGlyphs && summaryGlyphs.length > 0) {
          tl.fromTo(
            summaryGlyphs,
            { opacity: 0, y: 3 },
            {
              opacity: 1,
              y: 0,
              stagger: (summaryDuration - 0.04) / Math.max(1, summaryGlyphs.length - 1),
              duration: 0.08,
              ease: "none",
              immediateRender: true,
            },
            cursorTime
          );
        }
        cursorTime += summaryDuration;

        // --- Tier 5: Archival Quote (if present) ---
        if (quoteGlyphs && quoteGlyphs.length > 0 && milestone.quote) {
          tl.to(quill, { x: 18, y: 188, rotation: -6, duration: 0.14, ease: "power2.out" }, cursorTime);
          cursorTime += 0.14;

          if (tier5QuoteRef.current) {
            tl.to(tier5QuoteRef.current, { opacity: 1, duration: 0.10, immediateRender: true }, cursorTime);
          }

          const quoteCount = quoteGlyphs.length;
          const quoteDuration = Math.max(0.34, Math.min(0.50, quoteCount * 0.026));
          tl.to(quill, { x: 275, y: 194, rotation: 6, duration: quoteDuration, ease: "none" }, cursorTime);
          tl.fromTo(
            quoteGlyphs,
            { opacity: 0, y: 3 },
            {
              opacity: 1,
              y: 0,
              stagger: (quoteDuration - 0.04) / Math.max(1, quoteGlyphs.length - 1),
              duration: 0.08,
              ease: "none",
              immediateRender: true,
            },
            cursorTime
          );
          cursorTime += quoteDuration;
        }

        // Terminal Flourish: Graceful ascending loop into resting pose above right finial
        tl.to(
          quill,
          {
            x: 285,
            y: 220,
            rotation: -18,
            scale: 0.85,
            opacity: 0.85,
            duration: 0.40,
            ease: "back.out(1.4)",
          },
          cursorTime
        );
      }
    };

    // Expose imperative handle to parent ThreadTimeline
    useImperativeHandle(ref, () => ({
      playEntrance: () => playEntrance(),
      playExit: () => playExit(),
      resetStaged: () => resetStaged(),
      toggleOpen: () => handleToggle(),
    }));

    // Auto-trigger on initial active arrival
    useEffect(() => {
      if (isActive && !hasEnteredRef.current) {
        playEntrance();
      }
    }, [isActive]);

    // Handle Physical Spindle Roll / Unroll Toggle via Signet Seal Medallion
    const handleToggle = () => {
      if (isTransitioningRef.current || prefersReducedMotion) {
        const next = !isOpen;
        setIsOpen(next);
        onToggleOpen?.(next);
        return;
      }

      isTransitioningRef.current = true;
      const next = !isOpen;

      if (!next) {
        // Roll Closed: Top and Bottom spindles roll inward to meet at center
        const tl = gsap.timeline({
          onComplete: () => {
            isTransitioningRef.current = false;
            setIsOpen(false);
            onToggleOpen?.(false);
          },
        });

        if (quillRef.current) {
          tl.to(quillRef.current, { opacity: 0, scale: 0.6, duration: 0.2 }, 0);
        }
        if (sheetRef.current) {
          tl.to(
            sheetRef.current,
            {
              clipPath: "inset(50% 0% 50% 0%)",
              opacity: 0,
              duration: 0.42,
              ease: "power3.inOut",
            },
            0.04
          );
        }
        if (topRollerRef.current && bottomRollerRef.current) {
          tl.to(
            topRollerRef.current,
            { y: rollTravel, rotateX: 180, duration: 0.45, ease: "power3.inOut" },
            0.04
          );
          tl.to(
            bottomRollerRef.current,
            { y: -rollTravel, rotateX: -180, duration: 0.45, ease: "power3.inOut" },
            0.04
          );
        }
        if (closedTubeRef.current) {
          tl.to(closedTubeRef.current, { opacity: 1, duration: 0.25, ease: "power2.out" }, 0.28);
        }
      } else {
        // Unroll Open: Spindles glide apart, crystalline sheet flows outward, re-inscribes
        setIsOpen(true);
        onToggleOpen?.(true);

        const tl = gsap.timeline({
          onComplete: () => {
            isTransitioningRef.current = false;
            playEntrance(true);
          },
        });

        if (closedTubeRef.current) {
          tl.to(closedTubeRef.current, { opacity: 0, duration: 0.2 }, 0);
        }
        if (topRollerRef.current && bottomRollerRef.current) {
          tl.to(
            topRollerRef.current,
            { y: 0, rotateX: 0, duration: 0.45, ease: "back.out(1.2)" },
            0
          );
          tl.to(
            bottomRollerRef.current,
            { y: 0, rotateX: 0, duration: 0.45, ease: "back.out(1.2)" },
            0
          );
        }
        if (sheetRef.current) {
          tl.to(
            sheetRef.current,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              opacity: 1,
              duration: 0.48,
              ease: "power2.out",
            },
            0.04
          );
        }
      }
    };

    return (
      <div
        ref={containerRef}
        id={`crystalline-scroll-${milestone.id}`}
        data-testid={`crystalline-scroll-${milestone.id}`}
        className={`relative flex flex-col items-center justify-center select-none text-left ${className}`}
        style={{
          width: isExhibitionViewport ? `${cardWidth}px` : "100%",
          minHeight: `${cardHeight}px`,
          contain: "layout style",
          perspective: "1000px",
          transform: isExhibitionViewport
            ? "perspective(1000px) rotateY(-10deg) rotateX(3deg)"
            : "none",
          transformStyle: "preserve-3d",
        }}
      >
        {/* 1. Volumetric Chromatic Core Light (Translucent obsidian core glow) */}
        <div
          className="pointer-events-none absolute inset-x-2 inset-y-6 rounded-full blur-3xl transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${glowColor}, transparent 74%)`,
            opacity: isOpen ? 0.95 : 0.25,
            willChange: "opacity",
          }}
        />

        {/* 2. Top Cylindrical Spindle Roller (Authentic 3D turned dowel with ornate finials) */}
        <div
          ref={topRollerRef}
          data-testid={`top-spindle-${milestone.id}`}
          className="relative z-20 w-[calc(100%+48px)] -mx-6 h-9 flex items-center justify-between pointer-events-none"
          style={{ perspective: "600px", willChange: "transform" }}
        >
          {/* Left Turned Pommel Finial */}
          <TurnedPommelFinial side="left" accentColor={accentColor} />

          {/* Central 3D Cylindrical Obsidian Roller Rod */}
          <div
            className="relative flex-1 h-6 mx-0.5 rounded-sm flex items-center justify-between px-3 shadow-[0_10px_24px_rgba(0,0,0,0.92)] border-y border-white/15"
            style={{
              background:
                "linear-gradient(180deg, #46607F 0%, #202F42 22%, #0F1722 55%, #05080C 85%, #020406 100%)",
            }}
          >
            {/* Cylindrical Specular Crest Highlight */}
            <div
              className="absolute inset-x-0 top-0.5 h-0.5 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(245,248,250,0.4) 15%, rgba(245,248,250,0.85) 50%, rgba(245,248,250,0.4) 85%, transparent 100%)",
              }}
            />

            {/* Left Metallic Ring Collar */}
            <div
              className="w-1.5 h-full opacity-90 shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: accentColor, color: accentColor }}
            />

            {/* Spindle Archival Inscription */}
            <span
              className="text-[9px] font-mono tracking-[0.28em] uppercase opacity-90 truncate font-bold"
              style={{ color: accentColor, textShadow: `0 0 10px ${accentColor}` }}
            >
              ✦ CODEX {milestone.yearLabel} ✦
            </span>

            {/* Right Metallic Ring Collar */}
            <div
              className="w-1.5 h-full opacity-90 shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: accentColor, color: accentColor }}
            />

            {/* Bottom Under-Roller Cylinder Shadow */}
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/75 pointer-events-none" />
          </div>

          {/* Right Turned Pommel Finial */}
          <TurnedPommelFinial side="right" accentColor={accentColor} />

          {/* Attached Convex Roll-Curl Overhang (Moves with top spindle, hidden when closed) */}
          <div
            className="absolute -bottom-2.5 inset-x-6 h-2.5 pointer-events-none overflow-hidden transition-opacity duration-300"
            style={{
              opacity: isOpen ? 1 : 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(13,19,28,0.7) 45%, transparent 100%)",
            }}
          />
        </div>

        {/* 3. The Unrolled Volcanic Black Obsidian Sheet Face */}
        <div
          ref={sheetRef}
          data-testid={`crystalline-slab-${milestone.id}`}
          className="relative z-10 w-full flex-1 rounded-sm backdrop-blur-xl px-5 sm:px-7 py-4 shadow-[0_24px_56px_rgba(0,0,0,0.96)] overflow-hidden transition-[opacity,visibility] duration-300"
          style={{
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? "visible" : "hidden",
            pointerEvents: isOpen ? "auto" : "none",
            background:
              "linear-gradient(165deg, rgba(8, 12, 18, 0.96) 0%, rgba(4, 7, 11, 0.98) 55%, rgba(1, 2, 4, 0.99) 100%)",
            boxShadow: `inset 0 1.5px 0 rgba(255, 255, 255, 0.22), inset 0 -1.5px 0 rgba(0, 0, 0, 0.95), inset 2px 0 0 ${accentColor}40, inset -2px 0 0 ${accentColor}40, 0 24px 56px rgba(0, 0, 0, 0.95), 0 0 36px ${accentColor}18`,
            contain: "layout style paint",
            willChange: "transform, opacity",
          }}
        >
          {/* Luminous Crystalline Cleavage Margins */}
          <div
            className="pointer-events-none absolute left-0 inset-y-0 w-0.5 opacity-75"
            style={{
              background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
            }}
          />
          <div
            className="pointer-events-none absolute right-0 inset-y-0 w-0.5 opacity-75"
            style={{
              background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
            }}
          />

          {/* Specular Crystallization Beam Glint */}
          <div
            ref={crystalGlintRef}
            className="pointer-events-none absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] transform -translate-x-full"
          />

          {/* 4. Authentic Ancient Scribe Flight Feather Quill */}
          <svg
            ref={quillRef}
            data-testid={`feather-quill-${milestone.id}`}
            className="pointer-events-none absolute z-30 w-14 h-20 opacity-0"
            style={{
              top: 0,
              left: 0,
              opacity: 0,
              filter: `url(#quill-glow-${milestone.id})`,
              transformOrigin: "6px 82px",
              willChange: "transform, opacity",
            }}
            viewBox="0 0 68 88"
            fill="none"
          >
            <defs>
              <filter id={`quill-glow-${milestone.id}`} x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.85" />
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={accentColor} floodOpacity="0.80" />
              </filter>
              {/* Asymmetrical Natural Feather Vane Gradient */}
              <linearGradient id={`quill-vane-${milestone.id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F5F8FA" stopOpacity="0.95" />
                <stop offset="28%" stopColor={accentColor} stopOpacity="0.85" />
                <stop offset="68%" stopColor="#0B131E" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#030508" stopOpacity="0.98" />
              </linearGradient>
              {/* Central Feather Spine (Rachis) */}
              <linearGradient id={`quill-rachis-${milestone.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="55%" stopColor="#E2E8F0" />
                <stop offset="85%" stopColor="#FDE68A" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              {/* Hollow Translucent Keratin Calamus (Quill Barrel) */}
              <linearGradient id={`quill-calamus-${milestone.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.95" />
                <stop offset="85%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>

            {/* Trailing Outer Flight Vane (Broad Natural Plume with Barb Separations) */}
            <path
              d="M 56 6 C 50 18 36 34 16 58 C 18 52 24 40 32 30 C 40 20 48 12 56 6 Z"
              fill={`url(#quill-vane-${milestone.id})`}
              stroke={accentColor}
              strokeWidth="0.8"
              strokeOpacity="0.85"
            />
            {/* Leading Inner Flight Vane (Narrow Aerodynamic Edge) */}
            <path
              d="M 56 6 C 62 20 48 44 26 68 C 36 50 50 28 56 6 Z"
              fill="#06090E"
              fillOpacity="0.92"
              stroke="rgba(245,248,250,0.4)"
              strokeWidth="0.5"
            />
            {/* Organic Barb Notches / Separations */}
            <path
              d="M 48 16 L 40 22 M 42 24 L 32 32 M 36 32 L 24 42 M 28 42 L 18 52"
              stroke={accentColor}
              strokeWidth="0.6"
              strokeOpacity="0.7"
              strokeLinecap="round"
            />
            <path
              d="M 52 18 L 46 24 M 44 28 L 36 36 M 38 38 L 28 48"
              stroke="rgba(245,248,250,0.35)"
              strokeWidth="0.5"
              strokeLinecap="round"
            />

            {/* Central Rachis (Curved Feather Spine) */}
            <path
              d="M 8 72 Q 26 44 56 6"
              stroke={`url(#quill-rachis-${milestone.id})`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Hollow Hand-Cured Keratin Calamus Barrel (Tapered Slanted Writing Tip — No Metal Nib) */}
            <path
              d="M 12 68 L 6 82 L 10 80 L 15 66 Z"
              fill={`url(#quill-calamus-${milestone.id})`}
              stroke="#92400E"
              strokeWidth="0.5"
            />
            {/* Capillary Ink Slit Down the Slanted Tip */}
            <line x1="6" y1="82" x2="9" y2="74" stroke="#0F172A" strokeWidth="0.5" strokeLinecap="round" />

            {/* Luminous Ink Droplet Glowing at the Hand-Cut Feather Tip */}
            <circle cx="6" cy="82" r="2.8" fill={accentColor} />
            <circle cx="6" cy="82" r="1.2" fill="#FFFFFF" />
            <circle cx="6" cy="82" r="4.8" fill={accentColor} fillOpacity="0.3" />
          </svg>

          {/* 6. True Character-by-Character Calligraphic Inscription Container */}
          <div className="relative z-10 flex flex-col justify-center h-full min-h-[300px]">
            <div className="space-y-3.5">
              {/* Tier 1: Archival Record Badge & Year */}
              <div
                ref={tier1BadgeRef}
                className="flex items-center gap-2 transition-opacity"
                style={{ opacity: 0 }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: accentColor, color: accentColor }}
                />
                <span
                  className="text-[11.5px] font-mono font-bold tracking-[0.24em] uppercase"
                  style={{
                    color: accentColor,
                    textShadow: `0 1px 1px rgba(255,255,255,0.2), 0 0 10px ${accentColor}`,
                  }}
                >
                  {milestone.yearLabel} · ARCHIVAL RECORD
                </span>
                <MilestoneThematicSymbol
                  id={milestone.id}
                  className="w-5 h-5 ml-auto shrink-0"
                  color={accentColor}
                  style={{ color: accentColor }}
                />
              </div>

              {/* Tier 2: Pioneer Name (Decomposed into Character Glyphs with Chiseled Stone Relief) */}
              <h3
                ref={tier2NameRef}
                className="font-serif text-[28px] sm:text-[34px] xl:text-[38px] font-medium leading-[1.06] tracking-tight text-[#F5F8FA]"
                style={{
                  textShadow: `0 1px 1px rgba(255,255,255,0.25), 0 -1px 2px rgba(0,0,0,0.95), 0 0 16px ${glowColor}`,
                }}
              >
                {milestone.person.split("").map((char, i) => (
                  <span
                    key={i}
                    className="calligraphy-glyph inline-block opacity-0 translate-y-1 transition-none"
                    style={{
                      opacity: 0,
                      minWidth: char === " " ? "0.3em" : undefined,
                      textShadow: `0 1px 1px rgba(255,255,255,0.25), 0 -1px 2px rgba(0,0,0,0.95), 0 0 16px ${glowColor}`,
                      willChange: "transform, opacity",
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h3>

              {/* Tier 3: Historical Contribution Title (Character Glyphs Etched in Stone) */}
              <h4
                ref={tier3TitleRef}
                className="text-[12.5px] sm:text-[13.5px] font-mono font-semibold uppercase leading-snug tracking-[0.14em]"
                style={{
                  color: accentColor,
                  textShadow: `0 1px 1px rgba(255,255,255,0.20), 0 -1px 1px rgba(0,0,0,0.90), 0 0 10px ${accentColor}aa`,
                }}
              >
                {milestone.contributionTitle.split("").map((char, i) => (
                  <span
                    key={i}
                    className="calligraphy-glyph inline-block opacity-0 translate-y-1 transition-none"
                    style={{
                      opacity: 0,
                      minWidth: char === " " ? "0.26em" : undefined,
                      color: accentColor,
                      textShadow: `0 1px 1px rgba(255,255,255,0.20), 0 -1px 1px rgba(0,0,0,0.90), 0 0 10px ${accentColor}aa`,
                      willChange: "transform, opacity",
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h4>

              {/* Tier 4: Archival Inscription Narrative (Word Glyphs Etched into Obsidian) */}
              <p
                ref={tier4SummaryRef}
                className="text-[13px] sm:text-[14px] font-sans leading-relaxed tracking-normal text-[#E2E8F0] pt-1 font-normal"
                style={{
                  textShadow: `0 1px 1px rgba(255,255,255,0.15), 0 -1px 1px rgba(0,0,0,0.85), 0 0 6px ${accentColor}33`,
                }}
              >
                {milestone.contributionSummary.split(" ").map((word, i) => (
                  <span
                    key={i}
                    className="calligraphy-glyph inline-block opacity-0 translate-y-1 transition-none mr-[0.25em]"
                    style={{
                      opacity: 0,
                      textShadow: `0 1px 1px rgba(255,255,255,0.15), 0 -1px 1px rgba(0,0,0,0.85), 0 0 6px ${accentColor}33`,
                      willChange: "transform, opacity",
                    }}
                  >
                    {word}
                  </span>
                ))}
              </p>

              {/* Tier 5: Archival Quote (Word Glyphs Etched into Obsidian) */}
              {milestone.quote && (
                <blockquote
                  ref={tier5QuoteRef}
                  className="border-l-2 pl-3 py-0.5 text-[12.5px] italic text-[#CBD5E1] font-serif leading-relaxed"
                  style={{ borderColor: `${accentColor}99`, opacity: 0 }}
                >
                  “
                  {milestone.quote.split(" ").map((word, i) => (
                    <span
                      key={i}
                      className="calligraphy-glyph inline-block opacity-0 translate-y-1 transition-none mr-[0.25em]"
                      style={{
                        opacity: 0,
                        textShadow: "0 1px 1px rgba(255,255,255,0.15), 0 -1px 1px rgba(0,0,0,0.80)",
                        willChange: "transform, opacity",
                      }}
                    >
                      {word}
                    </span>
                  ))}
                  ”
                </blockquote>
              )}
            </div>
          </div>
        </div>

        {/* 6. Bottom Cylindrical Spindle Roller & Archival Signet Seal Clasp */}
        <div
          ref={bottomRollerRef}
          data-testid={`bottom-spindle-${milestone.id}`}
          className="relative z-20 w-[calc(100%+48px)] -mx-6 h-9 flex items-center justify-between pointer-events-none"
          style={{ perspective: "600px", willChange: "transform" }}
        >
          {/* Attached Concave Roll-Curl Overhang (Moves with bottom spindle, hidden when closed) */}
          <div
            className="absolute -top-2.5 inset-x-6 h-2.5 pointer-events-none overflow-hidden transition-opacity duration-300"
            style={{
              opacity: isOpen ? 1 : 0,
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(13,19,28,0.7) 45%, transparent 100%)",
            }}
          />

          {/* Left Turned Pommel Finial */}
          <TurnedPommelFinial side="left" accentColor={accentColor} />

          {/* Central 3D Cylindrical Obsidian Roller with Signet Seal Clasp */}
          <div
            className="relative flex-1 h-6 mx-0.5 rounded-sm flex items-center justify-between px-3 shadow-[0_-8px_24px_rgba(0,0,0,0.92)] border-y border-white/15"
            style={{
              background:
                "linear-gradient(0deg, #46607F 0%, #202F42 22%, #0F1722 55%, #05080C 85%, #020406 100%)",
            }}
          >
            {/* Cylindrical Specular Bottom Crest Highlight */}
            <div
              className="absolute inset-x-0 bottom-0.5 h-0.5 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(245,248,250,0.35) 15%, rgba(245,248,250,0.75) 50%, rgba(245,248,250,0.35) 85%, transparent 100%)",
              }}
            />

            {/* Left Metallic Ring Collar */}
            <div
              className="w-1.5 h-full opacity-90 shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: accentColor, color: accentColor }}
            />

            {/* Archival Signet Seal Medallion (Interactive Roll/Unroll Toggle Clasp) */}
            <button
              type="button"
              onClick={handleToggle}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Roll up archival scroll" : "Unroll archival scroll"}
              className="relative z-30 group -my-2 flex items-center justify-center cursor-pointer pointer-events-auto transition-transform duration-300 hover:scale-110 active:scale-95"
            >
              {/* Medallion Outer Filigree Ring */}
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-b from-[#1C293A] via-[#0A0F17] to-[#04070B] border-2 flex items-center justify-center shadow-[0_4px_18px_rgba(0,0,0,0.95)] transition-colors"
                style={{
                  borderColor: accentColor,
                  boxShadow: `0 0 14px ${accentColor}90, inset 0 1px 0 rgba(255,255,250,0.4)`,
                }}
              >
                {/* Token Glyphic Emblem */}
                <MilestoneThematicSymbol
                  id={milestone.id}
                  className="w-4.5 h-4.5 transition-transform duration-500 group-hover:rotate-180"
                  color={accentColor}
                  style={{ color: accentColor }}
                />
              </div>
              <span className="sr-only">{isOpen ? "Roll Up" : "Unroll"}</span>
            </button>

            {/* Right Metallic Ring Collar */}
            <div
              className="w-1.5 h-full opacity-90 shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: accentColor, color: accentColor }}
            />

            {/* Top Under-Roller Shadow */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-black/75 pointer-events-none" />
          </div>

          {/* Right Turned Pommel Finial */}
          <TurnedPommelFinial side="right" accentColor={accentColor} />
        </div>

        {/* 9. Closed Scroll Single-Tube Overlay (Active when rolled shut) */}
        <div
          ref={closedTubeRef}
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 z-25 h-10 flex items-center justify-center transition-opacity"
          style={{ opacity: isOpen ? 0 : 1 }}
        >
          {/* Archival Ribbon Wrapped Around Closed Rolled Tube */}
          <div
            className="w-12 h-8 border-y-2 opacity-85 shadow-[0_0_10px_currentColor]"
            style={{
              borderColor: accentColor,
              backgroundColor: "rgba(11, 19, 28, 0.9)",
              color: accentColor,
            }}
          />
        </div>
      </div>
    );
  }
);

CrystallineObsidianScroll.displayName = "CrystallineObsidianScroll";
