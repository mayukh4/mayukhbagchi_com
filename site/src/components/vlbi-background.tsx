"use client";

import { useEffect, useRef } from "react";
import { geoOrthographic, geoPath } from "d3-geo";
import { feature as topoFeature, mesh as topoMesh } from "topojson-client";

type Station = {
  name: string;
  lat: number;
  lon: number;
};

// EHT-like network (approx positions)
const STATIONS: Station[] = [
  { name: "ALMA", lat: -23.02, lon: -67.75 },
  { name: "APEX", lat: -23.0, lon: -67.76 },
  { name: "LMT", lat: 19.0, lon: -97.3 },
  { name: "SMA/JCMT", lat: 19.82, lon: -155.47 },
  { name: "SMT", lat: 32.7, lon: -109.89 },
  { name: "IRAM Pico", lat: 37.06, lon: -3.39 },
  { name: "NOEMA", lat: 44.63, lon: 5.91 },
  { name: "GLT", lat: 72.58, lon: -38.46 },
  { name: "SPT", lat: -89.99, lon: 0 },
];

const LINKS: Array<[number, number]> = [
  [0, 2], [0, 3], [2, 3], [2, 4], [4, 5], [5, 6], [6, 7], [7, 3], [0, 8],
];

function toRadians(d: number) {
  return (d * Math.PI) / 180;
}

function latLonToVec3(lat: number, lon: number) {
  const phi = toRadians(90 - lat);
  const theta = toRadians(lon + 180);
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  return [x, y, z] as const;
}

function rotateY([x, y, z]: readonly [number, number, number], a: number) {
  const ca = Math.cos(a), sa = Math.sin(a);
  return [ca * x + sa * z, y, -sa * x + ca * z] as const;
}

function rotateX([x, y, z]: readonly [number, number, number], a: number) {
  const ca = Math.cos(a), sa = Math.sin(a);
  return [x, ca * y - sa * z, sa * y + ca * z] as const;
}

