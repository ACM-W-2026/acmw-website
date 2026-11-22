import { describe, expect, it } from "vitest";
import {
  calculateJourneyScrollRanges,
  clampJourneyProgress,
  JOURNEY_SCROLL_RESPONSE_SECONDS,
  JOURNEY_SCROLL_RESPONSE_EASE,
  mapJourneyProgress,
} from "@/state/journeyScroll";

describe("responsive history progress mapping", () => {
  const stops = [
    { nativeProgress: 0, timelineProgress: 0 },
    { nativeProgress: 0.09, timelineProgress: 0.1033 },
    { nativeProgress: 0.25, timelineProgress: 0.2443 },
    { nativeProgress: 0.42, timelineProgress: 0.3853 },
    { nativeProgress: 0.57, timelineProgress: 0.5263 },
    { nativeProgress: 0.72, timelineProgress: 0.6673 },
    { nativeProgress: 0.89, timelineProgress: 0.8082 },
    { nativeProgress: 1, timelineProgress: 1 },
  ];

  it("places every mapped milestone exactly at its native scroll arrival point", () => {
    for (const stop of stops) {
      expect(mapJourneyProgress(stop.nativeProgress, stops)).toBeCloseTo(
        stop.timelineProgress,
        8
      );
    }
  });

  it("interpolates continuously and monotonically between milestone arrivals", () => {
    const samples = Array.from({ length: 101 }, (_, index) =>
      mapJourneyProgress(index / 100, stops)
    );
    expect(samples[0]).toBe(0);
    expect(samples[samples.length - 1]).toBe(1);
    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index]).toBeGreaterThanOrEqual(samples[index - 1]);
    }
    expect(mapJourneyProgress(0.17, stops)).toBeGreaterThan(0.1033);
    expect(mapJourneyProgress(0.17, stops)).toBeLessThan(0.2443);
  });

  it("clamps endpoints and preserves linear progress when no responsive map is registered", () => {
    expect(mapJourneyProgress(-0.2, stops)).toBe(0);
    expect(mapJourneyProgress(1.2, stops)).toBe(1);
    expect(mapJourneyProgress(0.42, null)).toBe(0.42);
    expect(mapJourneyProgress(0.42, [])).toBe(0.42);
  });
});

describe("single master journey scroll ranges", () => {
  it("keeps the visual response short and non-overshooting while native scroll stays authoritative", () => {
    expect(JOURNEY_SCROLL_RESPONSE_SECONDS).toBe(0.16);
    expect(JOURNEY_SCROLL_RESPONSE_EASE).toBe("power2.out");
    expect(JOURNEY_SCROLL_RESPONSE_SECONDS).toBeGreaterThanOrEqual(0.12);
    expect(JOURNEY_SCROLL_RESPONSE_SECONDS).toBeLessThanOrEqual(0.2);
  });

  it("hands off directly from history to fork and finishes at native max scroll on desktop", () => {
    const ranges = calculateJourneyScrollRanges(
      { top: 0, height: 8000 },
      { top: 8000, height: 900 },
      900,
      0,
      8000
    );

    expect(ranges.historyStart).toBe(0);
    expect(ranges.historyEnd).toBe(7100);
    expect(ranges.forkStart).toBe(7100);
    expect(ranges.forkEnd).toBe(8000);
    expect(ranges.forkStart).toBe(ranges.historyEnd);
    expect(ranges.forkEnd).toBe(8000);
    expect(ranges.forkEnd - ranges.forkStart).toBe(900);
  });

  it("uses the entire remaining document scroll range on a short desktop viewport", () => {
    const ranges = calculateJourneyScrollRanges(
      { top: 0, height: 8000 },
      { top: 8000, height: 778 },
      415,
      0,
      8363
    );

    expect(ranges.historyEnd).toBe(7585);
    expect(ranges.forkStart).toBe(7585);
    expect(ranges.forkEnd).toBe(8363);
    expect(ranges.forkEnd - ranges.forkStart).toBe(778);
  });

  it("keeps the mobile handoff contiguous and completes at native max scroll", () => {
    const ranges = calculateJourneyScrollRanges(
      { top: 0, height: 7600 },
      { top: 7600, height: 844 },
      844,
      0,
      7600
    );

    expect(ranges.historyEnd).toBe(6756);
    expect(ranges.forkStart).toBe(6756);
    expect(ranges.forkEnd).toBe(7600);
    expect(ranges.forkEnd - ranges.forkStart).toBe(844);
  });

  it("re-bases document ranges correctly after the page is already scrolled", () => {
    const ranges = calculateJourneyScrollRanges(
      { top: -1200, height: 8000 },
      { top: 6800, height: 900 },
      900,
      1200,
      8000
    );

    expect(ranges.historyStart).toBe(0);
    expect(ranges.historyEnd).toBe(7100);
    expect(ranges.forkStart).toBe(7100);
    expect(ranges.forkEnd).toBe(8000);
  });

  it("clamps local progress without allowing history/fork overlap or gaps", () => {
    const ranges = calculateJourneyScrollRanges(
      { top: 0, height: 8000 },
      { top: 8000, height: 900 },
      900,
      0,
      8000
    );
    expect(ranges.forkStart).toBe(ranges.historyEnd);

    expect(clampJourneyProgress(-10, 0, 100)).toBe(0);
    expect(clampJourneyProgress(50, 0, 100)).toBe(0.5);
    expect(clampJourneyProgress(110, 0, 100)).toBe(1);
    expect(clampJourneyProgress(0, 5, 5)).toBe(0);
    expect(clampJourneyProgress(6, 5, 5)).toBe(1);
  });
});
