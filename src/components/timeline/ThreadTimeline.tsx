"use client";

import React, { useRef, useState, useEffect, useLayoutEffect, useMemo } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import { APPROVED_HISTORICAL_MILESTONES } from "../../data/historicalMilestones";
import {
  buildCameraDwellMap,
  type JourneyProgressMapPoint,
  type JourneyProgressRegistry,
} from "../../state/journeyScroll";
import { sampleTemporalParticles } from "./temporalBeam";
import type { TemporalParticle } from "./temporalBeam";
import { MilestoneThematicSymbol } from "./MilestoneThematicSymbols";
import {
  ObsidianExhibit,
  type ObsidianExhibitHandle,
} from "../exhibit/ObsidianExhibit";
import {
  LivingHelixOverlay,
  type CenterlineSample,
  type MilestoneColorStop,
} from "./LivingHelixOverlay";

gsap.registerPlugin(MotionPathPlugin);

interface ThreadTimelineProps {
  onForkReached?: () => void;
  journeyProgressRef: React.MutableRefObject<JourneyProgressRegistry>;
  historyProgressRef?: React.MutableRefObject<number>;
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
  innerConnectorD?: string;
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
const EXHIBITION_MIN_VIEWPORT_WIDTH = 1024;
const EXHIBITION_MIN_VIEWPORT_HEIGHT = 600;
// Generous native-scroll runway includes temporary focus dwell windows at the
// opening emblem birth and at each of the 6 pioneer stations before unpinning.
const TRUNK_START_PROGRESS = 0.048;
const TRUNK_PROGRESS_SPAN = 1 - TRUNK_START_PROGRESS;
const WORLD_STAGE_HEIGHT = 11200;
const RESPONSIVE_WORLD_STAGE_HEIGHT = 10400;
const TIMELINE_STAGE_HEIGHT = 21600;
const RESPONSIVE_TIMELINE_STAGE_HEIGHT = 16800;
const DESKTOP_VIEWBOX_HEIGHT = 10980.3922;
const RESPONSIVE_VIEWBOX_HEIGHT = 11269.6;
const RESPONSIVE_MILESTONE_ANCHORS = [1250, 2900, 4550, 6200, 7850, 9500];
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
    anchorY: 1160,
    cardX: 40,
    cardY: 980,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 440,
    entryY: 1160,
    connectorD: "M 500 1160 C 480 1160, 460 1160, 440 1160",
    frameTraceD: getLeftCardPerimeterPath(40, 980, 400, 360, 1160),
    isLeft: true,
  },
  "PION-02": {
    anchorY: 2640,
    cardX: 560,
    cardY: 2460,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 560,
    entryY: 2640,
    connectorD: "M 500 2640 C 520 2640, 540 2640, 560 2640",
    frameTraceD: getRightCardPerimeterPath(560, 2460, 400, 360, 2640),
    isLeft: false,
  },
  "PION-03": {
    anchorY: 4200,
    cardX: 40,
    cardY: 4020,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 440,
    entryY: 4200,
    connectorD: "M 500 4200 C 480 4200, 460 4200, 440 4200",
    frameTraceD: getLeftCardPerimeterPath(40, 4020, 400, 360, 4200),
    isLeft: true,
  },
  "PION-04": {
    anchorY: 5760,
    cardX: 560,
    cardY: 5580,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 560,
    entryY: 5760,
    connectorD: "M 500 5760 C 520 5760, 540 5760, 560 5760",
    frameTraceD: getRightCardPerimeterPath(560, 5580, 400, 360, 5760),
    isLeft: false,
  },
  "PION-05": {
    anchorY: 7320,
    cardX: 40,
    cardY: 7140,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 440,
    entryY: 7320,
    connectorD: "M 500 7320 C 480 7320, 460 7320, 440 7320",
    frameTraceD: getLeftCardPerimeterPath(40, 7140, 400, 360, 7320),
    isLeft: true,
  },
  "PION-06": {
    anchorY: 8880,
    cardX: 560,
    cardY: 8700,
    cardWidth: 400,
    cardHeight: 360,
    entryX: 560,
    entryY: 8880,
    connectorD: "M 500 8880 C 520 8880, 540 8880, 560 8880",
    frameTraceD: getRightCardPerimeterPath(560, 8700, 400, 360, 8880),
    isLeft: false,
  },
};

interface TimelinePathMetrics {
  pathLength: number;
  anchorProgresses: Record<string, number>;
  particles: TemporalParticle[];
  centerlineSamples: CenterlineSample[];
  anchorYs: number[];
}

