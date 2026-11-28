export type JourneyProgressSetter = (progress: number, worldOffsetPx?: number) => void;

export interface JourneyProgressMapPoint {
  /** Normalized native scroll progress within the history stage. */
  nativeProgress: number;
  /** Corresponding normalized progress in the historical story timeline. */
  timelineProgress: number;
  /** Visual vertical world scroll offset inside the pinned stage viewport (CSS px). */
  worldOffsetPx?: number;
}

function findSegmentInterpolation(
  nativeProgress: number,
  mapping: JourneyProgressMapPoint[]
): { prev: JourneyProgressMapPoint; next: JourneyProgressMapPoint; local: number } {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(nativeProgress) ? nativeProgress : 0));
  if (clamped <= mapping[0].nativeProgress) {
    return { prev: mapping[0], next: mapping[0], local: 0 };
  }
  for (let index = 1; index < mapping.length; index += 1) {
    const prev = mapping[index - 1];
    const next = mapping[index];
    if (clamped <= next.nativeProgress) {
      const span = next.nativeProgress - prev.nativeProgress;
      return {
        prev,
        next,
        local: span <= 0 ? 1 : (clamped - prev.nativeProgress) / span,
      };
    }
  }
  const last = mapping[mapping.length - 1];
  return { prev: last, next: last, local: 0 };
}

export function mapJourneyProgress(
  nativeProgress: number,
  mapping: JourneyProgressMapPoint[] | null
): number {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(nativeProgress) ? nativeProgress : 0));
  if (!mapping?.length) return clamped;
  const { prev, next, local } = findSegmentInterpolation(clamped, mapping);
  return prev.timelineProgress + (next.timelineProgress - prev.timelineProgress) * local;
}

export function mapCameraWorldOffset(
  nativeProgress: number,
  mapping: JourneyProgressMapPoint[] | null,
  fallbackMaxOffsetPx = 0
): number {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(nativeProgress) ? nativeProgress : 0));
  if (!mapping?.length) return clamped * Math.max(0, fallbackMaxOffsetPx);
  const { prev, next, local } = findSegmentInterpolation(clamped, mapping);
  const a = prev.worldOffsetPx ?? 0;
  const b = next.worldOffsetPx ?? a;
  return a + (b - a) * local;
}

export interface CameraDwellStationInput {
  anchorWorldPx: number;
  anchorTimelineProgress: number;
}

function smoothStationCorners(
  rawPoints: JourneyProgressMapPoint[],
  pinKeepCount: number
): JourneyProgressMapPoint[] {
  if (rawPoints.length <= pinKeepCount + 1) return rawPoints;

  // Replace sharp piecewise corners after the opening hold with non-overlapping
  // quadratic Bezier fillets (r = 0.28 <= 0.5) so camera speed glides smoothly
  // into and out of each pioneer focus band while remaining strictly monotonic.
  const FILLET_FRAC = 0.28;
  const SUBSTEPS = 4;
  const smoothed: JourneyProgressMapPoint[] = [];

  for (let i = 0; i < pinKeepCount; i += 1) {
    smoothed.push(rawPoints[i]);
  }

  const lerpPoint = (
    a: JourneyProgressMapPoint,
    b: JourneyProgressMapPoint,
    t: number
  ): JourneyProgressMapPoint => ({
    nativeProgress: a.nativeProgress + (b.nativeProgress - a.nativeProgress) * t,
    timelineProgress: a.timelineProgress + (b.timelineProgress - a.timelineProgress) * t,
    worldOffsetPx:
      (a.worldOffsetPx ?? 0) + ((b.worldOffsetPx ?? 0) - (a.worldOffsetPx ?? 0)) * t,
  });

  for (let i = pinKeepCount; i < rawPoints.length - 1; i += 1) {
    const prev = rawPoints[i - 1];
    const corner = rawPoints[i];
    const next = rawPoints[i + 1];

    // Never pull back into the stationary opening convergence hold
    const inPull = i === pinKeepCount ? Math.min(0.18, FILLET_FRAC) : FILLET_FRAC;
    const p0 = lerpPoint(corner, prev, inPull);
    const p2 = lerpPoint(corner, next, FILLET_FRAC);

    for (let step = 0; step <= SUBSTEPS; step += 1) {
      const t = step / SUBSTEPS;
      const omt = 1 - t;
      smoothed.push({
        nativeProgress:
          omt * omt * p0.nativeProgress +
          2 * omt * t * corner.nativeProgress +
          t * t * p2.nativeProgress,
        timelineProgress:
          omt * omt * p0.timelineProgress +
          2 * omt * t * corner.timelineProgress +
          t * t * p2.timelineProgress,
        worldOffsetPx:
          omt * omt * (p0.worldOffsetPx ?? 0) +
          2 * omt * t * (corner.worldOffsetPx ?? 0) +
          t * t * (p2.worldOffsetPx ?? 0),
      });
    }
  }

  smoothed.push(rawPoints[rawPoints.length - 1]);
  return smoothed;
}

