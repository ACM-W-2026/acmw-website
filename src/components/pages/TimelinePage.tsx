"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ThreadTimeline } from "../timeline/ThreadTimeline";
import { TerminalFork } from "../fork/TerminalFork";
import { LivingFluidAtmosphere } from "../atmosphere/LivingFluidAtmosphere";
import type { FacetId } from "../../data/facets";
import {
  calculateJourneyScrollRanges,
  clampJourneyProgress,
  mapJourneyProgress,
  mapCameraWorldOffset,
  JOURNEY_SCROLL_RESPONSE_SECONDS,
  JOURNEY_SCROLL_RESPONSE_EASE,
} from "../../state/journeyScroll";
import type { JourneyProgressRegistry } from "../../state/journeyScroll";

gsap.registerPlugin(ScrollTrigger);

export interface TimelinePageProps {
  onNavigateFacet?: (facetId: FacetId, route: string) => void;
  onNavigateHome?: () => void;
}

/**
 * Story-Driven Ambient Hue Pacing (Handbook Edition 01, Page 6)
 * Modulates the 4 ambient depth orbs across the story arc:
 * - Beat 1 (Ada Lovelace, 1843 / Genesis, historyProgress 0.0 -> 0.25): Ocean Teal & Soft Pearl depth pocket.
 * - Beat 2 (Apollo & Foundations, historyProgress 0.25 -> 0.65): Deep Oceanic ACM-W Blue (#1595D0) fluid radiance.
 * - Beat 3 (Distributed Networks & AI, historyProgress 0.65 -> 0.90): Dusty Rose (#C96C8E) human-centered warmth.
 * - Beat 4 (Terminal Fork Synthesis, historyProgress > 0.90 / forkProgress 0.0 -> 1.0): ACM-W Pink (#ED247A) confluence energy.
 */
export function computeAmbientHueWeights(
  historyProgress: number,
  forkProgress: number
): [number, number, number, number] {
  if (forkProgress > 0.02) {
    const fp = Math.min(1, Math.max(0, forkProgress));
    // Confluence bloom: orb4 peaks at 0.95, supported by harmonic ambient strands
    const o1 = 0.35 + 0.15 * (1 - fp);
    const o2 = 0.40 + 0.20 * fp;
    const o3 = 0.35 + 0.15 * fp;
    const o4 = 0.70 + 0.25 * fp;
    return [
      Number(o1.toFixed(3)),
      Number(o2.toFixed(3)),
      Number(o3.toFixed(3)),
      Number(o4.toFixed(3)),
    ];
  }

  const hp = Math.max(0, Math.min(1, historyProgress));
  // Beat 1: Genesis / Ada Lovelace (0.00 -> 0.25)
  const o1 = Math.max(0.20, Math.min(0.85, 0.85 - hp * 2.0));
  // Beat 2: Apollo & Computational Foundations (0.25 -> 0.65, peak ~0.45)
  const dist2 = Math.abs(hp - 0.45);
  const o2 = Math.max(0.20, Math.min(0.85, 0.85 - dist2 * 2.6));
  // Beat 3: Distributed Networks & AI (0.65 -> 0.90, peak ~0.78)
  const dist3 = Math.abs(hp - 0.78);
  const o3 = Math.max(0.20, Math.min(0.85, 0.85 - dist3 * 2.8));
  // Beat 4: Approaching the Fork Synthesis (> 0.70)
  const o4 = hp < 0.70 ? 0.20 : Math.min(0.85, 0.20 + (hp - 0.70) * 2.6);

  return [
    Number(o1.toFixed(3)),
    Number(o2.toFixed(3)),
    Number(o3.toFixed(3)),
    Number(o4.toFixed(3)),
  ];
}

/**
 * One native-scroll controller owns the whole visitor journey.
 *
 * Child components own their local GSAP animation details, but expose paused
 * timelines through JourneyProgressRegistry. This page maps document scroll to
 * a sequential history range followed by a viewport-aware seven-way fork range.
 * There is intentionally no second ScrollTrigger and no numeric scrub catch-up.
 */
