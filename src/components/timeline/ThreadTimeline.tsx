"use client";

import React, { useRef, useState, useEffect, useLayoutEffect, useMemo } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import { APPROVED_HISTORICAL_MILESTONES } from "../../data/historicalMilestones";
import type {
  JourneyProgressMapPoint,
  JourneyProgressRegistry,
} from "../../state/journeyScroll";
import { sampleTemporalParticles, sampleThreadBodySparkles } from "./temporalBeam";
import type { TemporalParticle, ThreadBodySparkle } from "./temporalBeam";
import { MilestoneThematicSymbol } from "./MilestoneThematicSymbols";
import { CrystallineObsidianScroll, type CrystallineObsidianScrollHandle } from "./CrystallineObsidianScroll";

gsap.registerPlugin(MotionPathPlugin);

interface ThreadTimelineProps {
  onForkReached?: () => void;
  journeyProgressRef: React.MutableRefObject<JourneyProgressRegistry>;
  onSkipToFork?: () => void;
  onSkipToHome?: () => void;
}

interface MilestoneGeometry {
  anchorY: number;
  cardX: number;
  cardY: number;
  cardWidth: number;
  cardHeight: number;
  entryX: number;
  entryY: number;
  connectorD: string;
  leftConnectorD?: string;
  frameTraceD: string;
  isLeft: boolean;
  approachOffset?: number;
}

// The historical path is authored with monotonically increasing Y coordinates.
// Resolve milestone timing from the actual rendered SVG arc length so card reveals
// cannot drift when the path geometry changes.
const CARD_FORMATION_LEAD_VIEWBOX_UNITS = 72;
const EXHIBITION_FORMATION_LEAD_VIEWBOX_UNITS = 420;
const RESPONSIVE_FORMATION_LEAD_VIEWBOX_UNITS = 420;
const EXHIBITION_MIN_VIEWPORT_WIDTH = 1200;
const EXHIBITION_MIN_VIEWPORT_HEIGHT = 700;
// More native-scroll runway between each encounter gives the visitor time to
// register the arrival instead of letting one ordinary wheel gesture skip it.
const TIMELINE_STAGE_HEIGHT = 8000;
const RESPONSIVE_TIMELINE_STAGE_HEIGHT = 7600;
const DESKTOP_VIEWBOX_HEIGHT = 7843.1373;
const RESPONSIVE_VIEWBOX_HEIGHT = 8235.3;
const RESPONSIVE_MILESTONE_ANCHORS = [950, 2150, 3350, 4550, 5750, 6950];
const TIMELINE_SVG_SCALE = 1.02;

function getPathProgressAtY(
  path: SVGPathElement,
  targetY: number,
  totalLength = path.getTotalLength()
): number {
  if (totalLength <= 0) return 0;

  let low = 0;
  let high = totalLength;
  for (let iteration = 0; iteration < 32; iteration += 1) {
    const middle = (low + high) / 2;
    if (path.getPointAtLength(middle).y < targetY) low = middle;
    else high = middle;
  }

  return Math.min(1, Math.max(0, ((low + high) / 2) / totalLength));
}

function getLeftCardPerimeterPath(
  cardX: number,
  cardY: number,
  w: number,
  h: number,
  entryY: number,
  r: number = 6
): string {
  const right = cardX + w;
  const bottom = cardY + h;
  return `
    M ${right} ${entryY}
    L ${right} ${bottom - r}
    A ${r} ${r} 0 0 1 ${right - r} ${bottom}
    L ${cardX + r} ${bottom}
    A ${r} ${r} 0 0 1 ${cardX} ${bottom - r}
    L ${cardX} ${cardY + r}
    A ${r} ${r} 0 0 1 ${cardX + r} ${cardY}
    L ${right - r} ${cardY}
    A ${r} ${r} 0 0 1 ${right} ${cardY + r}
    Z
  `.replace(/\s+/g, " ").trim();
}

function getRightCardPerimeterPath(
  cardX: number,
  cardY: number,
  w: number,
  h: number,
  entryY: number,
  r: number = 6
): string {
  const right = cardX + w;
  const bottom = cardY + h;
  return `
    M ${cardX} ${entryY}
    L ${cardX} ${cardY + r}
    A ${r} ${r} 0 0 1 ${cardX + r} ${cardY}
    L ${right - r} ${cardY}
    A ${r} ${r} 0 0 1 ${right} ${cardY + r}
    L ${right} ${bottom - r}
    A ${r} ${r} 0 0 1 ${right - r} ${bottom}
    L ${cardX + r} ${bottom}
    A ${r} ${r} 0 0 1 ${cardX} ${bottom - r}
    Z
  `.replace(/\s+/g, " ").trim();
}

function getContactEdgeClip(isLeft: boolean): string {
  // Left-hand panels are entered from their right edge; right/mobile panels
  // are entered from their left edge. The reveal grows away from connector contact.
  return isLeft ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)";
}

function getAdaptiveFormationLeadUnits(
  viewportHeight: number,
  panelHeightCss: number,
  pathLength: number,
  stageHeight: number
): number {
  const scrollRange = Math.max(1, stageHeight - viewportHeight);
  const availableViewportTravel = Math.max(96, viewportHeight - panelHeightCss - 48);
  const desiredLeadCss = Math.min(380, availableViewportTravel * 0.9);
  return Math.min(
    pathLength * 0.12,
    Math.max(72, (desiredLeadCss * pathLength) / scrollRange)
  );
}

const MILESTONE_GEOMETRIES: Record<string, MilestoneGeometry> = {
  "PION-01": {
    anchorY: 846,
    cardX: 40,
    cardY: 666,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 440,
    entryY: 846,
    connectorD: "M 500 846 C 480 846, 460 846, 440 846",
    frameTraceD: getLeftCardPerimeterPath(40, 666, 400, 360, 846),
    isLeft: true,
  },
  "PION-02": {
    anchorY: 1946,
    cardX: 560,
    cardY: 1766,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 560,
    entryY: 1946,
    connectorD: "M 500 1946 C 520 1946, 540 1946, 560 1946",
    frameTraceD: getRightCardPerimeterPath(560, 1766, 400, 360, 1946),
    isLeft: false,
  },
  "PION-03": {
    anchorY: 3046,
    cardX: 40,
    cardY: 2866,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 440,
    entryY: 3046,
    connectorD: "M 500 3046 C 480 3046, 460 3046, 440 3046",
    frameTraceD: getLeftCardPerimeterPath(40, 2866, 400, 360, 3046),
    isLeft: true,
  },
  "PION-04": {
    anchorY: 4146,
    cardX: 560,
    cardY: 3966,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 560,
    entryY: 4146,
    connectorD: "M 500 4146 C 520 4146, 540 4146, 560 4146",
    frameTraceD: getRightCardPerimeterPath(560, 3966, 400, 360, 4146),
    isLeft: false,
  },
  "PION-05": {
    anchorY: 5246,
    cardX: 40,
    cardY: 5066,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 440,
    entryY: 5246,
    connectorD: "M 500 5246 C 480 5246, 460 5246, 440 5246",
    frameTraceD: getLeftCardPerimeterPath(40, 5066, 400, 360, 5246),
    isLeft: true,
  },
  "PION-06": {
    anchorY: 6346,
    cardX: 560,
    cardY: 6166,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 560,
    entryY: 6346,
    connectorD: "M 500 6346 C 520 6346, 540 6346, 560 6346",
    frameTraceD: getRightCardPerimeterPath(560, 6166, 400, 360, 6346),
    isLeft: false,
  },
};

interface TimelinePathMetrics {
  pathLength: number;
  anchorProgresses: Record<string, number>;
  particles: TemporalParticle[];
  sparkles: ThreadBodySparkle[];
}

const PARTICLE_COLORS = [
  "#F5F8FA",
  "#1595D0",
  "#ED247A",
  "#278F9B",
  "#C96C8E",
];

function getExhibitionGeometry(
  base: MilestoneGeometry,
  viewportWidth: number,
  viewportHeight: number,
  pathLength: number,
  anchorProgress: number,
  formationLeadUnits: number
): MilestoneGeometry {
  const panelWidthCss = Math.min(940, Math.max(880, viewportWidth * 0.72));
  const panelHeightCss = Math.min(520, Math.max(440, viewportWidth * 0.32));
  const margin = 24;
  const historyScrollRange = Math.max(1, TIMELINE_STAGE_HEIGHT - viewportHeight);
  const leadScrollCss =
    (formationLeadUnits / Math.max(pathLength, 1)) * historyScrollRange;
  const scrollAtAnchor = anchorProgress * historyScrollRange;
  const anchorViewportY = base.anchorY * TIMELINE_SVG_SCALE - scrollAtAnchor;
  const maxTop = Math.max(
    margin,
    viewportHeight - margin - panelHeightCss
  );
  const desiredTop = anchorViewportY - panelHeightCss / 2;
  const topAtArrival = Math.min(Math.max(desiredTop, margin), maxTop);
  const cardWidth = panelWidthCss / TIMELINE_SVG_SCALE;
  const cardHeight = panelHeightCss / TIMELINE_SVG_SCALE;

  // Symmetrical Bilateral Placement across thread center (X = 500)
  const cardX = 500 - cardWidth / 2;
  const cardY = (scrollAtAnchor + topAtArrival) / TIMELINE_SVG_SCALE;
  const anchorY = base.anchorY; // CANONICAL ANCHOR Y PRESERVED (846, 1946, 3046...)
  const entryY = base.anchorY; // STRICTLY HORIZONTAL BRANCHING (Issue 4 Fix - zero V-sag)

  // Bounds stabilization offset during approach to keep panel strictly inside [12, viewportHeight - 12]
  const approachBottom = topAtArrival + leadScrollCss + panelHeightCss;
  const approachOffset = Math.max(0, approachBottom - (viewportHeight - 24));

  // 35% Left Wing (Pioneer Cutout), 30% Corridor (Thread at 500), 35% Right Wing (Crystalline Codex Scroll)
  const cutoutRightX = cardX + cardWidth * 0.35;
  const typoX = cardX + cardWidth * 0.65;
  const typoWidth = cardX + cardWidth - typoX;
  const entryX = typoX;

  // Pure horizontal bilateral branching lines (<-- o -->) strictly at anchorY
  const connectorD = `M 500 ${anchorY} L ${entryX} ${anchorY}`;
  const leftConnectorD = `M 500 ${anchorY} L ${cutoutRightX} ${anchorY}`;
  const frameTraceD = getRightCardPerimeterPath(typoX, cardY, typoWidth, cardHeight, entryY);
  return {
    ...base,
    anchorY,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    entryX,
    entryY,
    connectorD,
    leftConnectorD,
    frameTraceD,
    isLeft: true,
    approachOffset,
  };
}


interface OrbitParticle {
  dx: number;
  dy: number;
  r: number;
  fill: string;
  animClass: string;
  duration: number;
  delay: number;
}