/**
 * Builds a single monotonic piecewise map pairing native scroll [0..1] to both
 * timeline progress and camera world offset. Keeps the opening emblem pinned at
 * y = 0 while stars converge, then smoothly decelerates into a calm slow-motion
 * focus glide across each pioneer showcase instead of hard-braking mid-scroll.
 */
export function buildCameraDwellMap(options: {
  worldScrollRangePx: number;
  targetCenterPx: number;
  trunkStartProgress: number;
  openingDwellFraction: number;
  stationDwellFraction: number;
  stationDriftPx?: number;
  stations: CameraDwellStationInput[];
}): JourneyProgressMapPoint[] {
  const {
    worldScrollRangePx,
    targetCenterPx,
    trunkStartProgress,
    openingDwellFraction,
    stationDwellFraction,
    stationDriftPx = 168,
    stations,
  } = options;
  const maxWorld = Math.max(1, worldScrollRangePx);
  const span = 1 - trunkStartProgress;

  const points: JourneyProgressMapPoint[] = [
    { nativeProgress: 0, timelineProgress: 0, worldOffsetPx: 0 },
  ];

  // Hold camera pinned at world y = 0 while stars converge into SSN ACM-W logo and spawn thread tip
  const openEndN = Math.max(0, Math.min(0.15, openingDwellFraction));
  const openEndTP = Math.min(0.95, trunkStartProgress + 0.008 * span);
  if (openEndN > 0) {
    points.push({ nativeProgress: openEndN, timelineProgress: openEndTP, worldOffsetPx: 0 });
  }
  const pinKeepCount = points.length;

  const arrivalWorlds = stations.map((s) =>
    Math.max(0, Math.min(maxWorld, s.anchorWorldPx - targetCenterPx))
  );

  const halfDrift = Math.max(12, stationDriftPx * 0.5);
  const stationBands: {
    startWorld: number;
    endWorld: number;
    arriveTP: number;
    leaveTP: number;
  }[] = [];

  let cursorWorld = 0;
  let cursorTP = openEndTP;
  for (let i = 0; i < stations.length; i += 1) {
    const w = Math.max(cursorWorld, arrivalWorlds[i]);
    const upperBoundWorld =
      i + 1 < arrivalWorlds.length ? Math.max(w, (w + arrivalWorlds[i + 1]) * 0.5) : maxWorld;
    const startWorld = Math.max(cursorWorld, w - halfDrift);
    const endWorld = Math.min(upperBoundWorld, Math.max(startWorld, w + halfDrift));

    const driftTP = Math.min(
      0.014 * span,
      Math.max(0.006 * span, ((endWorld - startWorld) / maxWorld) * span * 1.05)
    );
    const centerTP = Math.min(0.988, trunkStartProgress + stations[i].anchorTimelineProgress * span);
    const arriveTP = Math.max(cursorTP, Math.min(0.985, centerTP - driftTP * 0.5));
    const leaveTP = Math.min(0.994, Math.max(arriveTP, centerTP + driftTP * 0.5));

    stationBands.push({ startWorld, endWorld, arriveTP, leaveTP });
    cursorWorld = endWorld;
    cursorTP = leaveTP;
  }

  let totalLegWorld = 0;
  let walkWorld = 0;
  for (const band of stationBands) {
    totalLegWorld += Math.max(0, band.startWorld - walkWorld);
    walkWorld = band.endWorld;
  }
  totalLegWorld += Math.max(0, maxWorld - walkWorld);

  const totalFocusNative = stations.length * stationDwellFraction;
  const travelBudget = Math.max(0.1, 1 - openEndN - totalFocusNative);
  const safeTotalLegWorld = Math.max(1, totalLegWorld);

  let prevWorld = 0;
  let prevNative = openEndN;

  for (let i = 0; i < stationBands.length; i += 1) {
    const band = stationBands[i];
    const legFraction = (Math.max(0, band.startWorld - prevWorld) / safeTotalLegWorld) * travelBudget;
    const arriveNative = Math.min(0.98, prevNative + legFraction);
    const leaveNative = Math.min(0.992, arriveNative + stationDwellFraction);

    points.push({
      nativeProgress: arriveNative,
      timelineProgress: band.arriveTP,
      worldOffsetPx: band.startWorld,
    });
    points.push({
      nativeProgress: leaveNative,
      timelineProgress: band.leaveTP,
      worldOffsetPx: band.endWorld,
    });

    prevWorld = band.endWorld;
    prevNative = leaveNative;
  }

  points.push({ nativeProgress: 1, timelineProgress: 1, worldOffsetPx: maxWorld });
  return smoothStationCorners(points, pinKeepCount);
}

