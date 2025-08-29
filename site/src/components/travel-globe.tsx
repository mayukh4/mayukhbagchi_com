"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { geoOrthographic, geoPath, geoContains } from "d3-geo";
import { feature as topoFeature, mesh as topoMesh } from "topojson-client";

export type TravelEvent = {
  id: string;
  event: string;
  year: number;
  city: string;
  province_state?: string;
  country: string;
  description?: string;
  presentation_type?: string;
  title?: string;
  lat: number;
  lon: number;
  image?: string;
};

type Props = {
  events: TravelEvent[];
};

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
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

export function TravelGlobe({ events }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<TravelEvent | null>(null);
  const geoDataRef = useRef<{
    land: any | null;
    borders: any | null;
    countries: any[] | null;
  }>({ land: null, borders: null, countries: null });
  const [geoLoaded, setGeoLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // GPU-optimized canvas context
    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    }) as CanvasRenderingContext2D;

    // Lazy-load world outlines (TopoJSON 110m)
    (async () => {
      try {
        const [landResp, countriesResp] = await Promise.all([
          fetch("https://unpkg.com/world-atlas@2/land-110m.json"),
          fetch("https://unpkg.com/world-atlas@2/countries-110m.json"),
        ]);
        const landTopo = await landResp.json();
        const countriesTopo = await countriesResp.json();
        const land = topoFeature(landTopo as any, (landTopo as any).objects.land as any);
        const borders = topoMesh(countriesTopo as any, (countriesTopo as any).objects.countries as any, (a: any, b: any) => a !== b);
        const countriesFc = topoFeature(countriesTopo as any, (countriesTopo as any).objects.countries as any) as any;
        const countries = (countriesFc.features || []) as any[];
        geoDataRef.current = { land, borders, countries };
        setGeoLoaded(true);
      } catch (e) {
        // fail silently; globe still works without outlines
        console.warn("world-atlas fetch failed", e);
      }
    })();

    // GPU-optimized settings for travel globe
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const maxGPUSize = 4096; // Safe GPU texture limit
    
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Limit canvas size for GPU efficiency
      canvas.width = Math.min(Math.floor(w * dpr), maxGPUSize);
      canvas.height = Math.min(Math.floor(h * dpr), maxGPUSize);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      
      // GPU isolation
      canvas.style.contain = 'layout style paint';
      canvas.style.isolation = 'isolate';
      
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };
    resize();

    let rotY = -toRadians(40); // initial to show N. America + Europe
    let rotX = toRadians(10);
    let autoVel = 0.00005; // slower auto rotation for better performance
    let radiusScale = 0.9;
    let tilt = toRadians(18);
    let raf = 0;
    let last = performance.now();
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let dragRotY0 = 0, dragRotX0 = 0;
    let clickMaybe = false;
    let mouseX = -1, mouseY = -1; // for hover labels
    const lastPointsRef: { current: Array<{ ev: TravelEvent; x: number; y: number }> } = { current: [] };

    function withinGlobe(x: number, y: number) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w * 0.5, cy = h * 0.52;
      const R = Math.min(w, h) * 0.42 * radiusScale;
      return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= R * R * 1.05;
    }

    const onPointerDown = (e: PointerEvent) => {
      if (selected) return; // disable when modal open
      if (!withinGlobe(e.clientX, e.clientY)) return;
      isDragging = true;
      clickMaybe = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragRotY0 = rotY;
      dragRotX0 = rotX;
    };
    const onPointerMove = (e: PointerEvent) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (selected || !isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.hypot(dx, dy) > 3) clickMaybe = false;
      // Natural trackball: drag-right rotates view to the right (globe follows finger)
      rotY = dragRotY0 - dx * 0.005;
      rotX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, dragRotX0 - dy * 0.003));
    };
    const onPointerUp = (e: PointerEvent) => {
      if (selected || !isDragging) return;
      isDragging = false;
      if (clickMaybe && withinGlobe(e.clientX, e.clientY)) {
        // hit-test current drawn points
        const mx = e.clientX, my = e.clientY;
        let best: { idx: number; d: number } | null = null as any;
        lastPointsRef.current.forEach((pt, idx) => {
          const d = Math.hypot(mx - pt.x, my - pt.y);
          if (d < 22 && (!best || d < best.d)) best = { idx, d };
        });
        if (best) setSelected(lastPointsRef.current[best.idx].ev);
      }
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("pointermove", onPointerMove, { capture: true });
    window.addEventListener("pointerup", onPointerUp, { capture: true });
    window.addEventListener("resize", resize);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);

    function frame(now: number) {
      const dt = Math.min(64, now - last);
      last = now;
      if (!isDragging) rotY += autoVel * dt;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.60; // push globe slightly down
      const R = Math.min(w, h) * 0.40 * radiusScale; // a bit smaller so it doesn't overlap header

      // Shared D3 projection for outlines and markers
      const proj = geoOrthographic()
        .translate([cx, cy])
        .scale(R)
        .clipAngle(90)
        .rotate([-(rotY * 180) / Math.PI, -((rotX * 0.6 + tilt * 0.4) * 180) / Math.PI, 0]);

      // Earth outline & fill (higher opacity)
      ctx.strokeStyle = "rgba(100, 200, 255, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      const earthGrad = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, 0, cx, cy, R);
      earthGrad.addColorStop(0, "rgba(100, 180, 255, 0.09)");
      earthGrad.addColorStop(1, "rgba(100, 180, 255, 0.035)");
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Graticule
      ctx.strokeStyle = "rgba(100, 200, 255, 0.16)";
      ctx.lineWidth = 0.7;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 6) {
          let v = latLonToVec3(lat, lon);
          v = rotateY(v, rotY);
          v = rotateX(v, rotX * 0.6 + tilt * 0.4);
          const p = orthographicProject(v, cx, cy, R);
          if (p.front) { if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y); }
          else if (started) { ctx.stroke(); started = false; }
        }
        if (started) ctx.stroke();
      }
      for (let lon = -150; lon <= 150; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 6) {
          let v = latLonToVec3(lat, lon);
          v = rotateY(v, rotY);
          v = rotateX(v, rotX * 0.6 + tilt * 0.4);
          const p = orthographicProject(v, cx, cy, R);
          if (p.front) { if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y); }
          else if (started) { ctx.stroke(); started = false; }
        }
        if (started) ctx.stroke();
      }

      // Real land and borders if available
      if (geoDataRef.current.land && geoDataRef.current.borders) {
        const path = geoPath(proj).context(ctx as any);

        // Land fill
        ctx.save();
        ctx.fillStyle = "rgba(60, 140, 180, 0.20)";
        ctx.beginPath();
        path(geoDataRef.current.land as any);
        ctx.fill();
        ctx.restore();

        // Country borders
        ctx.save();
        ctx.strokeStyle = "rgba(140, 210, 255, 0.35)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        path(geoDataRef.current.borders as any);
        ctx.stroke();
        ctx.restore();

        // Country highlight for selected
        if (selected && geoDataRef.current.countries) {
          const match = (geoDataRef.current.countries as any[]).find((f) =>
            geoContains(f, [selected.lon, selected.lat])
          );
          if (match) {
            ctx.save();
            ctx.fillStyle = "rgba(255, 220, 0, 0.12)";
            ctx.beginPath();
            path(match as any);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // Project events
      const points: Array<{ ev: TravelEvent; x: number; y: number } > = [];
      for (const ev of events) {
        const xy = proj([ev.lon, ev.lat]) as [number, number] | null;
        if (!xy) continue; // behind hemisphere via clipAngle
        const x = xy[0], y = xy[1];
        const inDisc = (x - cx) * (x - cx) + (y - cy) * (y - cy) <= R * R + 1;
        if (!inDisc) continue;
        points.push({ ev, x, y });
      }
      lastPointsRef.current = points;

      // No baselines for this globe

      // Location markers: pin svg path
      ctx.save();
      for (const p of points) {
        const r = 10; // size
        // outer glow
        ctx.fillStyle = "rgba(255, 100, 100, 0.28)";
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.2, 0, Math.PI * 2); ctx.fill();
        // pin body
        ctx.fillStyle = "#ff6666";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - r * 0.6);
        ctx.quadraticCurveTo(p.x + r * 0.9, p.y - r * 0.2, p.x, p.y + r);
        ctx.quadraticCurveTo(p.x - r * 0.9, p.y - r * 0.2, p.x, p.y - r * 0.6);
        ctx.fill();
        // inner dot
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(p.x, p.y - r * 0.2, r * 0.28, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // Hover label only (tidier)
      if (mouseX >= 0 && mouseY >= 0) {
        let best: { p: {x:number;y:number;ev:TravelEvent}; d:number } | null = null;
        for (const pt of points) {
          const d = Math.hypot(mouseX - pt.x, mouseY - pt.y);
          if (d < 22 && (!best || d < best.d)) best = { p: pt, d };
        }
        if (best) {
          const label = `${best.p.ev.city}${best.p.ev.province_state ? ", " + best.p.ev.province_state : ""}, ${best.p.ev.country}`;
          ctx.save();
          ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system";
          const padX = 8; const boxH = 22;
          const textW = ctx.measureText(label).width;
          const bx = best.p.x + 14, by = best.p.y - 16;
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.beginPath();
          ctx.roundRect?.(bx, by - 14, textW + padX * 2, boxH, 8 as any);
          if (!ctx.roundRect) { ctx.rect(bx, by - 14, textW + padX * 2, boxH); }
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          ctx.fillText(label, bx + padX, by + 2);
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as any);
      window.removeEventListener("pointermove", onPointerMove, { capture: true } as any);
      window.removeEventListener("pointerup", onPointerUp, { capture: true } as any);
      window.removeEventListener("keydown", onKey);
    };
  }, [events]);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-auto">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {selected && createPortal(
        <>
          <div
            className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="pointer-events-auto fixed z-[130] left-1/2 -translate-x-1/2 top-12 w-[96vw] max-w-5xl rounded-3xl border-[hsl(var(--muted)/0.22)] bg-[hsl(var(--background)/0.10)]/85 backdrop-blur-2xl shadow-2xl overflow-hidden">
            {/* Close */}
            <button
              aria-label="Close"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 z-[140] rounded-full border border-muted/30 px-3 py-1.5 bg-background/40 hover:bg-foreground/5"
            >×</button>

            {/* Hero image */}
            <div className="relative">
              {selected.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.image} alt={selected.event}
                     className="w-full h-[40vh] md:h-[56vh] object-cover" />
              )}
            </div>

            {/* Title and details below image for legibility */}
            <div className="px-6 md:px-8 pt-5 md:pt-6">
              <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {selected.event} {selected.year ? <span className="text-foreground/70 font-normal">({selected.year})</span> : null}
              </h3>
              <p className="text-sm text-foreground/80 mt-1">
                {selected.city}{selected.province_state ? `, ${selected.province_state}` : ""}, {selected.country}
              </p>
              {selected.title && (
                <p className="text-sm md:text-base mt-2 text-foreground/90"><span className="font-medium">Title:</span> {selected.title}</p>
              )}
              {selected.presentation_type && (
                <p className="text-xs md:text-sm text-foreground/70 mt-1">{selected.presentation_type}</p>
              )}
            </div>

            {/* Full description below */}
            {selected.description && (
              <div className="px-6 md:px-8 py-5 md:py-6">
                <p className="text-sm md:text-base text-foreground/85 leading-relaxed">
                  {selected.description}
                </p>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

export default TravelGlobe;


