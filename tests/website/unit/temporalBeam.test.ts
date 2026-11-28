import { describe, expect, it, vi } from "vitest";
import { sampleTemporalParticles, sampleThreadBodySparkles } from "@/components/timeline/temporalBeam";
import type { SvgPathSampler } from "@/components/timeline/temporalBeam";

function createCurvedPathSampler(): SvgPathSampler {
  return {
    getTotalLength: vi.fn(() => 1000),
    getPointAtLength: vi.fn((distance: number) => ({
      x: 500 + 18 * Math.sin(distance / 170),
      y: 40 + distance,
    }) as DOMPoint),
  };
}

describe("sampleTemporalParticles", () => {
  it("returns a small, deterministic field distributed along the measured path", () => {
    const path = createCurvedPathSampler();

    const particles = sampleTemporalParticles(path, 24);

    expect(particles).toHaveLength(24);
    expect(particles[0].progress).toBeCloseTo(0.075);
    expect(particles[particles.length - 1]?.progress).toBeCloseTo(0.925);
    expect(particles.every((particle) =>
      particle.radius > 0 &&
      particle.opacity > 0 &&
      particle.opacity <= 1 &&
      particle.progress >= 0 &&
      particle.progress <= 1
    )).toBe(true);
    expect(new Set(particles.map((particle) => `${particle.x.toFixed(3)}:${particle.y.toFixed(3)}`)).size).toBe(24);
    expect(path.getTotalLength).toHaveBeenCalledTimes(1);
  });

  it("returns no particles for invalid geometry or a zero count", () => {
    const emptyPath = {
      getTotalLength: () => 0,
      getPointAtLength: () => ({ x: 0, y: 0 }) as DOMPoint,
    } as SvgPathSampler;

    expect(sampleTemporalParticles(emptyPath)).toEqual([]);
    expect(sampleTemporalParticles(createCurvedPathSampler(), 0)).toEqual([]);
  });

  it("caps requested particle counts to keep the effect bounded", () => {
    const particles = sampleTemporalParticles(createCurvedPathSampler(), 500);

    expect(particles).toHaveLength(64);
  });
});

describe("sampleThreadBodySparkles", () => {
  it("returns micro-sparkles distributed along the thread with colors and drift classes", () => {
    const path = createCurvedPathSampler();
    const sparkles = sampleThreadBodySparkles(path, 36);

    expect(sparkles).toHaveLength(36);
    expect(
      sparkles.every(
        (s) =>
          s.radius >= 1.0 &&
          s.opacity > 0 &&
          s.opacity <= 1 &&
          s.color.startsWith("#") &&
          s.driftClass.startsWith("thread-particle-drift-") &&
          s.duration > 0
      )
    ).toBe(true);
  });

  it("handles empty path or zero count gracefully", () => {
    const emptyPath = {
      getTotalLength: () => 0,
      getPointAtLength: () => ({ x: 0, y: 0 }) as DOMPoint,
    } as SvgPathSampler;

    expect(sampleThreadBodySparkles(emptyPath)).toEqual([]);
    expect(sampleThreadBodySparkles(createCurvedPathSampler(), 0)).toEqual([]);
  });
});