const LIGHT_ORBIT_PARTICLES: OrbitParticle[] = [
  { dx: -14, dy: -12, r: 2.2, fill: "#F5F8FA", animClass: "particle-drift-a", duration: 2.2, delay: 0 },
  { dx: 12, dy: -15, r: 1.8, fill: "#1595D0", animClass: "particle-drift-b", duration: 2.8, delay: 0.3 },
  { dx: -18, dy: 6, r: 2.4, fill: "#278F9B", animClass: "particle-drift-c", duration: 2.4, delay: 0.7 },
  { dx: 16, dy: 10, r: 1.6, fill: "#F5F8FA", animClass: "particle-drift-a", duration: 3.1, delay: 0.2 },
  { dx: -8, dy: -22, r: 1.9, fill: "#1595D0", animClass: "particle-drift-b", duration: 2.5, delay: 0.5 },
  { dx: 9, dy: 20, r: 2.0, fill: "#C96C8E", animClass: "particle-drift-c", duration: 2.9, delay: 0.8 },
  { dx: -22, dy: -5, r: 1.4, fill: "#F5F8FA", animClass: "particle-drift-a", duration: 2.0, delay: 0.4 },
  { dx: 24, dy: -6, r: 1.7, fill: "#ED247A", animClass: "particle-drift-b", duration: 2.6, delay: 0.1 },
  { dx: -6, dy: 18, r: 2.5, fill: "#278F9B", animClass: "particle-drift-c", duration: 3.0, delay: 0.6 },
  { dx: 7, dy: -10, r: 2.8, fill: "#F5F8FA", animClass: "particle-drift-a", duration: 1.9, delay: 0.9 },
  { dx: -12, dy: 24, r: 1.5, fill: "#1595D0", animClass: "particle-drift-b", duration: 2.7, delay: 0.3 },
  { dx: 19, dy: -20, r: 2.1, fill: "#C96C8E", animClass: "particle-drift-c", duration: 2.3, delay: 0.7 },
  { dx: -25, dy: 14, r: 1.6, fill: "#ED247A", animClass: "particle-drift-a", duration: 2.8, delay: 0.2 },
  { dx: 22, dy: 18, r: 2.2, fill: "#F5F8FA", animClass: "particle-drift-b", duration: 2.4, delay: 0.5 },
  { dx: -3, dy: -26, r: 1.7, fill: "#278F9B", animClass: "particle-drift-c", duration: 3.2, delay: 0.4 },
  { dx: 4, dy: 26, r: 1.5, fill: "#1595D0", animClass: "particle-drift-a", duration: 2.5, delay: 0.8 },
  // Additional organic hovering particles around the traveling beam
  { dx: -16, dy: -30, r: 1.5, fill: "#F5F8FA", animClass: "particle-drift-c", duration: 3.4, delay: 0.5 },
  { dx: 18, dy: -28, r: 1.7, fill: "#1595D0", animClass: "particle-drift-a", duration: 2.9, delay: 0.9 },
  { dx: -28, dy: -14, r: 1.4, fill: "#C96C8E", animClass: "particle-drift-b", duration: 3.1, delay: 0.2 },
  { dx: 28, dy: 12, r: 1.8, fill: "#F5F8FA", animClass: "particle-drift-c", duration: 2.6, delay: 0.7 },
  { dx: -10, dy: 32, r: 1.6, fill: "#ED247A", animClass: "particle-drift-a", duration: 3.3, delay: 0.4 },
  { dx: 12, dy: 34, r: 1.5, fill: "#278F9B", animClass: "particle-drift-b", duration: 2.7, delay: 0.1 },
  { dx: -32, dy: 4, r: 1.3, fill: "#F5F8FA", animClass: "particle-drift-a", duration: 3.0, delay: 0.8 },
  { dx: 32, dy: -8, r: 1.5, fill: "#1595D0", animClass: "particle-drift-c", duration: 2.5, delay: 0.3 },
  { dx: -20, dy: 22, r: 1.8, fill: "#C96C8E", animClass: "particle-drift-b", duration: 2.8, delay: 0.6 },
  { dx: 24, dy: -22, r: 1.4, fill: "#F5F8FA", animClass: "particle-drift-a", duration: 3.2, delay: 0.2 },
  { dx: -5, dy: -34, r: 1.3, fill: "#278F9B", animClass: "particle-drift-c", duration: 2.9, delay: 0.7 },
  { dx: 6, dy: 36, r: 1.6, fill: "#ED247A", animClass: "particle-drift-b", duration: 3.5, delay: 0.4 },
];