function sampleCenterline(
  path: SVGPathElement,
  totalLength: number,
  steps = 200
): CenterlineSample[] {
  if (totalLength <= 0) return [];
  const samples: CenterlineSample[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const progress = i / steps;
    const pt = path.getPointAtLength(progress * totalLength);
    samples.push({ progress, x: pt.x, y: pt.y });
  }
  return samples;
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
  _viewportHeight: number,
  _pathLength: number,
  _anchorProgress: number,
  _formationLeadUnits: number
): MilestoneGeometry {
  const panelWidthCss = Math.min(1260, Math.max(960, viewportWidth * 0.90));
  const panelHeightCss = Math.min(540, Math.max(440, viewportWidth * 0.36));
  const cardWidth = panelWidthCss / TIMELINE_SVG_SCALE;
  const cardHeight = panelHeightCss / TIMELINE_SVG_SCALE;

  // Symmetrical Bilateral Placement across thread center (X = 500)
  // Perfectly centered on base.anchorY so the anchor dot and bilateral split line are exactly in the middle of the card
  const cardX = 500 - cardWidth / 2;
  const cardY = base.anchorY - cardHeight / 2;
  const anchorY = base.anchorY; // CANONICAL ANCHOR Y PRESERVED (846, 1946, 3046...)
  const entryY = base.anchorY; // STRICTLY HORIZONTAL BRANCHING (zero V-sag)
  const approachOffset = 0;

  // 38% Left Wing (Cutout), 21% Clear Corridor (Thread at 50% / X=500), 41% Right Wing (Card starts strictly at 59% / ~100px clear of thread)
  const cutoutTargetX = cardX + cardWidth * 0.28;
  const typoX = cardX + cardWidth * 0.59;
  const typoWidth = cardX + cardWidth - typoX;
  // Terminate right connector gracefully inside the Right Wing exhibit cavity so closed artifacts connect seamlessly
  const entryX = typoX + Math.round(typoWidth * 0.28);

  // Terminate outer curved branch cleanly at left card dock edge (typoX, anchorY); innerConnector
  // bridges to closed artifact center and smoothly erases back to typoX during card transformation.
  const connectorD = `M 500 ${anchorY - 36} C 500 ${anchorY - 6}, ${Math.round(500 + (typoX - 500) * 0.45)} ${anchorY + 12}, ${typoX} ${anchorY}`;
  const innerConnectorD = `M ${typoX} ${anchorY} L ${entryX} ${anchorY}`;
  const leftConnectorD = `M 500 ${anchorY - 36} C 500 ${anchorY - 6}, 476 ${anchorY + 14}, ${cutoutTargetX} ${anchorY}`;
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
    innerConnectorD,
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
  historyProgressRef,
  onSkipToFork,
  onSkipToHome,
}) => {
  const localHistoryProgressRef = useRef(0);
  const effectiveHistoryProgressRef = historyProgressRef ?? localHistoryProgressRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const worldLayerRef = useRef<HTMLDivElement>(null);
  const cameraWorldOffsetRef = useRef(0);
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
  const heroIntroRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const progressTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Element refs for phased cinematic card formation
  const anchorRefs = useRef<Record<string, SVGGElement | null>>({});
  const connectorRefs = useRef<Record<string, SVGPathElement | null>>({});
  const innerConnectorRefs = useRef<Record<string, SVGPathElement | null>>({});
  const leftConnectorRefs = useRef<Record<string, SVGPathElement | null>>({});
  const exhibitProgressRef = useRef<Record<string, number>>({});
  const milestoneRefs = useRef<Record<string, HTMLElement | null>>({});
  const mobileMilestoneRefs = useRef<Record<string, HTMLElement | null>>({});
  const frameTraceRefs = useRef<Record<string, SVGPathElement | null>>({});
  const responsiveFrameTraceRefs = useRef<Record<string, SVGPathElement | null>>({});
  const cardSurfaceRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const portraitRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const identityRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollRefs = useRef<Record<string, ObsidianExhibitHandle | null>>({});
  const stationActivatedRef = useRef<Record<string, boolean>>({});
  const revealedStationsRef = useRef<Record<string, boolean>>({});

  const handleExhibitProgress = (mId: string, prog: number) => {
    exhibitProgressRef.current[mId] = prog;
    const inner = innerConnectorRefs.current[mId];
    if (!inner || !revealedStationsRef.current[mId] || prefersReducedMotion) return;
    // Erase the inner stub from artifact tip back to the card dock (prog: 0.04 -> 0.24)
    const eraseFrac = Math.min(1, Math.max(0, (prog - 0.04) / 0.20));
    const len = inner.getTotalLength() || 120;
    if (prog > 0.04) gsap.killTweensOf(inner);
    inner.style.strokeDasharray = `${len}`;
    inner.style.strokeDashoffset = `${len * eraseFrac}`;
    inner.style.opacity = `${(0.98 * (1 - eraseFrac)).toFixed(3)}`;
  };

  const _handleScrollToggle = (milestoneId: string, isOpen: boolean) => {
    const frame = frameTraceRefs.current[milestoneId];
    if (frame) {
      gsap.to(frame, {
        strokeOpacity: isOpen ? 0.25 : 0,
        duration: 0.35,
        ease: "power2.inOut",
      });
    }
  };

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    width: 1280,
    height: 800,
  });
  const [pathMetrics, setPathMetrics] = useState<TimelinePathMetrics | null>(null);

  useEffect(() => {
    // 0. Disable automatic browser scroll restoration to prevent FOUC on reload
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // 1. Immediately sync actual client viewport dimensions after hydration
    setViewportSize({ width: window.innerWidth, height: window.innerHeight });

    // 2. Synchronize user motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener("change", motionHandler);

    // 3. Dynamic resize handler with requestAnimationFrame debounce
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
      motionQuery.removeEventListener("change", motionHandler);
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
    M ${centerRailX} 350
    C ${centerRailX - 24} 580, ${centerRailX + 26} 900, ${centerRailX} 1250
    C ${centerRailX + 28} 1680, ${centerRailX - 28} 2400, ${centerRailX} 2900
    C ${centerRailX + 28} 3360, ${centerRailX - 28} 4050, ${centerRailX} 4550
    C ${centerRailX + 28} 5010, ${centerRailX - 28} 5700, ${centerRailX} 6200
    C ${centerRailX + 28} 6660, ${centerRailX - 28} 7350, ${centerRailX} 7850
    C ${centerRailX + 28} 8310, ${centerRailX - 26} 9000, ${centerRailX} 9500
    C ${centerRailX + 22} 10050, ${centerRailX} 10750, ${centerRailX} ${RESPONSIVE_VIEWBOX_HEIGHT}
  `.replace(/\s+/g, " ").trim();

  const desktopParentPathD = `
    M 500 350
    C 500 600, 434 860, 500 1160
    C 566 1540, 434 2240, 500 2640
    C 566 3020, 434 3800, 500 4200
    C 566 4580, 434 5360, 500 5760
    C 566 6140, 434 6920, 500 7320
    C 566 7700, 440 8480, 500 8880
    C 550 9500, 478 10300, 500 ${DESKTOP_VIEWBOX_HEIGHT}
  `.replace(/\s+/g, " ").trim();
  const parentPathD = isResponsiveComposition ? responsiveParentPathD : desktopParentPathD;

  const isExhibitionViewport =
    viewportSize.width >= EXHIBITION_MIN_VIEWPORT_WIDTH &&
    viewportSize.height >= EXHIBITION_MIN_VIEWPORT_HEIGHT;
  const exhibitionPanelHeightCss = Math.min(520, Math.max(420, viewportSize.width * 0.304));
  const responsivePanelHeightCss = viewportSize.width < 480 ? 360 : 320;
  const exhibitionFormationLeadUnits = pathMetrics
    ? getAdaptiveFormationLeadUnits(
        viewportSize.height,
        exhibitionPanelHeightCss,
        pathMetrics.pathLength,
        WORLD_STAGE_HEIGHT
      )
    : EXHIBITION_FORMATION_LEAD_VIEWBOX_UNITS;
  const responsiveFormationLeadUnits = pathMetrics
    ? getAdaptiveFormationLeadUnits(
        viewportSize.height,
        responsivePanelHeightCss,
        pathMetrics.pathLength,
        RESPONSIVE_WORLD_STAGE_HEIGHT
      )
    : RESPONSIVE_FORMATION_LEAD_VIEWBOX_UNITS;

  // Map native document scroll smoothly into camera world Y + timeline progress,
  // giving the opening SSN ACM-W birth and all 6 pioneer encounters temporary dwell
  // windows while keeping trunk, branches, cutouts, and cards locked as one unit.
  const historyProgressMap = useMemo<JourneyProgressMapPoint[] | null>(() => {
    if (!pathMetrics || pathMetrics.pathLength <= 0) {
      return null;
    }
    if (isResponsiveComposition) {
      const worldScrollRange = Math.max(
        1,
        RESPONSIVE_WORLD_STAGE_HEIGHT - viewportSize.height
      );
      const stageScale =
        RESPONSIVE_WORLD_STAGE_HEIGHT / RESPONSIVE_VIEWBOX_HEIGHT;
      const panelHeight = responsivePanelHeightCss;
      const halfPanel = panelHeight / 2;
      const formationWindowPx =
        (responsiveFormationLeadUnits / pathMetrics.pathLength) * worldScrollRange;
      const minCenter = halfPanel + worldScrollRange * 0.01 + 2;
      const maxCenter = viewportSize.height - halfPanel - formationWindowPx - 2;
      const targetCenter = Math.min(
        maxCenter,
        Math.max(minCenter, viewportSize.height * 0.34)
      );

      return buildCameraDwellMap({
        worldScrollRangePx: worldScrollRange,
        targetCenterPx: targetCenter,
        trunkStartProgress: TRUNK_START_PROGRESS,
        openingDwellFraction: 0.032,
        stationDwellFraction: 0.046,
        stationDriftPx: 148,
        stations: APPROVED_HISTORICAL_MILESTONES.map((milestone, index) => ({
          anchorWorldPx: RESPONSIVE_MILESTONE_ANCHORS[index] * stageScale,
          anchorTimelineProgress: pathMetrics.anchorProgresses[milestone.id] ?? 0,
        })),
      });
    }

    const worldScrollRange = Math.max(1, WORLD_STAGE_HEIGHT - viewportSize.height);
    const targetCenter = Math.round(viewportSize.height * 0.44);

    return buildCameraDwellMap({
      worldScrollRangePx: worldScrollRange,
      targetCenterPx: targetCenter,
      trunkStartProgress: TRUNK_START_PROGRESS,
      openingDwellFraction: 0.028,
      stationDwellFraction: 0.056,
      stationDriftPx: 184,
      stations: APPROVED_HISTORICAL_MILESTONES.map((milestone) => {
        const base = MILESTONE_GEOMETRIES[milestone.id];
        return {
          anchorWorldPx: (base?.anchorY ?? 0) * TIMELINE_SVG_SCALE,
          anchorTimelineProgress: pathMetrics.anchorProgresses[milestone.id] ?? 0,
        };
      }),
    });
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
    const anchorYs: number[] = [];
    APPROVED_HISTORICAL_MILESTONES.forEach((milestone) => {
      const geometry = milestoneGeometries[milestone.id];
      if (geometry) {
        anchorProgresses[milestone.id] = getPathProgressAtY(path, geometry.anchorY, pathLength);
        anchorYs.push(geometry.anchorY);
      }
    });
    const particles = sampleTemporalParticles(path, 24, pathLength);
    const centerlineSamples = sampleCenterline(path, pathLength, 200);
    setPathMetrics({ pathLength, anchorProgresses, particles, centerlineSamples, anchorYs });
  }, [parentPathD, viewportSize.width]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Preload only the first visible pioneer cutout (.webp) so initial hydration avoids 6MB+ JPEG contention
  useEffect(() => {
    const first = APPROVED_HISTORICAL_MILESTONES[0];
    const url = first?.cutoutUrl || first?.silhouetteUrl;
    if (url && typeof window !== "undefined") {
      const img = new Image();
      img.src = url;
    }
  }, []);

  // One-time deep-space void opening: wait briefly in starlight before fading in hero copy
  useEffect(() => {
    const heroIntro = heroIntroRef.current;
    if (!heroIntro) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(heroIntro, { opacity: 1, y: 0 });
      return;
    }
    const tween = gsap.to(heroIntro, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      delay: 0.85,
      ease: "power2.out",
    });
    return () => {
      tween.kill();
    };
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
      const heroIntro = heroIntroRef.current;
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
        if (sourceAmbient) gsap.set(sourceAmbient, { cx: threadX, cy: 350, opacity: 0.58 });
        particles.forEach((particle) => {
          const node = particleRefs.current[particle.id];
          if (node) gsap.set(node, { opacity: particle.opacity });
        });
        // Reduced motion preserves the opening origin spark; it must not teleport
        // the light to the terminal endpoint. The complete static path/content
        // remains available without requiring scroll-driven movement.
        if (bead) gsap.set(bead, { cx: threadX, cy: 350, opacity: 1, scale: 1, stroke: "#1595D0" });
        if (beadGlow) gsap.set(beadGlow, { cx: threadX, cy: 350, opacity: 0.8, scale: 1, fill: "rgba(21, 149, 208, 0.45)" });
        if (beadParticleCluster) gsap.set(beadParticleCluster, { opacity: 0.7 });
        const staticStrobeStops = [strobeStopStartRef.current, strobeStopEndRef.current].filter(Boolean);
        if (staticStrobeStops.length > 0) gsap.set(staticStrobeStops, { stopColor: "#1595D0" });
        if (strobeStopCoreRef.current) gsap.set(strobeStopCoreRef.current, { stopColor: "#F5F8FA" });
        if (strobeRippleRef.current) gsap.set(strobeRippleRef.current, { stroke: "#F5F8FA" });
        if (header) gsap.set(header, { opacity: 1, y: 0 });
        if (heroIntro) gsap.set(heroIntro, { opacity: 1, y: 0 });
        APPROVED_HISTORICAL_MILESTONES.forEach((m) => {
          const anchor = anchorRefs.current[m.id];
          if (anchor) gsap.set(anchor, { autoAlpha: 1, scale: 1 });
          const connector = connectorRefs.current[m.id];
          if (connector) gsap.set(connector, { strokeDashoffset: 0, autoAlpha: 1 });
          const innerConnector = innerConnectorRefs.current[m.id];
          if (innerConnector) gsap.set(innerConnector, { strokeDashoffset: 0, autoAlpha: 0 });
          const leftConnector = leftConnectorRefs.current[m.id];
          if (leftConnector) gsap.set(leftConnector, { strokeDashoffset: 0, autoAlpha: 1 });
          const card = milestoneRefs.current[m.id];
          if (card) gsap.set(card, { autoAlpha: 1, y: 0, clipPath: isExhibitionViewport ? "none" : "inset(0% 0% 0% 0%)" });
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

      // Start travelling spark hidden in pure deep-space void until star convergence forms SSN ACM-W logo
      if (bead) gsap.set(bead, { opacity: 0, scale: 0.7 });
      if (beadGlow) gsap.set(beadGlow, { opacity: 0, scale: 0.7 });
      if (beadParticleCluster) gsap.set(beadParticleCluster, { opacity: 0 });

      // Scroll dims headerRef cleanly without fighting the standalone mount fade-in
      if (header) gsap.set(header, { opacity: 1, y: 0 });
      if (prompt) gsap.set(prompt, { opacity: 0.85 });

      // Hide only unrevealed station elements at initial baseline; once revealed forward they stay loaded
      APPROVED_HISTORICAL_MILESTONES.forEach((m) => {
        if (revealedStationsRef.current[m.id]) return;

        const anchor = anchorRefs.current[m.id];
        if (anchor) gsap.set(anchor, { autoAlpha: 0, scale: 0.35, transformOrigin: "center center" });

        const connector = connectorRefs.current[m.id];
        if (connector) {
          const len = connector.getTotalLength() || 400;
          gsap.set(connector, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 0 });
        }
        const innerConnector = innerConnectorRefs.current[m.id];
        if (innerConnector) {
          const len = innerConnector.getTotalLength() || 120;
          gsap.set(innerConnector, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 0 });
        }
        const leftConnector = leftConnectorRefs.current[m.id];
        if (leftConnector) {
          const len = leftConnector.getTotalLength() || 400;
          gsap.set(leftConnector, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 0 });
        }

        const card = milestoneRefs.current[m.id];
        if (card) {
          const geo = milestoneGeometries[m.id];
          const openingClip = isExhibitionViewport
            ? "none"
            : getContactEdgeClip(geo?.isLeft ?? false);
          gsap.set(card, {
            autoAlpha: 0,
            clipPath: openingClip,
            y: 0,
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
          gsap.set(frame, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 0, opacity: 0 });
        }
        const responsiveFrame = responsiveFrameTraceRefs.current[m.id];
        if (responsiveFrame) {
          const len = responsiveFrame.getTotalLength() || 1520;
          gsap.set(responsiveFrame, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 0, opacity: 0 });
        }

        const surface = cardSurfaceRefs.current[m.id];
        if (surface) gsap.set(surface, { opacity: 0 });

        const portrait = portraitRefs.current[m.id];
        if (portrait) gsap.set(portrait, { autoAlpha: 0, scale: 0.94, y: 12 });

        const identity = identityRefs.current[m.id];
        if (identity) gsap.set(identity, { autoAlpha: 1, y: 0 });
        const content = contentRefs.current[m.id];
        if (content) gsap.set(content, { autoAlpha: 1, y: 0 });
      });

      // -----------------------------------------------------------------------
      // SCROLL-SCRUBBED MASTER CHOREOGRAPHY (Fully Reversible Forward & Backward)
      // -----------------------------------------------------------------------
      const tl = gsap.timeline({ paused: true });

      // 1. Fade opening text cleanly right as scroll starts (0.00 -> 0.014) so it clears before emblem converges
      if (header) {
        tl.to(
          header,
          {
            opacity: 0,
            y: -32,
            duration: 0.014,
            ease: "power1.out",
          },
          0
        );
      }
      if (prompt) {
        tl.to(prompt, { opacity: 0, duration: 0.01, ease: "none" }, 0);
      }

      // 2. Ignite origin spark cleanly at bottom apex of star-forged SSN ACM-W logo (0.036 -> TRUNK_START_PROGRESS)
      if (bead) {
        tl.to(bead, { opacity: 1, scale: 1, duration: 0.012, ease: "power2.out" }, 0.036);
      }
      if (beadGlow) {
        tl.to(beadGlow, { opacity: 0.85, scale: 1, duration: 0.012, ease: "power2.out" }, 0.036);
      }
      if (beadParticleCluster) {
        tl.to(beadParticleCluster, { opacity: 1, duration: 0.012, ease: "power2.out" }, 0.036);
      }

      // 3. Grow parent-beam layers & travelling bead ONLY AFTER logo convergence completes
      progressiveBeamPaths.forEach((layer) => {
        tl.to(
          layer,
          { strokeDashoffset: 0, duration: TRUNK_PROGRESS_SPAN, ease: "none" },
          TRUNK_START_PROGRESS
        );
      });
      if (flowRays) {
        tl.to(
          flowRays,
          { strokeDashoffset: -1040, opacity: 0.22, duration: TRUNK_PROGRESS_SPAN, ease: "none" },
          TRUNK_START_PROGRESS
        );
      }
      if (sourceAmbient) {
        tl.to(
          sourceAmbient,
          {
            motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
            duration: TRUNK_PROGRESS_SPAN,
            ease: "none",
          },
          TRUNK_START_PROGRESS
        );
        tl.to(sourceAmbient, { opacity: 0.66, duration: 0.06, ease: "none" }, TRUNK_START_PROGRESS + 0.01);
      }
      particles.forEach((particle) => {
        const node = particleRefs.current[particle.id];
        if (!node) return;
        tl.to(
          node,
          { opacity: particle.opacity, duration: 0.012, ease: "power1.out" },
          TRUNK_START_PROGRESS + particle.progress * TRUNK_PROGRESS_SPAN
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
            duration: TRUNK_PROGRESS_SPAN,
            ease: "none",
          },
          TRUNK_START_PROGRESS
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
            duration: TRUNK_PROGRESS_SPAN,
            ease: "none",
          },
          TRUNK_START_PROGRESS
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
            duration: TRUNK_PROGRESS_SPAN,
            ease: "none",
          },
          TRUNK_START_PROGRESS
        );
      }

      // Dynamic chromatic sync matching the thread path's canonical color journey anchored to exact station arrivals:
      const ap = pathMetrics?.anchorProgresses ?? {};
      const sparkStops = APPROVED_HISTORICAL_MILESTONES.map((m, idx) => ({
        color: m.accentColor || "#1595D0",
        at:
          TRUNK_START_PROGRESS +
          Math.max(0.02, (ap[m.id] ?? (idx + 1) * 0.14) - 0.04) * TRUNK_PROGRESS_SPAN,
      }));
      const dynamicStrobeStops = [strobeStopStartRef.current, strobeStopEndRef.current].filter(Boolean);
      const strobeCore = strobeStopCoreRef.current;
      const strobeRipple = strobeRippleRef.current;

      sparkStops.forEach(({ color, at }) => {
        const coreColor = color === "#278F9B" ? "#CCFBF1" : color === "#ED247A" || color === "#C96C8E" ? "#FCE7F3" : "#F5F8FA";
        if (bead) tl.to(bead, { stroke: color, duration: 0.06, ease: "power1.inOut" }, at);
        if (beadGlow) tl.to(beadGlow, { fill: color, opacity: 0.48, duration: 0.06, ease: "power1.inOut" }, at);
        if (dynamicStrobeStops.length > 0) tl.to(dynamicStrobeStops, { stopColor: color, duration: 0.06, ease: "power1.inOut" }, at);
        if (strobeCore) tl.to(strobeCore, { stopColor: coreColor, duration: 0.06, ease: "power1.inOut" }, at);
        if (strobeRipple) tl.to(strobeRipple, { stroke: coreColor, duration: 0.06, ease: "power1.inOut" }, at);
      });
      if (bead) tl.to(bead, { stroke: "#F5F8FA", duration: 0.06, ease: "power1.inOut" }, 0.93);
      if (beadGlow) tl.to(beadGlow, { fill: "#F5F8FA", opacity: 0.45, duration: 0.06, ease: "power1.inOut" }, 0.93);
      if (dynamicStrobeStops.length > 0) tl.to(dynamicStrobeStops, { stopColor: "#F5F8FA", duration: 0.06, ease: "power1.inOut" }, 0.93);
      if (strobeCore) tl.to(strobeCore, { stopColor: "#F5F8FA", duration: 0.06, ease: "power1.inOut" }, 0.93);
      if (strobeRipple) tl.to(strobeRipple, { stroke: "#F5F8FA", duration: 0.06, ease: "power1.inOut" }, 0.93);

      // 5. Trunk Spark Pulse Only (Reversible station reveal & exhibit open/close live in syncMilestoneExhibit)
      APPROVED_HISTORICAL_MILESTONES.forEach((milestone) => {
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
        const pulseStart =
          TRUNK_START_PROGRESS +
          (approachProgress + formationLeadProgress * 0.45) * TRUNK_PROGRESS_SPAN;
        const pulseStep = formationLeadProgress * TRUNK_PROGRESS_SPAN;

        if (bead) {
          tl.to(bead, { scale: 1.55, duration: pulseStep * 0.06, ease: "power2.out" }, pulseStart);
          tl.to(bead, { scale: 1, duration: pulseStep * 0.08, ease: "power2.out" }, pulseStart + pulseStep * 0.06);
        }
        if (beadGlow) {
          tl.to(beadGlow, { scale: 1.45, duration: pulseStep * 0.06, ease: "power2.out" }, pulseStart);
          tl.to(beadGlow, { scale: 1, duration: pulseStep * 0.08, ease: "power2.out" }, pulseStart + pulseStep * 0.06);
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

    const setStationRevealed = (mId: string, revealed: boolean, instant: boolean) => {
      if (!!revealedStationsRef.current[mId] === revealed) return;
      revealedStationsRef.current[mId] = revealed;

      const anchor = anchorRefs.current[mId];
      const connector = connectorRefs.current[mId];
      const innerConnector = innerConnectorRefs.current[mId];
      const leftConnector = leftConnectorRefs.current[mId];
      const card = milestoneRefs.current[mId];
      const mobileCard = mobileMilestoneRefs.current[mId];
      const frame = isResponsiveComposition
        ? responsiveFrameTraceRefs.current[mId]
        : frameTraceRefs.current[mId];
      const surface = cardSurfaceRefs.current[mId];
      const portrait = portraitRefs.current[mId];
      const identity = identityRefs.current[mId];
      const content = contentRefs.current[mId];

      const targets = [
        anchor,
        connector,
        innerConnector,
        leftConnector,
        card,
        mobileCard,
        frame,
        surface,
        portrait,
        identity,
        content,
      ].filter(Boolean);
      if (targets.length > 0) gsap.killTweensOf(targets);

      if (!revealed) {
        const connectorLen = connector?.getTotalLength() || 400;
        const innerLen = innerConnector?.getTotalLength() || 120;
        const leftLen = leftConnector?.getTotalLength() || 400;
        if (instant) {
          if (anchor) gsap.set(anchor, { autoAlpha: 0, scale: 0.35 });
          if (connector) gsap.set(connector, { autoAlpha: 0, strokeDashoffset: connectorLen });
          if (innerConnector) gsap.set(innerConnector, { opacity: 0, strokeDashoffset: innerLen });
          if (leftConnector) gsap.set(leftConnector, { autoAlpha: 0, strokeDashoffset: leftLen });
          if (card) gsap.set(card, { autoAlpha: 0 });
          if (mobileCard) gsap.set(mobileCard, { autoAlpha: 0 });
          if (frame) gsap.set(frame, { strokeOpacity: 0, opacity: 0 });
          if (surface) gsap.set(surface, { opacity: 0 });
          if (portrait) gsap.set(portrait, { autoAlpha: 0, scale: 0.94, y: 12 });
          return;
        }
        // Reversible retraction back into the main thread when scrolling up past this station
        if (card) gsap.to(card, { autoAlpha: 0, duration: 0.28, ease: "power2.in" });
        if (mobileCard) gsap.to(mobileCard, { autoAlpha: 0, duration: 0.28, ease: "power2.in" });
        if (portrait) gsap.to(portrait, { autoAlpha: 0, scale: 0.94, y: 10, duration: 0.28, ease: "power2.in" });
        if (surface) gsap.to(surface, { opacity: 0, duration: 0.25, ease: "power2.in" });
        if (frame) gsap.to(frame, { strokeOpacity: 0, opacity: 0, duration: 0.25 });
        if (innerConnector && isExhibitionViewport) {
          gsap.to(innerConnector, { strokeDashoffset: innerLen, opacity: 0, duration: 0.22, ease: "power2.in" });
        }
        if (connector) gsap.to(connector, { strokeDashoffset: connectorLen, autoAlpha: 0, duration: 0.38, delay: 0.12, ease: "power2.inOut" });
        if (leftConnector && isExhibitionViewport) {
          gsap.to(leftConnector, { strokeDashoffset: leftLen, autoAlpha: 0, duration: 0.38, delay: 0.12, ease: "power2.inOut" });
        }
        if (anchor) gsap.to(anchor, { autoAlpha: 0, scale: 0.35, duration: 0.24, delay: 0.22, ease: "power2.in" });
        return;
      }

      if (instant) {
        if (anchor) gsap.set(anchor, { autoAlpha: 1, scale: 1 });
        if (connector) gsap.set(connector, { autoAlpha: 1, strokeDashoffset: 0 });
        if (innerConnector) {
          const isOpen = (exhibitProgressRef.current[mId] ?? 0) > 0.24;
          gsap.set(innerConnector, { opacity: isOpen ? 0 : 0.98, strokeDashoffset: isOpen ? (innerConnector.getTotalLength() || 120) : 0 });
        }
        if (leftConnector) gsap.set(leftConnector, { autoAlpha: 1, strokeDashoffset: 0 });
        if (card) gsap.set(card, { autoAlpha: 1, y: 0, clipPath: isExhibitionViewport ? "none" : "inset(0% 0% 0% 0%)" });
        if (mobileCard) gsap.set(mobileCard, { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" });
        if (frame) gsap.set(frame, { strokeDashoffset: 0, strokeOpacity: isResponsiveComposition ? 1 : 0, opacity: isResponsiveComposition ? 1 : 0 });
        if (surface) gsap.set(surface, { opacity: 1 });
        if (portrait) gsap.set(portrait, { autoAlpha: 1, scale: 1, y: 0 });
        if (identity) gsap.set(identity, { autoAlpha: 1, y: 0 });
        if (content) gsap.set(content, { autoAlpha: 1, y: 0 });
        return;
      }

      // 1. Anchor bloom + curved branches physically growing outward from main thread
      if (anchor) {
        gsap.to(anchor, {
          autoAlpha: 1,
          scale: 1.22,
          duration: 0.18,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(anchor, { scale: 1, duration: 0.16, ease: "power2.out" });
          },
        });
      }
      if (connector) {
        gsap.to(connector, { autoAlpha: 1, strokeDashoffset: 0, duration: 0.34, ease: "power2.out" });
      }
      if (innerConnector && isExhibitionViewport && (exhibitProgressRef.current[mId] ?? 0) <= 0.04) {
        gsap.to(innerConnector, { opacity: 0.98, strokeDashoffset: 0, duration: 0.20, delay: 0.14, ease: "power2.out" });
      }
      if (leftConnector && isExhibitionViewport) {
        gsap.to(leftConnector, { autoAlpha: 1, strokeDashoffset: 0, duration: 0.38, ease: "power2.out" });
      }

      // 2. Materialize cutout portrait and closed artifact right away to avoid blind-spot flashes
      if (card) {
        gsap.to(card, {
          autoAlpha: 1,
          y: 0,
          clipPath: isExhibitionViewport ? "none" : "inset(0% 0% 0% 0%)",
          duration: 0.32,
          delay: 0.08,
          ease: "power2.out",
        });
      }
      if (mobileCard) {
        gsap.to(mobileCard, {
          autoAlpha: 1,
          y: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.30,
          delay: 0.08,
          ease: "power2.out",
        });
      }
      if (portrait) {
        gsap.to(portrait, {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.32,
          delay: 0.08,
          ease: "power2.out",
        });
      }
      if (surface) {
        gsap.to(surface, { opacity: 1, duration: 0.28, delay: 0.08, ease: "power2.out" });
      }
      if (frame) {
        gsap.to(frame, {
          strokeDashoffset: 0,
          strokeOpacity: isResponsiveComposition ? 1 : 0,
          opacity: isResponsiveComposition ? 1 : 0,
          duration: 0.36,
          delay: 0.10,
          ease: "power2.out",
        });
      }
      if (identity) gsap.to(identity, { autoAlpha: 1, y: 0, duration: 0.26, delay: 0.08 });
      if (content) gsap.to(content, { autoAlpha: 1, y: 0, duration: 0.26, delay: 0.10 });
    };

    const syncMilestoneExhibit = (mId: string, progress: number) => {
      const geo = milestoneGeometries[mId];
      if (!geo) return;
      const totalLen = pathMetrics?.pathLength || 10500;
      const anchorP = pathMetrics?.anchorProgresses?.[mId] ?? geo.anchorY / WORLD_STAGE_HEIGHT;
      const leadP = (isExhibitionViewport ? exhibitionFormationLeadUnits : responsiveFormationLeadUnits) / totalLen;
      const approachP = Math.max(0, anchorP - leadP);
      const trunkProgress = Math.max(0, (progress - TRUNK_START_PROGRESS) / TRUNK_PROGRESS_SPAN);

      const revealThreshold = isExhibitionViewport
        ? Math.max(0, anchorP - leadP * 0.55)
        : approachP + leadP * 0.42;

      if (trunkProgress >= revealThreshold) {
        if (!revealedStationsRef.current[mId]) {
          const passedWellPast = trunkProgress > anchorP + leadP * 1.15;
          setStationRevealed(mId, true, passedWellPast);
        }
      } else {
        if (revealedStationsRef.current[mId]) {
          const jumpedFarBack = trunkProgress < Math.max(0, revealThreshold - 0.12);
          setStationRevealed(mId, false, jumpedFarBack);
        }
        if (stationActivatedRef.current[mId]) {
          stationActivatedRef.current[mId] = false;
          scrollRefs.current[mId]?.playExit();
        }
        return;
      }

      const enterThreshold = isExhibitionViewport ? (anchorP - leadP * 0.36) : (approachP + leadP * 0.40);
      const exitThreshold = isExhibitionViewport ? (anchorP + leadP * 1.45) : Math.min(1, anchorP + leadP * 0.95);
      const isInside = trunkProgress >= enterThreshold && trunkProgress <= exitThreshold;
      const wasActive = !!stationActivatedRef.current[mId];

      if (isExhibitionViewport) {
        // Trigger self-completing 4-beat disassembly once in the focus window so
        // cards always finish unfolding cleanly even if the user stops scrolling.
        if (isInside && !wasActive) {
          stationActivatedRef.current[mId] = true;
          scrollRefs.current[mId]?.playEntrance();
        } else if (!isInside && wasActive) {
          stationActivatedRef.current[mId] = false;
          scrollRefs.current[mId]?.playExit();
        }
        return;
      }

      stationActivatedRef.current[mId] = isInside;
    };

    const setHistoryProgress = (progress: number, worldOffsetPx?: number) => {
      const clamped = Math.max(0, Math.min(1, progress));
      effectiveHistoryProgressRef.current = clamped;
      if (typeof worldOffsetPx === "number") {
        cameraWorldOffsetRef.current = worldOffsetPx;
        if (worldLayerRef.current) {
          worldLayerRef.current.style.transform = `translate3d(0, ${-worldOffsetPx.toFixed(2)}px, 0)`;
        }
      }
      if (progressTimelineRef.current !== timeline) return;
      timeline.progress(clamped, false);
      if (clamped >= 0.98 && onForkReached) onForkReached();

      APPROVED_HISTORICAL_MILESTONES.forEach((m) => {
        syncMilestoneExhibit(m.id, clamped);
      });
    };

    journeyProgressRef.current.historyMap = historyProgressMap;
    journeyProgressRef.current.history = setHistoryProgress;
    journeyProgressRef.current.sync?.();

    APPROVED_HISTORICAL_MILESTONES.forEach((m) => {
      syncMilestoneExhibit(m.id, timeline.progress());
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
    historyProgressMap,
  ]);

  const outerStageHeight = prefersReducedMotion
    ? (isResponsiveComposition ? RESPONSIVE_WORLD_STAGE_HEIGHT : WORLD_STAGE_HEIGHT)
    : (isResponsiveComposition ? RESPONSIVE_TIMELINE_STAGE_HEIGHT : TIMELINE_STAGE_HEIGHT);
  const worldStageHeight = isResponsiveComposition
    ? RESPONSIVE_WORLD_STAGE_HEIGHT
    : WORLD_STAGE_HEIGHT;

  return (
    <div
      ref={containerRef}
      id="thread-timeline"
      data-testid="thread-timeline"
      suppressHydrationWarning
      className="relative w-full text-[#F5F8FA] selection:bg-[#1595D0]/30 selection:text-[#F5F8FA]"
      style={{ height: `${outerStageHeight}px`, backgroundColor: "transparent" }}
      aria-label="The Thread We Carry — Darkness-First Historical Timeline"
    >
      {/* Sticky Camera Frame: pins during opening logo birth & per-station dwell windows */}
      <div className={prefersReducedMotion ? "relative w-full" : "sticky top-0 h-screen w-full overflow-hidden"}>
        {/* Quick Skip Controls (Keyboard accessible) */}
        <div className="absolute top-4 right-4 z-30 pointer-events-auto flex items-center gap-2">
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

        {/* Viewport 1: Deep-space Void Opening Copy */}
        <div className="absolute top-0 left-0 w-full h-screen flex flex-col items-center justify-start pt-48 sm:pt-56 pointer-events-none z-10">
          {/* Warm Golden Spark Header — Pure Darkness-First Atmosphere */}
          <div ref={headerRef} className="w-full flex justify-center">
            <div
              ref={heroIntroRef}
              className="hero-intro-void-init flex flex-col items-center text-center px-4 max-w-xl"
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
          </div>
        </div>

        {/* Authoritative Shared SVG Stage + Canvas Helix locked to single cameraWorldOffsetRef */}
        <div
          className="relative w-full max-w-[1020px] mx-auto pointer-events-none z-20"
          style={{ height: prefersReducedMotion ? `${worldStageHeight}px` : "100%" }}
          suppressHydrationWarning
        >
          {pathMetrics && pathMetrics.centerlineSamples.length >= 2 && (
            <LivingHelixOverlay
              stageRef={containerRef}
              historyProgressRef={effectiveHistoryProgressRef}
              cameraWorldOffsetRef={cameraWorldOffsetRef}
              centerlineSamples={pathMetrics.centerlineSamples}
              milestoneStops={APPROVED_HISTORICAL_MILESTONES.map((m): MilestoneColorStop => {
                const geo = milestoneGeometries[m.id];
                return {
                  id: m.id,
                  anchorProgress: pathMetrics.anchorProgresses[m.id] ?? 0,
                  anchorY: geo?.anchorY ?? 0,
                  color: m.accentColor || "#1595D0",
                };
              })}
              viewBoxWidth={isResponsiveComposition ? responsiveStageWidth : 1000}
              responsiveScaleY={
                isResponsiveComposition
                  ? RESPONSIVE_WORLD_STAGE_HEIGHT / RESPONSIVE_VIEWBOX_HEIGHT
                  : undefined
              }
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
          <div
            ref={worldLayerRef}
            className="relative w-full will-change-transform"
            style={{
              height: `${worldStageHeight}px`,
              transform: prefersReducedMotion ? "none" : undefined,
            }}
          >
        <svg
          key={`timeline-svg-${isResponsiveComposition ? "responsive" : "desktop"}`}
          viewBox={isResponsiveComposition ? `0 0 ${responsiveStageWidth} ${RESPONSIVE_VIEWBOX_HEIGHT}` : `0 0 1000 ${DESKTOP_VIEWBOX_HEIGHT}`}
          preserveAspectRatio={isResponsiveComposition ? "none" : "xMidYMin meet"}
          className="absolute inset-0 w-full h-full overflow-visible"
          aria-hidden="true"
          suppressHydrationWarning
        >
          <defs>
            {/* Canonical Luminous Thread Gradient Synchronized to Exact Pioneer Anchors */}
            <linearGradient id="parentThreadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1595D0" />
              <stop offset="11%" stopColor="#1595D0" />
              <stop offset="25%" stopColor="#278F9B" />
              <stop offset="39%" stopColor="#C96C8E" />
              <stop offset="52%" stopColor="#1595D0" />
              <stop offset="66%" stopColor="#278F9B" />
              <stop offset="80%" stopColor="#ED247A" />
              <stop offset="100%" stopColor="#ED247A" />
            </linearGradient>

            <linearGradient id="parentBeamEnvelopeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1595D0" stopOpacity="0.16" />
              <stop offset="11%" stopColor="#1595D0" stopOpacity="0.20" />
              <stop offset="25%" stopColor="#278F9B" stopOpacity="0.18" />
              <stop offset="39%" stopColor="#C96C8E" stopOpacity="0.18" />
              <stop offset="52%" stopColor="#1595D0" stopOpacity="0.20" />
              <stop offset="66%" stopColor="#278F9B" stopOpacity="0.18" />
              <stop offset="80%" stopColor="#ED247A" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ED247A" stopOpacity="0.18" />
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

            {/* Zero-blur radial glow for the travelling spark halo */}
            <radialGradient id="beadRadialHalo">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#FFD700" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1595D0" stopOpacity="0" />
            </radialGradient>

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
                strokeWidth={pathMetrics ? "28" : "0"}
                strokeLinecap="round"
                strokeDasharray={pathMetrics?.pathLength ?? 0}
                strokeDashoffset={pathMetrics?.pathLength ?? 0}
                opacity={pathMetrics ? 1 : 0}
              />
            </mask>
          </defs>

          {/* Source-following ambient falloff; radial gradient avoids a rectangular blur surface. */}
          <circle
            ref={sourceAmbientRef}
            data-testid="travelling-source-ambient"
            cx={threadX}
            cy="350"
            r="68"
            fill="url(#travellingSourceAmbient)"
            opacity={0}
          />

          {/* Layered, translucent historical center spine slimmed so rotating helix stands out cleanly. */}
          <path
            ref={beamEnvelopeRef}
            data-testid="parent-beam-envelope"
            d={parentPathD}
            fill="none"
            stroke="url(#parentBeamEnvelopeGradient)"
            strokeWidth="12"
            strokeOpacity="0.45"
            strokeLinecap="round"
            opacity={0}
          />
          <path
            ref={beamBodyRef}
            data-testid="parent-beam-body"
            d={parentPathD}
            fill="none"
            stroke="url(#parentThreadGradient)"
            strokeWidth="3.6"
            strokeOpacity="0.42"
            strokeLinecap="round"
            opacity={0}
          />
          <path
            ref={beamFibreLeftRef}
            d={parentPathD}
            transform="translate(-1.2 0)"
            fill="none"
            stroke="#F5F8FA"
            strokeWidth="0.8"
            strokeOpacity="0.45"
            strokeLinecap="round"
            opacity={0}
          />
          <path
            ref={beamFibreRightRef}
            d={parentPathD}
            transform="translate(1.2 0)"
            fill="none"
            stroke="#1595D0"
            strokeWidth="0.7"
            strokeOpacity="0.45"
            strokeLinecap="round"
            opacity={0}
          />

          {/* Active parent core stays subtle inside the rotating LivingHelixOverlay */}
          <path
            ref={pathRef}
            id="parent-thread-path"
            data-testid="parent-thread-path"
            d={parentPathD}
            fill="none"
            stroke="url(#parentThreadGradient)"
            strokeWidth="1.9"
            strokeOpacity="0.72"
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
            opacity={pathMetrics ? (prefersReducedMotion ? 0 : 0.26) : 0}
          />
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
            opacity={pathMetrics ? (prefersReducedMotion ? 0 : 0.94) : 0}
          />
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
            opacity={pathMetrics ? (prefersReducedMotion ? 0 : 0.72) : 0}
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
              opacity={prefersReducedMotion ? particle.opacity : 0}
              className={`thread-body-particle thread-particle-drift-${(particle.id % 4) + 1}`}
              style={{
                animationDuration: `${2.4 + (particle.id % 4) * 0.6}s`,
                animationDelay: `${(particle.id % 5) * 0.4}s`,
              }}
              aria-hidden="true"
            />
          ))}

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
                {/* 1. Connector Filament (From Station Anchor to Exact Card Dock Edge) */}
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
                  style={{ strokeDasharray: 400, strokeDashoffset: 400, opacity: 0 }}
                />

                {/* Inner Artifact Bridge (connects typoX to closed artifact, erases back to dock when card opens) */}
                {isExhibitionViewport && geo.innerConnectorD && (
                  <path
                    ref={(el) => {
                      innerConnectorRefs.current[m.id] = el;
                    }}
                    id={`inner-connector-${m.id}`}
                    data-testid={`inner-connector-${m.id}`}
                    className="pointer-events-none"
                    d={geo.innerConnectorD}
                    fill="none"
                    stroke={m.accentColor || "#1595D0"}
                    strokeWidth="3"
                    strokeOpacity="0.98"
                    strokeLinecap="round"
                    style={{ strokeDasharray: 120, strokeDashoffset: 120, opacity: 0 }}
                  />
                )}

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
                    style={{ strokeDasharray: 400, strokeDashoffset: 400, opacity: 0 }}
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
                  className="hidden min-[1024px]:block overflow-visible pointer-events-auto"
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
                      style={{ opacity: 0, visibility: "hidden", transform: "translate3d(0,0,0)" }}
                    >
                      {/* Zero-border surface node maintaining smoke test contract */}
                      <div
                        ref={(el) => {
                          cardSurfaceRefs.current[m.id] = el;
                        }}
                        data-testid={`milestone-surface-${m.id}`}
                        className="pointer-events-none absolute inset-0 opacity-100 border-0"
                      />

                      {/* Left Wing (38%): Heroic Pioneer Cutout floating in space with interactive hover aura */}
                      <div
                        ref={(el) => {
                          portraitRefs.current[m.id] = el;
                        }}
                        className="group/portrait relative z-10 flex h-full w-[38%] shrink-0 flex-col items-center justify-center p-1 select-none"
                        style={{ opacity: 0, visibility: "hidden" }}
                      >
                        {/* Ethereal radial back-glow (intensifies on hover, zero heavy blur surface) */}
                        <div
                          className="absolute inset-0 rounded-full pointer-events-none opacity-75 transition-opacity duration-300 [@media(hover:hover)]:group-hover/portrait:opacity-100"
                          style={{
                            background: `radial-gradient(ellipse at 50% 50%, ${m.glowColor || "rgba(21,149,208,0.28)"}, transparent 68%)`,
                          }}
                        />
                        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
                          {m.cutoutUrl || m.silhouetteUrl || m.portraitUrl ? (
                            <img
                              src={m.cutoutUrl || m.silhouetteUrl || m.portraitUrl}
                              alt={`Archival cutout of ${m.person}`}
                              className="max-h-[480px] xl:max-h-[520px] w-auto max-w-full object-contain transition-[transform,filter] duration-300 ease-out [@media(hover:hover)]:group-hover/portrait:scale-[1.04] [@media(hover:hover)]:group-hover/portrait:-translate-y-1 cursor-pointer"
                              style={{
                                filter: `drop-shadow(0 0 12px ${m.accentColor || "#1595D0"}90) drop-shadow(0 0 28px ${m.accentColor || "#1595D0"}4A)`,
                              }}
                              onClick={() => {
                                const cur = scrollRefs.current[m.id];
                                if (cur) cur.playEntrance();
                              }}
                              loading={m.id === "PION-01" ? "eager" : "lazy"}
                              decoding="async"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center">
                              <MilestoneThematicSymbol
                                id={m.id}
                                className="w-40 h-40 object-contain transition-transform duration-300 [@media(hover:hover)]:group-hover/portrait:scale-105"
                                color={m.accentColor || "#1595D0"}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => scrollRefs.current[m.id]?.playEntrance()}
                          className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-[#080C12]/70 backdrop-blur-sm text-[10px] font-mono uppercase tracking-[0.2em] font-semibold transition-[transform,background-color,border-color] duration-200 [@media(hover:hover)]:hover:scale-105 cursor-pointer"
                          style={{
                            color: m.accentColor || "#1595D0",
                            borderColor: `${m.accentColor || "#1595D0"}45`,
                          }}
                          aria-label={`Inspect ${m.person} archival record`}
                        >
                          <span>✦ {m.yearLabel} · {m.person} ✦</span>
                        </button>
                      </div>

                      {/* Center Corridor (21%): Distinct clear gap isolating double helix thread (50%) from right card (59%) */}
                      <div className="w-[21%] h-full shrink-0 pointer-events-none" />

                      {/* Right Wing (41%): Distinct Wide Sculptural Obsidian Monument */}
                      <div className="relative z-10 flex min-w-0 w-[41%] flex-col justify-center pl-1 py-1">
                        <div
                          ref={(el) => {
                            identityRefs.current[m.id] = el;
                            contentRefs.current[m.id] = el;
                          }}
                          data-testid={`milestone-identity-${m.id}`}
                          className="min-w-0 w-full"
                        >
                          <div data-testid={`milestone-content-${m.id}`} className="w-full flex justify-start">
                            <div
                              className="w-[540px] shrink-0 flex justify-start origin-left"
                              style={{
                                transform: isExhibitionViewport
                                  ? `scale(${Math.min(
                                      viewportSize.width < 1200 ? 0.72 : viewportSize.width < 1400 ? 0.84 : 0.90,
                                      viewportSize.height < 820 ? viewportSize.height / 880 : 1
                                    ).toFixed(3)})`
                                  : "scale(0.84)",
                                transformOrigin: "left center",
                              }}
                            >
                              <ObsidianExhibit
                                ref={(handle) => {
                                  scrollRefs.current[m.id] = handle;
                                }}
                                milestone={m}
                                layoutMode="monument-only"
                                variant="spatial-artifact"
                                onProgressChange={(prog) => handleExhibitProgress(m.id, prog)}
                                prefersReducedMotion={prefersReducedMotion}
                              />
                            </div>
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
                      style={{ opacity: 0, visibility: "hidden" }}
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
                          <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_50%_50%,rgba(229,169,60,0.22),transparent_70%)] pointer-events-none" />
                          {m.cutoutUrl || m.silhouetteUrl || m.portraitUrl ? (
                            <img
                              src={m.cutoutUrl || m.silhouetteUrl || m.portraitUrl}
                              alt={`Archival cutout of ${m.person}`}
                              className="max-h-full max-w-full object-contain transition-transform duration-300 [@media(hover:hover)]:hover:scale-105"
                              loading="lazy"
                              decoding="async"
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
                  strokeOpacity="0"
                  style={{ opacity: 0 }}
                />
              </g>
            );
          })}

          {/* Travelling Golden Bead Halo (radial gradient — zero blur filter) */}
          <circle
            ref={beadGlowRef}
            data-testid="travelling-golden-bead-glow"
            cx={threadX}
            cy="350"
            opacity={0}
            r="18"
            fill="url(#beadRadialHalo)"
          />

          {/* Travelling Golden Bead Core */}
          <circle
            ref={beadRef}
            data-testid="travelling-golden-bead"
            cx={threadX}
            cy="350"
            opacity={0}
            r="5"
            fill="#FFF"
            stroke="#1595D0"
            strokeWidth="2.5"
          />

          {/* Travelling Suspended Particle Constellation */}
          <g
            ref={beadParticleClusterRef}
            data-testid="travelling-bead-particle-cluster"
            transform={`translate(${threadX}, 350)`}
            opacity={0}
            aria-hidden="true"
          >
            {LIGHT_ORBIT_PARTICLES.map((p, idx) => (
              <circle
                key={`light-particle-${idx}`}
                cx={p.dx}
                cy={p.dy}
                r={p.r}
                fill={p.fill}
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
                  opacity: 0,
                  visibility: "hidden",
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
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{
                              background: `radial-gradient(ellipse at 50% 50%, ${m.glowColor || "rgba(21,149,208,0.22)"}, transparent 70%)`,
                            }}
                          />
                          {m.cutoutUrl || m.silhouetteUrl || m.portraitUrl ? (
                            <img
                              src={m.cutoutUrl || m.silhouetteUrl || m.portraitUrl}
                              alt={`Archival silhouette of ${m.person}`}
                              className="max-h-full max-w-full object-contain"
                              loading={m.id === "PION-01" ? "eager" : "lazy"}
                              decoding="async"
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
                    <div className="border-t border-white/10 pt-1 flex items-center justify-between gap-2 text-[8px] font-mono uppercase tracking-[0.06em]">
                      <span
                        className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 truncate min-w-0 flex-1"
                        style={{ color: m.accentColor || "#1595D0" }}
                      >
                        {m.accentField}
                      </span>
                      <span className="text-[#F5F8FA]/40 font-serif italic text-[8.5px] shrink-0">ACM-W</span>
                    </div>
                  </div>
                ) : (
                  /* Tablet Grid Layout */
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-3">
                        <div className="flex h-24 w-[100px] items-center justify-center p-1 select-none relative">
                          <div
                            className="absolute inset-0 rounded-full pointer-events-none"
                            style={{
                              background: `radial-gradient(ellipse at 50% 50%, ${m.glowColor || "rgba(21,149,208,0.2)"}, transparent 70%)`,
                            }}
                          />
                          {m.cutoutUrl || m.silhouetteUrl || m.portraitUrl ? (
                            <img
                              src={m.cutoutUrl || m.silhouetteUrl || m.portraitUrl}
                              alt={`Archival silhouette of ${m.person}`}
                              className="max-h-full max-w-full object-contain"
                              loading={m.id === "PION-01" ? "eager" : "lazy"}
                              decoding="async"
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
                    strokeOpacity="0"
                    style={{ opacity: 0 }}
                  />
                </svg>
              </article>
            );
          })}
          </div>
          </div>
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
