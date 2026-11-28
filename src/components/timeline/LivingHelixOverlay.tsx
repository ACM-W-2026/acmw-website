"use client";

import React, { useEffect, useRef } from "react";

export interface CenterlineSample {
  progress: number;
  x: number;
  y: number;
}

export interface MilestoneColorStop {
  id: string;
  anchorProgress: number;
  anchorY: number;
  color: string;
}

export interface LivingHelixOverlayProps {
  stageRef: React.RefObject<HTMLDivElement | null>;
  historyProgressRef: React.MutableRefObject<number>;
  cameraWorldOffsetRef?: React.MutableRefObject<number>;
  centerlineSamples: CenterlineSample[];
  milestoneStops: MilestoneColorStop[];
  viewBoxWidth: number;
  responsiveScaleY?: number;
  prefersReducedMotion: boolean;
}

interface OriginMote {
  angle: number;
  radius: number;
  size: number;
  isGold: boolean;
  alpha: number;
  speed: number;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RgbColor {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function lerpRgb(a: RgbColor, b: RgbColor, t: number): RgbColor {
  const k = Math.min(1, Math.max(0, t));
  return {
    r: Math.round(a.r + (b.r - a.r) * k),
    g: Math.round(a.g + (b.g - a.g) * k),
    b: Math.round(a.b + (b.b - a.b) * k),
  };
}

function rgbString(c: RgbColor, alpha: number): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha.toFixed(3)})`;
}

const GOLD_RGB: RgbColor = { r: 255, g: 215, b: 0 };
const BLUE_RGB: RgbColor = { r: 21, g: 149, b: 208 };

/**
 * Viewport-scoped 2D Canvas overlay porting the LivingThreadAwakening prototype:
 * - Celestial motes converging into the vector ACM-W emblem at timeline origin
 * - Continuously rotating, depth-cued dual-strand helix with streaming pulses
 * - Smooth per-pioneer chromatic interpolation synchronized to historyProgressRef
 */
export const LivingHelixOverlay: React.FC<LivingHelixOverlayProps> = ({
  stageRef,
  historyProgressRef,
  cameraWorldOffsetRef,
  centerlineSamples,
  milestoneStops,
  viewBoxWidth,
  responsiveScaleY,
  prefersReducedMotion,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motesRef = useRef<OriginMote[]>([]);

  // Initialize deterministic wide deep-space origin motes once
  if (motesRef.current.length === 0) {
    const motes: OriginMote[] = [];
    for (let i = 0; i < 90; i += 1) {
      const goldenRatioAngle = i * 2.39996323;
      const dist = 48 + ((i * 53) % 240);
      motes.push({
        angle: goldenRatioAngle,
        radius: dist,
        size: 0.9 + ((i * 13) % 10) * 0.16,
        isGold: i % 2 === 0,
        alpha: 0.35 + ((i * 19) % 10) * 0.055,
        speed: 0.25 + ((i * 7) % 10) * 0.05,
      });
    }
    motesRef.current = motes;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    const stageEl = stageRef.current;
    if (!canvas || !wrapper || !stageEl || centerlineSamples.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parsedStops = milestoneStops.map((s) => ({
      ...s,
      rgb: hexToRgb(s.color),
    }));

    let animId = 0;
    let isVisible = true;
    let isTabVisible = !document.hidden;
    let stageTopDocPx = 0;
    let stageWidthPx = wrapper.clientWidth || 1000;
    let viewportH = window.innerHeight || 900;
    const startTime = performance.now();

    const measureLayout = () => {
      const rect = stageEl.getBoundingClientRect();
      stageTopDocPx = rect.top + window.scrollY;
      stageWidthPx = Math.max(1, wrapper.clientWidth || rect.width || 1000);
      viewportH = Math.max(1, window.innerHeight || 900);
    };

    measureLayout();

    const resizeObs =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measureLayout())
        : null;
    resizeObs?.observe(stageEl);
    resizeObs?.observe(wrapper);

    const resolveActiveColor = (progress: number): RgbColor => {
      if (parsedStops.length === 0) return BLUE_RGB;
      if (progress <= parsedStops[0].anchorProgress) return parsedStops[0].rgb;
      for (let i = 1; i < parsedStops.length; i += 1) {
        const prev = parsedStops[i - 1];
        const next = parsedStops[i];
        if (progress <= next.anchorProgress) {
          const span = Math.max(0.0001, next.anchorProgress - prev.anchorProgress);
          return lerpRgb(prev.rgb, next.rgb, (progress - prev.anchorProgress) / span);
        }
      }
      return parsedStops[parsedStops.length - 1].rgb;
    };

    const sampleCenterlineAtProgress = (progress: number): { x: number; y: number } => {
      if (progress <= centerlineSamples[0].progress) return centerlineSamples[0];
      const last = centerlineSamples[centerlineSamples.length - 1];
      if (progress >= last.progress) return last;

      let low = 0;
      let high = centerlineSamples.length - 1;
      while (high - low > 1) {
        const mid = (low + high) >> 1;
        if (centerlineSamples[mid].progress < progress) low = mid;
        else high = mid;
      }
      const a = centerlineSamples[low];
      const b = centerlineSamples[high];
      const span = Math.max(0.0001, b.progress - a.progress);
      const t = (progress - a.progress) / span;
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
      };
    };

    const sampleCenterlineXAtSvgY = (targetY: number): number => {
      if (targetY <= centerlineSamples[0].y) return centerlineSamples[0].x;
      const last = centerlineSamples[centerlineSamples.length - 1];
      if (targetY >= last.y) return last.x;

      let low = 0;
      let high = centerlineSamples.length - 1;
      while (high - low > 1) {
        const mid = (low + high) >> 1;
        if (centerlineSamples[mid].y < targetY) low = mid;
        else high = mid;
      }
      const a = centerlineSamples[low];
      const b = centerlineSamples[high];
      const span = Math.max(0.0001, b.y - a.y);
      const t = (targetY - a.y) / span;
      return a.x + (b.x - a.x) * t;
    };

    const drawFrame = (now: number) => {
      const w = stageWidthPx;
      const h = viewportH;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const targetCw = Math.round(w * dpr);
      const targetCh = Math.round(h * dpr);
      if (canvas.width !== targetCw || canvas.height !== targetCh) {
        canvas.width = targetCw;
        canvas.height = targetCh;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const progress = prefersReducedMotion
        ? 1
        : Math.min(1, Math.max(0, historyProgressRef.current));
      const elapsedSec = prefersReducedMotion ? 0 : (now - startTime) * 0.001;
      const scrollOffsetInStage =
        !prefersReducedMotion && cameraWorldOffsetRef
          ? cameraWorldOffsetRef.current
          : window.scrollY - stageTopDocPx;

      // Match SVG preserveAspectRatio="xMidYMin meet" on desktop or stretched on responsive
      const scaleX = w / viewBoxWidth;
      const scaleY = responsiveScaleY ?? scaleX;
      const originSvg = centerlineSamples[0];
      const originScreenX = originSvg.x * scaleX;
      const originScreenY = originSvg.y * scaleY - scrollOffsetInStage;

      // -------------------------------------------------------------------
      // 1. Stars Implode -> Birth Radiant SSN ACM-W Emblem
      // 0.002 -> 0.032: Stars spiral inward into a bright focal core (logo hidden).
      // 0.028 -> 0.044: Birth flare & glowing vector SSN ACM-W diamond emerges
      //                 as if forged from the converged starlight.
      // 0.048+: Dual-strand helical thread ignites downward from logo apex.
      // -------------------------------------------------------------------
      const emblemFade = prefersReducedMotion
        ? 0.92
        : Math.max(0, Math.min(1, 1 - (progress - 0.064) / 0.032));

      // Lock emblem strictly above the trunk origin (M 500 350) in world space so its
      // bottom apex meets originScreenY directly and the thread never cuts through it.
      const emblemDrawY = originScreenY - 64;

      if (emblemFade > 0.01 && emblemDrawY > -220 && emblemDrawY < h + 220) {
        const convergence = prefersReducedMotion
          ? 1
          : Math.min(1, Math.max(0, (progress - 0.002) / 0.030));
        // Stars accelerate inward to a tight birth singularity rather than stopping in a wide ring
        const tighten = Math.pow(1 - convergence, 1.35);
        // Logo remains completely hidden until stars nearly finish converging (convergence >= 0.87)
        const birthProgress = prefersReducedMotion
          ? 1
          : Math.min(1, Math.max(0, (progress - 0.028) / 0.015));
        const emblemAlpha = birthProgress * emblemFade;
        const birthFlare = prefersReducedMotion
          ? 0
          : Math.sin(Math.min(1, Math.max(0, (progress - 0.028) / 0.024)) * Math.PI);

        // Motes flare brighter near core convergence, then dissolve cleanly once logo is forged
        const moteDissipate = prefersReducedMotion
          ? 0
          : Math.max(0, Math.min(1, (progress - 0.036) / 0.016));

        ctx.save();
        for (const mote of motesRef.current) {
          const orbitAngle =
            mote.angle +
            elapsedSec * mote.speed * (1 + convergence * 1.4) +
            convergence * 1.65;
          const dist = mote.radius * tighten * 0.96;
          const mx = originScreenX + Math.cos(orbitAngle) * dist * 1.18;
          const my = emblemDrawY + Math.sin(orbitAngle) * dist * 0.78;
          const moteAlpha =
            mote.alpha *
            (0.65 + convergence * 0.5) *
            (1 - moteDissipate) *
            emblemFade;
          if (moteAlpha > 0.02) {
            ctx.beginPath();
            ctx.arc(mx, my, mote.size * (1 + convergence * 0.35), 0, Math.PI * 2);
            ctx.fillStyle = rgbString(mote.isGold ? GOLD_RGB : BLUE_RGB, Math.min(1, moteAlpha));
            ctx.fill();
          }
        }

        // Converging stellar ignition core right as stars coalesce before/during logo birth
        if (!prefersReducedMotion && convergence > 0.45 && emblemFade > 0.05) {
          const coreStrength =
            Math.min(1, (convergence - 0.45) / 0.55) * (1 - moteDissipate * 0.45) * emblemFade;
          const coreGrad = ctx.createRadialGradient(
            originScreenX,
            emblemDrawY,
            2,
            originScreenX,
            emblemDrawY,
            34 + birthFlare * 46
          );
          coreGrad.addColorStop(0, `rgba(255, 250, 220, ${(0.85 * coreStrength).toFixed(3)})`);
          coreGrad.addColorStop(0.35, `rgba(56, 189, 248, ${(0.48 * coreStrength).toFixed(3)})`);
          coreGrad.addColorStop(0.7, `rgba(237, 36, 122, ${(0.24 * coreStrength).toFixed(3)})`);
          coreGrad.addColorStop(1, "rgba(4, 7, 12, 0)");
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(originScreenX, emblemDrawY, 34 + birthFlare * 46, 0, Math.PI * 2);
          ctx.fill();
        }

        if (emblemAlpha > 0.02) {
          ctx.translate(originScreenX, emblemDrawY);
          const auraRadius = 112 + birthFlare * 38;
          const halo = ctx.createRadialGradient(0, 0, 8, 0, 0, auraRadius);
          halo.addColorStop(0, `rgba(255, 244, 214, ${((0.28 + birthFlare * 0.34) * emblemAlpha).toFixed(3)})`);
          halo.addColorStop(0.35, `rgba(21, 149, 208, ${((0.42 + birthFlare * 0.25) * emblemAlpha).toFixed(3)})`);
          halo.addColorStop(0.68, `rgba(237, 36, 122, ${((0.22 + birthFlare * 0.16) * emblemAlpha).toFixed(3)})`);
          halo.addColorStop(1, "rgba(4, 7, 12, 0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
          ctx.fill();

          const emblemScale = 1.18 + birthProgress * 0.28 + birthFlare * 0.08;
          ctx.scale(emblemScale, emblemScale);
          ctx.globalAlpha = emblemAlpha;

          // Upper ACM Blue (#1595D0) V-Frame Chevron with radiant glow
          ctx.save();
          ctx.shadowBlur = 22 + birthFlare * 16;
          ctx.shadowColor = "rgba(56, 189, 248, 0.95)";
          ctx.strokeStyle = "#1595D0";
          ctx.lineWidth = 3.6;
          ctx.lineJoin = "miter";
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-31, -4);
          ctx.lineTo(0, -35);
          ctx.lineTo(31, -4);
          ctx.stroke();

          // Luminous star-forged rim highlight along upper chevron
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(224, 242, 254, ${(0.58 + birthFlare * 0.32).toFixed(2)})`;
          ctx.lineWidth = 1.15;
          ctx.stroke();
          ctx.restore();

          // Lower ACM-W Pink (#ED247A) Diamond Ribs + Stylized Interlocking "W"
          ctx.save();
          ctx.shadowBlur = 22 + birthFlare * 16;
          ctx.shadowColor = "rgba(237, 36, 122, 0.92)";
          ctx.strokeStyle = "#ED247A";
          ctx.lineWidth = 3.6;
          ctx.lineJoin = "miter";
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(-31, 4);
          ctx.lineTo(-11, 24);
          ctx.lineTo(-4, 16);
          ctx.lineTo(4, 24);
          ctx.lineTo(31, 4);
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(252, 231, 243, ${(0.5 + birthFlare * 0.3).toFixed(2)})`;
          ctx.lineWidth = 1.05;
          ctx.stroke();
          ctx.restore();

          // Inner Crossed "W" Arms
          ctx.save();
          ctx.shadowBlur = 14 + birthFlare * 12;
          ctx.shadowColor = "rgba(237, 36, 122, 0.85)";
          ctx.strokeStyle = "#ED247A";
          ctx.lineCap = "round";
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.moveTo(-10, 7);
          ctx.lineTo(-2, 17);
          ctx.moveTo(10, 7);
          ctx.lineTo(2, 17);
          ctx.stroke();
          ctx.restore();

          // Bottom Blue Apex Point (spawns the golden-blue thread below)
          ctx.save();
          ctx.shadowBlur = 18 + birthFlare * 14;
          ctx.shadowColor = "rgba(56, 189, 248, 0.95)";
          ctx.fillStyle = "#38BDF8";
          ctx.beginPath();
          ctx.moveTo(-9, 27);
          ctx.lineTo(0, 38);
          ctx.lineTo(9, 27);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Crisp Center Wordmark with radiant text halo
          ctx.save();
          ctx.font = "700 9.5px ui-sans-serif, system-ui, sans-serif";
          ctx.lineWidth = 2.6;
          ctx.strokeStyle = "rgba(4, 7, 12, 0.9)";
          ctx.textAlign = "center";
          ctx.strokeText("SSN ACM-W", 0, -1);
          ctx.shadowBlur = 12 + birthFlare * 10;
          ctx.shadowColor = "rgba(245, 248, 250, 0.75)";
          ctx.fillStyle = "#F5F8FA";
          ctx.fillText("SSN ACM-W", 0, -1);
          ctx.restore();
        }
        ctx.restore();
      }

      // -------------------------------------------------------------------
      // 2. Rotating Dual-Strand Helical Thread (Viewport Slice Only)
      // Spawns ONLY after progress > 0.048 (after stars converge & birth logo)
      // -------------------------------------------------------------------
      const threadStartProgress = 0.048;
      const threadProgress = prefersReducedMotion
        ? 1
        : Math.max(0, (progress - threadStartProgress) / (1 - threadStartProgress));
      if (threadProgress > 0.002) {
        const sparkSvg = sampleCenterlineAtProgress(threadProgress);
        const sparkScreenY = sparkSvg.y * scaleY - scrollOffsetInStage;
        const visibleTopScreenY = Math.max(originScreenY, -36);
        const visibleBottomScreenY = Math.min(sparkScreenY, h + 36);

        if (visibleBottomScreenY > visibleTopScreenY + 4) {
          const activeRgb = resolveActiveColor(threadProgress);
          const warpRgb = lerpRgb(GOLD_RGB, activeRgb, 0.22);
          const amplitudePx = Math.min(17.5, 16.5 * scaleX);
          const freq = 0.033;
          const rotationPhase = prefersReducedMotion ? 0 : elapsedSec * 2.55;
          const pulsePhase = prefersReducedMotion ? 0 : elapsedSec * 4.4;
          const stepPx = 4;

          const warpPts: { x: number; y: number; depth: number; pulse: number }[] = [];
          const weftPts: { x: number; y: number; depth: number; pulse: number }[] = [];

          for (let sy = visibleTopScreenY; sy <= visibleBottomScreenY; sy += stepPx) {
            const worldYpx = sy + scrollOffsetInStage;
            const svgY = worldYpx / scaleY;
            const centerX = sampleCenterlineXAtSvgY(svgY) * scaleX;

            const distFromOrigin = Math.max(0, sy - originScreenY);
            const distFromTip = Math.max(0, sparkScreenY - sy);
            const originTaper = Math.sin(Math.min(1, distFromOrigin / 42) * Math.PI * 0.5);
            const tipTaper = Math.sin(Math.min(1, distFromTip / 55) * Math.PI * 0.5);

            // Pinch cleanly through every milestone anchor node
            let anchorTaper = 1;
            for (const stop of parsedStops) {
              const distA = Math.abs(svgY - stop.anchorY);
              if (distA < 36) {
                anchorTaper = Math.min(
                  anchorTaper,
                  Math.sin((distA / 36) * Math.PI * 0.5)
                );
              }
            }

            const phase = svgY * freq - rotationPhase;
            const offset = Math.sin(phase) * amplitudePx * originTaper * tipTaper * anchorTaper;
            const depth = Math.cos(phase); // [-1..1] continuous front/back 3D cue
            const pulse = (Math.sin(svgY * 0.036 - pulsePhase) + 1) * 0.5;

            warpPts.push({ x: centerX + offset, y: sy, depth, pulse });
            weftPts.push({ x: centerX - offset, y: sy, depth: -depth, pulse: 1 - pulse * 0.3 });
          }

          if (warpPts.length >= 2) {
            const sparkX = sparkSvg.x * scaleX;
            warpPts.push({ x: sparkX, y: sparkScreenY, depth: 1, pulse: 1 });
            weftPts.push({ x: sparkX, y: sparkScreenY, depth: 1, pulse: 1 });

            const drawContinuousHelix = (
              pts: { x: number; y: number; depth: number; pulse: number }[],
              rgb: RgbColor
            ) => {
              ctx.lineCap = "round";
              ctx.lineJoin = "round";

              // 1. Soft volumetric sheath along entire spiral curve
              ctx.beginPath();
              ctx.moveTo(pts[0].x, pts[0].y);
              for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
              ctx.strokeStyle = rgbString(rgb, 0.16);
              ctx.lineWidth = 10;
              ctx.stroke();

              // 2. Continuous back-plane base curve (zero gaps across phase crossings)
              ctx.strokeStyle = rgbString(rgb, 0.44);
              ctx.lineWidth = 2.0;
              ctx.stroke();

              // 3. Bright front-facing 3D weave crests drawn smoothly over spine
              ctx.beginPath();
              for (let i = 1; i < pts.length; i += 1) {
                if (pts[i - 1].depth > -0.08 && pts[i].depth > -0.08) {
                  ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
                  ctx.lineTo(pts[i].x, pts[i].y);
                }
              }
              ctx.strokeStyle = rgbString(rgb, 0.96);
              ctx.lineWidth = 2.8;
              ctx.stroke();

              // 4. Streaming pearl-white light pulses riding the front crests
              if (!prefersReducedMotion) {
                ctx.beginPath();
                for (let i = 1; i < pts.length; i += 1) {
                  if (pts[i - 1].pulse > 0.64 && pts[i - 1].depth > 0.12) {
                    ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
                    ctx.lineTo(pts[i].x, pts[i].y);
                  }
                }
                ctx.strokeStyle = "rgba(245, 248, 250, 0.72)";
                ctx.lineWidth = 2.5;
                ctx.stroke();
              }
            };

            drawContinuousHelix(warpPts, warpRgb);
            drawContinuousHelix(weftPts, activeRgb);
          }
        }
      }

      if (!prefersReducedMotion && isVisible && isTabVisible) {
        animId = requestAnimationFrame(drawFrame);
      } else {
        animId = 0;
      }
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                isVisible = entry.isIntersecting;
                if (isVisible && isTabVisible && !prefersReducedMotion && !animId) {
                  animId = requestAnimationFrame(drawFrame);
                }
              }
            },
            { threshold: 0 }
          )
        : null;
    observer?.observe(stageEl);

    const handleVisibility = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && isVisible && !prefersReducedMotion && !animId) {
        animId = requestAnimationFrame(drawFrame);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Draw initial frame immediately and start animation loop if active
    drawFrame(performance.now());
    if (!prefersReducedMotion && isVisible && isTabVisible && !animId) {
      animId = requestAnimationFrame(drawFrame);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      observer?.disconnect();
      resizeObs?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [
    stageRef,
    historyProgressRef,
    cameraWorldOffsetRef,
    centerlineSamples,
    milestoneStops,
    viewBoxWidth,
    responsiveScaleY,
    prefersReducedMotion,
  ]);

  return (
    <div
      ref={wrapperRef}
      data-testid="living-helix-overlay"
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-[19]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none">
        <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
      </div>
    </div>
  );
};