function orthographicProject([x, y, z]: readonly [number, number, number], cx: number, cy: number, r: number) {
  return { x: cx + r * x, y: cy - r * y, front: z > 0 };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type VLBIBackgroundProps = {
  mode?: "default" | "contact" | "travel" | "about" | "outreach";
  targetSelector?: string;
  // When true, suppresses rendering of the black hole while preserving the rest of the default scene
  hideBlackHole?: boolean;
};

export default function VLBIBackground({ mode = "default", targetSelector, hideBlackHole = false }: VLBIBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    
    // Stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.8 + 0.2,
    }));

    // Black hole - larger and slightly more left and lower
    const bh = {
      x: () => W() * 0.16,
      y: () => H() * 0.28,
      r: () => Math.min(W(), H()) * 0.15,
      phase: 0,
    };

    // Balloon-borne VLBI platform (hovering over the globe)
    const balloon = {
      lat: 22, // starting latitude
      lon: -30, // starting longitude
      alt: 1.03, // slightly above Earth surface
      lonOffsetDeg: 0, // additional longitudinal drift relative to Earth
      dlonDegPerMs: mode === "contact" ? 0.006 : 0.003, // faster in contact mode for quicker reappearance
    };

    // Realistic radio galaxies - proper double-lobe structure
    function createRadioGalaxies() {
      const galaxies: Array<{
        x: number; y: number; angle: number; coreSize: number; jetLength: number;
        jetWidth: number; lobeSize: number; brightness: number; jetAsymmetry: number;
        scale: number; hotspotIntensity: number;
      }> = [];

      const width = W();
      const height = H();
      const target = 7;
      const candidatesPerPoint = 50; // best-candidate sampling for uniform spread

      function isExcluded(x: number, y: number, pad: number) {
        // Black hole exclusion
        const dxBH = x - bh.x();
        const dyBH = y - bh.y();
        const minDistBH = bh.r() * 1.6 + pad; // tuned clearance: avoid over-excluding lower-left
        if (dxBH * dxBH + dyBH * dyBH < minDistBH * minDistBH) return true;

        // Earth exclusion (match Earth radius used in render with a small buffer)
        const earthX = width * 0.87;
        const earthY = height * 0.85;
        const earthRadius = Math.min(width, height) * 0.38; // match drawn Earth
        const dxE = x - earthX;
        const dyE = y - earthY;
        const minDistE = earthRadius * 1.02 + pad; // small buffer, slightly tighter
        if (dxE * dxE + dyE * dyE < minDistE * minDistE) return true;

        return false;
      }

      function minDistanceToExisting(x: number, y: number) {
        let d = Infinity;
        for (const g of galaxies) {
          const dx = x - g.x;
          const dy = y - g.y;
          const dd = Math.hypot(dx, dy);
          if (dd < d) d = dd;
        }
        return d;
      }

      for (let i = 0; i < target; i++) {
        let best: any = null;
        let bestScore = -Infinity;

        for (let k = 0; k < candidatesPerPoint; k++) {
          const cand = {
            x: Math.random() * width,
            y: Math.random() * height,
            angle: Math.random() * Math.PI,
            coreSize: 1 + Math.random() * 2,
            jetLength: 25 + Math.random() * 60,
            jetWidth: 2 + Math.random() * 4,
            lobeSize: 15 + Math.random() * 40,
            brightness: 0.4 + Math.random() * 0.5,
            jetAsymmetry: 0.5 + Math.random() * 0.8,
            scale: 0.6 + Math.random() * 0.8,
            hotspotIntensity: 0.7 + Math.random() * 0.6,
          };

          const pad = Math.max(cand.jetLength, cand.lobeSize) * cand.scale;
          if (isExcluded(cand.x, cand.y, pad)) continue;

          const score = galaxies.length === 0 ? 1e9 : minDistanceToExisting(cand.x, cand.y);
          if (score > bestScore) {
            bestScore = score;
            best = cand;
          }
        }

        // If we failed to find a valid candidate in K tries (e.g. extreme aspect or overlap),
        // relax by random search up to a higher cap
        if (!best) {
          let fallbackTries = 0;
          while (fallbackTries++ < 3000 && !best) {
            const cand = {
              x: Math.random() * width,
              y: Math.random() * height,
              angle: Math.random() * Math.PI,
              coreSize: 1 + Math.random() * 2,
              jetLength: 25 + Math.random() * 60,
              jetWidth: 2 + Math.random() * 4,
              lobeSize: 15 + Math.random() * 40,
              brightness: 0.4 + Math.random() * 0.5,
              jetAsymmetry: 0.5 + Math.random() * 0.8,
              scale: 0.6 + Math.random() * 0.8,
              hotspotIntensity: 0.7 + Math.random() * 0.6,
            };
            const pad = Math.max(cand.jetLength, cand.lobeSize) * cand.scale;
            if (isExcluded(cand.x, cand.y, pad)) continue;
            best = cand;
          }
        }

        if (best) galaxies.push(best);
      }
      return galaxies;
    }
    
    let radioGalaxies = createRadioGalaxies();
    const reseedGalaxies = () => {
      radioGalaxies = createRadioGalaxies();
    };
    window.addEventListener("resize", reseedGalaxies);
    let tPrev = performance.now();
    let rot = 0;
    const tilt = toRadians(18);
    let raf = 0;

    // World outlines (used in about page)
    const geoDataRef: { current: { land: any | null; borders: any | null } } = { current: { land: null, borders: null } };
    if (mode === "about") {
      (async () => {
        try {
          const [landResp, countriesResp] = await Promise.all([
            fetch("https://unpkg.com/world-atlas@2/land-110m.json"),
            fetch("https://unpkg.com/world-atlas@2/countries-110m.json"),
          ]);
          const landTopo = await landResp.json();
          const countriesTopo = await countriesResp.json();
          const land = topoFeature(landTopo as any, (landTopo as any).objects.land as any);
          const borders = topoMesh(
            countriesTopo as any,
            (countriesTopo as any).objects.countries as any,
            (a: any, b: any) => a !== b
          );
          geoDataRef.current = { land, borders } as any;
        } catch (e) {
          // fail silently; Earth still renders without outlines
          // eslint-disable-next-line no-console
          console.warn("world-atlas fetch failed", e);
        }
      })();
    }

    function drawRadioGalaxy(galaxy: any, time: number) {
      const { x, y, angle, coreSize, jetLength, jetWidth, lobeSize, brightness, jetAsymmetry, scale, hotspotIntensity } = galaxy;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);
      
      // Radio astronomy false-color scheme: red = brightest, orange/yellow = medium, blue = faintest
      
      // LOBES FIRST (large elliptical regions) - Classic radio galaxy double-lobe structure
      const lobeDistance = jetLength + lobeSize * 0.4;
      
      // Lobe 1 (main lobe)
      ctx.save();
      ctx.translate(0, lobeDistance);
      
      // Outer faint lobe emission (blue - faintest)
      ctx.globalAlpha = brightness * 0.3;
      const lobe1Outer = ctx.createRadialGradient(0, 0, 0, 0, 0, lobeSize * 1.4);
      lobe1Outer.addColorStop(0, `rgba(100, 150, 255, ${brightness * 0.3})`); // Blue for faint
      lobe1Outer.addColorStop(0.6, `rgba(80, 120, 200, ${brightness * 0.2})`);
      lobe1Outer.addColorStop(1, 'rgba(60, 100, 150, 0)');
      ctx.fillStyle = lobe1Outer;
      ctx.beginPath();
      ctx.ellipse(0, 0, lobeSize * 1.4, lobeSize * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Medium lobe emission (orange/yellow)
      ctx.globalAlpha = brightness * 0.6;
      const lobe1Med = ctx.createRadialGradient(0, 0, 0, 0, 0, lobeSize * 0.8);
      lobe1Med.addColorStop(0, `rgba(255, 180, 80, ${brightness * 0.6})`); // Orange for medium
      lobe1Med.addColorStop(0.5, `rgba(220, 140, 60, ${brightness * 0.4})`);
      lobe1Med.addColorStop(1, `rgba(180, 100, 40, 0)`);
      ctx.fillStyle = lobe1Med;
      ctx.beginPath();
      ctx.ellipse(0, 0, lobeSize * 0.8, lobeSize * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Hotspot (bright red - where jet terminates)
      ctx.globalAlpha = brightness * hotspotIntensity;
      const hotspot1 = ctx.createRadialGradient(0, -lobeSize * 0.3, 0, 0, -lobeSize * 0.3, lobeSize * 0.2);
      hotspot1.addColorStop(0, `rgba(255, 80, 80, ${brightness * hotspotIntensity})`); // Red for brightest
      hotspot1.addColorStop(0.5, `rgba(255, 120, 60, ${brightness * hotspotIntensity * 0.7})`);
      hotspot1.addColorStop(1, `rgba(200, 80, 40, 0)`);
      ctx.fillStyle = hotspot1;
      ctx.beginPath();
      ctx.ellipse(0, -lobeSize * 0.3, lobeSize * 0.2, lobeSize * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // Lobe 2 (asymmetric - often fainter)
      ctx.save();
      ctx.translate(0, -lobeDistance);
      
      // Outer faint lobe emission
      ctx.globalAlpha = brightness * 0.3 * jetAsymmetry;
      const lobe2Outer = ctx.createRadialGradient(0, 0, 0, 0, 0, lobeSize * 1.2 * jetAsymmetry);
      lobe2Outer.addColorStop(0, `rgba(120, 160, 255, ${brightness * 0.3 * jetAsymmetry})`);
      lobe2Outer.addColorStop(0.6, `rgba(100, 130, 200, ${brightness * 0.2 * jetAsymmetry})`);
      lobe2Outer.addColorStop(1, 'rgba(80, 110, 150, 0)');
      ctx.fillStyle = lobe2Outer;
      ctx.beginPath();
      ctx.ellipse(0, 0, lobeSize * 1.2 * jetAsymmetry, lobeSize * 0.7 * jetAsymmetry, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Medium emission
      ctx.globalAlpha = brightness * 0.5 * jetAsymmetry;
      const lobe2Med = ctx.createRadialGradient(0, 0, 0, 0, 0, lobeSize * 0.6 * jetAsymmetry);
      lobe2Med.addColorStop(0, `rgba(240, 160, 100, ${brightness * 0.5 * jetAsymmetry})`);
      lobe2Med.addColorStop(0.5, `rgba(200, 120, 80, ${brightness * 0.3 * jetAsymmetry})`);
      lobe2Med.addColorStop(1, `rgba(160, 80, 60, 0)`);
      ctx.fillStyle = lobe2Med;
      ctx.beginPath();
      ctx.ellipse(0, 0, lobeSize * 0.6 * jetAsymmetry, lobeSize * 0.4 * jetAsymmetry, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Hotspot 2 (often fainter)
      ctx.globalAlpha = brightness * hotspotIntensity * jetAsymmetry * 0.8;
      const hotspot2 = ctx.createRadialGradient(0, lobeSize * 0.3, 0, 0, lobeSize * 0.3, lobeSize * 0.15);
      hotspot2.addColorStop(0, `rgba(255, 100, 100, ${brightness * hotspotIntensity * jetAsymmetry * 0.8})`);
      hotspot2.addColorStop(0.5, `rgba(220, 140, 80, ${brightness * hotspotIntensity * jetAsymmetry * 0.6})`);
      hotspot2.addColorStop(1, `rgba(180, 100, 60, 0)`);
      ctx.fillStyle = hotspot2;
      ctx.beginPath();
      ctx.ellipse(0, lobeSize * 0.3, lobeSize * 0.15 * jetAsymmetry, lobeSize * 0.1 * jetAsymmetry, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // JETS (very thin, connecting core to lobes)
      ctx.globalAlpha = brightness * 0.2; // Jets are usually very faint
      ctx.strokeStyle = `rgba(150, 120, 200, ${brightness * 0.2})`;
      ctx.lineWidth = jetWidth * 0.3; // Very thin
      
      // Jet 1
      ctx.beginPath();
      ctx.moveTo(0, coreSize);
      ctx.lineTo(0, jetLength);
      ctx.stroke();
      
      // Jet 2 (asymmetric)
      ctx.globalAlpha = brightness * 0.2 * jetAsymmetry;
      ctx.strokeStyle = `rgba(130, 100, 180, ${brightness * 0.2 * jetAsymmetry})`;
      ctx.beginPath();
      ctx.moveTo(0, -coreSize);
      ctx.lineTo(0, -jetLength);
      ctx.stroke();
      
      // CENTRAL CORE (AGN - very bright, compact)
      ctx.globalAlpha = brightness * 0.9;
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize * 3);
      coreGrad.addColorStop(0, `rgba(255, 255, 220, ${brightness * 0.9})`); // Bright white/yellow core
      coreGrad.addColorStop(0.3, `rgba(255, 200, 100, ${brightness * 0.7})`);
      coreGrad.addColorStop(0.7, `rgba(255, 150, 80, ${brightness * 0.4})`);
      coreGrad.addColorStop(1, 'rgba(200, 100, 60, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, coreSize * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner bright core
      ctx.globalAlpha = brightness;
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }

    function drawBalloonIcon(x: number, y: number, size: number, timeMs: number) {
      // Slightly elongated and inverted to resemble a stratospheric zero-pressure balloon
      const h = size * 1.25;
      const wTop = size * 0.65; // broader crown
      const bob = Math.sin(timeMs * 0.003) * (size * 0.05);
      const sway = Math.sin(timeMs * 0.0017) * 0.08;

      ctx.save();
      ctx.translate(x, y + bob);
      ctx.rotate(sway);

      // Envelope (inverted: bulbous crown, tapered skirt to a tip)
      const topY = -h * 0.6;
      const bottomY = h * 0.45; // longer overall shape
      ctx.beginPath();
      ctx.moveTo(0, topY);
      ctx.bezierCurveTo(wTop, topY + h * 0.18, wTop * 0.9, bottomY * 0.2, 0, bottomY);
      ctx.bezierCurveTo(-wTop * 0.9, bottomY * 0.2, -wTop, topY + h * 0.18, 0, topY);
      const grad = ctx.createLinearGradient(0, topY, 0, bottomY);
      grad.addColorStop(0, "rgba(255,255,255,0.16)");
      grad.addColorStop(1, "rgba(200,220,255,0.05)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Vertical highlight seams to suggest gores
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 0.7;
      for (let i = -2; i <= 2; i++) {
        const t = i / 5;
        ctx.beginPath();
        ctx.moveTo(wTop * t * 0.6, topY + Math.abs(t) * h * 0.05);
        ctx.quadraticCurveTo(wTop * t, 0, wTop * t * 0.25, bottomY * 0.65);
        ctx.stroke();
      }

      // Long flight train and small gondola/payload
      const ropeLen = h * 0.35;
      ctx.beginPath();
      ctx.moveTo(0, bottomY);
      ctx.quadraticCurveTo(wTop * 0.18, bottomY + ropeLen * 0.35, wTop * 0.1, bottomY + ropeLen);
      ctx.strokeStyle = "rgba(230,230,255,0.25)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      const gW = wTop * 0.16;
      const gH = wTop * 0.11;
      ctx.beginPath();
      ctx.rect(wTop * 0.1 - gW / 2, bottomY + ropeLen - gH / 2, gW, gH);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // Resolve optional target element (e.g., contact form panel) for telemetry beam
    let targetEl: HTMLElement | null = null;
    if (targetSelector) {
      targetEl = document.querySelector(targetSelector) as HTMLElement | null;
    }

    function getTargetPoint() {
      if (!targetEl) return null;
      const r = targetEl.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    // Constellation overlays (faint, recognizable patterns)
    type Constellation = { stars: Array<{ x: number; y: number; mag?: number }>; links: Array<[number, number]> };
    const CONSTELLATIONS: Constellation[] = [
      // Orion (approximate layout)
      {
        stars: [
          { x: 0.18, y: 0.35 }, // Betelgeuse
          { x: 0.24, y: 0.32 }, // Bellatrix
          { x: 0.21, y: 0.42 }, // Alnilam belt center
          { x: 0.18, y: 0.44 }, // Alnitak
          { x: 0.24, y: 0.40 }, // Mintaka
          { x: 0.26, y: 0.52 }, // Rigel
          { x: 0.16, y: 0.54 }, // Saiph
        ],
        links: [
          [0, 2], [1, 2], [2, 3], [2, 4], [3, 6], [4, 5], [0, 6], [1, 5],
        ],
      },
      // Cassiopeia (W shape)
      {
        stars: [
          { x: 0.65, y: 0.18 },
          { x: 0.69, y: 0.22 },
          { x: 0.73, y: 0.18 },
          { x: 0.77, y: 0.22 },
          { x: 0.81, y: 0.18 },
        ],
        links: [[0,1],[1,2],[2,3],[3,4]],
      },
      // Ursa Major (Big Dipper outline)
      {
        stars: [
          { x: 0.60, y: 0.60 }, // Alkaid
          { x: 0.56, y: 0.58 },
          { x: 0.53, y: 0.56 },
          { x: 0.49, y: 0.56 }, // Megrez (kink)
          { x: 0.46, y: 0.58 },
          { x: 0.43, y: 0.60 },
          { x: 0.41, y: 0.63 }, // Dubhe
        ],
        links: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
      },
    ];

    function drawConstellations(ctx: CanvasRenderingContext2D, w: number, h: number, driftX: number, driftY: number) {
      ctx.save();
      ctx.translate(driftX * 0.45, driftY * 0.45);
      ctx.globalAlpha = 0.48; // slightly higher for better visibility
      ctx.strokeStyle = "rgba(200, 220, 255, 0.55)";
      ctx.lineWidth = 1;
      for (const c of CONSTELLATIONS) {
        // lines
        for (const [ai, bi] of c.links) {
          const a = c.stars[ai];
          const b = c.stars[bi];
          ctx.beginPath();
          ctx.moveTo(a.x * w, a.y * h);
          ctx.lineTo(b.x * w, b.y * h);
          ctx.stroke();
        }
        // stars (small soft dots)
        for (const s of c.stars) {
          const x = s.x * w, y = s.y * h;
          const r = 2.2; // slightly larger
          const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
          g.addColorStop(0, "rgba(255,255,255,0.95)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    function frame(now: number) {
      const dt = Math.min(64, now - tPrev);
      tPrev = now;
      // Earth rotation
      const rotSpeed = mode === "about" ? 0.00016 : 0.00025; // slower on about page
      rot += dt * rotSpeed;
      bh.phase += dt * 0.0002; // Black hole phase
      balloon.lonOffsetDeg += dt * balloon.dlonDegPerMs; // Balloon drift

      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      // Space background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "hsl(220 20% 8%)");
      grad.addColorStop(1, "hsl(220 20% 4%)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Parallax effect
      const driftX = Math.sin(now * 0.00005) * 15;
      const driftY = Math.cos(now * 0.00003) * 12;

      // Compute black hole screen position early for clipping masks
      const bx = bh.x() + driftX * 0.4;
      const by = bh.y() + driftY * 0.4;
      const br = bh.r();
      // Clip radius slightly smaller than inner ring so stars/radio galaxies never appear inside
      const holeClipR = Math.max(0, br - 12);

      // Stars with parallax (clip out black hole only if it will be drawn)
      ctx.save();
      if (mode === "default" && !hideBlackHole) {
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.arc(bx, by, holeClipR, 0, Math.PI * 2);
        // @ts-ignore - evenodd fill rule supported at runtime
        ctx.clip('evenodd');
      }
      ctx.translate(driftX * 0.3, driftY * 0.3);
      ctx.fillStyle = "#ffffff";
      for (const s of stars) {
        ctx.globalAlpha = s.a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Radio galaxies with slight parallax (skip for outreach for a cleaner star/constellation background)
      if (mode !== "outreach") {
        ctx.save();
        if (mode === "default" && !hideBlackHole) {
          ctx.beginPath();
          ctx.rect(0, 0, w, h);
          ctx.arc(bx, by, holeClipR, 0, Math.PI * 2);
          // @ts-ignore
          ctx.clip('evenodd');
        }
        ctx.translate(driftX * 0.7, driftY * 0.7);
        for (const galaxy of radioGalaxies) {
          drawRadioGalaxy(galaxy, now);
        }
        ctx.restore();
      }

      // Faint constellation overlays for outreach
      if (mode === "outreach") {
        drawConstellations(ctx, w, h, driftX, driftY);
      }

      // Black hole - only draw in default mode (skip for others for perf and clarity)
      if (mode === "default" && !hideBlackHole) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        // Accretion disk with much brighter, more vivid colors
        const steps = 300;
        for (let ring = -8; ring <= 8; ring++) {
          const rr = br + ring * 2;
          for (let i = 0; i < steps; i++) {
            const ang = (i / steps) * Math.PI * 2;
            const intensity = Math.max(0, Math.cos(ang - bh.phase + ring * 0.1));
            const temp = 0.4 + intensity * 0.6; // Temperature variation
            const rCol = Math.round(255 * Math.min(1, temp * 1.4));
            const gCol = Math.round(255 * Math.max(0, temp - 0.2) * 1.6);
            const bCol = Math.round(255 * Math.max(0, temp - 0.6) * 2.5);
            const alpha = 0.22 + 0.48 * Math.pow(intensity, 1.5) * (1 - Math.abs(ring) / 12);
            ctx.strokeStyle = `rgba(${rCol},${gCol},${bCol},${alpha})`;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(bx, by, rr, ang, ang + (Math.PI * 2) / steps);
            ctx.stroke();
          }
        }
        // Brighter outer glow
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 12;
        ctx.strokeStyle = "#ff8c42";
        ctx.beginPath();
        ctx.arc(bx, by, br * 1.05, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
        // Event horizon
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(bx, by, br * 0.82, 0, Math.PI * 2);
        ctx.fill();
        const eventHorizon = ctx.createRadialGradient(bx, by, 0, bx, by, br * 0.86);
        eventHorizon.addColorStop(0, "rgba(0, 0, 0, 1)");
        eventHorizon.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = eventHorizon;
        ctx.beginPath();
        ctx.arc(bx, by, br * 0.86, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // EARTH
      // In travel mode, skip the embedded small Earth (the page has a full interactive globe)
      if (mode === "travel") {
        raf = requestAnimationFrame(frame);
        return;
      }
      const isAbout = mode === "about";
      const cx = isAbout ? w * 0.5 : w * (mode === "contact" ? 0.7 : 0.87);
      const cy = isAbout ? h * 0.55 : h * (mode === "contact" ? 0.72 : 0.85);
      const radius = isAbout ? Math.min(w, h) * 0.46 : Math.min(w, h) * (mode === "contact" ? 0.52 : 0.44);

      // Earth outline
      ctx.strokeStyle = isAbout ? "rgba(140, 220, 255, 0.55)" : "rgba(100, 200, 255, 0.25)";
      ctx.lineWidth = isAbout ? 2.2 : 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Earth fill (higher opacity for about)
      const earthGrad = ctx.createRadialGradient(cx - radius * 0.28, cy - radius * 0.28, 0, cx, cy, radius);
      earthGrad.addColorStop(0, isAbout ? "rgba(100, 180, 255, 0.18)" : "rgba(100, 180, 255, 0.03)");
      earthGrad.addColorStop(1, isAbout ? "rgba(100, 180, 255, 0.08)" : "rgba(100, 180, 255, 0.008)");
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // For about: draw real land and borders (non-interactive)
      if (isAbout && geoDataRef.current.land && geoDataRef.current.borders) {
        const proj = geoOrthographic()
          .translate([cx, cy])
          .scale(radius)
          .clipAngle(90)
          .rotate([-(rot * 180) / Math.PI, -((tilt) * 180) / Math.PI, 0]);
        const path = geoPath(proj).context(ctx as any);

        // Land fill
        ctx.save();
        ctx.fillStyle = "rgba(60, 140, 180, 0.32)";
        ctx.beginPath();
        path(geoDataRef.current.land as any);
        ctx.fill();
        ctx.restore();

        // Country borders
        ctx.save();
        ctx.strokeStyle = "rgba(140, 210, 255, 0.6)";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        path(geoDataRef.current.borders as any);
        ctx.stroke();
        ctx.restore();

        // Kolkata marker (always visible)
        const kolkata = proj([88.3639, 22.5726]);
        if (kolkata) {
          const [kx, ky] = kolkata as [number, number];
          // outer glow
          ctx.fillStyle = "rgba(255, 100, 100, 0.35)";
          ctx.beginPath();
          ctx.arc(kx, ky, Math.max(6, radius * 0.012), 0, Math.PI * 2);
          ctx.fill();
          // center dot
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          ctx.beginPath();
          ctx.arc(kx, ky, Math.max(2.2, radius * 0.005), 0, Math.PI * 2);
          ctx.fill();

          // label box
          const label = "Kolkata, India";
          ctx.save();
          ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system";
          const textW = ctx.measureText(label).width;
          const bx = kx + 12;
          const by = ky - 10;
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.beginPath();
          // roundRect may not exist in all CanvasRenderingContext2D typings; fallback to rect
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ctx.roundRect?.(bx, by - 14, textW + 16, 22, 8);
          if (!ctx.roundRect) { ctx.rect(bx, by - 14, textW + 16, 22); }
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.96)";
          ctx.fillText(label, bx + 8, by + 2);
          ctx.restore();
        }
      }

      // Contact/default/outreach embellishments: draw VLBI stations and baselines too
      if (!isAbout) {
        // Project telescope stations
        const projected = STATIONS.map((s) => {
          let v = latLonToVec3(s.lat, s.lon);
          v = rotateY(v, rot);
          v = rotateX(v, tilt);
          return { s, v, p: orthographicProject(v, cx, cy, radius) };
        });

        // Project balloon (slightly above the surface)
        const balloonLon = balloon.lon + balloon.lonOffsetDeg;
        let vBalloon = latLonToVec3(balloon.lat, balloonLon);
        vBalloon = rotateY(vBalloon, rot);
        vBalloon = rotateX(vBalloon, tilt);
        if (vBalloon[2] <= 0.25) {
          vBalloon = [-vBalloon[0], vBalloon[1], -vBalloon[2]] as typeof vBalloon;
        }
        const pBalloon = orthographicProject(vBalloon, cx, cy, radius * balloon.alt);

        // VLBI baselines (elegant lines)
        const baselineAlpha = mode === "contact" ? 0.15 : 0.08;
        ctx.strokeStyle = `rgba(255, 220, 0, ${baselineAlpha})`;
        ctx.lineWidth = mode === "contact" ? 2.2 : 2;
        ctx.shadowColor = `rgba(255, 220, 0, ${baselineAlpha})`;
        ctx.shadowBlur = 2;
        
        LINKS.forEach(([ai, bi]) => {
          const A = projected[ai];
          const B = projected[bi];
          if (A.p.front && B.p.front) {
            ctx.beginPath();
            ctx.moveTo(A.p.x, A.p.y);
            ctx.lineTo(B.p.x, B.p.y);
            ctx.stroke();
          }
        });

        // Moving baselines from balloon to visible ground stations
        if (pBalloon.front) {
          for (const P of projected) {
            if (P.p.front) {
              ctx.beginPath();
              ctx.moveTo(pBalloon.x, pBalloon.y);
              ctx.lineTo(P.p.x, P.p.y);
              ctx.stroke();
            }
          }
        }
        
        ctx.shadowBlur = 0;

        // Telescope stations (elegant dots)
        for (const P of projected) {
          if (!P.p.front) continue;
          ctx.fillStyle = "rgba(255, 150, 150, 0.25)";
          ctx.beginPath(); ctx.arc(P.p.x, P.p.y, 8, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath(); ctx.arc(P.p.x, P.p.y, 3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "rgba(255, 100, 100, 0.9)";
          ctx.beginPath(); ctx.arc(P.p.x, P.p.y, 1.5, 0, Math.PI * 2); ctx.fill();
        }

        // Draw balloon icon on top of stations and baselines
        if (pBalloon.front) {
          const sizeFactor = mode === "contact" ? 0.08 : 0.12;
          const balloonSize = Math.max(12, radius * sizeFactor);
          drawBalloonIcon(pBalloon.x, pBalloon.y - radius * 0.02, balloonSize, now);
        }

        // Telemetry beacon from balloon to target element (contact mode only)
        if (mode === "contact" && pBalloon.front) {
          const target = getTargetPoint();
          if (target) {
            const midX = (pBalloon.x + target.x) / 2;
            const midY = (pBalloon.y + target.y) / 2 - Math.min(140, Math.abs(pBalloon.y - target.y) * 0.4);
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            const glowGrad = ctx.createLinearGradient(pBalloon.x, pBalloon.y, target.x, target.y);
            glowGrad.addColorStop(0, "rgba(0, 200, 255, 0.15)");
            glowGrad.addColorStop(1, "rgba(0, 200, 255, 0.0)");
            ctx.strokeStyle = glowGrad;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(pBalloon.x, pBalloon.y);
            ctx.quadraticCurveTo(midX, midY, target.x, target.y);
            ctx.stroke();

            const coreGrad = ctx.createLinearGradient(pBalloon.x, pBalloon.y, target.x, target.y);
            coreGrad.addColorStop(0, "rgba(0, 220, 255, 0.9)");
            coreGrad.addColorStop(1, "rgba(0, 220, 255, 0.2)");
            ctx.strokeStyle = coreGrad;
            ctx.lineWidth = 2.2;
            ctx.setLineDash([10, 12]);
            ctx.lineDashOffset = -now * 0.08;
            ctx.beginPath();
            ctx.moveTo(pBalloon.x, pBalloon.y);
            ctx.quadraticCurveTo(midX, midY, target.x, target.y);
            ctx.stroke();

            const pulse = (Math.sin(now * 0.006) + 1) / 2;
            const markerR = 6 + pulse * 5;
            ctx.fillStyle = "rgba(0, 220, 255, 0.22)";
            ctx.beginPath(); ctx.arc(target.x, target.y, markerR * 1.6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "rgba(0, 220, 255, 0.7)";
            ctx.beginPath(); ctx.arc(target.x, target.y, 3.2, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
        }
      }

      raf = requestAnimationFrame(frame);
    }
    
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", reseedGalaxies);
      cancelAnimationFrame(raf);
    };
  }, [mode, targetSelector, hideBlackHole]);

    return (
      <div className="pointer-events-none fixed inset-0 -z-10 select-none">
        <canvas ref={canvasRef} aria-hidden className="w-full h-full vlbi-canvas" />
      </div>
    );
}