export const ThreadTimeline: React.FC<ThreadTimelineProps> = ({
  onForkReached,
  journeyProgressRef,
  onSkipToFork,
  onSkipToHome,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const beamEnvelopeRef = useRef<SVGPathElement>(null);
  const beamBodyRef = useRef<SVGPathElement>(null);
  const beamFibreLeftRef = useRef<SVGPathElement>(null);
  const beamFibreRightRef = useRef<SVGPathElement>(null);
  const beamMaskPathRef = useRef<SVGPathElement>(null);
  const flowRaysRef = useRef<SVGPathElement>(null);
  const sourceAmbientRef = useRef<SVGCircleElement>(null);
  const particleRefs = useRef<Record<number, SVGCircleElement | null>>({});
  const beadRef = useRef<SVGCircleElement>(null);
  const beadGlowRef = useRef<SVGCircleElement>(null);
  const beadParticleClusterRef = useRef<SVGGElement>(null);
  const strobeStopStartRef = useRef<SVGStopElement>(null);
  const strobeStopCoreRef = useRef<SVGStopElement>(null);
  const strobeStopEndRef = useRef<SVGStopElement>(null);
  const strobeRippleRef = useRef<SVGPathElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const progressTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Element refs for phased cinematic card formation
  const anchorRefs = useRef<Record<string, SVGGElement | null>>({});
  const connectorRefs = useRef<Record<string, SVGPathElement | null>>({});
  const leftConnectorRefs = useRef<Record<string, SVGPathElement | null>>({});
  const milestoneRefs = useRef<Record<string, HTMLElement | null>>({});
  const mobileMilestoneRefs = useRef<Record<string, HTMLElement | null>>({});
  const frameTraceRefs = useRef<Record<string, SVGPathElement | null>>({});
  const responsiveFrameTraceRefs = useRef<Record<string, SVGPathElement | null>>({});
  const cardSurfaceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const portraitRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const identityRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollRefs = useRef<Record<string, CrystallineObsidianScrollHandle | null>>({});

  const handleScrollToggle = (milestoneId: string, isOpen: boolean) => {
    const frame = frameTraceRefs.current[milestoneId];
    if (frame) {
      gsap.to(frame, {
        strokeOpacity: isOpen ? 0.25 : 0,
        duration: 0.35,
        ease: "power2.inOut",
      });
    }
  };

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );
  const [viewportSize, setViewportSize] = useState(() => ({
    width: typeof window === "undefined" ? 1024 : window.innerWidth,
    height: typeof window === "undefined" ? 768 : window.innerHeight,
  }));
  const [pathMetrics, setPathMetrics] = useState<TimelinePathMetrics | null>(null);

  useEffect(() => {
    let resizeFrame = 0;
    const updateViewport = () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      });
    };
    window.addEventListener("resize", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    };
  }, []);

  const isResponsiveComposition = viewportSize.width < EXHIBITION_MIN_VIEWPORT_WIDTH;
  const responsiveStageWidth = Math.min(viewportSize.width, 1020);
  const centerRailX = responsiveStageWidth / 2;
  const threadX = isResponsiveComposition ? centerRailX : 500;

  // Responsive viewports use CSS-pixel coordinates: the thread runs down the
  // exact horizontal center of the viewport stage, and the encounters jut out
  // on alternating sides with balanced, readable archival plaques.
  const responsiveParentPathD = `
    M ${centerRailX} 40
    C ${centerRailX - 10} 260, ${centerRailX + 10} 560, ${centerRailX} 950
    C ${centerRailX + 14} 1250, ${centerRailX - 14} 1780, ${centerRailX} 2150
    C ${centerRailX + 14} 2450, ${centerRailX - 14} 3000, ${centerRailX} 3350
    C ${centerRailX + 14} 3650, ${centerRailX - 14} 4200, ${centerRailX} 4550
    C ${centerRailX + 14} 4850, ${centerRailX - 14} 5400, ${centerRailX} 5750
    C ${centerRailX + 14} 6050, ${centerRailX - 10} 6600, ${centerRailX} 6950
    C ${centerRailX + 12} 7300, ${centerRailX} 7850, ${centerRailX} ${RESPONSIVE_VIEWBOX_HEIGHT}
  `.replace(/\s+/g, " ").trim();

  const desktopParentPathD = `
    M 500 40
    C 500 240, 470 540, 500 846
    C 530 1120, 470 1650, 500 1946
    C 530 2220, 470 2750, 500 3046
    C 530 3320, 470 3850, 500 4146
    C 530 4420, 470 4950, 500 5246
    C 530 5520, 500 6050, 500 6346
    C 500 6750, 500 7450, 500 ${DESKTOP_VIEWBOX_HEIGHT}
  `.replace(/\s+/g, " ").trim();
  const parentPathD = isResponsiveComposition ? responsiveParentPathD : desktopParentPathD;

  const isExhibitionViewport =
    viewportSize.width >= EXHIBITION_MIN_VIEWPORT_WIDTH &&
    viewportSize.height >= EXHIBITION_MIN_VIEWPORT_HEIGHT &&
    pathMetrics !== null;
  const exhibitionPanelHeightCss = Math.min(520, Math.max(420, viewportSize.width * 0.304));
  const responsivePanelHeightCss = viewportSize.width < 480 ? 360 : 320;
  const exhibitionFormationLeadUnits = pathMetrics
    ? getAdaptiveFormationLeadUnits(
        viewportSize.height,
        exhibitionPanelHeightCss,
        pathMetrics.pathLength,
        TIMELINE_STAGE_HEIGHT
      )
    : EXHIBITION_FORMATION_LEAD_VIEWBOX_UNITS;
  const responsiveFormationLeadUnits = pathMetrics
    ? getAdaptiveFormationLeadUnits(
        viewportSize.height,
        responsivePanelHeightCss,
        pathMetrics.pathLength,
        RESPONSIVE_TIMELINE_STAGE_HEIGHT
      )
    : RESPONSIVE_FORMATION_LEAD_VIEWBOX_UNITS;

  // Responsive exhibits are positioned at a consistent, readable viewport
  // band when the travelling light reaches their station. The document remains
  // the native scroll authority; this piecewise map only changes how story
  // progress is distributed across that existing native range.
  const responsiveHistoryProgressMap = useMemo<JourneyProgressMapPoint[] | null>(() => {
    if (!isResponsiveComposition || !pathMetrics || pathMetrics.pathLength <= 0) {
      return null;
    }
    const scrollRange = Math.max(
      1,
      RESPONSIVE_TIMELINE_STAGE_HEIGHT - viewportSize.height
    );
    const stageScale =
      RESPONSIVE_TIMELINE_STAGE_HEIGHT / RESPONSIVE_VIEWBOX_HEIGHT;
    const panelHeight = responsivePanelHeightCss;
    const halfPanel = panelHeight / 2;
    const formationWindowPx =
      (responsiveFormationLeadUnits / pathMetrics.pathLength) * scrollRange;
    const minCenter = halfPanel + scrollRange * 0.01 + 2;
    const maxCenter = viewportSize.height - halfPanel - formationWindowPx - 2;
    const targetCenter = Math.min(
      maxCenter,
      Math.max(minCenter, viewportSize.height * 0.32)
    );

    return [
      { nativeProgress: 0, timelineProgress: 0 },
      ...APPROVED_HISTORICAL_MILESTONES.map((milestone, index) => {
        const anchorY = RESPONSIVE_MILESTONE_ANCHORS[index];
        const nativeScrollAtArrival = anchorY * stageScale - targetCenter;
        return {
          nativeProgress: Math.max(
            0,
            Math.min(1, nativeScrollAtArrival / scrollRange)
          ),
          timelineProgress: pathMetrics.anchorProgresses[milestone.id] ?? 0,
        };
      }),
      { nativeProgress: 1, timelineProgress: 1 },
    ];
  }, [
    isResponsiveComposition,
    pathMetrics,
    responsivePanelHeightCss,
    responsiveFormationLeadUnits,
    viewportSize.height,
  ]);

  const milestoneGeometries: Record<string, MilestoneGeometry> =
    isResponsiveComposition
      ? Object.fromEntries(
          APPROVED_HISTORICAL_MILESTONES.map((milestone, index) => {
            const base = MILESTONE_GEOMETRIES[milestone.id];
            const anchorY = RESPONSIVE_MILESTONE_ANCHORS[index];
            const isLeft = index % 2 === 0;

            let cardWidth: number;
            let cardHeight: number;
            let cardX: number;
            let entryX: number;
            let connectorD: string;
            let frameTraceD: string;

            if (viewportSize.width < 640) {
              // Mobile phones (<640px): cards alternate on either side of the center thread
              const edgeMargin = Math.max(8, Math.min(14, responsiveStageWidth * 0.025));
              const connectorGap = Math.max(10, Math.min(16, responsiveStageWidth * 0.03));
              const availableHalf = centerRailX - edgeMargin - connectorGap;
              cardWidth = Math.max(140, Math.floor(availableHalf));
              cardHeight = 320;

              if (isLeft) {
                cardX = Math.floor(centerRailX - connectorGap - cardWidth);
                entryX = cardX + cardWidth;
                connectorD = `M ${centerRailX} ${anchorY} C ${centerRailX - 4} ${anchorY}, ${entryX + 4} ${anchorY}, ${entryX} ${anchorY}`;
                frameTraceD = getLeftCardPerimeterPath(0, 0, cardWidth, cardHeight, cardHeight / 2);
              } else {
                cardX = Math.floor(centerRailX + connectorGap);
                entryX = cardX;
                connectorD = `M ${centerRailX} ${anchorY} C ${centerRailX + 4} ${anchorY}, ${entryX - 4} ${anchorY}, ${entryX} ${anchorY}`;
                frameTraceD = getRightCardPerimeterPath(0, 0, cardWidth, cardHeight, cardHeight / 2);
              }
            } else {
              // Tablets and medium viewports (640px to 1199px)
              const connectorGap = 24;
              cardWidth = Math.min(420, Math.max(260, centerRailX - 48));
              cardHeight = 340;

              if (isLeft) {
                cardX = Math.floor(centerRailX - connectorGap - cardWidth);
                entryX = cardX + cardWidth;
                connectorD = `M ${centerRailX} ${anchorY} C ${centerRailX - 8} ${anchorY}, ${entryX + 8} ${anchorY}, ${entryX} ${anchorY}`;
                frameTraceD = getLeftCardPerimeterPath(0, 0, cardWidth, cardHeight, cardHeight / 2);
              } else {
                cardX = Math.floor(centerRailX + connectorGap);
                entryX = cardX;
                connectorD = `M ${centerRailX} ${anchorY} C ${centerRailX + 8} ${anchorY}, ${entryX - 8} ${anchorY}, ${entryX} ${anchorY}`;
                frameTraceD = getRightCardPerimeterPath(0, 0, cardWidth, cardHeight, cardHeight / 2);
              }
            }

            return [
              milestone.id,
              {
                ...base,
                anchorY,
                cardX,
                cardY: anchorY - cardHeight / 2,
                cardWidth,
                cardHeight,
                entryX,
                entryY: anchorY,
                connectorD,
                frameTraceD,
                isLeft,
              },
            ];
          })
        ) as Record<string, MilestoneGeometry>
      : isExhibitionViewport
        ? Object.fromEntries(
            APPROVED_HISTORICAL_MILESTONES.map((milestone) => {
              const base = MILESTONE_GEOMETRIES[milestone.id];
              return [
                milestone.id,
                getExhibitionGeometry(
                  base,
                  viewportSize.width,
                  viewportSize.height,
                  pathMetrics?.pathLength ?? 0,
                  pathMetrics?.anchorProgresses[milestone.id] ?? 0,
                  exhibitionFormationLeadUnits
                ),
              ];
            })
          ) as Record<string, MilestoneGeometry>
        : MILESTONE_GEOMETRIES;

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const pathLength = path.getTotalLength();
    const anchorProgresses: Record<string, number> = {};
    APPROVED_HISTORICAL_MILESTONES.forEach((milestone) => {
      const geometry = milestoneGeometries[milestone.id];
      if (geometry) {
        anchorProgresses[milestone.id] = getPathProgressAtY(path, geometry.anchorY, pathLength);
      }
    });
    const particles = sampleTemporalParticles(path, 24, pathLength);
    const sparkles = sampleThreadBodySparkles(path, 36, pathLength);
    setPathMetrics({ pathLength, anchorProgresses, particles, sparkles });
  }, [parentPathD, viewportSize.width]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Preload historical milestone portraits eagerly into browser cache for zero scroll latency
  useEffect(() => {
    APPROVED_HISTORICAL_MILESTONES.forEach((m) => {
      if (m.portraitUrl && typeof window !== "undefined") {
        const img = new Image();
        img.src = m.portraitUrl;
      }
    });
  }, []);

  useGSAP(
    () => {
      const path = pathRef.current;
      const beamEnvelope = beamEnvelopeRef.current;
      const beamBody = beamBodyRef.current;
      const beamFibreLeft = beamFibreLeftRef.current;
      const beamFibreRight = beamFibreRightRef.current;
      const beamMaskPath = beamMaskPathRef.current;
      const flowRays = flowRaysRef.current;
      const sourceAmbient = sourceAmbientRef.current;
      const bead = beadRef.current;
      const beadGlow = beadGlowRef.current;
      const beadParticleCluster = beadParticleClusterRef.current;
      const container = containerRef.current;
      const header = headerRef.current;
      const prompt = promptRef.current;
      progressTimelineRef.current = null;
      if (!path || !container) return;

      const pathLength = pathMetrics?.pathLength ?? path.getTotalLength();
      const progressiveBeamPaths = [
        path,
        beamEnvelope,
        beamBody,
        beamFibreLeft,
        beamFibreRight,
        beamMaskPath,
      ].filter((node): node is SVGPathElement => node !== null);
      const particles = pathMetrics?.particles ?? [];

      // REDUCED MOTION MODE: Instant static clarity
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(container, { backgroundColor: "transparent" });
        gsap.set(progressiveBeamPaths, { strokeDasharray: "none", strokeDashoffset: 0 });
        if (path) gsap.set(path, { opacity: 1 });
        if (beamEnvelope) gsap.set(beamEnvelope, { opacity: 1 });
        if (beamBody) gsap.set(beamBody, { opacity: 0.32 });
        if (beamFibreLeft) gsap.set(beamFibreLeft, { opacity: 0.54 });
        if (beamFibreRight) gsap.set(beamFibreRight, { opacity: 0.42 });
        if (flowRays) gsap.set(flowRays, { strokeDashoffset: 0, opacity: 0.18 });
        if (sourceAmbient) gsap.set(sourceAmbient, { cx: threadX, cy: 40, opacity: 0.58 });
        particles.forEach((particle) => {
          const node = particleRefs.current[particle.id];
          if (node) gsap.set(node, { opacity: particle.opacity });
        });
        // Reduced motion preserves the opening origin spark; it must not teleport
        // the light to the terminal endpoint. The complete static path/content
        // remains available without requiring scroll-driven movement.
        if (bead) gsap.set(bead, { cx: threadX, cy: 40, opacity: 1, scale: 1, stroke: "#1595D0" });
        if (beadGlow) gsap.set(beadGlow, { cx: threadX, cy: 40, opacity: 0.8, scale: 1, fill: "rgba(21, 149, 208, 0.45)" });
        if (beadParticleCluster) gsap.set(beadParticleCluster, { opacity: 0.7 });
        const staticStrobeStops = [strobeStopStartRef.current, strobeStopEndRef.current].filter(Boolean);
        if (staticStrobeStops.length > 0) gsap.set(staticStrobeStops, { stopColor: "#1595D0" });
        if (strobeStopCoreRef.current) gsap.set(strobeStopCoreRef.current, { stopColor: "#F5F8FA" });
        if (strobeRippleRef.current) gsap.set(strobeRippleRef.current, { stroke: "#F5F8FA" });
        if (header) gsap.set(header, { opacity: 1, y: 0 });
        APPROVED_HISTORICAL_MILESTONES.forEach((m) => {
          const anchor = anchorRefs.current[m.id];
          if (anchor) gsap.set(anchor, { autoAlpha: 1, scale: 1 });
          const connector = connectorRefs.current[m.id];
          if (connector) gsap.set(connector, { strokeDashoffset: 0, autoAlpha: 1 });
          const leftConnector = leftConnectorRefs.current[m.id];
          if (leftConnector) gsap.set(leftConnector, { strokeDashoffset: 0, autoAlpha: 1 });
          const card = milestoneRefs.current[m.id];
          if (card) gsap.set(card, { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" });
          const mobileCard = mobileMilestoneRefs.current[m.id];
          if (mobileCard) gsap.set(mobileCard, { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" });
          const frame = frameTraceRefs.current[m.id];
          if (frame) gsap.set(frame, { strokeDashoffset: 0, strokeOpacity: 0.58 });
          const responsiveFrame = responsiveFrameTraceRefs.current[m.id];
          if (responsiveFrame) gsap.set(responsiveFrame, { strokeDashoffset: 0, strokeOpacity: 0.58 });
          const surface = cardSurfaceRefs.current[m.id];
          if (surface) gsap.set(surface, { opacity: 1 });
          const portrait = portraitRefs.current[m.id];
          if (portrait) gsap.set(portrait, { autoAlpha: 1, scale: 1 });
          const identity = identityRefs.current[m.id];
          if (identity) gsap.set(identity, { autoAlpha: 1, y: 0 });
          const content = contentRefs.current[m.id];
          if (content) gsap.set(content, { autoAlpha: 1, y: 0 });
        });
        return;
      }

      // -----------------------------------------------------------------------
      // INITIAL STAGING: Unified Transparent Canvas & Hidden Future Elements
      // -----------------------------------------------------------------------
      gsap.set(container, { backgroundColor: "transparent" });
      gsap.set(progressiveBeamPaths, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });
      if (path) gsap.set(path, { opacity: 1 });
      if (beamEnvelope) gsap.set(beamEnvelope, { opacity: 1 });
      if (beamBody) gsap.set(beamBody, { opacity: 0.32 });
      if (beamFibreLeft) gsap.set(beamFibreLeft, { opacity: 0.54 });
      if (beamFibreRight) gsap.set(beamFibreRight, { opacity: 0.42 });
      if (flowRays) gsap.set(flowRays, { strokeDashoffset: 0, opacity: 0 });
      if (sourceAmbient) gsap.set(sourceAmbient, { opacity: 0 });
      particles.forEach((particle) => {
        const node = particleRefs.current[particle.id];
        if (node) gsap.set(node, { opacity: 0 });
      });

      // The origin spark is visible from the first painted frame. Only the
      // editorial sentence and scroll affordance have a page-load entrance.
      if (bead) gsap.set(bead, { opacity: 1, scale: 1 });
      if (beadGlow) gsap.set(beadGlow, { opacity: 0.85, scale: 1 });
      if (beadParticleCluster) gsap.set(beadParticleCluster, { opacity: 1 });
      // Opening copy is visible in the resting frame. Its only animated owner
      // is the reversible journey timeline below; there is no competing load tween.
      if (header) gsap.set(header, { opacity: 1, y: 0 });
      if (prompt) gsap.set(prompt, { opacity: 0.8 });

      // Hide all future station markers and cards at baseline
      APPROVED_HISTORICAL_MILESTONES.forEach((m) => {
        const anchor = anchorRefs.current[m.id];
        if (anchor) gsap.set(anchor, { autoAlpha: 0, scale: 0.35, transformOrigin: "center center" });

        const connector = connectorRefs.current[m.id];
        if (connector) {
          const len = connector.getTotalLength() || 140;
          gsap.set(connector, { strokeDasharray: len, strokeDashoffset: len });
        }
        const leftConnector = leftConnectorRefs.current[m.id];
        if (leftConnector) {
          const len = leftConnector.getTotalLength() || 140;
          gsap.set(leftConnector, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 0 });
        }

        const card = milestoneRefs.current[m.id];
        if (card) {
          const geo = milestoneGeometries[m.id];
          const approachOffset = geo?.approachOffset || 0;
          const openingClip = isExhibitionViewport
            ? "inset(0% 48% 0% 48%)"
            : getContactEdgeClip(geo?.isLeft ?? false);
          gsap.set(card, {
            autoAlpha: 0,
            clipPath: openingClip,
            y: isExhibitionViewport ? -approachOffset : 0,
          });
        }
        const mobileCard = mobileMilestoneRefs.current[m.id];
        if (mobileCard) {
          const isLeft = milestoneGeometries[m.id]?.isLeft ?? false;
          gsap.set(mobileCard, {
            autoAlpha: 0,
            clipPath: getContactEdgeClip(isLeft),
          });
        }

        const frame = frameTraceRefs.current[m.id];
        if (frame) {
          const len = frame.getTotalLength() || 1520;
          gsap.set(frame, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 0.22 });
        }
        const responsiveFrame = responsiveFrameTraceRefs.current[m.id];
        if (responsiveFrame) {
          const len = responsiveFrame.getTotalLength() || 1520;
          gsap.set(responsiveFrame, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 0.22 });
        }

        const surface = cardSurfaceRefs.current[m.id];
        if (surface) gsap.set(surface, { opacity: 0 });

        const portrait = portraitRefs.current[m.id];
        if (portrait) gsap.set(portrait, { autoAlpha: 0, scale: 1.08 });

        const identity = identityRefs.current[m.id];
        if (identity) gsap.set(identity, { autoAlpha: 1, y: 0 });
        const content = contentRefs.current[m.id];
        if (content) gsap.set(content, { autoAlpha: 1, y: 0 });
      });

      // -----------------------------------------------------------------------
      // SCROLL-SCRUBBED MASTER CHOREOGRAPHY (Fully Reversible Forward & Backward)
      // -----------------------------------------------------------------------
      const tl = gsap.timeline({ paused: true });

      // 1. Fade opening text as scroll starts (0.00 -> 0.07)
      if (header) {
        tl.to(
          header,
          {
            opacity: 0,
            y: -24,
            duration: 0.07,
            ease: "none",
          },
          0
        );
      }
      if (prompt) {
        tl.to(prompt, { opacity: 0, duration: 0.04, ease: "none" }, 0);
      }

      // 3. Reveal every parent-beam layer and the ray mask from the same path progress.
      progressiveBeamPaths.forEach((layer) => {
        tl.to(
          layer,
          { strokeDashoffset: 0, duration: 1, ease: "none" },
          0
        );
      });
      if (flowRays) {
        // The ray pattern moves forward while the shared mask keeps it strictly
        // inside the already-revealed section of the parent path.
        tl.to(flowRays, { strokeDashoffset: -1040, opacity: 0.22, duration: 1, ease: "none" }, 0);
      }
      if (sourceAmbient) {
        tl.to(
          sourceAmbient,
          {
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
            duration: 1,
            ease: "none",
          },
          0
        );
        tl.to(sourceAmbient, { opacity: 0.66, duration: 0.1, ease: "none" }, 0.025);
      }
      particles.forEach((particle) => {
        const node = particleRefs.current[particle.id];
        if (!node) return;
        tl.to(
          node,
          { opacity: particle.opacity, duration: 0.012, ease: "power1.out" },
          particle.progress
        );
      });

      // 4. Animate travelling bead & halo along exact SVG MotionPath
      if (bead) {
        tl.to(
          bead,
          {
            motionPath: {
              path: path,
              align: path,
              alignOrigin: [0.5, 0.5],
            },
            duration: 1,
            ease: "none",
          },
          0
        );
      }

      if (beadGlow) {
        tl.to(
          beadGlow,
          {
            motionPath: {
              path: path,
              align: path,
              alignOrigin: [0.5, 0.5],
            },
            duration: 1,
            ease: "none",
          },
          0
        );
      }

      if (beadParticleCluster) {
        tl.to(
          beadParticleCluster,
          {
            motionPath: {
              path: path,
              align: path,
              alignOrigin: [0.5, 0.5],
            },
            duration: 1,
            ease: "none",
          },
          0
        );
      }

      // Dynamic chromatic sync matching the thread path's canonical color journey aligned with milestone anchors:
      if (bead) {
        tl.to(bead, { stroke: "#278F9B", duration: 0.08, ease: "power1.inOut" }, 0.22);
        tl.to(bead, { stroke: "#C96C8E", duration: 0.08, ease: "power1.inOut" }, 0.35);
        tl.to(bead, { stroke: "#1595D0", duration: 0.08, ease: "power1.inOut" }, 0.48);
        tl.to(bead, { stroke: "#278F9B", duration: 0.08, ease: "power1.inOut" }, 0.62);
        tl.to(bead, { stroke: "#ED247A", duration: 0.08, ease: "power1.inOut" }, 0.76);
        tl.to(bead, { stroke: "#F5F8FA", duration: 0.08, ease: "power1.inOut" }, 0.92);
      }
      if (beadGlow) {
        tl.to(beadGlow, { fill: "rgba(39, 143, 155, 0.45)", duration: 0.08, ease: "power1.inOut" }, 0.22);
        tl.to(beadGlow, { fill: "rgba(201, 108, 142, 0.45)", duration: 0.08, ease: "power1.inOut" }, 0.35);
        tl.to(beadGlow, { fill: "rgba(21, 149, 208, 0.45)", duration: 0.08, ease: "power1.inOut" }, 0.48);
        tl.to(beadGlow, { fill: "rgba(39, 143, 155, 0.45)", duration: 0.08, ease: "power1.inOut" }, 0.62);
        tl.to(beadGlow, { fill: "rgba(237, 36, 122, 0.45)", duration: 0.08, ease: "power1.inOut" }, 0.76);
        tl.to(beadGlow, { fill: "rgba(245, 248, 250, 0.45)", duration: 0.08, ease: "power1.inOut" }, 0.92);
      }
      const dynamicStrobeStops = [strobeStopStartRef.current, strobeStopEndRef.current].filter(Boolean);
      if (dynamicStrobeStops.length > 0) {
        tl.to(dynamicStrobeStops, { stopColor: "#278F9B", duration: 0.08, ease: "power1.inOut" }, 0.22);
        tl.to(dynamicStrobeStops, { stopColor: "#C96C8E", duration: 0.08, ease: "power1.inOut" }, 0.35);
        tl.to(dynamicStrobeStops, { stopColor: "#1595D0", duration: 0.08, ease: "power1.inOut" }, 0.48);
        tl.to(dynamicStrobeStops, { stopColor: "#278F9B", duration: 0.08, ease: "power1.inOut" }, 0.62);
        tl.to(dynamicStrobeStops, { stopColor: "#ED247A", duration: 0.08, ease: "power1.inOut" }, 0.76);
        tl.to(dynamicStrobeStops, { stopColor: "#F5F8FA", duration: 0.08, ease: "power1.inOut" }, 0.92);
      }
      const strobeCore = strobeStopCoreRef.current;
      if (strobeCore) {
        tl.to(strobeCore, { stopColor: "#CCFBF1", duration: 0.08, ease: "power1.inOut" }, 0.22);
        tl.to(strobeCore, { stopColor: "#FCE7F3", duration: 0.08, ease: "power1.inOut" }, 0.35);
        tl.to(strobeCore, { stopColor: "#F5F8FA", duration: 0.08, ease: "power1.inOut" }, 0.48);
        tl.to(strobeCore, { stopColor: "#CCFBF1", duration: 0.08, ease: "power1.inOut" }, 0.62);
        tl.to(strobeCore, { stopColor: "#FCE7F3", duration: 0.08, ease: "power1.inOut" }, 0.76);
        tl.to(strobeCore, { stopColor: "#F5F8FA", duration: 0.08, ease: "power1.inOut" }, 0.92);
      }
      const strobeRipple = strobeRippleRef.current;
      if (strobeRipple) {
        tl.to(strobeRipple, { stroke: "#CCFBF1", duration: 0.08, ease: "power1.inOut" }, 0.22);
        tl.to(strobeRipple, { stroke: "#FCE7F3", duration: 0.08, ease: "power1.inOut" }, 0.35);
        tl.to(strobeRipple, { stroke: "#F5F8FA", duration: 0.08, ease: "power1.inOut" }, 0.48);
        tl.to(strobeRipple, { stroke: "#CCFBF1", duration: 0.08, ease: "power1.inOut" }, 0.62);
        tl.to(strobeRipple, { stroke: "#FCE7F3", duration: 0.08, ease: "power1.inOut" }, 0.76);
        tl.to(strobeRipple, { stroke: "#F5F8FA", duration: 0.08, ease: "power1.inOut" }, 0.92);
      }

      // 5. Cinematic Station & Card Formation (D-41) for each approved milestone
      APPROVED_HISTORICAL_MILESTONES.forEach((milestone, milestoneIndex) => {
        const geometry = milestoneGeometries[milestone.id];
        if (!geometry) return;

        const anchorProgress = pathMetrics?.anchorProgresses[milestone.id]
          ?? getPathProgressAtY(path, geometry.anchorY, pathLength);
        const formationLeadUnits = isExhibitionViewport
          ? exhibitionFormationLeadUnits
          : isResponsiveComposition
            ? responsiveFormationLeadUnits
            : CARD_FORMATION_LEAD_VIEWBOX_UNITS;
        const formationLeadProgress = formationLeadUnits / pathLength;
        const approachProgress = Math.max(0, anchorProgress - formationLeadProgress);
        const anchor = anchorRefs.current[milestone.id];
        const connector = connectorRefs.current[milestone.id];
        const card = milestoneRefs.current[milestone.id];
        const mobileCard = mobileMilestoneRefs.current[milestone.id];
        const frame = isResponsiveComposition
          ? responsiveFrameTraceRefs.current[milestone.id]
          : frameTraceRefs.current[milestone.id];
        const surface = cardSurfaceRefs.current[milestone.id];
        const portrait = portraitRefs.current[milestone.id];
        const content = contentRefs.current[milestone.id];

        const leftConnector = leftConnectorRefs.current[milestone.id];
        // Synchronized Bilateral Connector Expansion (Issue 2 Fix: start as spark nears station)
        const connectorStart = approachProgress + formationLeadProgress * 0.55;
        const connectorDuration = formationLeadProgress * ((isExhibitionViewport || isResponsiveComposition) ? 0.35 : 0.45);

        if (connector) {
          tl.to(
            connector,
            {
              strokeDashoffset: 0,
              duration: connectorDuration,
              ease: "power2.out",
            },
            connectorStart
          );
          if (isExhibitionViewport || isResponsiveComposition) {
            tl.to(
              connector,
              {
                strokeWidth: 3.6,
                duration: formationLeadProgress * 0.10,
                ease: "power2.out",
              },
              connectorStart + connectorDuration * 0.60
            );
            tl.to(
              connector,
              {
                strokeWidth: 2.4,
                duration: formationLeadProgress * 0.10,
                ease: "power2.out",
              },
              connectorStart + connectorDuration * 0.85
            );
          }
        }
        if (leftConnector && isExhibitionViewport) {
          tl.to(
            leftConnector,
            {
              autoAlpha: 1,
              strokeDashoffset: 0,
              duration: connectorDuration,
              ease: "power2.out",
            },
            connectorStart
          );
          tl.to(
            leftConnector,
            {
              strokeWidth: 3.2,
              duration: formationLeadProgress * 0.10,
              ease: "power2.out",
            },
            connectorStart + connectorDuration * 0.60
          );
          tl.to(
            leftConnector,
            {
              strokeWidth: 2.2,
              duration: formationLeadProgress * 0.10,
              ease: "power2.out",
            },
            connectorStart + connectorDuration * 0.85
          );
        }

        // The station charges up and blooms as the spark contacts the anchor (Issue 1 Fix)
        if (anchor && (isExhibitionViewport || isResponsiveComposition)) {
          tl.to(
            anchor,
            {
              autoAlpha: 1,
              scale: 1.35,
              duration: formationLeadProgress * 0.18,
              ease: "back.out(2)",
            },
            connectorStart
          );
          tl.to(
            anchor,
            {
              scale: 1,
              duration: formationLeadProgress * 0.10,
              ease: "power2.out",
            },
            approachProgress + formationLeadProgress * 0.90
          );
        }

        // The travelling spark briefly intensifies at each encounter.
        if (bead) {
          tl.to(
            bead,
            { scale: 1.65, duration: formationLeadProgress * 0.12, ease: "power2.out" },
            approachProgress + formationLeadProgress * 0.60
          );
          tl.to(
            bead,
            { scale: 1, duration: formationLeadProgress * 0.15, ease: "power2.out" },
            approachProgress + formationLeadProgress * 0.75
          );
        }
        if (beadGlow) {
          tl.to(
            beadGlow,
            { scale: 1.5, duration: formationLeadProgress * 0.12, ease: "power2.out" },
            approachProgress + formationLeadProgress * 0.60
          );
          tl.to(
            beadGlow,
            { scale: 1, duration: formationLeadProgress * 0.15, ease: "power2.out" },
            approachProgress + formationLeadProgress * 0.75
          );
        }

        if (isExhibitionViewport && milestoneIndex > 0) {
          const previousMilestone = APPROVED_HISTORICAL_MILESTONES[milestoneIndex - 1];
          const previousCard = milestoneRefs.current[previousMilestone.id];
          const previousConnector = connectorRefs.current[previousMilestone.id];
          const previousFrame = frameTraceRefs.current[previousMilestone.id];
          const recedeStart = approachProgress + formationLeadProgress * 0.20;
          const recedeDuration = formationLeadProgress * 0.35;

          // Previous encounters remain in the archive, but retreat as quiet
          // peripheral memories instead of appearing clipped and equally active.
          if (previousCard) {
            tl.to(
              previousCard,
              { autoAlpha: 0.16, duration: recedeDuration, ease: "power1.out" },
              recedeStart
            );
          }
          if (previousConnector) {
            tl.to(
              previousConnector,
              { strokeOpacity: 0.16, duration: recedeDuration, ease: "power1.out" },
              recedeStart
            );
          }
          const previousLeftConnector = leftConnectorRefs.current[previousMilestone.id];
          if (previousLeftConnector) {
            tl.to(
              previousLeftConnector,
              { strokeOpacity: 0.16, duration: recedeDuration, ease: "power1.out" },
              recedeStart
            );
          }
          if (previousFrame) {
            tl.to(
              previousFrame,
              { strokeOpacity: 0.12, duration: recedeDuration, ease: "power1.out" },
              recedeStart
            );
          }
        }

        if (isResponsiveComposition) {
          if (mobileCard) {
            tl.to(
              mobileCard,
              { autoAlpha: 1, duration: formationLeadProgress * 0.05, ease: "none" },
              approachProgress + formationLeadProgress * 0.86
            );
            tl.to(
              mobileCard,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: formationLeadProgress * 0.12,
                ease: "power2.inOut",
              },
              approachProgress + formationLeadProgress * 0.88
            );
          }
          if (frame) {
            tl.to(
              frame,
              {
                strokeDashoffset: 0,
                strokeOpacity: 1,
                duration: formationLeadProgress * 0.12,
                ease: "none",
              },
              approachProgress + formationLeadProgress * 0.88
            );
          }
        } else if (isExhibitionViewport) {
          if (card) {
            const approachOffset = geometry.approachOffset || 0;
            if (approachOffset > 0) {
              tl.fromTo(
                card,
                { y: -approachOffset },
                { y: 0, duration: formationLeadProgress * 0.75, ease: "power2.out" },
                approachProgress
              );
            }
            tl.to(
              card,
              { autoAlpha: 1, duration: formationLeadProgress * 0.05, ease: "none" },
              approachProgress + formationLeadProgress * 0.86
            );
            tl.to(
              card,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: formationLeadProgress * 0.12,
                ease: "power2.inOut",
              },
              approachProgress + formationLeadProgress * 0.88
            );
          }
          if (frame) {
            tl.to(
              frame,
              {
                strokeDashoffset: 0,
                strokeOpacity: 0.25,
                duration: formationLeadProgress * 0.12,
                ease: "none",
              },
              approachProgress + formationLeadProgress * 0.88
            );
          }
          if (surface) {
            tl.to(
              surface,
              {
                opacity: 1,
                duration: formationLeadProgress * 0.10,
                ease: "power2.out",
              },
              approachProgress + formationLeadProgress * 0.88
            );
          }
          if (portrait) {
            tl.to(
              portrait,
              {
                autoAlpha: 1,
                scale: 1,
                duration: formationLeadProgress * 0.11,
                ease: "power2.out",
              },
              approachProgress + formationLeadProgress * 0.89
            );
          }
        } else {
          if (card) {
            tl.to(card, { autoAlpha: 1, duration: 0.008, ease: "none" }, approachProgress + 0.004);
          }
          if (frame) {
            tl.to(
              frame,
              { strokeDashoffset: 0, duration: 0.024, ease: "power1.out" },
              approachProgress + 0.004
            );
          }
          if (surface) {
            tl.to(
              surface,
              { opacity: 1, duration: 0.018, ease: "power2.out" },
              approachProgress + 0.007
            );
          }
          if (anchor) {
            tl.to(
              anchor,
              { autoAlpha: 1, scale: 1, duration: 0.016, ease: "back.out(1.6)" },
              approachProgress + 0.01
            );
          }
          if (portrait) {
            tl.to(
              portrait,
              { autoAlpha: 1, scale: 1, duration: 0.015, ease: "power2.out" },
              approachProgress + 0.01
            );
          }
          if (content) {
            tl.to(
              content,
              { autoAlpha: 1, y: 0, duration: 0.014, ease: "power2.out" },
              approachProgress + 0.012
            );
          }
        }

        if (mobileCard && !isExhibitionViewport && !isResponsiveComposition) {
          tl.to(
            mobileCard,
            { autoAlpha: 1, y: 0, duration: 0.018, ease: "power2.out" },
            approachProgress + 0.004
          );
        }

        if (frame) {
          tl.to(
            frame,
            { strokeOpacity: 0.58, duration: 0.02, ease: "power1.out" },
            anchorProgress + 0.012
          );
        }
      });

      progressTimelineRef.current = tl;
    },
    { scope: containerRef, dependencies: [prefersReducedMotion, isExhibitionViewport, isResponsiveComposition, viewportSize.width, viewportSize.height, exhibitionFormationLeadUnits, responsiveFormationLeadUnits, parentPathD, pathMetrics], revertOnUpdate: true }
  );

  // Register the local story timeline with the page-level master scroll driver.
  // This component owns animation details; TimelinePage owns the one scroll source.
  useEffect(() => {
    const timeline = progressTimelineRef.current;
    if (prefersReducedMotion || !timeline) return;

    const setHistoryProgress = (progress: number) => {
      if (progressTimelineRef.current !== timeline) return;
      timeline.progress(Math.max(0, Math.min(1, progress)), false);
      if (progress >= 0.98 && onForkReached) onForkReached();

      APPROVED_HISTORICAL_MILESTONES.forEach((m) => {
        const geo = milestoneGeometries[m.id];
        if (!geo) return;
        const totalLen = pathMetrics?.pathLength || 7100;
        const anchorP = (pathMetrics?.anchorProgresses?.[m.id] ?? geo.anchorY / TIMELINE_STAGE_HEIGHT);
        const leadP = (isExhibitionViewport ? exhibitionFormationLeadUnits : responsiveFormationLeadUnits) / totalLen;
        const approachP = Math.max(0, anchorP - leadP);
        const recedeP = Math.min(1, anchorP + leadP * 0.95);

        // Synchronize scroll unroll with visual entrance in GSAP (card fades in at approachP + leadP * 0.86)
        // Three-phase hysteresis enables smooth reversible exit and prevents cached states (Issues 2 & 3 Fix)
        const enterThreshold = approachP + leadP * 0.82;
        const exitThreshold = approachP + leadP * 0.75;
        const resetThreshold = approachP + leadP * 0.60;

        if (progress >= enterThreshold && progress <= recedeP) {
          scrollRefs.current[m.id]?.playEntrance();
        } else if (progress < exitThreshold && progress >= resetThreshold) {
          scrollRefs.current[m.id]?.playExit();
        } else if (progress < resetThreshold) {
          scrollRefs.current[m.id]?.resetStaged();
        }
      });
    };

    journeyProgressRef.current.historyMap = responsiveHistoryProgressMap;
    journeyProgressRef.current.history = setHistoryProgress;
    journeyProgressRef.current.sync?.();

    APPROVED_HISTORICAL_MILESTONES.forEach((m) => {
      const geo = milestoneGeometries[m.id];
      if (!geo) return;
      const totalLen = pathMetrics?.pathLength || 7100;
      const anchorP = (pathMetrics?.anchorProgresses?.[m.id] ?? geo.anchorY / TIMELINE_STAGE_HEIGHT);
      const leadP = (isExhibitionViewport ? exhibitionFormationLeadUnits : responsiveFormationLeadUnits) / totalLen;
      const approachP = Math.max(0, anchorP - leadP);
      const enterThreshold = approachP + leadP * 0.82;
      if (timeline.progress() >= enterThreshold) {
        scrollRefs.current[m.id]?.playEntrance();
      }
    });

    return () => {
      if (journeyProgressRef.current.history === setHistoryProgress) {
        journeyProgressRef.current.history = null;
        journeyProgressRef.current.historyMap = null;
      }
    };
  }, [
    prefersReducedMotion,
    journeyProgressRef,
    onForkReached,
    isExhibitionViewport,
    viewportSize.width,
    viewportSize.height,
    exhibitionFormationLeadUnits,
    responsiveFormationLeadUnits,
    responsiveHistoryProgressMap,
  ]);

  return (
    <div
      ref={containerRef}
      id="thread-timeline"
      data-testid="thread-timeline"
      className="relative w-full text-[#F5F8FA] selection:bg-[#1595D0]/30 selection:text-[#F5F8FA]"
      style={{ height: isResponsiveComposition ? `${RESPONSIVE_TIMELINE_STAGE_HEIGHT}px` : `${TIMELINE_STAGE_HEIGHT}px`, backgroundColor: "transparent" }}
      aria-label="The Thread We Carry — Darkness-First Historical Timeline"
    >
      {/* Viewport 1: Darkness-first Opening & Golden Spark (Absolute so it does not displace subsequent DOM elements) */}
      <div className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-start pt-20 sm:pt-28 pointer-events-none z-10">
        {/* Warm Golden Spark Header — Pure Darkness-First Atmosphere */}
        <div
          ref={headerRef}
          className="flex flex-col items-center text-center px-4 max-w-xl"
        >
          <span className="sr-only">SSN ACM-W</span>
          <h1 className="text-3xl sm:text-5xl font-serif tracking-tight text-[#F5F8FA] mb-6 leading-tight">
            Every possibility begins somewhere.
          </h1>

          {/* Discreet Scroll Prompt */}
          <div
            ref={promptRef}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#1595D0] animate-pulse"
          >
            <span>Scroll to draw the thread</span>
            <span>↓</span>
          </div>
        </div>

        {/* Quick Skip Controls (Keyboard accessible) */}
        <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-2">
          {onSkipToFork && (
            <button
              onClick={onSkipToFork}
              className="text-xs font-mono px-3.5 py-2.5 min-h-[44px] rounded-lg bg-[#0D131C]/80 border border-[#1595D0]/30 text-[#1595D0] hover:bg-[#1595D0]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D131C]"
            >
              Skip to Fork →
            </button>
          )}
          {onSkipToHome && (
            <button
              onClick={onSkipToHome}
              className="text-xs font-mono px-3.5 py-2.5 min-h-[44px] rounded-lg bg-[#0D131C]/80 border border-[#ED247A]/30 text-[#ED247A] hover:bg-[#ED247A]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ED247A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D131C]"
            >
              Living Mosaic →
            </button>
          )}
        </div>
      </div>

      {/* Authoritative Shared SVG Stage: Timeline Thread, Stations, Connectors, Frame Traces, and ForeignObject Cards */}
      <div className="relative w-full max-w-[1020px] mx-auto pointer-events-none z-20" style={{ height: isResponsiveComposition ? `${RESPONSIVE_TIMELINE_STAGE_HEIGHT}px` : `${TIMELINE_STAGE_HEIGHT}px` }}>
        <svg
          viewBox={isResponsiveComposition ? `0 0 ${responsiveStageWidth} ${RESPONSIVE_VIEWBOX_HEIGHT}` : `0 0 1000 ${DESKTOP_VIEWBOX_HEIGHT}`}
          preserveAspectRatio={isResponsiveComposition ? "none" : "xMidYMin meet"}
          className="absolute inset-0 w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* Canonical Luminous Thread Gradient Synchronized to Milestone Anchors */}
            <linearGradient id="parentThreadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1595D0" />
              <stop offset="12%" stopColor="#1595D0" />
              <stop offset="25%" stopColor="#278F9B" />
              <stop offset="39%" stopColor="#C96C8E" />
              <stop offset="53%" stopColor="#1595D0" />
              <stop offset="67%" stopColor="#278F9B" />
              <stop offset="81%" stopColor="#ED247A" />
              <stop offset="100%" stopColor="#1595D0" />
            </linearGradient>

            <linearGradient id="parentBeamEnvelopeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1595D0" stopOpacity="0.18" />
              <stop offset="12%" stopColor="#1595D0" stopOpacity="0.22" />
              <stop offset="25%" stopColor="#278F9B" stopOpacity="0.20" />
              <stop offset="39%" stopColor="#C96C8E" stopOpacity="0.20" />
              <stop offset="53%" stopColor="#1595D0" stopOpacity="0.22" />
              <stop offset="67%" stopColor="#278F9B" stopOpacity="0.20" />
              <stop offset="81%" stopColor="#ED247A" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1595D0" stopOpacity="0.20" />
            </linearGradient>

            <linearGradient id="forwardFlowRayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1595D0" stopOpacity="0.25" />
              <stop offset="45%" stopColor="#F5F8FA" stopOpacity="0.80" />
              <stop offset="100%" stopColor="#ED247A" stopOpacity="0.30" />
            </linearGradient>

            {/* Downward Timeline Light Strobe Gradient */}
            <linearGradient id="timelineStrobeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop ref={strobeStopStartRef} id="strobeStopStart" offset="0%" stopColor="#1595D0" stopOpacity="0.08" />
              <stop ref={strobeStopCoreRef} id="strobeStopCore" offset="50%" stopColor="#F5F8FA" stopOpacity="0.96" />
              <stop ref={strobeStopEndRef} id="strobeStopEnd" offset="100%" stopColor="#1595D0" stopOpacity="0.08" />
            </linearGradient>

            <radialGradient id="travellingSourceAmbient">
              <stop offset="0%" stopColor="#1595D0" stopOpacity="0.30" />
              <stop offset="38%" stopColor="#278F9B" stopOpacity="0.14" />
              <stop offset="72%" stopColor="#C96C8E" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#ED247A" stopOpacity="0" />
            </radialGradient>

            {/* Expanded bounds keep the source falloff outside the filter region. */}
            <filter id="goldenBeadGlow" x="-250%" y="-250%" width="600%" height="600%">
              <feGaussianBlur stdDeviation="8" result="blur1" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing filters for continuous timeline strobing and suspended particles */}
            <filter id="timelineStrobeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <mask
              id="parentThreadRevealMask"
              maskUnits="userSpaceOnUse"
              maskContentUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={isResponsiveComposition ? responsiveStageWidth : 1000}
              height={isResponsiveComposition ? RESPONSIVE_VIEWBOX_HEIGHT : DESKTOP_VIEWBOX_HEIGHT}
            >
              <path
                ref={beamMaskPathRef}
                d={parentPathD}
                fill="none"
                stroke="white"
                strokeWidth="28"
                strokeLinecap="round"
                strokeDasharray={pathMetrics?.pathLength ?? 1}
                strokeDashoffset={pathMetrics?.pathLength ?? 1}
              />
            </mask>

            {/* Card Frame Trace Glow Filter */}
            <filter id="cardTraceGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="traceBlur" />
              <feMerge>
                <feMergeNode in="traceBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Source-following ambient falloff; radial gradient avoids a rectangular blur surface. */}
          <circle
            ref={sourceAmbientRef}
            data-testid="travelling-source-ambient"
            cx={threadX}
            cy="40"
            r="68"
            fill="url(#travellingSourceAmbient)"
            opacity={0}
          />

          {/* Layered, translucent historical beam. All copies share the measured parent path. */}
          <path
            ref={beamEnvelopeRef}
            data-testid="parent-beam-envelope"
            d={parentPathD}
            fill="none"
            stroke="url(#parentBeamEnvelopeGradient)"
            strokeWidth="22"
            strokeLinecap="round"
            opacity={0}
          />
          <path
            ref={beamBodyRef}
            data-testid="parent-beam-body"
            d={parentPathD}
            fill="none"
            stroke="url(#parentThreadGradient)"
            strokeWidth="9"
            strokeLinecap="round"
            opacity={0}
          />
          <path
            ref={beamFibreLeftRef}
            d={parentPathD}
            transform="translate(-1.8 0)"
            fill="none"
            stroke="#F5F8FA"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity={0}
          />
          <path
            ref={beamFibreRightRef}
            d={parentPathD}
            transform="translate(1.8 0)"
            fill="none"
            stroke="#1595D0"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity={0}
          />

          {/* Active parent core stays above the fibre body but below the visible flow and particles. */}
          <path
            ref={pathRef}
            id="parent-thread-path"
            data-testid="parent-thread-path"
            d={parentPathD}
            fill="none"
            stroke="url(#parentThreadGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity={prefersReducedMotion ? 1 : 0}
          />

          {/* Short longitudinal rays flow forward but remain clipped to the revealed thread. */}
          <path
            ref={flowRaysRef}
            data-testid="parent-beam-forward-rays"
            d={parentPathD}
            fill="none"
            stroke="url(#forwardFlowRayGradient)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeDasharray="28 520"
            strokeDashoffset="0"
            mask="url(#parentThreadRevealMask)"
            opacity={prefersReducedMotion ? 0.18 : 0}
          />

          {/* Continuous light strobing streaming downward through the revealed timeline */}
          {/* Layer 1: Hardware-Accelerated Outer Halo (Zero GPU Blur Buffer) */}
          <path
            id="timeline-light-strobe-halo"
            data-testid="timeline-light-strobe-halo"
            d={parentPathD}
            fill="none"
            stroke="url(#timelineStrobeGradient)"
            strokeWidth="5.6"
            strokeLinecap="round"
            strokeDasharray="90 380"
            className="timeline-strobe-primary pointer-events-none"
            mask="url(#parentThreadRevealMask)"
            opacity={prefersReducedMotion ? 0 : 0.26}
          />
          {/* Layer 2: Concentrated Inner Core */}
          <path
            id="timeline-light-strobe-pulse"
            data-testid="timeline-light-strobe-pulse"
            d={parentPathD}
            fill="none"
            stroke="url(#timelineStrobeGradient)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="90 380"
            className="timeline-strobe-primary pointer-events-none"
            mask="url(#parentThreadRevealMask)"
            opacity={prefersReducedMotion ? 0 : 0.94}
          />
          {/* Layer 3: Secondary Fast Harmonic Ripple */}
          <path
            ref={strobeRippleRef}
            id="timeline-light-strobe-ripple"
            data-testid="timeline-light-strobe-ripple"
            d={parentPathD}
            fill="none"
            stroke="#FFF1D0"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="40 240"
            className="timeline-strobe-secondary pointer-events-none"
            mask="url(#parentThreadRevealMask)"
            opacity={prefersReducedMotion ? 0 : 0.72}
          />

          {/* Suspended flecks along the thread body */}
          {(pathMetrics?.particles ?? []).map((particle) => (
            <circle
              key={particle.id}
              ref={(element) => { particleRefs.current[particle.id] = element; }}
              data-testid={`temporal-particle-${particle.id}`}
              data-progress={particle.progress.toFixed(4)}
              cx={particle.x}
              cy={particle.y}
              r={particle.radius}
              fill={PARTICLE_COLORS[particle.id % PARTICLE_COLORS.length]}
              filter="url(#particleGlow)"
              opacity={prefersReducedMotion ? particle.opacity : 0}
              className={`thread-body-particle thread-particle-drift-${(particle.id % 4) + 1}`}
              style={{
                animationDuration: `${2.4 + (particle.id % 4) * 0.6}s`,
                animationDelay: `${(particle.id % 5) * 0.4}s`,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Secondary masked sparkle field dotted along the thread body */}
          <g
            id="thread-body-sparkle-field"
            data-testid="thread-body-sparkle-field"
            mask="url(#parentThreadRevealMask)"
            className="pointer-events-none"
            aria-hidden="true"
          >
            {(pathMetrics?.sparkles ?? []).map((sparkle) => (
              <circle
                key={`sparkle-${sparkle.id}`}
                cx={sparkle.x}
                cy={sparkle.y}
                r={sparkle.radius}
                fill={sparkle.color}
                opacity={sparkle.opacity}
                filter="url(#particleGlow)"
                className={`thread-body-particle ${sparkle.driftClass}`}
                style={{
                  animationDuration: `${sparkle.duration}s`,
                  animationDelay: `${sparkle.delay}s`,
                }}
              />
            ))}
          </g>

          {/* Milestone Station Anchors, Connectors, Frame Traces & ForeignObject Cards */}
          {APPROVED_HISTORICAL_MILESTONES.map((m) => {
            const geo = milestoneGeometries[m.id];
            if (!geo) return null;

            return (
              <g
                key={`milestone-encounter-${m.id}`}
                id={`milestone-encounter-${m.id}`}
                data-testid={`milestone-encounter-${m.id}`}
                data-formation-lead-viewbox-units={
                  isExhibitionViewport
                    ? Math.round(exhibitionFormationLeadUnits)
                    : isResponsiveComposition
                      ? Math.round(responsiveFormationLeadUnits)
                      : CARD_FORMATION_LEAD_VIEWBOX_UNITS
                }
                data-presentation={
                  isExhibitionViewport
                    ? "immersive-split-exhibition"
                    : isResponsiveComposition
                      ? "responsive-thread-exhibit"
                      : "framed-card"
                }
              >
                {/* 1. Connector Filament (From Station Anchor to Exact Card Frame Entry Edge) */}
                <path
                  ref={(el) => {
                    connectorRefs.current[m.id] = el;
                  }}
                  id={`connector-${m.id}`}
                  data-testid={`connector-${m.id}`}
                  className="pointer-events-none"
                  d={geo.connectorD}
                  fill="none"
                  stroke={m.accentColor || "#1595D0"}
                  strokeWidth="3"
                  strokeOpacity="0.98"
                  strokeLinecap="round"
                />

                {/* Left Connector Branch to Pioneer Cutout (Synchronized Reveal, Hidden Until Arrival) */}
                {isExhibitionViewport && (
                  <path
                    ref={(el) => {
                      leftConnectorRefs.current[m.id] = el;
                    }}
                    id={`left-connector-${m.id}`}
                    data-testid={`left-connector-${m.id}`}
                    className="pointer-events-none opacity-0"
                    d={geo.leftConnectorD || `M 500 ${geo.entryY} L ${geo.cardX + geo.cardWidth * 0.35} ${geo.entryY}`}
                    fill="none"
                    stroke={m.accentColor || "#1595D0"}
                    strokeWidth="2.5"
                    strokeOpacity="0.9"
                    strokeLinecap="round"
                  />
                )}

                {/* 2. Station Anchor Ring Group (Bloom strictly on arrival - Issue 1 Fix) */}
                <g
                  ref={(el) => {
                    anchorRefs.current[m.id] = el;
                  }}
                  id={`station-anchor-${m.id}`}
                  data-testid={`station-anchor-${m.id}`}
                  className="opacity-0 pointer-events-none"
                  style={{ opacity: 0 }}
                >
                  <circle
                    cx={threadX}
                    cy={geo.anchorY}
                    r="8"
                    fill="#0D131C"
                    stroke={m.accentColor || "#1595D0"}
                    strokeWidth="2"
                  />
                  <circle
                    cx={threadX}
                    cy={geo.anchorY}
                    r="3.5"
                    fill={m.accentColor || "#1595D0"}
                  />
                </g>



                {/* 4. Exhibition panel: enlarged editorial split, anchored to the same station geometry. */}
                <foreignObject
                  x={geo.cardX}
                  y={geo.cardY}
                  width={geo.cardWidth}
                  height={geo.cardHeight}
                  aria-hidden="true"
                  className="hidden min-[1200px]:block overflow-visible pointer-events-auto"
                >
                  {isExhibitionViewport ? (
                    <article
                      ref={(el) => {
                        milestoneRefs.current[m.id] = el;
                      }}
                      id={`milestone-${m.id}`}
                      data-testid={`milestone-${m.id}`}
                      data-layout="immersive-split-exhibition"
                      className="group relative flex h-full w-full flex-row items-center pointer-events-auto bg-transparent cursor-default select-none"
                      style={{ willChange: "transform, opacity", transform: "translate3d(0,0,0)" }}
                    >
                      {/* Zero-border surface node maintaining smoke test contract */}
                      <div
                        ref={(el) => {
                          cardSurfaceRefs.current[m.id] = el;
                        }}
                        data-testid={`milestone-surface-${m.id}`}
                        className="pointer-events-none absolute inset-0 opacity-100 border-0"
                      />

                      {/* Left Wing: Heroic Pioneer Cutout floating in space */}
                      <div
                        ref={(el) => {
                          portraitRefs.current[m.id] = el;
                        }}
                        className="relative z-10 flex h-full w-[35%] shrink-0 flex-col items-center justify-center p-2 select-none"
                      >
                        {/* Ethereal radial back-glow */}
                        <div
                          className="absolute inset-2 rounded-full pointer-events-none blur-2xl"
                          style={{
                            background: `radial-gradient(ellipse at 50% 50%, ${m.glowColor || "rgba(21,149,208,0.22)"}, transparent 68%)`,
                          }}
                        />
                        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
                          {m.cutoutUrl || m.silhouetteUrl || m.portraitUrl ? (
                            <img
                              src={m.cutoutUrl || m.silhouetteUrl || m.portraitUrl}
                              alt={`Archival cutout of ${m.person}`}
                              className="max-h-[440px] w-auto max-w-full object-contain filter transition-transform duration-700 hover:scale-105"
                              style={{
                                filter: `drop-shadow(0 0 28px ${m.glowColor || "rgba(21,149,208,0.24)"})`,
                              }}
                              loading="eager"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center">
                              <MilestoneThematicSymbol
                                id={m.id}
                                className="w-36 h-36 object-contain filter transition-transform duration-700 hover:scale-105"
                                color={m.accentColor || "#1595D0"}
                                style={{
                                  filter: `drop-shadow(0 0 28px ${m.glowColor || "rgba(21,149,208,0.24)"})`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <span
                          className="mt-2 block w-full truncate text-center text-[10px] font-mono uppercase tracking-[0.24em] font-semibold"
                          style={{ color: m.accentColor || "#1595D0" }}
                        >
                          ✦ {m.yearLabel} · ARCHIVAL RECORD ✦
                        </span>
                      </div>

                      {/* Center Corridor: 30% transparent breathing clearance for thread path */}
                      <div className="w-[30%] h-full shrink-0 pointer-events-none" />

                      {/* Right Wing: Crystalline Obsidian Scroll with Feather Quill Inscription */}
                      <div className="relative z-10 flex min-w-0 w-[35%] flex-col justify-center px-2 py-1">
                        <div
                          ref={(el) => {
                            identityRefs.current[m.id] = el;
                            contentRefs.current[m.id] = el;
                          }}
                          data-testid={`milestone-identity-${m.id}`}
                          className="min-w-0 w-full"
                        >
                          <div data-testid={`milestone-content-${m.id}`} className="w-full">
                            <CrystallineObsidianScroll
                              ref={(handle) => {
                                scrollRefs.current[m.id] = handle;
                              }}
                              milestone={m}
                              cardWidth={geo.cardWidth * 0.35}
                              cardHeight={geo.cardHeight * 0.88}
                              accentColor={m.accentColor || "#1595D0"}
                              glowColor={m.glowColor || "rgba(21, 149, 208, 0.35)"}
                              isExhibitionViewport={isExhibitionViewport}
                              prefersReducedMotion={prefersReducedMotion}
                              onToggleOpen={(open) => handleScrollToggle(m.id, open)}
                            />
                          </div>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <article
                      ref={(el) => {
                        milestoneRefs.current[m.id] = el;
                      }}
                      id={`milestone-${m.id}`}
                      data-testid={`milestone-${m.id}`}
                      className="group relative w-full h-full p-5 sm:p-6 rounded-2xl flex flex-col justify-between cursor-default bg-transparent select-none"
                    >
                      {/* Zero-border surface maintaining smoke test contract */}
                      <div
                        ref={(el) => {
                          cardSurfaceRefs.current[m.id] = el;
                        }}
                        data-testid={`milestone-surface-${m.id}`}
                        className="pointer-events-none absolute inset-0 opacity-100 border-0"
                      />

                      {/* Archival Silhouette */}
                      <div
                        ref={(el) => {
                          portraitRefs.current[m.id] = el;
                        }}
                        className="relative z-10 mb-3 flex items-center gap-4"
                      >
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
                          <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_50%_50%,rgba(229,169,60,0.2),transparent_70%)] pointer-events-none blur-md" />
                          {m.cutoutUrl || m.silhouetteUrl || m.portraitUrl ? (
                            <img
                              src={m.cutoutUrl || m.silhouetteUrl || m.portraitUrl}
                              alt={`Archival cutout of ${m.person}`}
                              className="max-h-full max-w-full object-contain filter drop-shadow-[0_0_16px_rgba(229,169,60,0.3)] transition-all duration-500 hover:scale-105"
                              loading="eager"
                              decoding="async"
                              fetchPriority="high"
                            />
                          ) : (
                            <MilestoneThematicSymbol
                              id={m.id}
                              className="w-12 h-12 object-contain"
                              color={m.accentColor || "#1595D0"}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: m.accentColor || "#1595D0",
                                boxShadow: `0 0 6px ${m.accentColor || "#1595D0"}`,
                              }}
                            />
                            <span
                              className="text-[10px] font-mono tracking-widest uppercase block font-semibold truncate"
                              style={{ color: m.accentColor || "#1595D0" }}
                            >
                              Archival Record · {m.yearLabel}
                            </span>
                            <MilestoneThematicSymbol
                              id={m.id}
                              className="w-4 h-4 ml-auto shrink-0"
                              color={m.accentColor || "#1595D0"}
                              style={{ color: m.accentColor || "#1595D0" }}
                            />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-serif text-[#F5F8FA] font-bold tracking-tight truncate">
                            {m.person}
                          </h3>
                          <p className="text-xs font-mono text-[#1595D0] truncate">
                            {m.contributionTitle}
                          </p>
                        </div>
                      </div>

                      {/* Content Stagger: Contribution Summary, Quote & Accent Field */}
                      <div
                        ref={(el) => {
                          contentRefs.current[m.id] = el;
                        }}
                        data-testid={`milestone-content-${m.id}`}
                        className="relative z-10 space-y-2.5 flex-1 flex flex-col justify-between"
                      >
                        <p className="text-xs sm:text-sm text-[#F5F8FA]/90 leading-relaxed font-sans line-clamp-3">
                          {m.contributionSummary}
                        </p>

                        {m.quote && (
                          <blockquote
                            className="border-l-2 pl-3 py-0.5 text-xs italic text-[#F5F8FA]/75 font-serif line-clamp-2"
                            style={{ borderColor: `${m.accentColor || "#1595D0"}99` }}
                          >
                            “{m.quote}”
                          </blockquote>
                        )}

                        <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px] font-mono text-[#F5F8FA]/50">
                          <span
                            className="px-2 py-0.5 rounded bg-white/5 border border-white/10"
                            style={{ color: m.accentColor || "#1595D0" }}
                          >
                            {m.accentField}
                          </span>
                          <span>SSN ACM-W Heritage</span>
                        </div>
                      </div>
                    </article>
                  )}
                </foreignObject>

                {/* Luminous perimeter trace: refined architectural accent hairline */}
                <path
                  ref={(el) => {
                    frameTraceRefs.current[m.id] = el;
                  }}
                  id={`frame-trace-${m.id}`}
                  data-testid={`frame-trace-${m.id}`}
                  className="hidden min-[1200px]:block"
                  d={geo.frameTraceD}
                  fill="none"
                  stroke={m.accentColor || "#1595D0"}
                  strokeWidth="0.85"
                  strokeOpacity="0.22"
                />
              </g>
            );
          })}

          {/* Travelling Golden Bead Halo */}
          <circle
            ref={beadGlowRef}
            data-testid="travelling-golden-bead-glow"
            cx={threadX}
            cy="40"
            opacity={0.85}
            r="16"
            fill="rgba(21, 149, 208, 0.45)"
            filter="url(#goldenBeadGlow)"
          />

          {/* Travelling Golden Bead Core */}
          <circle
            ref={beadRef}
            data-testid="travelling-golden-bead"
            cx={threadX}
            cy="40"
            opacity={1}
            r="5"
            fill="#FFF"
            stroke="#1595D0"
            strokeWidth="2.5"
          />

          {/* Travelling Suspended Particle Constellation */}
          <g
            ref={beadParticleClusterRef}
            data-testid="travelling-bead-particle-cluster"
            transform={`translate(${threadX}, 40)`}
            aria-hidden="true"
          >
            {LIGHT_ORBIT_PARTICLES.map((p, idx) => (
              <circle
                key={`light-particle-${idx}`}
                cx={p.dx}
                cy={p.dy}
                r={p.r}
                fill={p.fill}
                filter="url(#particleGlow)"
                className={`particle-suspended ${p.animClass}`}
                style={{
                  animationDuration: `${p.duration}s`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </g>
        </svg>

        {/* Responsive exhibition lane: alternating archival plaques flanking the central thread */}
        <div
          data-testid="mobile-milestone-lane"
          className="absolute inset-0 min-[1200px]:hidden pointer-events-none"
        >
          {APPROVED_HISTORICAL_MILESTONES.map((m) => {
            const geo = milestoneGeometries[m.id];
            if (!geo) return null;
            const topPercent = (geo.anchorY / RESPONSIVE_VIEWBOX_HEIGHT) * 100;
            const isNarrowPhone = viewportSize.width < 640;
            return (
              <article
                key={`mobile-${m.id}`}
                ref={(el) => {
                  mobileMilestoneRefs.current[m.id] = el;
                }}
                id={`mobile-milestone-${m.id}`}
                data-testid={`mobile-milestone-${m.id}`}
                data-layout="responsive-thread-exhibit"
                data-is-left={geo.isLeft ? "true" : "false"}
                aria-hidden="true"
                className="group absolute rounded-xl overflow-hidden bg-[#0B1119]/96 shadow-[0_18px_48px_rgba(0,0,0,0.5)] p-2.5 sm:p-4 pointer-events-auto cursor-default transition-[box-shadow] duration-300 hover:shadow-[0_22px_56px_rgba(0,0,0,0.6),0_0_20px_rgba(229,169,60,0.12)] active:shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_14px_rgba(229,169,60,0.15)]"
                style={{
                  left: `${geo.cardX}px`,
                  width: `${geo.cardWidth}px`,
                  top: `calc(${topPercent}% - ${geo.cardHeight / 2}px)`,
                  height: `${geo.cardHeight}px`,
                }}
              >
                {/* Specular Top Edge Sheen */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5F8FA]/25 to-transparent transition-colors z-20"
                />

                <div
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(115deg, rgba(235,222,197,0.018) 0 1px, transparent 1px 7px), linear-gradient(135deg, rgba(20,28,39,0.98), rgba(10,16,24,0.98))",
                  }}
                >
                  <div className="pointer-events-none absolute inset-1.5 rounded-lg border border-[#F5F8FA]/[0.07]" />
                  <div
                    className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 transition-colors"
                    style={{ borderColor: `${m.accentColor || "#1595D0"}B3` }}
                  />
                  <div
                    className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 transition-colors"
                    style={{ borderColor: `${m.accentColor || "#1595D0"}B3` }}
                  />
                  <div
                    className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 transition-colors"
                    style={{ borderColor: `${m.accentColor || "#1595D0"}B3` }}
                  />
                  <div
                    className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 transition-colors"
                    style={{ borderColor: `${m.accentColor || "#1595D0"}B3` }}
                  />
                  {/* Interactive inner light wash and edge highlight */}
                  <div
                    className="absolute inset-[-25%] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 30% 40%, ${m.glowColor || "rgba(21,149,208,0.18)"}, transparent 50%)`,
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-xl transition-[box-shadow] duration-300 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${m.accentColor || "#1595D0"}33`,
                    }}
                  />
                </div>

                {isNarrowPhone ? (
                  /* Compact Refined Plaque Layout for Narrow Mobile Screens (<640px) */
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      {/* Archival Record Header */}
                      <div
                        className="flex items-center justify-between gap-1 mb-1.5 border-b pb-1"
                        style={{ borderColor: `${m.accentColor || "#1595D0"}33` }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: m.accentColor || "#1595D0",
                              boxShadow: `0 0 6px ${m.accentColor || "#1595D0"}`,
                            }}
                          />
                          <span
                            className="text-[8.5px] font-mono font-bold tracking-[0.12em] uppercase truncate"
                            style={{ color: m.accentColor || "#1595D0" }}
                          >
                            {m.yearLabel} · ARCHIVE
                          </span>
                        </div>
                        <MilestoneThematicSymbol
                          id={m.id}
                          className="w-3.5 h-3.5 shrink-0"
                          color={m.accentColor || "#1595D0"}
                          style={{ color: m.accentColor || "#1595D0" }}
                        />
                      </div>

                      {/* Silhouette + Name Header */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="relative h-12 w-12 shrink-0 flex items-center justify-center select-none">
                          <div
                            className="absolute inset-0 rounded-full pointer-events-none blur-sm"
                            style={{
                              background: `radial-gradient(ellipse at 50% 50%, ${m.glowColor || "rgba(21,149,208,0.22)"}, transparent 70%)`,
                            }}
                          />
                          {m.cutoutUrl || m.silhouetteUrl || m.portraitUrl ? (
                            <img
                              src={m.cutoutUrl || m.silhouetteUrl || m.portraitUrl}
                              alt={`Archival silhouette of ${m.person}`}
                              className="max-h-full max-w-full object-contain filter"
                              style={{
                                filter: `drop-shadow(0 0 8px ${m.glowColor || "rgba(21,149,208,0.3)"})`,
                              }}
                              loading="eager"
                              decoding="async"
                              fetchPriority="high"
                            />
                          ) : (
                            <MilestoneThematicSymbol
                              id={m.id}
                              className="w-8 h-8 object-contain"
                              color={m.accentColor || "#1595D0"}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif text-[13.5px] font-bold leading-tight text-[#F5F8FA] tracking-tight">
                            {m.person}
                          </h3>
                          <p
                            className="mt-0.5 text-[8.5px] font-mono font-semibold uppercase tracking-[0.04em] truncate"
                            style={{ color: m.accentColor || "#1595D0" }}
                          >
                            {m.contributionTitle}
                          </p>
                        </div>
                      </div>

                      {/* Full Summary (Un-clamped for complete readability & smoke test parity) */}
                      <p
                        data-testid={`mobile-summary-${m.id}`}
                        className="mt-1 text-[10.5px] leading-[1.42] text-[#F5F8FA]/90 font-sans overflow-hidden"
                      >
                        {m.contributionSummary}
                      </p>
                    </div>

                    {/* Accent Field Bottom Capsule */}
                    <div className="border-t border-white/10 pt-1 flex items-center justify-between text-[8px] font-mono uppercase tracking-[0.06em]">
                      <span
                        className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 truncate max-w-[85%]"
                        style={{ color: m.accentColor || "#1595D0" }}
                      >
                        {m.accentField}
                      </span>
                      <span className="text-[#F5F8FA]/40 font-serif italic text-[8.5px]">ACM-W</span>
                    </div>
                  </div>
                ) : (
                  /* Tablet Grid Layout */
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-3">
                        <div className="flex h-24 w-[100px] items-center justify-center p-1 select-none relative">
                          <div
                            className="absolute inset-0 rounded-full pointer-events-none blur-md"
                            style={{
                              background: `radial-gradient(ellipse at 50% 50%, ${m.glowColor || "rgba(21,149,208,0.2)"}, transparent 70%)`,
                            }}
                          />
                          {m.cutoutUrl || m.silhouetteUrl || m.portraitUrl ? (
                            <img
                              src={m.cutoutUrl || m.silhouetteUrl || m.portraitUrl}
                              alt={`Archival silhouette of ${m.person}`}
                              className="max-h-full max-w-full object-contain filter"
                              style={{
                                filter: `drop-shadow(0 0 12px ${m.glowColor || "rgba(21,149,208,0.3)"})`,
                              }}
                              loading="eager"
                              decoding="async"
                              fetchPriority="high"
                            />
                          ) : (
                            <MilestoneThematicSymbol
                              id={m.id}
                              className="w-10 h-10 object-contain"
                              color={m.accentColor || "#1595D0"}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: m.accentColor || "#1595D0",
                                boxShadow: `0 0 6px ${m.accentColor || "#1595D0"}`,
                              }}
                            />
                            <span
                              className="text-[10px] font-mono font-semibold tracking-[0.18em] uppercase"
                              style={{ color: m.accentColor || "#1595D0" }}
                            >
                              {m.yearLabel} · HISTORICAL MILESTONE
                            </span>
                            <MilestoneThematicSymbol
                              id={m.id}
                              className="w-4 h-4 ml-auto shrink-0"
                              color={m.accentColor || "#1595D0"}
                              style={{ color: m.accentColor || "#1595D0" }}
                            />
                          </div>
                          <h3 className="break-words font-serif text-[20px] leading-[1.05] font-medium text-[#F5F8FA]">
                            {m.person}
                          </h3>
                          <p
                            className="mt-1.5 break-words text-[11px] leading-[1.4] font-mono font-semibold uppercase tracking-[0.08em]"
                            style={{ color: m.accentColor || "#1595D0" }}
                          >
                            {m.contributionTitle}
                          </p>
                        </div>
                      </div>

                      <p
                        data-testid={`mobile-summary-${m.id}`}
                        className="mt-3 text-[13px] leading-[1.5] text-[#F5F8FA]/90"
                      >
                        {m.contributionSummary}
                      </p>
                    </div>

                    <div
                      className="border-t border-white/10 pt-2 text-[10px] font-mono uppercase leading-relaxed tracking-[0.08em]"
                      style={{ color: m.accentColor || "#1595D0" }}
                    >
                      {m.accentField}
                    </div>
                  </div>
                )}

                <svg
                  viewBox={`0 0 ${geo.cardWidth} ${geo.cardHeight}`}
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
                  aria-hidden="true"
                >
                  <path
                    ref={(el) => {
                      responsiveFrameTraceRefs.current[m.id] = el;
                    }}
                    id={`mobile-frame-trace-${m.id}`}
                    data-testid={`mobile-frame-trace-${m.id}`}
                    d={geo.frameTraceD}
                    fill="none"
                    stroke={m.accentColor || "#1595D0"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    filter="url(#cardTraceGlow)"
                  />
                </svg>
              </article>
            );
          })}
        </div>
      </div>

      {/* Persistent semantic equivalent for assistive technology. The animated
          desktop/mobile cards above are aria-hidden to avoid duplicate reading. */}
      <ol
        data-testid="timeline-accessible-list"
        aria-label="Six approved historical computing milestones"
        className="sr-only"
      >
        {APPROVED_HISTORICAL_MILESTONES.map((m) => (
          <li key={m.id}>
            <article aria-labelledby={`accessible-milestone-title-${m.id}`}>
              <h2 id={`accessible-milestone-title-${m.id}`}>
                {m.person}
              </h2>
              <p>{m.yearLabel} · {m.contributionTitle}</p>
              <p>{m.contributionSummary}</p>
              {m.quote && <blockquote>{m.quote}</blockquote>}
              <p>{m.accentField}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
};
