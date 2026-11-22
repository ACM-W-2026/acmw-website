"use client";
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Compass, Calendar, Code, Heart, Shield, Sparkles, ArrowRight, Users, BookOpen } from "lucide-react";
import { FACET_DEFINITIONS } from "../../data/facets";
import type { FacetId } from "../../data/facets";
import type { JourneyProgressRegistry } from "../../state/journeyScroll";
import { measureTextFast } from "../../utils/pretextText";



interface TerminalForkProps {
  onSelectFacet: (facetId: FacetId, route: string) => void;
  onSelectCentre: () => void;
  journeyProgressRef: React.MutableRefObject<JourneyProgressRegistry>;
}

interface PhysicalNode {
  x: number;
  y: number;
  eqX: number;
  eqY: number;
  vx: number;
  vy: number;
}

interface BranchConfig {
  id: FacetId | "home";
  name: string;
  category: string;
  route: string;
  badge: string;
  teaser: string;
  accent: string;
  glowColor: string;
  phase: number;
  points: [number, number][];
  plaqueOffset: [number, number]; // [dx, dy] relative to terminal node
  isCentre?: boolean;
}

const BRANCH_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>> = {
  projects: Code,
  about: Shield,
  team: Users,
  home: Compass,
  "join-us": Heart,
  events: Calendar,
  outreach: BookOpen,
};

// Deliberate, balanced, graceful S-curves across full 1200x760 canvas (NO spider legs)
// Canonical root at (600, 0)
const BRANCH_CONFIGS: Record<string, BranchConfig> = {
  projects: {
    id: "projects",
    name: "Projects & Tech",
    category: "SYSTEMS",
    route: "/projects",
    badge: FACET_DEFINITIONS.projects.badge,
    teaser: "Flagship codebases, open source tooling & research",
    accent: "#1595D0",
    glowColor: "rgba(21, 149, 208, 0.5)",
    phase: 1.6,
    points: [
      [600, 0],
      [530, 80],
      [420, 115],
      [300, 155],
      [210, 190],
      [150, 230],
    ],
    plaqueOffset: [0, 36],
  },
  about: {
    id: "about",
    name: "About ACM-W",
    category: "IDENTITY",
    route: "/about",
    badge: FACET_DEFINITIONS.about.badge,
    teaser: "Heritage, chapter constitution, values & mission",
    accent: "#1595D0",
    glowColor: "rgba(21, 149, 208, 0.5)",
    phase: 3.2,
    points: [
      [600, 0],
      [550, 120],
      [470, 205],
      [350, 290],
      [240, 375],
      [170, 450],
    ],
    plaqueOffset: [0, 36],
  },
  team: {
    id: "team",
    name: "Team & Leadership",
    category: "GOVERNANCE",
    route: "/team",
    badge: FACET_DEFINITIONS.team.badge,
    teaser: "Executive council, domain mentors & leaders",
    accent: "#C96C8E",
    glowColor: "rgba(201, 108, 142, 0.5)",
    phase: 0.0,
    points: [
      [600, 0],
      [570, 140],
      [520, 250],
      [440, 370],
      [360, 490],
      [290, 610],
    ],
    plaqueOffset: [0, 36],
  },
  home: {
    id: "home",
    name: "Living Mosaic",
    category: "CHAPTER NEXUS",
    route: "/home",
    badge: "CHAPTER HOMEPAGE",
    teaser: "Interactive chapter mosaic & living continuum",
    accent: "#1595D0",
    glowColor: "rgba(21, 149, 208, 0.5)",
    phase: 5.0,
    isCentre: true,
    points: [
      [600, 0],
      [600, 150],
      [600, 270],
      [600, 390],
      [600, 510],
      [600, 630],
    ],
    plaqueOffset: [0, 36],
  },
  "join-us": {
    id: "join-us",
    name: "Join Us · The Future",
    category: "HORIZON",
    route: "/join-us",
    badge: FACET_DEFINITIONS["join-us"].badge,
    teaser: "Student recruitment & active committee tracks",
    accent: "#ED247A",
    glowColor: "rgba(237, 36, 122, 0.5)",
    phase: 0.8,
    points: [
      [600, 0],
      [630, 140],
      [680, 250],
      [760, 370],
      [840, 490],
      [910, 610],
    ],
    plaqueOffset: [0, 36],
  },
  events: {
    id: "events",
    name: "Events & Flagships",
    category: "FLAGSHIPS",
    route: "/events",
    badge: FACET_DEFINITIONS.events.badge,
    teaser: "Flagship symposiums, hackathons & summits",
    accent: "#ED247A",
    glowColor: "rgba(237, 36, 122, 0.5)",
    phase: 4.0,
    points: [
      [600, 0],
      [650, 120],
      [730, 205],
      [850, 290],
      [960, 375],
      [1030, 450],
    ],
    plaqueOffset: [0, 36],
  },
  outreach: {
    id: "outreach",
    name: "Outreach & CSpathshala",
    category: "COMMUNITY",
    route: "/outreach",
    badge: FACET_DEFINITIONS.outreach.badge,
    teaser: "School mentoring, digital literacy & workshops",
    accent: "#278F9B",
    glowColor: "rgba(39, 143, 155, 0.5)",
    phase: 2.4,
    points: [
      [600, 0],
      [670, 80],
      [780, 115],
      [900, 155],
      [990, 190],
      [1050, 230],
    ],
    plaqueOffset: [0, 36],
  },
};

function catmullRomSpline(points: [number, number][], samplesPerSeg: number = 6): [number, number][] {
  if (points.length < 2) return points;
  const result: [number, number][] = [];
  const p = [points[0], ...points, points[points.length - 1]];

  for (let i = 1; i < p.length - 2; i++) {
    const p0 = p[i - 1];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2];

    for (let t = 0; t <= samplesPerSeg; t++) {
      if (i > 1 && t === 0) continue;
      const u = t / samplesPerSeg;
      const u2 = u * u;
      const u3 = u2 * u;

      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * u +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3);

      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * u +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3);

      result.push([x, y]);
    }
  }
  return result;
}

function pointsToSvgPath(points: [number, number][]): string {
  if (points.length === 0) return "";
  const smoothed = catmullRomSpline(points, 6);
  if (smoothed.length === 0) return "";
  let d = `M ${smoothed[0][0].toFixed(1)} ${smoothed[0][1].toFixed(1)}`;
  for (let i = 1; i < smoothed.length; i++) {
    d += ` L ${smoothed[i][0].toFixed(1)} ${smoothed[i][1].toFixed(1)}`;
  }
  return d;
}

function offsetFilamentPoints(
  points: [number, number][],
  phase: number,
  filament: 2 | 3
): [number, number][] {
  return points.map(([x, y], idx) => {
    // Companion fibres diverge gently through the body of the branch, then
    // converge back onto the shared root and the exact same terminal eyelet.
    // This keeps all three filaments physically connected at both endpoints.
    const progress = idx / Math.max(1, points.length - 1);
    const endpointFalloff = Math.sin(Math.PI * progress);
    if (idx === 0 || idx === points.length - 1) return [x, y] as [number, number];

    if (filament === 2) {
      const offset = Math.sin(idx * 1.2 + phase) * 3.5 * endpointFalloff;
      return [x + offset, y - offset * 0.4] as [number, number];
    }
    const offset = Math.cos(idx * 1.4 + phase) * -3.0 * endpointFalloff;
    return [x - offset * 0.5, y + offset] as [number, number];
  });
}

