import { describe, it, expect } from "vitest";
import { measureTextFast, extractFontSize } from "@/utils/pretextText";

describe("Pretext Text Measurement Engine", () => {
  it("extracts font sizes correctly", () => {
    expect(extractFontSize("16px Inter")).toBe(16);
    expect(extractFontSize("24.5px 'JetBrains Mono'")).toBe(24.5);
    expect(extractFontSize("Inter")).toBe(14);
  });

  it("measures multiline text without zero height", () => {
    const text = "Ada Lovelace wrote the first algorithm for Babbage's Analytical Engine in 1843.";
    const result = measureTextFast(text, "16px Inter", 200, 24);
    expect(result.height).toBeGreaterThan(0);
    expect(result.lineCount).toBeGreaterThan(1);
    expect(result.fits).toBe(true);
  });
});
