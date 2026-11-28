export interface TemporalParticle {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  progress: number;
}

export interface ThreadBodySparkle {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  driftClass: string;
  duration: number;
  delay: number;
}

export type SvgPathSampler = Pick<
  SVGPathElement,
  "getTotalLength" | "getPointAtLength"
>;

/**
 * Samples a small, deterministic set of suspended flecks around the measured
 * SVG path. Call only after the path geometry is stable; cache the result and
 * drive visibility from the existing journey timeline.
 */
export function sampleTemporalParticles(
  path: SvgPathSampler,
  requestedCount = 24,
  totalLength = path.getTotalLength()
): TemporalParticle[] {
  const count = Math.min(64, Math.max(0, Math.floor(requestedCount)));

  if (!Number.isFinite(totalLength) || totalLength <= 0 || count === 0) {
    return [];
  }

  const edgeProgress = 0.075;
  const progressSpan = 0.85;
  const tangentStep = Math.min(18, Math.max(2, totalLength * 0.002));

  return Array.from({ length: count }, (_, id) => {
    const progress = count === 1
      ? 0.5
      : edgeProgress + (id / (count - 1)) * progressSpan;
    const distance = progress * totalLength;
    const point = path.getPointAtLength(distance);
    const before = path.getPointAtLength(Math.max(0, distance - tangentStep));
    const after = path.getPointAtLength(Math.min(totalLength, distance + tangentStep));

    const tangentX = after.x - before.x;
    const tangentY = after.y - before.y;
    const tangentLength = Math.hypot(tangentX, tangentY) || 1;
    const normalX = -tangentY / tangentLength;
    const normalY = tangentX / tangentLength;
    const tangentOffset = ((id % 3) - 1) * 2.5;
    const normalOffset = (7 + (id % 4) * 2.8) * (id % 2 === 0 ? 1 : -1);

    return {
      id,
      x: point.x + normalX * normalOffset + (tangentX / tangentLength) * tangentOffset,
      y: point.y + normalY * normalOffset + (tangentY / tangentLength) * tangentOffset,
      radius: 1.5 + (id % 5) * 0.28,
      opacity: 0.65 + (id % 4) * 0.08,
      progress,
    };
  });
}

/**
 * Samples a constellation of micro-sparkles dotted along the thread body.
 * These flecks remain clipped by the parent reveal mask, automatically appearing
 * as the thread grows and staying suspended with gentle organic animations.
 */
export function sampleThreadBodySparkles(
  path: SvgPathSampler,
  requestedCount = 36,
  totalLength = path.getTotalLength()
): ThreadBodySparkle[] {
  const count = Math.min(72, Math.max(0, Math.floor(requestedCount)));
  if (!Number.isFinite(totalLength) || totalLength <= 0 || count === 0) {
    return [];
  }

  const edgeProgress = 0.035;
  const progressSpan = 0.93;
  const tangentStep = Math.min(18, Math.max(2, totalLength * 0.002));
  // SSN ACM-W 6-Token Foundation System (Edition 01, Page 6)
  const colors = ["#F5F8FA", "#1595D0", "#ED247A", "#278F9B", "#C96C8E", "#F5F8FA"];
  const driftClasses = [
    "thread-particle-drift-1",
    "thread-particle-drift-2",
    "thread-particle-drift-3",
    "thread-particle-drift-4",
  ];

  return Array.from({ length: count }, (_, id) => {
    const progress = count === 1
      ? 0.5
      : edgeProgress + (id / (count - 1)) * progressSpan;
    const distance = progress * totalLength;
    const point = path.getPointAtLength(distance);
    const before = path.getPointAtLength(Math.max(0, distance - tangentStep));
    const after = path.getPointAtLength(Math.min(totalLength, distance + tangentStep));

    const tangentX = after.x - before.x;
    const tangentY = after.y - before.y;
    const tangentLength = Math.hypot(tangentX, tangentY) || 1;
    const normalX = -tangentY / tangentLength;
    const normalY = tangentX / tangentLength;
    const tangentOffset = ((id % 5) - 2) * 3.2;
    const normalOffset = (3.5 + (id % 6) * 1.5) * (id % 2 === 0 ? 1 : -1);

    return {
      id,
      x: point.x + normalX * normalOffset + (tangentX / tangentLength) * tangentOffset,
      y: point.y + normalY * normalOffset + (tangentY / tangentLength) * tangentOffset,
      radius: 1.1 + (id % 4) * 0.35,
      color: colors[id % colors.length],
      opacity: 0.55 + (id % 3) * 0.15,
      driftClass: driftClasses[id % driftClasses.length],
      duration: 2.2 + (id % 5) * 0.5,
      delay: (id % 7) * 0.35,
    };
  });
}