export const TerminalFork: React.FC<TerminalForkProps> = ({
  onSelectFacet,
  onSelectCentre,
  journeyProgressRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const mobileForkRootRef = useRef<HTMLDivElement>(null);
  const mobileForkChoicesRef = useRef<HTMLDivElement>(null);
  const progressTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [draggedBranchKey, setDraggedBranchKey] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isTransitioningRef = useRef(false);
  const transitionTimeoutRef = useRef<number | null>(null);
  const wakeRenderLoopRef = useRef<(() => void) | null>(null);
  const suppressNextClickRef = useRef(false);
  const pointerEventHandlersRef = useRef<{
    move: (event: PointerEvent) => void;
    up: (event: Pick<PointerEvent, "pointerId">) => void;
  }>({
    move: () => undefined,
    up: () => undefined,
  });

  // Imperative DOM references to bypass per-frame React re-renders and ghost transitions
  const domRefs = useRef<
    Record<
      string,
      {
        branchGroup: SVGGElement | null;
        corePath: SVGPathElement | null;
        f2Path: SVGPathElement | null;
        f3Path: SVGPathElement | null;
        hitPath: SVGPathElement | null;
        handleGroup: SVGGElement | null;
        plaqueGroup: SVGGElement | null;
      }
    >
  >({});

  // Physics simulation state stored in refs
  const physicsRef = useRef<{
    branches: Record<string, PhysicalNode[]>;
    draggedKey: string | null;
    dragType: "handle" | "strand" | null;
    dragNodeIdx: number;
    pickupOffset: { x: number; y: number };
    activePointerId: number | null;
    pointerSvgCoords: { x: number; y: number };
    pointerOriginClient: { x: number; y: number };
    lastPointerSvgCoords: { x: number; y: number };
    lastPointerTime: number;
    pointerVelocity: { x: number; y: number };
    dragMoved: boolean;
    time: number;
    decaySamples: { elapsed_ms: number; displacement_px: number; coord: [number, number] }[];
    releaseTime: number | null;
    initialReleaseDisp: number;
    svgRect: { left: number; top: number; scaleX: number; scaleY: number } | null;
  }>({
    branches: {},
    draggedKey: null,
    dragType: null,
    dragNodeIdx: -1,
    pickupOffset: { x: 0, y: 0 },
    activePointerId: null,
    pointerSvgCoords: { x: 0, y: 0 },
    pointerOriginClient: { x: 0, y: 0 },
    lastPointerSvgCoords: { x: 0, y: 0 },
    lastPointerTime: 0,
    pointerVelocity: { x: 0, y: 0 },
    dragMoved: false,
    time: 0,
    decaySamples: [],
    releaseTime: null,
    initialReleaseDisp: 0,
    svgRect: null,
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Initialize nodes for all branches
  useEffect(() => {
    const initialBranches: Record<string, PhysicalNode[]> = {};
    for (const [key, config] of Object.entries(BRANCH_CONFIGS)) {
      initialBranches[key] = config.points.map(([x, y]) => ({
        x,
        y,
        eqX: x,
        eqY: y,
        vx: 0,
        vy: 0,
      }));
    }
    physicsRef.current.branches = initialBranches;
  }, []);

  // Helper to map client pointer event to SVG coordinates
  const getSvgCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 600, y: 380 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }
    return { x: 600, y: 380 };
  }, []);

  // Paused fork choreography; progress is supplied by TimelinePage's master controller.
  useGSAP(
    () => {
      const container = containerRef.current;
      const title = titleRef.current;
      const mobileForkRoot = mobileForkRootRef.current;
      const mobileForkChoices = mobileForkChoicesRef.current;
      progressTimelineRef.current = null;
      if (!container) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if (title) gsap.set(title, { autoAlpha: 1, y: 0 });
        if (mobileForkRoot) gsap.set(mobileForkRoot, { autoAlpha: 1, y: 0 });
        if (mobileForkChoices) gsap.set(mobileForkChoices, { autoAlpha: 1, y: 0 });
        Object.keys(BRANCH_CONFIGS).forEach((key) => {
          const dom = domRefs.current[key];
          if (!dom) return;
          if (dom.corePath) gsap.set(dom.corePath, { strokeDasharray: "none", strokeDashoffset: 0, opacity: 1 });
          if (dom.f2Path) gsap.set(dom.f2Path, { strokeDasharray: "none", strokeDashoffset: 0, opacity: 1 });
          if (dom.f3Path) gsap.set(dom.f3Path, { strokeDasharray: "none", strokeDashoffset: 0, opacity: 1 });
          if (dom.handleGroup) gsap.set(dom.handleGroup, { autoAlpha: 1 });
          if (dom.plaqueGroup) gsap.set(dom.plaqueGroup, { autoAlpha: 1 });
        });
        return;
      }

      // Initial state: title, mobile junction and choices are hidden until the
      // shared fork progress begins. The mobile stack follows this same timeline.
      if (title) gsap.set(title, { autoAlpha: 0, y: -20 });
      if (mobileForkRoot) gsap.set(mobileForkRoot, { autoAlpha: 0, y: 12 });
      if (mobileForkChoices) gsap.set(mobileForkChoices, { autoAlpha: 0, y: 16 });

      Object.keys(BRANCH_CONFIGS).forEach((key) => {
        const dom = domRefs.current[key];
        if (!dom) return;
        const core = dom.corePath;
        const coreLength = core?.getTotalLength() ?? 0;
        const f2Length = dom.f2Path?.getTotalLength() ?? 0;
        const f3Length = dom.f3Path?.getTotalLength() ?? 0;
        if (core && coreLength > 0) {
          gsap.set(core, { strokeDasharray: coreLength, strokeDashoffset: coreLength, opacity: 1 });
        }
        if (dom.f2Path && f2Length > 0) {
          gsap.set(dom.f2Path, { strokeDasharray: f2Length, strokeDashoffset: f2Length, opacity: 1 });
        }
        if (dom.f3Path && f3Length > 0) {
          gsap.set(dom.f3Path, { strokeDasharray: f3Length, strokeDashoffset: f3Length, opacity: 1 });
        }
        if (dom.handleGroup) gsap.set(dom.handleGroup, { autoAlpha: 0 });
        if (dom.plaqueGroup) gsap.set(dom.plaqueGroup, { autoAlpha: 0 });
      });

      // The page-level journey controller supplies this timeline's progress.
      const tl = gsap.timeline({ paused: true });

      // Mobile uses the same fork progress: first the junction/decision prompt,
      // then all seven destination choices appear together from that origin.
      if (mobileForkRoot) {
        tl.to(mobileForkRoot, {
          autoAlpha: 1,
          y: 0,
          duration: 0.18,
          ease: "power2.out",
        }, 0.02);
      }
      if (mobileForkChoices) {
        tl.to(mobileForkChoices, {
          autoAlpha: 1,
          y: 0,
          duration: 0.24,
          ease: "power2.out",
        }, 0.24);
      }

      // 1. Title reveals cleanly above the centered graph
      if (title) {
        tl.to(
          title,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          0
        );
      }

      // 2. Strands draw progressively outward from root
      Object.keys(BRANCH_CONFIGS).forEach((key) => {
        const dom = domRefs.current[key];
        if (!dom) return;

        if (dom.corePath) {
          tl.to(
            dom.corePath,
            {
              strokeDashoffset: 0,
              duration: 0.74,
              ease: "power1.inOut",
              onComplete: () => {
                if (dom.corePath) {
                  dom.corePath.style.strokeDasharray = "none";
                  dom.corePath.style.strokeDashoffset = "0";
                }
              },
            },
            0.06
          );
        }
        if (dom.f2Path) {
          tl.to(
            dom.f2Path,
            {
              strokeDashoffset: 0,
              duration: 0.74,
              ease: "power1.inOut",
              onComplete: () => {
                if (dom.f2Path) {
                  dom.f2Path.style.strokeDasharray = "none";
                  dom.f2Path.style.strokeDashoffset = "0";
                }
              },
            },
            0.06
          );
        }
        if (dom.f3Path) {
          tl.to(
            dom.f3Path,
            {
              strokeDashoffset: 0,
              duration: 0.74,
              ease: "power1.inOut",
              onComplete: () => {
                if (dom.f3Path) {
                  dom.f3Path.style.strokeDasharray = "none";
                  dom.f3Path.style.strokeDashoffset = "0";
                }
              },
            },
            0.06
          );
        }

        // Endpoint portals reveal smoothly as strands arrive at destinations.
        // GSAP manages autoAlpha exclusively; transforms remain 100% under physics loop authority.
        if (dom.handleGroup) {
          tl.to(
            dom.handleGroup,
            {
              autoAlpha: 1,
              duration: 0.22,
              ease: "power2.out",
            },
            0.55
          );
        }
        if (dom.plaqueGroup) {
          tl.to(
            dom.plaqueGroup,
            {
              autoAlpha: 1,
              duration: 0.22,
              ease: "power2.out",
            },
            0.60
          );
        }
      });

      // Ensure master fork timeline spans normalized [0.0, 1.0] with an 18% stable zone [0.82, 1.00]
      tl.to({}, { duration: 0.18 }, 0.82);

      progressTimelineRef.current = tl;
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  // Join the same page-level progress source used by the historical thread.
  useEffect(() => {
    const timeline = progressTimelineRef.current;
    if (prefersReducedMotion || !timeline) return;

    const setForkProgress = (progress: number) => {
      if (progressTimelineRef.current !== timeline) return;
      const clamped = Math.max(0, Math.min(1, progress));
      timeline.progress(clamped, false);

      // Once the strands are drawn (progress >= 0.88), remove dasharray so
      // dragging or stretching the strands can never disconnect from endpoints.
      if (clamped >= 0.88) {
        Object.keys(BRANCH_CONFIGS).forEach((k) => {
          const d = domRefs.current[k];
          if (d) {
            if (d.corePath && d.corePath.style.strokeDasharray !== "none") {
              d.corePath.style.strokeDasharray = "none";
              d.corePath.style.strokeDashoffset = "0";
            }
            if (d.f2Path && d.f2Path.style.strokeDasharray !== "none") {
              d.f2Path.style.strokeDasharray = "none";
              d.f2Path.style.strokeDashoffset = "0";
            }
            if (d.f3Path && d.f3Path.style.strokeDasharray !== "none") {
              d.f3Path.style.strokeDasharray = "none";
              d.f3Path.style.strokeDashoffset = "0";
            }
          }
        });
      } else if (clamped < 0.84) {
        // Restore dasharray during reverse scroll into history
        Object.keys(BRANCH_CONFIGS).forEach((k) => {
          const d = domRefs.current[k];
          if (d && physicsRef.current.draggedKey !== k) {
            if (d.corePath && d.corePath.style.strokeDasharray === "none") {
              const len = d.corePath.getTotalLength() || 600;
              d.corePath.style.strokeDasharray = `${len}`;
            }
            if (d.f2Path && d.f2Path.style.strokeDasharray === "none") {
              const len = d.f2Path.getTotalLength() || 600;
              d.f2Path.style.strokeDasharray = `${len}`;
            }
            if (d.f3Path && d.f3Path.style.strokeDasharray === "none") {
              const len = d.f3Path.getTotalLength() || 600;
              d.f3Path.style.strokeDasharray = `${len}`;
            }
          }
        });
      }
    };

    journeyProgressRef.current.fork = setForkProgress;
    journeyProgressRef.current.sync?.();

    return () => {
      if (journeyProgressRef.current.fork === setForkProgress) {
        journeyProgressRef.current.fork = null;
      }
    };
  }, [prefersReducedMotion, journeyProgressRef]);

  // Frame-rate-independent spring physics with offscreen/background RAF pause (D-01).
  // The endpoint follows the pointer directly with sub-pixel jitter damping, while intermediate
  // nodes inherit a natural harmonic flex so the strand and its gateway move as one connected object.
  useEffect(() => {
    let animationFrameId: number | null = null;
    let previousTimestamp = 0;
    const SPRING_STIFFNESS = 200;
    const DAMPING_RATE = 11.5;
    const IDLE_AMP = prefersReducedMotion ? 0 : 0.85;

    let isIntersecting = true;
    let isDocumentVisible = typeof document !== "undefined" ? !document.hidden : true;

    const shouldRun = () => {
      const state = physicsRef.current;
      const hasMovingNodes = Object.values(state.branches).some((nodes) => {
        const terminal = nodes[nodes.length - 1];
        if (!terminal) return false;
        return (
          Math.abs(terminal.vx) > 0.05 ||
          Math.abs(terminal.vy) > 0.05 ||
          Math.hypot(terminal.x - terminal.eqX, terminal.y - terminal.eqY) > 0.15
        );
      });
      return (
        isIntersecting &&
        isDocumentVisible &&
        (state.draggedKey !== null ||
          hasMovingNodes ||
          isTransitioningRef.current)
      );
    };

    const stopLoop = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const renderLoop = (timestamp: number) => {
      const state = physicsRef.current;
      const dt = previousTimestamp
        ? Math.min(Math.max((timestamp - previousTimestamp) / 1000, 0), 1 / 30)
        : 1 / 60;
      previousTimestamp = timestamp;
      state.time = timestamp * 0.001;
      const damping = Math.exp(-DAMPING_RATE * dt);

      for (const [key, config] of Object.entries(BRANCH_CONFIGS)) {
        const nodes = state.branches[key];
        if (!nodes || nodes.length === 0) continue;

        const isBeingDragged = state.draggedKey === key;
        const dom = domRefs.current[key];
        const draggedIndex = !isBeingDragged
          ? -1
          : state.dragType === "handle"
            ? nodes.length - 1
            : state.dragNodeIdx;
        const draggedNode = draggedIndex >= 1 ? nodes[draggedIndex] : null;
        const draggedTarget = draggedNode
          ? {
              x: state.pointerSvgCoords.x - state.pickupOffset.x,
              y: state.pointerSvgCoords.y - state.pickupOffset.y,
            }
          : null;
        const dragDelta = draggedNode && draggedTarget
          ? {
              x: draggedTarget.x - draggedNode.eqX,
              y: draggedTarget.y - draggedNode.eqY,
            }
          : { x: 0, y: 0 };

        const n = nodes.length;
        const terminal = nodes[n - 1];

        // CPU Optimization: while a branch is being dragged, skip recalculating splines
        // and updating DOM attributes for other branches that are already settled at rest.
        const isBranchActive =
          isBeingDragged ||
          Math.abs(terminal.vx) > 0.05 ||
          Math.abs(terminal.vy) > 0.05 ||
          Math.hypot(terminal.x - terminal.eqX, terminal.y - terminal.eqY) > 0.15;

        if (!isBranchActive) {
          continue;
        }

        // Keep the root fixed at (600, 0).
        // 1:1 Instant Tracking: The dragged node and intermediate filaments follow
        // the user's hand with ZERO artificial lag or friction.
        for (let i = 0; i < n; i++) {
          const node = nodes[i];
          if (i === 0) continue;

          if (isBeingDragged && i === draggedIndex && draggedTarget) {
            // Direct 1:1 tracking under the pointer
            node.x = draggedTarget.x;
            node.y = draggedTarget.y;
            node.vx = 0;
            node.vy = 0;
            continue;
          }

          // Gentle ambient idle sway
          const idleEnvelope = i === n - 1 ? 0 : i / n;
          const idleX =
            Math.sin(state.time * 0.9 + config.phase + i * 0.5) *
            IDLE_AMP *
            idleEnvelope;
          const idleY =
            Math.cos(state.time * 0.7 + config.phase + i * 0.4) *
            IDLE_AMP *
            idleEnvelope;

          // Natural harmonic deflection factor along the braided yarn
          let factor = 0;
          if (isBeingDragged && draggedIndex >= 1) {
            if (draggedIndex === n - 1) {
              factor = Math.sin((Math.PI * i) / (2 * (n - 1)));
            } else {
              factor =
                i < draggedIndex
                  ? Math.sin((Math.PI * i) / (2 * draggedIndex))
                  : Math.sin((Math.PI * (n - 1 - i)) / (2 * (n - 1 - draggedIndex)));
            }
          }

          const targetX = node.eqX + idleX + dragDelta.x * factor * 0.78;
          const targetY = node.eqY + idleY + dragDelta.y * factor * 0.78;

          if (isBeingDragged) {
            // Fluid water-like compliance: intermediate nodes experience hydrodynamic drag,
            // catenary flex, and a trailing ribbon wave ripple when moving the card or strand
            const tNorm = i / (n - 1);
            const wavePhase = state.time * 4.2 + (1 - tNorm) * 5.2;
            const dragDist = Math.hypot(dragDelta.x, dragDelta.y);
            const rippleAmp = Math.min(14, dragDist * 0.08) * Math.sin((Math.PI * i) / (n - 1));
            const rippleX = -Math.sin(wavePhase) * rippleAmp * (dragDelta.y !== 0 ? Math.sign(dragDelta.y) : 1) * 0.35;
            const rippleY = Math.cos(wavePhase) * rippleAmp * (dragDelta.x !== 0 ? Math.sign(dragDelta.x) : 1) * 0.35;

            const fluidTargetX = targetX + rippleX;
            const fluidTargetY = targetY + rippleY;

            // Fluid spring relaxation: tight near handle, soft compliant fold along mid-body
            const fluidTightness = 38 + tNorm * 36;
            const dx = fluidTargetX - node.x;
            const dy = fluidTargetY - node.y;
            node.vx += dx * fluidTightness * dt;
            node.vy += dy * fluidTightness * dt;
            const fluidDamp = Math.pow(0.80, dt * 60);
            node.vx *= fluidDamp;
            node.vy *= fluidDamp;
            node.x += node.vx * dt;
            node.y += node.vy * dt;
          } else {
            // Graceful damped harmonic spring recovery on release
            node.vx += (targetX - node.x) * SPRING_STIFFNESS * dt;
            node.vy += (targetY - node.y) * SPRING_STIFFNESS * dt;
            node.vx *= damping;
            node.vy *= damping;
            node.x += node.vx * dt;
            node.y += node.vy * dt;
          }
        }

        // Live geometry update for core, companion filaments, and hit path
        if (dom) {
          const corePoints = nodes.map((n) => [n.x, n.y] as [number, number]);
          const coreD = pointsToSvgPath(corePoints);
          if (dom.corePath) {
            dom.corePath.setAttribute("d", coreD);
            if (isBeingDragged && dom.corePath.style.strokeDasharray !== "none") {
              dom.corePath.style.strokeDasharray = "none";
              dom.corePath.style.strokeDashoffset = "0";
            }
          }
          if (dom.hitPath) dom.hitPath.setAttribute("d", coreD);
          if (dom.f2Path) {
            dom.f2Path.setAttribute(
              "d",
              pointsToSvgPath(offsetFilamentPoints(corePoints, config.phase, 2))
            );
            if (isBeingDragged && dom.f2Path.style.strokeDasharray !== "none") {
              dom.f2Path.style.strokeDasharray = "none";
              dom.f2Path.style.strokeDashoffset = "0";
            }
          }
          if (dom.f3Path) {
            dom.f3Path.setAttribute(
              "d",
              pointsToSvgPath(offsetFilamentPoints(corePoints, config.phase, 3))
            );
            if (isBeingDragged && dom.f3Path.style.strokeDasharray !== "none") {
              dom.f3Path.style.strokeDasharray = "none";
              dom.f3Path.style.strokeDashoffset = "0";
            }
          }

          // Eyelet and full gateway plaque share one endpoint transform per frame.
          const terminal = nodes[nodes.length - 1];
          if (dom.handleGroup) {
            dom.handleGroup.setAttribute(
              "transform",
              `translate(${terminal.x.toFixed(2)}, ${terminal.y.toFixed(2)})`
            );
          }
          if (dom.plaqueGroup) {
            const plaqueX = terminal.x + config.plaqueOffset[0];
            const plaqueY = terminal.y + config.plaqueOffset[1];
            dom.plaqueGroup.setAttribute(
              "transform",
              `translate(${plaqueX.toFixed(2)}, ${plaqueY.toFixed(2)})`
            );
          }
        }
      }

      if (shouldRun()) {
        animationFrameId = requestAnimationFrame(renderLoop);
      } else {
        animationFrameId = null;
      }
    };

    const startLoop = () => {
      if (animationFrameId === null && shouldRun()) {
        previousTimestamp = 0;
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    };

    wakeRenderLoopRef.current = startLoop;

    const updateLoopState = () => {
      if (shouldRun()) {
        startLoop();
      } else {
        stopLoop();
      }
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && containerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isIntersecting = entry.isIntersecting;
          updateLoopState();
        },
        { rootMargin: "150px 0px" }
      );
      observer.observe(containerRef.current);
    }

    const onVisibilityChange = () => {
      isDocumentVisible = typeof document !== "undefined" ? !document.hidden : true;
      updateLoopState();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    updateLoopState();

    return () => {
      stopLoop();
      wakeRenderLoopRef.current = null;
      observer?.disconnect();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, [prefersReducedMotion]);

  // Capture the pointer on the stable SVG root so a gateway can keep moving
  // underneath the pointer without losing the drag gesture.
  const beginDrag = (
    key: string,
    e: Pick<PointerEvent, "pointerId" | "clientX" | "clientY" | "timeStamp" | "preventDefault" | "stopPropagation">,
    dragType: "handle" | "strand",
    nodeIndex: number,
    preserveClickTarget = false
  ) => {
    if (!preserveClickTarget) {
      e.stopPropagation();
      e.preventDefault();
    }
    const state = physicsRef.current;
    const nodes = state.branches[key];
    const node = nodes?.[nodeIndex];
    if (!node) return;

    const svgCoords = getSvgCoordinates(e.clientX, e.clientY);
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      state.svgRect = {
        left: rect.left,
        top: rect.top,
        scaleX: 1200 / (rect.width || 1200),
        scaleY: 760 / (rect.height || 760),
      };
    } else {
      state.svgRect = null;
    }

    state.draggedKey = key;
    state.dragType = dragType;
    state.dragNodeIdx = nodeIndex;
    state.activePointerId = e.pointerId;
    state.pointerSvgCoords = svgCoords;
    state.pointerOriginClient = { x: e.clientX, y: e.clientY };
    state.lastPointerSvgCoords = svgCoords;
    state.lastPointerTime = e.timeStamp;
    state.pointerVelocity = { x: 0, y: 0 };
    state.dragMoved = false;
    state.pickupOffset = {
      x: svgCoords.x - node.x,
      y: svgCoords.y - node.y,
    };
    setDraggedBranchKey(key);
    wakeRenderLoopRef.current?.();

    // Immediately guarantee strokeDasharray is removed on the dragged branch
    // so extending the line never introduces empty dash gaps / disconnection.
    const dom = domRefs.current[key];
    if (dom) {
      if (dom.corePath) {
        dom.corePath.style.strokeDasharray = "none";
        dom.corePath.style.strokeDashoffset = "0";
      }
      if (dom.f2Path) {
        dom.f2Path.style.strokeDasharray = "none";
        dom.f2Path.style.strokeDashoffset = "0";
      }
      if (dom.f3Path) {
        dom.f3Path.style.strokeDasharray = "none";
        dom.f3Path.style.strokeDashoffset = "0";
      }
    }

    const interactionRoot = svgRef.current;
    if (interactionRoot) {
      interactionRoot.setAttribute("data-active-drag-branch", key);
      interactionRoot.setAttribute("data-pointer-move-count", "0");
    }
    // Do not retarget pointer capture to the SVG root: a stationary release
    // must still click the original gateway button. Stable window-capture
    // listeners continue receiving movement even after the pointer leaves it.
  };

  const handleHandlePointerDown = (key: string, e: React.PointerEvent) => {
    const nodes = physicsRef.current.branches[key];
    if (nodes?.length) beginDrag(key, e, "handle", nodes.length - 1);
  };

  const handleStrandPointerDown = (key: string, e: React.PointerEvent) => {
    const state = physicsRef.current;
    const nodes = state.branches[key];
    if (!nodes?.length) return;

    const svgCoords = getSvgCoordinates(e.clientX, e.clientY);
    let closestIndex = 1;
    let closestDistance = Infinity;
    for (let i = 1; i < nodes.length; i++) {
      const distance = Math.hypot(
        nodes[i].x - svgCoords.x,
        nodes[i].y - svgCoords.y
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }
    beginDrag(key, e, "strand", closestIndex);
  };

  const handlePointerMove = (e: Pick<PointerEvent, "pointerId" | "clientX" | "clientY" | "timeStamp">) => {
    const state = physicsRef.current;
    if (!state.draggedKey || state.activePointerId !== e.pointerId) return;

    const clientDistance = Math.hypot(
      e.clientX - state.pointerOriginClient.x,
      e.clientY - state.pointerOriginClient.y
    );
    if (clientDistance >= 5) state.dragMoved = true;

    const cached = state.svgRect;
    const nextCoords = cached
      ? {
          x: (e.clientX - cached.left) * cached.scaleX,
          y: (e.clientY - cached.top) * cached.scaleY,
        }
      : getSvgCoordinates(e.clientX, e.clientY);

    if (svgRef.current) {
      const moveCount = Number(svgRef.current.getAttribute("data-pointer-move-count") ?? "0") + 1;
      svgRef.current.setAttribute("data-pointer-move-count", String(moveCount));
    }
    const elapsed = (e.timeStamp - state.lastPointerTime) / 1000;
    if (elapsed > 0.001) {
      let vx = (nextCoords.x - state.lastPointerSvgCoords.x) / elapsed;
      let vy = (nextCoords.y - state.lastPointerSvgCoords.y) / elapsed;
      const speed = Math.hypot(vx, vy);
      const maxSpeed = 1200;
      if (speed > maxSpeed) {
        vx = (vx / speed) * maxSpeed;
        vy = (vy / speed) * maxSpeed;
      }
      state.pointerVelocity = { x: vx, y: vy };
      state.lastPointerSvgCoords = nextCoords;
      state.lastPointerTime = e.timeStamp;
    }
    state.pointerSvgCoords = nextCoords;
  };

  const handlePointerUp = (e: Pick<PointerEvent, "pointerId">) => {
    const state = physicsRef.current;
    if (!state.draggedKey || state.activePointerId !== e.pointerId) return;

    const nodes = state.branches[state.draggedKey];
    const draggedIndex = state.dragType === "handle"
      ? (nodes?.length ?? 1) - 1
      : state.dragNodeIdx;
    const draggedNode = nodes?.[draggedIndex];
    if (draggedNode) {
      draggedNode.vx = state.pointerVelocity.x * 0.32;
      draggedNode.vy = state.pointerVelocity.y * 0.32;
    }

    if (state.dragMoved) {
      suppressNextClickRef.current = true;
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 0);
    }

    state.draggedKey = null;
    state.dragType = null;
    state.dragNodeIdx = -1;
    state.activePointerId = null;
    state.dragMoved = false;
    state.svgRect = null;
    svgRef.current?.removeAttribute("data-active-drag-branch");
    setDraggedBranchKey(null);
    wakeRenderLoopRef.current?.();
  };

  // Keep one stable native listener for the entire mounted lifetime. React
  // rerenders during a drag must not tear down/reinstall pointer listeners.
  pointerEventHandlersRef.current.move = handlePointerMove;
  pointerEventHandlersRef.current.up = handlePointerUp;

  useEffect(() => {
    const onDown = (event: PointerEvent) => {
      // The gateway is HTML inside SVG foreignObject. Resolve it from the
      // native composed target path so a browser-specific React delegation
      // boundary cannot swallow pointerdown.
      const target = event.target;
      if (!(target instanceof Element)) return;
      const gateway = target.closest<HTMLButtonElement>('button[data-testid^="fork-branch-"]');
      if (!gateway) return;

      const testId = gateway.getAttribute("data-testid") ?? "";
      const key = testId === "fork-branch-centre"
        ? "home"
        : testId.replace("fork-branch-", "");
      const nodes = physicsRef.current.branches[key];
      if (!nodes?.length) return;

      // Do not cancel or stop this native event: stationary activation must
      // still produce the button's ordinary click. Movement is tracked on the
      // window and a real drag is suppressed at click time.
      beginDrag(key, event, "handle", nodes.length - 1, true);
    };
    const onMove = (event: PointerEvent) => pointerEventHandlersRef.current.move(event);
    const onUp = (event: PointerEvent) => pointerEventHandlersRef.current.up(event);

    const onBlur = () => {
      const state = physicsRef.current;
      if (state.activePointerId !== null) {
        pointerEventHandlersRef.current.up({ pointerId: state.activePointerId });
      }
    };

    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onUp, true);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onBlur);

    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onUp, true);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onBlur);
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectBranch = (key: string) => {
    if (isTransitioningRef.current) return;
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    const config = BRANCH_CONFIGS[key];
    if (!config) return;

    isTransitioningRef.current = true;
    setSelectedRoute(config.route);
    wakeRenderLoopRef.current?.();

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    const duration = prefersReducedMotion ? 50 : 450;
    transitionTimeoutRef.current = window.setTimeout(() => {
      transitionTimeoutRef.current = null;
      if (config.isCentre) {
        onSelectCentre();
      } else {
        onSelectFacet(config.id as FacetId, config.route);
      }
    }, duration);
  };

  // Pre-calculate line distribution using Pretext to prevent layout shifts
  const measuredTeasers = useMemo(() => {
    return Object.fromEntries(
      Object.entries(BRANCH_CONFIGS).map(([k, cfg]) => [
        k,
        measureTextFast(cfg.teaser, "10.5px Inter, system-ui, sans-serif", 195, 14),
      ])
    );
  }, []);

  return (
    <section
      id="terminal-fork"
      ref={containerRef}
      aria-label="Terminal Decision Fork — Seven Independent Continuations"
      className="fork-atmosphere relative min-h-screen px-4 sm:px-8 pt-0 pb-12 max-w-7xl mx-auto flex flex-col items-center text-[#F5F8FA] overflow-visible"
    >
      {/* Background Ambient Glow & Atmospheric Continuity (C-07 / C-08) */}
      <div
        data-testid="fork-ambient-atmosphere"
        className="absolute inset-0 pointer-events-none overflow-visible"
        aria-hidden="true"
      />

      {/* Editorial Header: Positioned Restrained Above the Centered Hero Diagram */}
      <div
        ref={titleRef}
        data-testid="fork-editorial-title"
        className="absolute z-20 top-4 left-5 sm:left-8 w-[min(18rem,38vw)] text-left pointer-events-none hidden md:block"
      >
        <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-serif text-[#F5F8FA] tracking-tight leading-tight">
          When the thread reaches the present, you choose the path.
        </h2>
      </div>

      {/* Hero Branch Canvas: Dominant, Centered across ~90% Desktop Width (1200 x 760) */}
      <div
        data-testid="fork-graph-desktop"
        className="relative z-10 w-full max-w-6xl mx-auto aspect-[1200/760] hidden md:block"
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1200 760"
          className="w-full h-full overflow-visible select-none touch-pan-y"
          preserveAspectRatio="xMidYMin meet"
          role="group"
          aria-label="Seven independent, draggable Yggdrasil paths"
        >
          <defs>
            {/* Optimized Filter for Active Glowing Selected Strand */}
            <filter id="activeStrandGlow" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* The terminal junction shares the parent timeline's page-space endpoint. */}
          <g className="pointer-events-none" data-testid="fork-root-anchor">
            <circle cx="600" cy="0" r="10" fill="#0D131C" stroke="#1595D0" strokeWidth="2.5" />
            <circle cx="600" cy="0" r="4" fill="#ED247A" />
          </g>

          {/* Seven Organic Branch Strands (Yggdrasil Fibre) */}
          {Object.entries(BRANCH_CONFIGS).map(([key, config]) => {
            const isSelected = selectedRoute === config.route;
            const isDissolved = selectedRoute !== null && !isSelected;
            const isHovered = hoveredBranch === key;
            const isDragged = draggedBranchKey === key;
            const terminalPt = config.points[config.points.length - 1];
            const initialPlaqueX = Number((terminalPt[0] + config.plaqueOffset[0]).toFixed(2));
            const initialPlaqueY = Number((terminalPt[1] + config.plaqueOffset[1]).toFixed(2));

            return (
              <g
                key={key}
                id={`branch-group-${key}`}
                ref={(el) => {
                  if (!domRefs.current[key]) domRefs.current[key] = {} as any;
                  domRefs.current[key].branchGroup = el;
                }}
                className="transition-opacity duration-500 ease-out"
                style={{
                  opacity: isDissolved ? 0.02 : isSelected ? 1 : 0.95,
                  pointerEvents: isDissolved ? "none" : "auto",
                }}
              >
                {/* Secondary Filament */}
                <path
                  data-testid={`branch-f2-${key}`}
                  ref={(el) => {
                    if (!domRefs.current[key]) domRefs.current[key] = {} as any;
                    domRefs.current[key].f2Path = el;
                  }}
                  d={pointsToSvgPath(offsetFilamentPoints(config.points, config.phase, 2))}
                  fill="none"
                  stroke={config.accent}
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                  strokeLinecap="round"
                  opacity={0}
                  className="pointer-events-none"
                />

                {/* Tertiary Filament */}
                <path
                  data-testid={`branch-f3-${key}`}
                  ref={(el) => {
                    if (!domRefs.current[key]) domRefs.current[key] = {} as any;
                    domRefs.current[key].f3Path = el;
                  }}
                  d={pointsToSvgPath(offsetFilamentPoints(config.points, config.phase, 3))}
                  fill="none"
                  stroke={config.accent}
                  strokeWidth="0.8"
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                  opacity={0}
                  className="pointer-events-none"
                />

                {/* Core Filament */}
                <path
                  ref={(el) => {
                    if (!domRefs.current[key]) domRefs.current[key] = {} as any;
                    domRefs.current[key].corePath = el;
                  }}
                  data-testid={`branch-core-${key}`}
                  d={pointsToSvgPath(config.points)}
                  fill="none"
                  stroke={config.accent}
                  strokeWidth={isSelected || isDragged ? "3.2" : isHovered ? "2.6" : "2.2"}
                  strokeLinecap="round"
                  opacity={0}
                  filter={isSelected || isHovered || isDragged ? "url(#activeStrandGlow)" : undefined}
                  className="pointer-events-none"
                />

                {/* Wide transparent hit-target for direct strand dragging */}
                <path
                  ref={(el) => {
                    if (!domRefs.current[key]) domRefs.current[key] = {} as any;
                    domRefs.current[key].hitPath = el;
                  }}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="28"
                  strokeLinecap="round"
                  className="pointer-events-auto cursor-grab active:cursor-grabbing touch-none"
                  onPointerDown={(e) => handleStrandPointerDown(key, e)}
                  onPointerEnter={() => setHoveredBranch(key)}
                  onPointerLeave={() => setHoveredBranch(null)}
                />

                {/* Integrated Endpoint Eyelet Drag Handle */}
                <g
                  ref={(el) => {
                    if (!domRefs.current[key]) domRefs.current[key] = {} as any;
                    domRefs.current[key].handleGroup = el;
                  }}
                  id={`handle-${key}`}
                  data-testid={`handle-${key}`}
                  className="pointer-events-auto cursor-grab active:cursor-grabbing touch-none"
                  opacity={prefersReducedMotion ? 1 : 0}
                  visibility={prefersReducedMotion ? "visible" : "hidden"}
                  transform={`translate(${terminalPt[0].toFixed(2)}, ${terminalPt[1].toFixed(2)})`}
                  onPointerDown={(e) => handleHandlePointerDown(key, e)}
                  onPointerEnter={() => setHoveredBranch(key)}
                  onPointerLeave={() => setHoveredBranch(null)}
                  aria-label={`Drag handle for ${config.name}`}
                >
                  <circle r="22" fill="transparent" className="cursor-grab active:cursor-grabbing touch-none" />
                  <circle
                    r={isSelected || isDragged ? "10" : isHovered ? "8.5" : "7"}
                    fill="#0D131C"
                    stroke={config.accent}
                    strokeWidth={isSelected || isDragged ? "3" : isHovered ? "2.6" : "2.2"}
                  />
                  <circle
                    r={isHovered || isDragged ? "3.5" : "2.8"}
                    fill={config.accent}
                  />
                </g>

                {/* Prominent Full-Name Plaque (Primary Navigation Destination & Focus Target) */}
                <g
                  ref={(el) => {
                    if (!domRefs.current[key]) domRefs.current[key] = {} as any;
                    domRefs.current[key].plaqueGroup = el;
                  }}
                  id={`endpoint-group-${key}`}
                  data-testid={`endpoint-group-${key}`}
                  className="pointer-events-auto cursor-pointer"
                  opacity={prefersReducedMotion ? 1 : 0}
                  visibility={prefersReducedMotion ? "visible" : "hidden"}
                  transform={`translate(${initialPlaqueX}, ${initialPlaqueY})`}
                >
                  <foreignObject
                    x="-160"
                    y="-53"
                    width="320"
                    height="106"
                    className="overflow-visible"
                  >
                    {(() => {
                      const IconComponent = BRANCH_ICONS[key] || Sparkles;
                      const teaserMetrics = measuredTeasers[key];

                      if (config.isCentre) {
                        return (
                          <button
                            type="button"
                            data-testid="fork-branch-centre"
                            onClick={() => handleSelectBranch(key)}
                            onPointerEnter={() => setHoveredBranch(key)}
                            onPointerLeave={() => setHoveredBranch(null)}
                            disabled={isDissolved || (isTransitioningRef.current && !isSelected)}
                            className={`group relative w-full h-full p-3.5 rounded-2xl flex items-center gap-3.5 backdrop-blur-md transition-all duration-300 touch-none select-none cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D131C] min-h-[48px] ${
                              isSelected
                                ? "bg-gradient-to-b from-[#0B2538] via-[#0D1824] to-[#0A0D14] border-2 border-[#1595D0] shadow-[0_0_48px_rgba(21,149,208,0.55),0_18px_40px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(245,248,250,0.30)] ring-2 ring-[#1595D0] scale-[1.03]"
                                : isHovered || isDragged
                                ? "bg-gradient-to-b from-[#091F30]/98 via-[#0A1420]/98 to-[#070A10]/98 border-2 border-[#1595D0] shadow-[0_0_36px_rgba(21,149,208,0.40),0_20px_45px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(245,248,250,0.25)] scale-[1.015]"
                                : "bg-gradient-to-b from-[#081826]/96 via-[#09101A]/97 to-[#080B12]/98 border-2 border-[#1595D0]/85 shadow-[0_0_24px_rgba(21,149,208,0.22),0_12px_32px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(245,248,250,0.18)] hover:border-[#1595D0]"
                            }`}
                          >
                            {/* Specular Top Edge Sheen */}
                            <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-[#F5F8FA]/35 to-transparent group-hover:via-[#1595D0]/60 transition-colors" />

                            {/* Inner 1px Filigree Frame */}
                            <div className="pointer-events-none absolute inset-1 rounded-xl border border-[#1595D0]/40 group-hover:border-[#1595D0]/70 transition-colors" />

                            {/* Architectural Art-Deco Corner Brackets */}
                            <div className="pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-[#1595D0]" />
                            <div className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[#1595D0]" />
                            <div className="pointer-events-none absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[#1595D0]" />
                            <div className="pointer-events-none absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-[#1595D0]" />

                            {/* Ambient blue radial backlight */}
                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_35%_40%,rgba(21,149,208,0.22),transparent_70%)] opacity-80 group-hover:opacity-100 transition-opacity" />

                            {/* Ceremonial Sunburst Compass Medallion */}
                            <div className="relative w-12 h-12 rounded-2xl border-2 border-[#1595D0] bg-gradient-to-br from-[#0B2538] via-[#0D1824] to-[#0A0D14] shadow-[0_0_18px_rgba(21,149,208,0.45),inset_0_1px_0_rgba(245,248,250,0.25)] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(21,149,208,0.65)] transition-all">
                              <Compass className="w-6 h-6 text-[#1595D0] stroke-[2.2] group-hover:rotate-45 transition-transform duration-500" />
                            </div>

                            {/* Card Text Hierarchy: Illuminated Beacon, Bold Serif Title, Editorial Teaser */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="w-2 h-2 rounded-full shrink-0 bg-[#1595D0] shadow-[0_0_8px_#1595D0] animate-pulse" />
                                <span className="block text-[9.5px] font-mono tracking-[0.22em] font-bold text-[#1595D0] uppercase truncate">
                                  ✦ CHAPTER NEXUS ✦
                                </span>
                              </div>
                              <span className="block text-[16px] font-serif font-bold text-[#F5F8FA] leading-tight truncate [text-wrap:balance] group-hover:text-white transition-colors">
                                Chapter Living Mosaic
                              </span>
                              <span
                                className="block text-[10.5px] font-sans text-[#F5F8FA]/80 leading-snug truncate [text-wrap:balance] mt-0.5"
                                style={teaserMetrics ? { minHeight: `${Math.min(28, teaserMetrics.height)}px` } : undefined}
                              >
                                {config.teaser}
                              </span>
                            </div>

                            {/* Engraved Directional Action Crest */}
                            <div className="w-8 h-8 rounded-full border border-[#1595D0]/80 bg-[#1595D0]/15 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(21,149,208,0.3)] group-hover:scale-110 group-hover:bg-[#1595D0]/30 transition-all">
                              <ArrowRight className="w-4 h-4 text-[#1595D0] stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        );
                      }

                      return (
                        <button
                          type="button"
                          data-testid={`fork-branch-${config.id}`}
                          onClick={() => handleSelectBranch(key)}
                          onPointerEnter={() => setHoveredBranch(key)}
                          onPointerLeave={() => setHoveredBranch(null)}
                          disabled={isDissolved || (isTransitioningRef.current && !isSelected)}
                          className={`group relative w-full h-full p-3.5 rounded-2xl flex items-center gap-3.5 backdrop-blur-md transition-all duration-300 touch-none select-none cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D131C] min-h-[48px] ${
                            isSelected
                              ? "bg-gradient-to-b from-[#182334] to-[#0D1420] border-2 scale-[1.02]"
                              : isHovered || isDragged
                              ? "bg-gradient-to-b from-[#152030]/98 via-[#0F1724]/98 to-[#080D15]/98 border scale-[1.01]"
                              : "bg-gradient-to-b from-[#121A27]/96 via-[#0C121D]/97 to-[#060910]/98 border border-[#26354D]/90 shadow-[0_12px_32px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(245,248,250,0.12)]"
                          }`}
                          style={{
                            borderColor: isSelected || isHovered || isDragged ? config.accent : undefined,
                            boxShadow: isSelected
                              ? `0 0 36px ${config.glowColor}, inset 0 1px 0 rgba(245,248,250,0.25)`
                              : isHovered || isDragged
                              ? `0 18px 44px rgba(0,0,0,0.9), 0 0 26px ${config.glowColor}, inset 0 1px 0 rgba(245,248,250,0.20)`
                              : undefined,
                            outlineColor: config.accent,
                          }}
                        >
                          {/* Specular Top Edge Sheen */}
                          <div
                            className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-[#F5F8FA]/20 to-transparent transition-colors"
                            style={{ borderTopColor: isHovered ? config.accent : undefined }}
                          />

                          {/* Inset Perimeter Hairline */}
                          <div
                            className="pointer-events-none absolute inset-1 rounded-xl border border-white/[0.04] transition-colors"
                            style={{ borderColor: isHovered ? `${config.accent}40` : undefined }}
                          />

                          {/* Architectural Art-Deco Corner Brackets */}
                          <div
                            className="pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t border-l transition-colors"
                            style={{ borderColor: isHovered ? config.accent : `${config.accent}55` }}
                          />
                          <div
                            className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t border-r transition-colors"
                            style={{ borderColor: isHovered ? config.accent : `${config.accent}55` }}
                          />
                          <div
                            className="pointer-events-none absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l transition-colors"
                            style={{ borderColor: isHovered ? config.accent : `${config.accent}55` }}
                          />
                          <div
                            className="pointer-events-none absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r transition-colors"
                            style={{ borderColor: isHovered ? config.accent : `${config.accent}55` }}
                          />

                          {/* Interactive subtle radial highlight */}
                          <div
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: `radial-gradient(ellipse at 30% 35%, ${config.accent}24, transparent 65%)`,
                            }}
                          />

                          {/* Frosted Architectural Glass Medallion */}
                          <div
                            className="relative w-12 h-12 rounded-2xl border bg-gradient-to-br from-[#141C29]/95 via-[#0A0F18]/95 to-[#05080E]/98 shadow-[inset_0_1px_0_rgba(245,248,250,0.18),0_4px_16px_rgba(0,0,0,0.6)] flex items-center justify-center shrink-0 transition-all"
                            style={{
                              borderColor: isHovered ? config.accent : `${config.accent}66`,
                              boxShadow: isHovered ? `0 0 18px ${config.glowColor}` : undefined,
                            }}
                          >
                            <IconComponent
                              className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                              style={{ color: config.accent }}
                              strokeWidth={2}
                            />
                          </div>

                          {/* Card Text Hierarchy: Illuminated Beacon, Bold Serif Title, Editorial Teaser */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                                style={{ backgroundColor: config.accent, color: config.accent }}
                              />
                              <span
                                className="block text-[9.5px] font-mono tracking-[0.2em] font-bold uppercase truncate"
                                style={{ color: config.accent }}
                              >
                                {config.category}
                              </span>
                            </div>
                            <span className="block text-[15px] font-serif font-bold text-[#F5F8FA] leading-tight truncate [text-wrap:balance] group-hover:text-white transition-colors">
                              {config.name}
                            </span>
                            <span
                              className="block text-[10.5px] font-sans text-[#F5F8FA]/70 leading-snug line-clamp-2 mt-0.5 group-hover:text-[#F5F8FA]/85 transition-colors"
                              style={teaserMetrics ? { minHeight: `${Math.min(28, teaserMetrics.height)}px` } : undefined}
                            >
                              {config.teaser}
                            </span>
                          </div>

                          {/* Navigation Indicator Arrow Crest */}
                          <div
                            className="w-7 h-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center shrink-0 transition-all"
                            style={{
                              borderColor: isHovered ? config.accent : undefined,
                              backgroundColor: isHovered ? `${config.accent}20` : undefined,
                            }}
                          >
                            <ArrowRight
                              className="w-3.5 h-3.5 transition-transform duration-200 stroke-[2]"
                              style={{
                                color: isHovered ? config.accent : "rgba(245,248,250,0.5)",
                                transform: isHovered ? "translateX(2px)" : undefined,
                              }}
                            />
                          </div>
                        </button>
                      );
                    })()}
                  </foreignObject>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Desktop Fanout Institutional Nexus Caption & Guidance Indicator */}
        <div className="hidden md:flex flex-col items-center justify-center mt-3 z-20 pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="w-16 h-px bg-gradient-to-r from-transparent to-[#1595D0]/40" />
            <span className="text-[10.5px] font-mono font-medium tracking-[0.2em] text-[#1595D0]/75 uppercase">
              The Thread Divides · Choose a Path or Drag an Eyelet
            </span>
            <span className="w-16 h-px bg-gradient-to-l from-transparent to-[#1595D0]/40" />
          </div>
        </div>
      </div>

      {/* Mobile branch continuation begins at the historical parent endpoint. */}
      <div className="md:hidden w-full max-w-md z-20 pointer-events-auto pt-0">
        <div
          ref={mobileForkRootRef}
          className="flex flex-col items-center mb-5 -mt-1.5"
          data-testid="mobile-fork-root"
          style={prefersReducedMotion ? { opacity: 1, visibility: "visible" } : { opacity: 0, visibility: "hidden" }}
        >
          <span className="w-3 h-3 rounded-full border-2 border-[#1595D0] bg-[#0D131C] shadow-[0_0_12px_rgba(21,149,208,0.55)]" />
          <span className="w-px h-8 bg-gradient-to-b from-[#1595D0] to-[#278F9B]" />
          <h2 className="text-center text-xl font-serif text-[#F5F8FA] leading-tight">
            When the thread reaches the present, you choose the path.
          </h2>
        </div>
      </div>

      {/* Mobile Stacked Fork View (< md), revealed by the shared fork progress. */}
      <div
        ref={mobileForkChoicesRef}
        data-testid="mobile-fork-choice-list"
        className="w-full max-w-md flex flex-col gap-3 md:hidden z-20 pointer-events-auto mt-0"
        style={prefersReducedMotion ? { opacity: 1, visibility: "visible" } : { opacity: 0, visibility: "hidden" }}
      >
        {Object.entries(BRANCH_CONFIGS).map(([key, config]) => {
          const isSelected = selectedRoute === config.route;
          const isDissolved = selectedRoute !== null && !isSelected;
          const IconComponent = BRANCH_ICONS[key] || Sparkles;

          if (config.isCentre) {
            return (
              <button
                key={`m-btn-${key}`}
                onClick={() => handleSelectBranch(key)}
                data-testid="mobile-fork-branch-centre"
                disabled={isDissolved || (isTransitioningRef.current && !isSelected)}
                className={`relative mt-2 flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D131C] ${
                  isSelected
                    ? "bg-gradient-to-b from-[#0B2538] to-[#0A0D14] border-2 border-[#1595D0] shadow-[0_0_36px_rgba(21,149,208,0.55),inset_0_1px_0_rgba(245,248,250,0.28)] ring-2 ring-[#1595D0]"
                    : "bg-gradient-to-b from-[#091F30]/96 via-[#0A1420]/96 to-[#070A10]/98 border-2 border-[#1595D0]/75 shadow-[0_8px_24px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(245,248,250,0.18)] hover:border-[#1595D0]"
                }`}
                style={{
                  opacity: isDissolved ? 0.05 : 1,
                  pointerEvents: isDissolved ? "none" : "auto",
                }}
              >
                {/* Specular Top Edge Sheen */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1595D0]/40 to-transparent" />

                {/* Inner Filigree Ring */}
                <div className="pointer-events-none absolute inset-1 rounded-xl border border-[#1595D0]/35" />

                {/* Corner accents */}
                <div className="pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-[#1595D0]" />
                <div className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[#1595D0]" />
                <div className="pointer-events-none absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[#1595D0]" />
                <div className="pointer-events-none absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-[#1595D0]" />

                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl border-2 border-[#1595D0] bg-gradient-to-br from-[#0B2538] to-[#0A0D14] flex items-center justify-center shrink-0 shadow-[0_0_14px_rgba(21,149,208,0.35),inset_0_1px_0_rgba(245,248,250,0.2)]">
                    <Compass className="w-6 h-6 text-[#1595D0] stroke-[2.2]" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full shrink-0 bg-[#1595D0] shadow-[0_0_8px_#1595D0] animate-pulse" />
                      <span className="block text-[10px] font-mono font-bold tracking-[0.2em] text-[#1595D0] uppercase">
                        ✦ CHAPTER NEXUS ✦
                      </span>
                    </div>
                    <span className="text-base font-serif font-bold text-[#F5F8FA] [text-wrap:balance]">
                      Chapter Living Mosaic
                    </span>
                    <span className="block text-[11px] font-sans text-[#F5F8FA]/75 mt-0.5">
                      {config.teaser}
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-[#1595D0]/80 bg-[#1595D0]/15 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(21,149,208,0.25)]">
                  <ArrowRight className="w-4 h-4 text-[#1595D0] stroke-[2.2]" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={`m-btn-${key}`}
              onClick={() => handleSelectBranch(key)}
              data-testid={`mobile-fork-branch-${config.id}`}
              disabled={isDissolved || (isTransitioningRef.current && !isSelected)}
              className={`relative flex items-center justify-between p-4 rounded-xl border backdrop-blur-md transition-all duration-300 min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1595D0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D131C] ${
                isSelected
                  ? "bg-gradient-to-b from-[#182334] to-[#0D1420] border-2 border-[#1595D0] shadow-[0_0_28px_rgba(21,149,208,0.5),inset_0_1px_0_rgba(245,248,250,0.2)] ring-2 ring-[#1595D0]"
                  : "bg-gradient-to-b from-[#121A27]/96 via-[#0C121D]/97 to-[#060910]/98 border border-[#26354D]/90 shadow-[0_8px_24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(245,248,250,0.1)] hover:border-[#1595D0]/70"
              }`}
              style={{
                opacity: isDissolved ? 0.05 : 1,
                pointerEvents: isDissolved ? "none" : "auto",
              }}
            >
              {/* Specular Top Edge Sheen */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F5F8FA]/15 to-transparent" />

              {/* Corner brackets */}
              <div className="pointer-events-none absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#1595D0]/35" />
              <div className="pointer-events-none absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#1595D0]/35" />
              <div className="pointer-events-none absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-[#1595D0]/35" />
              <div className="pointer-events-none absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[#1595D0]/35" />

              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-xl border border-[#1595D0]/40 bg-[#060A12]/85 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(245,248,250,0.15)]"
                  style={{ borderColor: `${config.accent}66` }}
                >
                  <IconComponent className="w-5 h-5" style={{ color: config.accent }} strokeWidth={2} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
                      style={{ backgroundColor: config.accent, color: config.accent }}
                    />
                    <span
                      className="block text-[9.5px] font-mono tracking-[0.18em] font-semibold uppercase"
                      style={{ color: config.accent }}
                    >
                      {config.category}
                    </span>
                  </div>
                  <span className="text-sm font-serif font-bold text-[#F5F8FA] [text-wrap:balance]">
                    {config.name}
                  </span>
                  <span className="block text-[10.5px] font-sans text-[#F5F8FA]/65 leading-snug mt-0.5">
                    {config.teaser}
                  </span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full border border-white/15 bg-white/5 flex items-center justify-center shrink-0">
                <ArrowRight className="w-3.5 h-3.5 text-[#F5F8FA]/60 stroke-[2]" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
