"use client";
import React, { useEffect, useRef } from "react";

interface PaletteColor {
  r: number;
  g: number;
  b: number;
  alpha: number;
  name: string;
}

const APPROVED_PALETTES: PaletteColor[] = [
  { r: 21, g: 149, b: 208, alpha: 0.18, name: "ACM-W Blue" },
  { r: 39, g: 143, b: 155, alpha: 0.16, name: "Ocean Teal" },
  { r: 201, g: 108, b: 142, alpha: 0.16, name: "Dusty Rose" },
  { r: 237, g: 36, b: 122, alpha: 0.14, name: "ACM-W Pink" },
  { r: 245, g: 248, b: 250, alpha: 0.12, name: "Soft Pearl" },
];

interface AirPocket {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  baseAlpha: number;
  mass: number;
  pulsePhase: number;
  pulseSpeed: number;
  mergeCooldown: number;
  coalescenceTimer: number;
  partnerId: number | null;
  scaleX: number;
  scaleY: number;
  rotation: number;
  burstFlash: number;
  opacityFactor: number;
  age: number;
  state: "emerging" | "floating" | "dissolving";
}

interface FluidFleck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
}

interface CelestialMote {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  driftRange: number;
  r: number;
  g: number;
  b: number;
}

interface LivingFluidAtmosphereProps {
  prefersReducedMotion?: boolean;
}

/**
 * LivingFluidAtmosphere
 *
 * Implements organic fluid physics of buoyant air pockets suspended in deep water.
 * Features:
 * - Soft volumetric bioluminescent air pockets & ethereal Gaussian light auras
 * - Smooth radial luminous confluence blooms upon contact (zero polygon cuts or fan blades)
 * - Fluid drift, buoyancy, and laminar harmonic water currents
 * - Soft elastic collision deformation & surface tension coalescence (merging)
 * - Archival luminous fusion flash & radial wake bursts
 * - Continuous deep-water genesis (upwelling cycle) & gentle boundary dissolution
 * - Viscous wake flecks shedding into slipstreams
 * - Floating celestial micro-dust motes with Brownian drift and pointer repulsion
 * - Zero-allocation 60fps Canvas 2D composite with offscreen tab suspension
 */
