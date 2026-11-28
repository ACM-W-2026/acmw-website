import { prepare, layout } from "@chenglou/pretext";

export interface TextMeasurement {
  height: number;
  lineCount: number;
  fits: boolean;
  actualWidth: number;
}

const preparedCache = new Map<string, ReturnType<typeof prepare>>();

function isCanvasSupported(): boolean {
  if (typeof OffscreenCanvas !== "undefined") return true;
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) return false;
  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    try {
      const c = document.createElement("canvas");
      return !!(c && c.getContext);
    } catch {
      return false;
    }
  }
  return false;
}

export function extractFontSize(font: string): number {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  return match ? parseFloat(match[1]) : 14;
}

export function measureTextFast(
  text: string,
  font: string,
  maxWidth: number,
  lineHeight: number
): TextMeasurement {
  if (!text || maxWidth <= 0 || lineHeight <= 0) {
    return { height: 0, lineCount: 0, fits: true, actualWidth: 0 };
  }

  if (isCanvasSupported()) {
    try {
      const cacheKey = `${font}:::${text}`;
      let prep = preparedCache.get(cacheKey);
      if (!prep) {
        prep = prepare(text, font);
        if (preparedCache.size > 300) {
          const firstKey = preparedCache.keys().next().value;
          if (firstKey) preparedCache.delete(firstKey);
        }
        preparedCache.set(cacheKey, prep);
      }

      const res = layout(prep, maxWidth, lineHeight);
      return {
        height: res.height,
        lineCount: res.lineCount,
        fits: true,
        actualWidth: Math.min(maxWidth, text.length * 8),
      };
    } catch {
      // Fallback
    }
  }

  // Arithmetic fallback
  const fontSize = extractFontSize(font);
  const approxCharWidth = fontSize * 0.55;
  const charsPerLine = Math.max(1, Math.floor(maxWidth / approxCharWidth));
  const estimatedLines = Math.max(1, Math.ceil(text.length / charsPerLine));

  return {
    height: estimatedLines * lineHeight,
    lineCount: estimatedLines,
    fits: true,
    actualWidth: Math.min(maxWidth, text.length * approxCharWidth),
  };
}