const FACET_TRANSITION_COLORS: Record<string, string> = {
  about: "#1595D0",
  events: "#278F9B",
  projects: "#C96C8E",
  outreach: "#1595D0",
  team: "#278F9B",
  "join-us": "#ED247A",
  home: "#D4A35A",
};

export const TimelinePage: React.FC<TimelinePageProps> = ({
  onNavigateFacet,
  onNavigateHome,
}) => {
  const router = useRouter();
  const pageRef = useRef<HTMLElement>(null);
  const ambientLayerRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const orb4Ref = useRef<HTMLDivElement>(null);
  const progressRegistryRef = useRef<JourneyProgressRegistry>({
    history: null,
    fork: null,
    sync: null,
    historyMap: null,
  });
  const historyProgressRef = useRef<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [routeTransitionColor, setRouteTransitionColor] = useState<string | null>(null);

  const navigateWithThreadTransition = (color: string, navigateFn: () => void) => {
    if (prefersReducedMotion || typeof document === "undefined") {
      navigateFn();
      return;
    }
    setRouteTransitionColor(color);
    const docWithVT = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    if (typeof docWithVT.startViewTransition === "function") {
      docWithVT.startViewTransition(() => navigateFn());
      return;
    }
    window.setTimeout(navigateFn, 160);
  };

  const handleNavigateFacet = (facetId: FacetId, route: string) => {
    if (onNavigateFacet) {
      onNavigateFacet(facetId, route);
      return;
    }
    navigateWithThreadTransition(FACET_TRANSITION_COLORS[facetId] || "#1595D0", () => {
      router.push(route);
    });
  };

  const handleNavigateHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    navigateWithThreadTransition(FACET_TRANSITION_COLORS.home, () => {
      router.push("/home");
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
    }
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Pointer-responsive subtle ambient parallax (C-03)
  useEffect(() => {
    const ambientLayer = ambientLayerRef.current;
    if (!ambientLayer || prefersReducedMotion) return;

    const xTo = gsap.quickTo(ambientLayer, "x", {
      duration: 0.9,
      ease: "power2.out",
    });
    const yTo = gsap.quickTo(ambientLayer, "y", {
      duration: 0.9,
      ease: "power2.out",
    });

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      xTo(normX * 42);
      yTo(normY * 28);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const page = pageRef.current;
    const historyStage = document.getElementById("thread-timeline");
    const forkStage = document.getElementById("terminal-fork");
    if (!page || !historyStage || !forkStage || prefersReducedMotion) return;

    const initialScrollY = window.scrollY;
    // This proxy follows native document scroll with a short visual response.
    // It never writes to window.scrollY and is the single rendered position
    // used to derive both sequential story stages.
    const renderedScrollPosition = { value: initialScrollY };
    page.dataset.scrollResponseMs = String(JOURNEY_SCROLL_RESPONSE_SECONDS * 1000);
    const initialHistoryRect = historyStage.getBoundingClientRect();
    const initialForkRect = forkStage.getBoundingClientRect();
    let ranges = calculateJourneyScrollRanges(
      { top: initialHistoryRect.top, height: initialHistoryRect.height },
      { top: initialForkRect.top, height: initialForkRect.height },
      window.innerHeight,
      initialScrollY,
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    );
    let refreshFrame = 0;

    const measureRanges = (scrollY: number) => {
      const historyRect = historyStage.getBoundingClientRect();
      const forkRect = forkStage.getBoundingClientRect();
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      ranges = calculateJourneyScrollRanges(
        { top: historyRect.top, height: historyRect.height },
        { top: forkRect.top, height: forkRect.height },
        window.innerHeight,
        scrollY,
        maxScroll
      );
    };

    const applyProgress = (scrollY: number) => {
      const nativeHistoryProgress = clampJourneyProgress(
        scrollY,
        ranges.historyStart,
        ranges.historyEnd
      );
      const historyProgress = mapJourneyProgress(
        nativeHistoryProgress,
        progressRegistryRef.current.historyMap
      );
      const cameraOffsetPx = mapCameraWorldOffset(
        nativeHistoryProgress,
        progressRegistryRef.current.historyMap,
        Math.max(0, ranges.historyEnd - ranges.historyStart)
      );
      const forkProgress = clampJourneyProgress(
        scrollY,
        ranges.forkStart,
        ranges.forkEnd
      );

      progressRegistryRef.current.history?.(historyProgress, cameraOffsetPx);
      progressRegistryRef.current.fork?.(forkProgress);
      historyProgressRef.current = historyProgress;

      if (!prefersReducedMotion) {
        const atmoFade = Math.min(1, Math.max(0, (historyProgress - 0.004) / 0.045));
        if (ambientLayerRef.current) {
          ambientLayerRef.current.style.opacity = (0.4 * atmoFade).toFixed(3);
        }
        const [o1, o2, o3, o4] = computeAmbientHueWeights(historyProgress, forkProgress);
        if (orb1Ref.current) orb1Ref.current.style.opacity = String(o1);
        if (orb2Ref.current) orb2Ref.current.style.opacity = String(o2);
        if (orb3Ref.current) orb3Ref.current.style.opacity = String(o3);
        if (orb4Ref.current) orb4Ref.current.style.opacity = String(o4);
      } else if (ambientLayerRef.current) {
        ambientLayerRef.current.style.opacity = "0.4";
      }

      // Exposed only as lightweight telemetry for the browser acceptance suite.
      page.dataset.historyProgress = historyProgress.toFixed(4);
      page.dataset.forkProgress = forkProgress.toFixed(4);
      page.dataset.renderedScrollY = scrollY.toFixed(2);
    };

    applyProgress(initialScrollY);

    // On touch devices, direct tracking prevents sticky/draggy scroll latency,
    // while desktop viewports retain the smooth visual easing tail.
    const isTouchOrMobile =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(hover: none)").matches ||
        window.innerWidth < 1024);
    const scrollResponseDuration = isTouchOrMobile
      ? 0.02
      : 0.28;

    // quickTo reuses one tween while scroll updates retarget it. A smooth desktop
    // glide absorbs discrete mouse-wheel jumps while fast programmatic/End-Home jumps
    // catch up crisply without lagging behind native scroll.
    const easeStoryProgressToScroll = gsap.quickTo(
      renderedScrollPosition,
      "value",
      {
        duration: scrollResponseDuration,
        ease: isTouchOrMobile ? JOURNEY_SCROLL_RESPONSE_EASE : "power2.out",
        onUpdate: () => applyProgress(renderedScrollPosition.value),
      }
    );

    const targetRenderedScroll = (targetY: number) => {
      if (!isTouchOrMobile && easeStoryProgressToScroll.tween) {
        const delta = Math.abs(targetY - renderedScrollPosition.value);
        const nextDuration =
          delta > 2400
            ? 0.12
            : delta > 220
              ? Math.min(0.68, Math.max(scrollResponseDuration, delta / 1450))
              : scrollResponseDuration;
        easeStoryProgressToScroll.tween.duration(nextDuration);
      }
      easeStoryProgressToScroll(targetY);
    };

    const syncCurrentPosition = () => {
      const scrollY = window.scrollY;
      measureRanges(scrollY);
      if (Math.abs(renderedScrollPosition.value - scrollY) < 0.5) {
        applyProgress(scrollY);
      } else {
        targetRenderedScroll(scrollY);
      }
    };

    const masterTrigger = ScrollTrigger.create({
      id: "acmw-master-journey",
      trigger: page,
      start: "top top",
      // Use the browser's real document scroll range as the trigger end.
      end: () => "+=" + Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      ),
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        page.dataset.masterTriggerEnd = String(self.end);
        page.dataset.documentMaxScroll = String(
          Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
        );
        const scrollY = self.scroll();
        measureRanges(scrollY);
        if (Math.abs(renderedScrollPosition.value - scrollY) < 0.5) {
          applyProgress(scrollY);
        } else {
          targetRenderedScroll(scrollY);
        }
      },
      onUpdate: (self) => {
        targetRenderedScroll(self.scroll());
      },
    });
    page.dataset.masterTriggerEnd = String(masterTrigger.end);
    page.dataset.documentMaxScroll = String(
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    );

    progressRegistryRef.current.sync = syncCurrentPosition;
    syncCurrentPosition();

    // Stage heights are responsive. Re-measure their document ranges whenever
    // typography, viewport width or responsive composition changes.
    const resizeObserver = new ResizeObserver(() => {
      if (refreshFrame) return;
      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = 0;
        ScrollTrigger.refresh();
      });
    });
    resizeObserver.observe(page);
    resizeObserver.observe(historyStage);
    resizeObserver.observe(forkStage);
    // The total document range can change independently of the individual
    // stage boxes (font swaps, root/body sizing). Keep the master end aligned.
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      if (refreshFrame) window.cancelAnimationFrame(refreshFrame);
      if (progressRegistryRef.current.sync === syncCurrentPosition) {
        progressRegistryRef.current.sync = null;
      }
      easeStoryProgressToScroll.tween.kill();
      masterTrigger.kill();
    };
  }, [prefersReducedMotion]);

  const handleSkipToFork = () => {
    const historyStage = document.getElementById("thread-timeline");
    const forkStage = document.getElementById("terminal-fork");
    if (!historyStage || !forkStage) return;

    const scrollY = window.scrollY;
    const historyRect = historyStage.getBoundingClientRect();
    const forkRect = forkStage.getBoundingClientRect();
    const ranges = calculateJourneyScrollRanges(
      { top: historyRect.top, height: historyRect.height },
      { top: forkRect.top, height: forkRect.height },
      window.innerHeight,
      scrollY,
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    );

    window.scrollTo({
      top: ranges.forkStart,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <main
      id="main-content"
      ref={pageRef}
      data-testid="journey-page"
      data-history-progress="0"
      data-fork-progress="0"
      className="relative w-full text-[#F5F8FA] min-h-screen"
      style={{
        background:
          "linear-gradient(in oklab, #04070C 0%, #060B12 20%, #080E18 50%, #0B131D 80%, #060A10 100%)",
      }}
    >
      {/* Zero-Bundle Archival SVG Film Grain Overlay (Eliminates Banding & Imparts Tactile Materiality) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[1] opacity-[0.032] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Unified Full-Page Living Atmosphere (C-01, C-03, C-07, C-08) */}
      <div
        data-testid="timeline-living-atmosphere"
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      >
        {/* Dynamic Fluid Air Pockets Physics Simulation (Collision, Coalescence, Mitosis Budding) */}
        <LivingFluidAtmosphere
          prefersReducedMotion={prefersReducedMotion}
          historyProgressRef={historyProgressRef}
        />

        {/* Ambient Depth Orbs Layer (starts pure void black at scrollY = 0, fades in on scroll) */}
        <div
          ref={ambientLayerRef}
          className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
          style={{
            opacity: prefersReducedMotion ? 0.4 : 0,
            willChange: "transform",
            transform: "translate3d(0,0,0)",
          }}
        >
          {/* Orb 1: Upper-Right Ocean Teal / Early Era Depth Pocket */}
          <div
            ref={orb1Ref}
            id="ambient-orb-1"
            data-testid="ambient-orb-1"
            className="absolute -top-[12%] right-[2%] w-[380px] h-[380px] sm:w-[720px] sm:h-[720px] pointer-events-none transition-opacity duration-700 ease-out"
            style={{
              opacity: prefersReducedMotion ? 0.4 : 0.85,
              willChange: "transform, opacity",
            }}
          >
            <div
              className="acmw-air-pocket-1 w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(39,143,155,0.24) 0%, rgba(21,149,208,0.08) 45%, transparent 70%)",
                willChange: "transform",
                contain: "layout style paint",
              }}
            />
          </div>

          {/* Orb 2: Mid-Left ACM-W Blue / Oceanic Fluid */}
          <div
            ref={orb2Ref}
            id="ambient-orb-2"
            data-testid="ambient-orb-2"
            className="absolute top-[28%] -left-[12%] w-[420px] h-[420px] sm:w-[840px] sm:h-[840px] pointer-events-none transition-opacity duration-700 ease-out"
            style={{
              opacity: prefersReducedMotion ? 0.4 : 0.2,
              willChange: "transform, opacity",
            }}
          >
            <div
              className="acmw-air-pocket-2 w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(21,149,208,0.28) 0%, rgba(21,149,208,0.08) 45%, transparent 72%)",
                willChange: "transform",
                contain: "layout style paint",
              }}
            />
          </div>

          {/* Orb 3: Mid-Right Dusty Rose / Human-Centered Warmth */}
          <div
            ref={orb3Ref}
            id="ambient-orb-3"
            data-testid="ambient-orb-3"
            className="absolute top-[52%] -right-[10%] w-[400px] h-[400px] sm:w-[780px] sm:h-[780px] pointer-events-none transition-opacity duration-700 ease-out"
            style={{
              opacity: prefersReducedMotion ? 0.4 : 0.2,
              willChange: "transform, opacity",
            }}
          >
            <div
              className="acmw-air-pocket-3 w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(201,108,142,0.22) 0%, rgba(201,108,142,0.06) 48%, transparent 70%)",
                willChange: "transform",
                contain: "layout style paint",
              }}
            />
          </div>

          {/* Orb 4: Lower Center-Left ACM-W Pink / Terminal Confluence Bloom */}
          <div
            ref={orb4Ref}
            id="ambient-orb-4"
            data-testid="ambient-orb-4"
            className="absolute bottom-[8%] left-[18%] w-[440px] h-[440px] sm:w-[880px] sm:h-[880px] pointer-events-none transition-opacity duration-700 ease-out"
            style={{
              opacity: prefersReducedMotion ? 0.4 : 0.2,
              willChange: "transform, opacity",
            }}
          >
            <div
              className="acmw-air-pocket-4 w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(237,36,122,0.24) 0%, rgba(245,248,250,0.08) 40%, transparent 68%)",
                willChange: "transform",
                contain: "layout style paint",
              }}
            />
          </div>
        {/* Subtle Organic Shimmer Sweep inside ambientLayerRef so opening void remains pure */}
          <div
            className="acmw-atmosphere-sweep absolute inset-0 opacity-60 pointer-events-none"
            style={{
              background:
                "linear-gradient(118deg, transparent 20%, rgba(39,143,155,0.035) 42%, rgba(201,108,142,0.025) 58%, transparent 75%)",
            }}
          />
        </div>
      </div>

      {/* Both visual stages share one page-level native-scroll progress controller. */}
      <ThreadTimeline
        journeyProgressRef={progressRegistryRef}
        historyProgressRef={historyProgressRef}
        onSkipToFork={handleSkipToFork}
        onSkipToHome={handleNavigateHome}
      />

      <TerminalFork
        journeyProgressRef={progressRegistryRef}
        onSelectFacet={handleNavigateFacet}
        onSelectCentre={handleNavigateHome}
      />

      {/* Chromatic Thread Portal Veil during Terminal Fork -> Facet route transitions */}
      {routeTransitionColor && (
        <div
          aria-hidden="true"
          data-testid="thread-portal-transition-veil"
          className="acmw-thread-portal-veil fixed inset-0 z-50 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${routeTransitionColor}38 0%, #04070C 72%)`,
          }}
        />
      )}
    </main>
  );
};