export const LivingFluidAtmosphere: React.FC<LivingFluidAtmosphereProps> = ({
  prefersReducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerPosRef = useRef<{ x: number; y: number; vx: number; vy: number; active: boolean }>({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const SCALE = 0.8;
    let width = (canvas.width = Math.round(window.innerWidth * SCALE));
    let height = (canvas.height = Math.round(window.innerHeight * SCALE));
    let animFrame = 0;
    let nextId = 1;
    let isTabVisible = !document.hidden;

    const isMobile = window.innerWidth < 640;
    const baseRadiusRange = isMobile ? { min: 70, max: 140 } : { min: 140, max: 250 };
    const maxPockets = isMobile ? 6 : 8;
    const minPockets = isMobile ? 4 : 5;
    const maxFlecks = 32;

    // Wake fleck pool
    const flecks: FluidFleck[] = [];

    // Celestial micro-dust motes for ethereal background depth
    const celestialMotes: CelestialMote[] = [];
    const moteCount = isMobile ? 36 : 64;
    for (let i = 0; i < moteCount; i++) {
      const pal = APPROVED_PALETTES[i % APPROVED_PALETTES.length];
      celestialMotes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.8 + Math.random() * 1.4,
        baseAlpha: 0.12 + Math.random() * 0.24,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        driftRange: 15 + Math.random() * 25,
        r: pal.r,
        g: pal.g,
        b: pal.b,
      });
    }

    const spawnFleck = (
      x: number,
      y: number,
      vx: number,
      vy: number,
      r: number,
      g: number,
      b: number,
      radius: number,
      maxLife: number,
      maxAlpha: number
    ) => {
      if (flecks.length >= maxFlecks) {
        flecks.shift(); // Recycle oldest fleck
      }
      flecks.push({
        x,
        y,
        vx,
        vy,
        radius,
        maxAlpha,
        life: 0,
        maxLife,
        r,
        g,
        b,
      });
    };

    // Initialize canonical balanced air pockets
    const initialConfigs = [
      { x: width * 0.82, y: height * 0.15, palette: APPROVED_PALETTES[0], radius: baseRadiusRange.max * 0.95 },
      { x: width * 0.14, y: height * 0.35, palette: APPROVED_PALETTES[1], radius: baseRadiusRange.max * 1.05 },
      { x: width * 0.88, y: height * 0.65, palette: APPROVED_PALETTES[2], radius: baseRadiusRange.max * 0.98 },
      { x: width * 0.28, y: height * 0.85, palette: APPROVED_PALETTES[4], radius: baseRadiusRange.max * 1.10 },
      { x: width * 0.55, y: height * 0.45, palette: APPROVED_PALETTES[3], radius: baseRadiusRange.min * 1.25 },
    ];

    const pockets: AirPocket[] = initialConfigs.map((cfg) => {
      const radius = Math.min(cfg.radius, width * 0.45);
      return {
        id: nextId++,
        x: cfg.x,
        y: cfg.y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius,
        targetRadius: radius,
        r: cfg.palette.r,
        g: cfg.palette.g,
        b: cfg.palette.b,
        alpha: cfg.palette.alpha,
        baseAlpha: cfg.palette.alpha,
        mass: (radius * radius) / 1000,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.0012 + Math.random() * 0.0008,
        mergeCooldown: 2.5,
        coalescenceTimer: 0,
        partnerId: null,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        burstFlash: 0,
        opacityFactor: 1,
        age: 0,
        state: "floating",
      };
    });

    // Resize handler
    const handleResize = () => {
      width = canvas.width = Math.round(window.innerWidth * SCALE);
      height = canvas.height = Math.round(window.innerHeight * SCALE);
    };
    window.addEventListener("resize", handleResize);

    // Pointer tracking for fluid wake disturbance
    let lastPointerX = -1000;
    let lastPointerY = -1000;
    let lastPointerTime = performance.now();

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // Touch relies on smooth native scroll
      const now = performance.now();
      const dt = Math.max(0.001, (now - lastPointerTime) / 1000);
      const vx = (e.clientX - lastPointerX) / dt;
      const vy = (e.clientY - lastPointerY) / dt;

      pointerPosRef.current = {
        x: e.clientX * SCALE,
        y: e.clientY * SCALE,
        vx: Math.max(-200, Math.min(200, (vx * SCALE) * 0.04)),
        vy: Math.max(-200, Math.min(200, (vy * SCALE) * 0.04)),
        active: true,
      };
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerTime = now;
    };

    const handlePointerLeave = () => {
      pointerPosRef.current.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    // Scroll burst tracker: dampens heavy O(N^2) pairwise collisions during active scroll bursts
    let lastScrollTime = 0;
    const handleScroll = () => {
      lastScrollTime = performance.now();
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Visibility change handler (pauses RAF loop when tab is hidden)
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !prefersReducedMotion) {
        lastTime = performance.now();
        animFrame = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Reduced motion static render
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";
      celestialMotes.forEach((m) => {
        ctx.fillStyle = `rgba(${m.r}, ${m.g}, ${m.b}, ${m.baseAlpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      pockets.forEach((p) => {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha})`);
        grad.addColorStop(0.26, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha * 0.68})`);
        grad.addColorStop(0.56, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha * 0.26})`);
        grad.addColorStop(0.82, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha * 0.06})`);
        grad.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("mouseleave", handlePointerLeave);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }

    let lastTime = performance.now();
    let genesisTimer = 0;

    /**
     * Soft Ethereal Luminous Confluence Bloom
     * Renders a soft radial glowing light bridge when two buoyant fluid pockets touch or overlap.
     * Completely eliminates hard vector polygon edges, straight line cuts, and fan blades.
     */
    const renderLuminousConfluence = (
      pA: AirPocket,
      pB: AirPocket,
      currentRA: number,
      currentRB: number
    ) => {
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      const d = Math.hypot(dx, dy);
      const contactDist = currentRA + currentRB;
      if (d > contactDist || d < 2) return;

      const overlap = Math.max(0, Math.min(1, 1 - d / contactDist));
      const midX = (pA.x + pB.x) * 0.5;
      const midY = (pA.y + pB.y) * 0.5;
      const bridgeRadius = Math.max(12, Math.min(currentRA, currentRB) * (0.65 + overlap * 0.45));

      const blendR = Math.round((pA.r + pB.r) * 0.5);
      const blendG = Math.round((pA.g + pB.g) * 0.5);
      const blendB = Math.round((pA.b + pB.b) * 0.5);
      const peakAlpha = Math.min(
        0.26,
        ((pA.alpha * pA.opacityFactor + pB.alpha * pB.opacityFactor) * 0.5) * (overlap * 0.85)
      );

      const grad = ctx.createRadialGradient(midX, midY, 0, midX, midY, bridgeRadius);
      grad.addColorStop(0, `rgba(${blendR}, ${blendG}, ${blendB}, ${peakAlpha})`);
      grad.addColorStop(0.35, `rgba(${blendR}, ${blendG}, ${blendB}, ${peakAlpha * 0.55})`);
      grad.addColorStop(0.70, `rgba(${blendR}, ${blendG}, ${blendB}, ${peakAlpha * 0.15})`);
      grad.addColorStop(1, `rgba(${blendR}, ${blendG}, ${blendB}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(midX, midY, bridgeRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    // Main 60fps Organic Physics Simulation Loop
    const loop = (currentTime: number) => {
      if (!isTabVisible) return;

      const rawDt = (currentTime - lastTime) / 1000;
      const dt = Math.min(0.04, Math.max(0.001, rawDt)); // Clamp dt to prevent teleportation on hitch
      lastTime = currentTime;

      const ptr = pointerPosRef.current;
      genesisTimer += dt;

      // 1. Continuous Deep-Water Genesis (Upwelling Cycle)
      // Every 8s, if population allows, gently spawn a nascent micropocket from the bottom abyss
      if (genesisTimer > 8.0 && pockets.length < maxPockets) {
        genesisTimer = 0;
        const targetRadius = baseRadiusRange.min * (0.85 + Math.random() * 0.4);
        const palette = APPROVED_PALETTES[nextId % APPROVED_PALETTES.length];

        pockets.push({
          id: nextId++,
          x: width * (0.15 + Math.random() * 0.7),
          y: height + targetRadius * 0.6,
          vx: (Math.random() - 0.5) * 0.28,
          vy: -0.32 - Math.random() * 0.22,
          radius: targetRadius * 0.25,
          targetRadius,
          r: palette.r,
          g: palette.g,
          b: palette.b,
          alpha: palette.alpha,
          baseAlpha: palette.alpha,
          mass: (targetRadius * targetRadius) / 1000,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.0012 + Math.random() * 0.0008,
          mergeCooldown: 3.5,
          coalescenceTimer: 0,
          partnerId: null,
          scaleX: 0.85,
          scaleY: 1.15,
          rotation: 0,
          burstFlash: 0.35,
          opacityFactor: 0.08,
          age: 0,
          state: "emerging",
        });
      }

      // Mitosis Fallback: If population drops below minPockets, split largest pocket
      if (pockets.length < minPockets) {
        let largest = pockets[0];
        pockets.forEach((p) => {
          if (p.radius > largest.radius) largest = p;
        });

        if (largest && largest.radius > baseRadiusRange.min * 1.1) {
          const daughterRadius = Math.max(baseRadiusRange.min * 0.75, largest.radius * 0.48);
          largest.targetRadius = Math.sqrt(Math.max(100, largest.radius * largest.radius - daughterRadius * daughterRadius));
          largest.mass = (largest.targetRadius * largest.targetRadius) / 1000;
          largest.mergeCooldown = 5.0;
          largest.burstFlash = 0.7;

          const angle = Math.random() * Math.PI * 2;
          const palette = APPROVED_PALETTES[nextId % APPROVED_PALETTES.length];

          pockets.push({
            id: nextId++,
            x: largest.x + Math.cos(angle) * (largest.radius * 0.5),
            y: largest.y + Math.sin(angle) * (largest.radius * 0.5),
            vx: largest.vx + Math.cos(angle) * 0.6,
            vy: largest.vy + Math.sin(angle) * 0.6,
            radius: daughterRadius * 0.7,
            targetRadius: daughterRadius,
            r: palette.r,
            g: palette.g,
            b: palette.b,
            alpha: palette.alpha,
            baseAlpha: palette.alpha,
            mass: (daughterRadius * daughterRadius) / 1000,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.0014 + Math.random() * 0.0008,
            mergeCooldown: 4.5,
            coalescenceTimer: 0,
            partnerId: null,
            scaleX: 1,
            scaleY: 1,
            rotation: angle,
            burstFlash: 0.8,
            opacityFactor: 1,
            age: 0,
            state: "floating",
          });
        }
      }

      // 2. Physics & Fluid Drag Updates
      const deadIndices: number[] = [];

      for (let i = 0; i < pockets.length; i++) {
        const p = pockets[i];
        p.age += dt;

        // Smooth radius interpolation towards target
        p.radius += (p.targetRadius - p.radius) * (dt * 2.5);
        p.pulsePhase += p.pulseSpeed * dt * 60;
        p.mergeCooldown = Math.max(0, p.mergeCooldown - dt);
        p.burstFlash = Math.max(0, p.burstFlash - dt * 1.5);

        // State transitions for lifecycle
        if (p.state === "emerging") {
          p.opacityFactor = Math.min(1, p.opacityFactor + dt * 0.35);
          if (p.opacityFactor >= 0.98 && p.y < height - p.radius * 0.3) {
            p.state = "floating";
          }
        } else if (p.state === "floating") {
          // Check for upper boundary dissolution on mature pockets
          if (p.age > 16 && p.y < p.radius * 0.5) {
            p.state = "dissolving";
          }
        } else if (p.state === "dissolving") {
          p.opacityFactor = Math.max(0, p.opacityFactor - dt * 0.3);
          if (Math.random() < 0.25) {
            spawnFleck(
              p.x + (Math.random() - 0.5) * p.radius * 0.6,
              p.y + (Math.random() - 0.5) * p.radius * 0.6,
              (Math.random() - 0.5) * 0.4,
              -0.3 - Math.random() * 0.3,
              p.r,
              p.g,
              p.b,
              1.8 + Math.random() * 2.0,
              2.5,
              0.4
            );
          }
          if (p.opacityFactor <= 0.02) {
            deadIndices.push(i);
            continue;
          }
        }

        // Fluid buoyancy & laminar harmonic currents
        const currentX = Math.sin(currentTime * 0.00035 + p.id * 1.6) * 0.016;
        const buoyancyY = Math.cos(currentTime * 0.00028 + p.id * 2.2) * 0.014 - 0.004;

        p.vx = (p.vx + currentX) * 0.985;
        p.vy = (p.vy + buoyancyY) * 0.985;

        // Pointer fluid wake deflection
        if (ptr.active) {
          const dx = p.x - ptr.x;
          const dy = p.y - ptr.y;
          const dist = Math.hypot(dx, dy);
          const pushRadius = p.radius + 140;

          if (dist < pushRadius && dist > 1) {
            const force = (1 - dist / pushRadius) * 0.035;
            p.vx += (dx / dist) * force + ptr.vx * 0.008;
            p.vy += (dy / dist) * force + ptr.vy * 0.008;
          }
        }

        // Apply velocities
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;

        // Shed subtle viscous wake flecks in slipstream
        if (p.state === "floating" && Math.random() < 0.06) {
          spawnFleck(
            p.x + (Math.random() - 0.5) * p.radius * 0.4,
            p.y + p.radius * 0.45,
            p.vx * 0.3 + (Math.random() - 0.5) * 0.15,
            p.vy * 0.2 - 0.12,
            p.r,
            p.g,
            p.b,
            1.5 + Math.random() * 1.8,
            2.8,
            0.35 * p.opacityFactor
          );
        }

        // Soft elastic screen boundaries (unless emerging from bottom or dissolving at top)
        const pad = p.radius * 0.6;
        if (p.x < pad) p.vx += (pad - p.x) * 0.008;
        if (p.x > width - pad) p.vx -= (p.x - (width - pad)) * 0.008;

        if (p.state !== "dissolving" && p.y < pad) {
          p.vy += (pad - p.y) * 0.008;
        }
        if (p.state !== "emerging" && p.y > height - pad) {
          p.vy -= (p.y - (height - pad)) * 0.008;
        }

        // Reset scale toward resting spherical form
        p.scaleX += (1 - p.scaleX) * (dt * 3.5);
        p.scaleY += (1 - p.scaleY) * (dt * 3.5);
      }

      // Remove dissolved pockets
      if (deadIndices.length > 0) {
        for (let k = deadIndices.length - 1; k >= 0; k--) {
          pockets.splice(deadIndices[k], 1);
        }
      }

      // 3. Collision, Soft Elastic Deformation & Coalescence (Merging)
      // Paused during active wheel/touch scroll bursts to guarantee pure 60fps main thread fluidity
      const isActivelyScrolling = performance.now() - lastScrollTime < 160;
      const mergedIndices: number[] = [];

      if (!isActivelyScrolling) {
        for (let i = 0; i < pockets.length; i++) {
        for (let j = i + 1; j < pockets.length; j++) {
          const pA = pockets[i];
          const pB = pockets[j];
          if (mergedIndices.includes(i) || mergedIndices.includes(j)) continue;

          const dx = pB.x - pA.x;
          const dy = pB.y - pA.y;
          const dist = Math.hypot(dx, dy);
          const contactDist = pA.radius + pB.radius;

          if (dist < contactDist && dist > 0.001) {
            const overlap = contactDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            // Fluid squish: deform perpendicular to collision axis
            const deformAmount = Math.min(0.22, (overlap / contactDist) * 0.4);
            pA.scaleX = 1 - deformAmount * 0.6;
            pA.scaleY = 1 + deformAmount * 0.4;
            pA.rotation = Math.atan2(ny, nx);

            pB.scaleX = 1 - deformAmount * 0.6;
            pB.scaleY = 1 + deformAmount * 0.4;
            pB.rotation = Math.atan2(ny, nx);

            // Coalescence merging condition
            const canMerge =
              pockets.length > minPockets &&
              pA.state === "floating" &&
              pB.state === "floating" &&
              pA.mergeCooldown <= 0 &&
              pB.mergeCooldown <= 0 &&
              pA.radius + pB.radius < baseRadiusRange.max * 1.45;

            if (canMerge) {
              if (pA.partnerId === pB.id) {
                pA.coalescenceTimer += dt;
              } else {
                pA.partnerId = pB.id;
                pA.coalescenceTimer = 0;
              }

              // After 1.0s of sustained liquid bridge contact, merge into single larger bubble
              if (pA.coalescenceTimer > 1.0) {
                pA.targetRadius = Math.min(
                  baseRadiusRange.max * 1.35,
                  Math.sqrt(pA.radius * pA.radius + pB.radius * pB.radius) * 0.94
                );
                pA.mass = (pA.targetRadius * pA.targetRadius) / 1000;
                pA.vx = (pA.vx * pA.mass + pB.vx * pB.mass) / (pA.mass + pB.mass);
                pA.vy = (pA.vy * pA.mass + pB.vy * pB.mass) / (pA.mass + pB.mass);

                // Blend colors
                pA.r = Math.round((pA.r + pB.r) / 2);
                pA.g = Math.round((pA.g + pB.g) / 2);
                pA.b = Math.round((pA.b + pB.b) / 2);

                pA.burstFlash = 1.0;
                pA.mergeCooldown = 4.0;
                pA.coalescenceTimer = 0;
                pA.partnerId = null;

                // Luminous fusion fleck burst
                for (let k = 0; k < 6; k++) {
                  const burstAngle = (Math.PI * 2 * k) / 6 + (Math.random() - 0.5) * 0.3;
                  const speed = 0.4 + Math.random() * 0.6;
                  spawnFleck(
                    pA.x,
                    pA.y,
                    Math.cos(burstAngle) * speed,
                    Math.sin(burstAngle) * speed,
                    pA.r,
                    pA.g,
                    pA.b,
                    2.0 + Math.random() * 1.8,
                    2.2,
                    0.5
                  );
                }

                mergedIndices.push(j);
                continue;
              }
            } else {
              pA.partnerId = null;
              pA.coalescenceTimer = 0;
            }

            // Elastic surface repulsion pushes them gently apart
            const repulseForce = overlap * 0.015;
            pA.vx -= nx * (repulseForce / pA.mass);
            pA.vy -= ny * (repulseForce / pA.mass);
            pB.vx += nx * (repulseForce / pB.mass);
            pB.vy += ny * (repulseForce / pB.mass);
          } else {
            if (pA.partnerId === pB.id) {
              pA.partnerId = null;
              pA.coalescenceTimer = 0;
            }
          }
        }
      }
      }

      // Remove merged pockets
      if (mergedIndices.length > 0) {
        for (let k = mergedIndices.length - 1; k >= 0; k--) {
          pockets.splice(mergedIndices[k], 1);
        }
      }

      // 4. Large Bubble Mitosis (Split oversized bubbles to maintain equilibrium)
      if (pockets.length < maxPockets) {
        for (let i = 0; i < pockets.length; i++) {
          const p = pockets[i];
          if (p.radius > baseRadiusRange.max * 1.25 && p.mergeCooldown <= 0 && p.state === "floating") {
            const daughterR = p.radius * 0.52;
            p.targetRadius = Math.sqrt(p.radius * p.radius - daughterR * daughterR);
            p.mass = (p.targetRadius * p.targetRadius) / 1000;
            p.mergeCooldown = 5.0;
            p.burstFlash = 0.7;

            const splitAngle = Math.random() * Math.PI * 2;
            const pal = APPROVED_PALETTES[(p.id + 1) % APPROVED_PALETTES.length];

            pockets.push({
              id: nextId++,
              x: p.x + Math.cos(splitAngle) * (p.radius * 0.45),
              y: p.y + Math.sin(splitAngle) * (p.radius * 0.45),
              vx: p.vx + Math.cos(splitAngle) * 0.55,
              vy: p.vy + Math.sin(splitAngle) * 0.55,
              radius: daughterR * 0.75,
              targetRadius: daughterR,
              r: pal.r,
              g: pal.g,
              b: pal.b,
              alpha: pal.alpha,
              baseAlpha: pal.alpha,
              mass: (daughterR * daughterR) / 1000,
              pulsePhase: Math.random() * Math.PI * 2,
              pulseSpeed: 0.0013 + Math.random() * 0.0007,
              mergeCooldown: 4.0,
              coalescenceTimer: 0,
              partnerId: null,
              scaleX: 1,
              scaleY: 1,
              rotation: splitAngle,
              burstFlash: 0.75,
              opacityFactor: 1,
              age: 0,
              state: "floating",
            });
            break;
          }
        }
      }

      // 5. Update Flecks
      for (let i = flecks.length - 1; i >= 0; i--) {
        const f = flecks[i];
        f.life += dt;
        if (f.life >= f.maxLife) {
          flecks.splice(i, 1);
          continue;
        }
        f.x += f.vx * dt * 60;
        f.y += f.vy * dt * 60;
        f.vx *= 0.98;
        f.vy *= 0.98;
      }

      // 6. Composite Render (Clear and Set Screen Blend Mode)
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      // Render Soft Luminous Confluence Blooms First (Between In-Contact Air Pockets)
      for (let i = 0; i < pockets.length; i++) {
        for (let j = i + 1; j < pockets.length; j++) {
          const pA = pockets[i];
          const pB = pockets[j];
          const pulseA = 1 + Math.sin(pA.pulsePhase) * 0.06;
          const pulseB = 1 + Math.sin(pB.pulsePhase) * 0.06;
          renderLuminousConfluence(pA, pB, pA.radius * pulseA, pB.radius * pulseB);
        }
      }

      // Render Fluid Air Pockets (Soft Volumetric Bioluminescent Auras)
      for (let i = 0; i < pockets.length; i++) {
        const p = pockets[i];
        const pulse = 1 + Math.sin(p.pulsePhase) * 0.06;
        const currentR = Math.max(10, p.radius * pulse);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scaleX, p.scaleY);

        // Ultra-smooth multi-stop Gaussian falloff: zero harsh boundaries or polygon cuts
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentR);
        const peakAlpha = Math.min(0.38, (p.alpha + p.burstFlash * 0.20) * p.opacityFactor);

        grad.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${peakAlpha})`);
        grad.addColorStop(0.26, `rgba(${p.r}, ${p.g}, ${p.b}, ${peakAlpha * 0.68})`);
        grad.addColorStop(0.56, `rgba(${p.r}, ${p.g}, ${p.b}, ${peakAlpha * 0.26})`);
        grad.addColorStop(0.82, `rgba(${p.r}, ${p.g}, ${p.b}, ${peakAlpha * 0.06})`);
        grad.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, currentR, 0, Math.PI * 2);
        ctx.fill();

        // Delicate luminous core on fusion / split flash
        if (p.burstFlash > 0.05) {
          const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentR * 0.35);
          coreGrad.addColorStop(0, `rgba(255, 248, 235, ${p.burstFlash * 0.35 * p.opacityFactor})`);
          coreGrad.addColorStop(1, "rgba(255, 248, 235, 0)");
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(0, 0, currentR * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Render Slipstream Flecks
      for (let i = 0; i < flecks.length; i++) {
        const f = flecks[i];
        const fleckProgress = f.life / f.maxLife;
        const currentAlpha = f.maxAlpha * (1 - fleckProgress);
        ctx.fillStyle = `rgba(${f.r}, ${f.g}, ${f.b}, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius * (1 - fleckProgress * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. Update & Render Celestial Micro-Dust Motes (Organic Suspended Particle Field)
      for (let i = 0; i < celestialMotes.length; i++) {
        const m = celestialMotes[i];
        m.phase += dt * m.speed * 1.2;
        // Gentle upward drift with harmonic lateral wave
        m.y -= dt * 12 * m.speed;
        m.x += Math.sin(m.phase) * (dt * 7);

        // Subtle pointer displacement if cursor is moving nearby
        if (ptr.active) {
          const pdx = m.x - ptr.x;
          const pdy = m.y - ptr.y;
          const pdistSq = pdx * pdx + pdy * pdy;
          if (pdistSq < 14400 && pdistSq > 1) { // 120px radius
            const pdist = Math.sqrt(pdistSq);
            const pforce = (1 - pdist / 120) * dt * 35;
            m.x += (pdx / pdist) * pforce;
            m.y += (pdy / pdist) * pforce;
          }
        }

        // Screen wrap-around with randomized reinjection
        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        const flicker = Math.sin(m.phase * 1.8) * 0.35 + 0.65;
        const alpha = Math.max(0.04, Math.min(0.40, m.baseAlpha * flicker));

        ctx.fillStyle = `rgba(${m.r}, ${m.g}, ${m.b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="living-fluid-canvas"
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{
        willChange: "transform",
        transform: "translate3d(0,0,0)",
      }}
      aria-hidden="true"
    />
  );
};
