import { describe, expect, it } from "vitest";
import { computeAmbientHueWeights } from "@/components/pages/TimelinePage";

describe("story-driven ambient hue pacing (Task 10.2)", () => {
  it("establishes Ocean Teal depth dominance at Genesis / Ada Lovelace (Beat 1: historyProgress = 0)", () => {
    const [orb1, orb2, orb3, orb4] = computeAmbientHueWeights(0.0, 0.0);
    expect(orb1).toBe(0.85);
    expect(orb2).toBe(0.20);
    expect(orb3).toBe(0.20);
    expect(orb4).toBe(0.20);
    expect(orb1).toBeGreaterThan(orb2);
    expect(orb1).toBeGreaterThan(orb3);
    expect(orb1).toBeGreaterThan(orb4);
  });

  it("peaks oceanic ACM-W Blue radiance during Apollo & computational foundations (Beat 2: historyProgress ~ 0.45)", () => {
    const [orb1, orb2, orb3, orb4] = computeAmbientHueWeights(0.45, 0.0);
    expect(orb2).toBe(0.85);
    expect(orb1).toBeLessThanOrEqual(0.20);
    expect(orb2).toBeGreaterThan(orb1);
    expect(orb2).toBeGreaterThan(orb3);
    expect(orb2).toBeGreaterThan(orb4);
  });

  it("peaks Dusty Rose radiance during distributed networks & AI (Beat 3: historyProgress ~ 0.78)", () => {
    const [orb1, orb2, orb3, orb4] = computeAmbientHueWeights(0.78, 0.0);
    expect(orb3).toBe(0.85);
    expect(orb3).toBeGreaterThan(orb1);
    expect(orb3).toBeGreaterThan(orb2);
    expect(orb3).toBeGreaterThan(orb4);
  });

  it("reaches maximum ACM-W Pink confluence bloom radiance at full fork expansion (Beat 4: forkProgress = 1.0)", () => {
    const [orb1, orb2, orb3, orb4] = computeAmbientHueWeights(1.0, 1.0);
    expect(orb4).toBe(0.95);
    expect(orb4).toBeGreaterThan(orb1);
    expect(orb4).toBeGreaterThan(orb2);
    expect(orb4).toBeGreaterThan(orb3);
    // Supportive backlighting remains harmonic
    expect(orb1).toBeGreaterThanOrEqual(0.35);
    expect(orb2).toBeGreaterThanOrEqual(0.50);
    expect(orb3).toBeGreaterThanOrEqual(0.45);
  });

  it("strictly bounds all ambient orb weights between 0.20 and 0.95 across any input progress", () => {
    const testSamples = [-0.5, 0, 0.1, 0.25, 0.33, 0.5, 0.65, 0.75, 0.88, 1.0, 1.5];
    for (const hp of testSamples) {
      for (const fp of [0.0, 0.1, 0.5, 0.9, 1.0]) {
        const weights = computeAmbientHueWeights(hp, fp);
        for (const w of weights) {
          expect(w).toBeGreaterThanOrEqual(0.20);
          expect(w).toBeLessThanOrEqual(0.95);
        }
      }
    }
  });
});
