export type JourneyProgressSetter = (progress: number) => void;

export interface JourneyProgressMapPoint {
  /** Normalized native scroll progress within the history stage. */
  nativeProgress: number;
  /** Corresponding normalized progress in the historical story timeline. */
  timelineProgress: number;
}

export function mapJourneyProgress(
  nativeProgress: number,
  mapping: JourneyProgressMapPoint[] | null
): number {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(nativeProgress) ? nativeProgress : 0));
  if (!mapping?.length) return clamped;
  if (clamped <= mapping[0].nativeProgress) return mapping[0].timelineProgress;

  for (let index = 1; index < mapping.length; index += 1) {
    const previous = mapping[index - 1];
    const next = mapping[index];
    if (clamped <= next.nativeProgress) {
      const span = next.nativeProgress - previous.nativeProgress;
      if (span <= 0) return next.timelineProgress;
      const local = (clamped - previous.nativeProgress) / span;
      return previous.timelineProgress +
        (next.timelineProgress - previous.timelineProgress) * local;
    }
  }

  return mapping[mapping.length - 1].timelineProgress;
}

/**
 * Small visual follow window for the story timelines. Native document scrolling
 * remains immediate; only the rendered story progress eases toward its latest
 * native scroll position. Keep this short so reversals remain predictable.
 */
export const JOURNEY_SCROLL_RESPONSE_SECONDS = 0.16;
export const JOURNEY_SCROLL_RESPONSE_EASE = "power2.out" as const;

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