/**
 * Small visual follow window for the story timelines. Native document scrolling
 * remains immediate; only the rendered story progress eases toward its latest
 * native scroll position. Keep this short so reversals remain predictable.
 */
export const JOURNEY_SCROLL_RESPONSE_SECONDS = 0.2;
export const JOURNEY_SCROLL_RESPONSE_EASE = "power3.out" as const;

export interface JourneyProgressRegistry {
  history: JourneyProgressSetter | null;
  fork: JourneyProgressSetter | null;
  sync: (() => void) | null;
  historyMap: JourneyProgressMapPoint[] | null;
}

export interface JourneyStageLayout {
  /** Element top relative to the current viewport. */
  top: number;
  /** Rendered element height in CSS pixels. */
  height: number;
}

export interface JourneyScrollRanges {
  historyStart: number;
  historyEnd: number;
  forkStart: number;
  forkEnd: number;
}

/**
 * Maps the complete native document scroll range into two strictly contiguous
 * story stages. The historical thread completes exactly where the fork begins;
 * the fork completes exactly at the browser's real maximum scroll position.
 *
 * There are deliberately no "dead" scroll intervals between stages or after
 * the final strand finishes. Native document scroll is the only position/input
 * authority; GSAP timelines simply render the progress derived from it.
 */
export function calculateJourneyScrollRanges(
  history: JourneyStageLayout,
  _fork: JourneyStageLayout,
  viewportHeight: number,
  scrollY: number,
  maxScroll: number
): JourneyScrollRanges {
  const safeViewportHeight = Math.max(1, viewportHeight);
  const historyStart = history.top + scrollY;
  const historyEnd = Math.max(
    historyStart + 1,
    historyStart + history.height - safeViewportHeight
  );

  // The first scroll pixel after the history ends belongs to the fork.
  // The last available document scroll position completes the fork.
  const forkStart = historyEnd;
  const safeMaxScroll = Math.max(forkStart + 1, maxScroll);
  const forkEnd = safeMaxScroll;

  return { historyStart, historyEnd, forkStart, forkEnd };
}

export function clampJourneyProgress(value: number, start: number, end: number): number {
  if (!Number.isFinite(value) || end <= start) return value >= end ? 1 : 0;
  return Math.max(0, Math.min(1, (value - start) / (end - start)));
}
