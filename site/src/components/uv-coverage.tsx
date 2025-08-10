"use client";
import { useMemo } from "react";

function generateBaselines(count = 180) {
  const baselines: Array<{ u: number; v: number }> = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = Math.sin(i * 1.3) * 0.9 + 0.1; // pseudo-stations baseline length variety
    baselines.push({ u: r * Math.cos(angle), v: r * Math.sin(angle) });
  }
  return baselines;
}

export function UVCoverage({ size = 220 }: { size?: number }) {
  const points = useMemo(() => generateBaselines(240), []);
  const half = size / 2;
  const scale = half * 0.9;
  // Fix hydration by rounding to consistent precision across SSR/CSR
  const fmt = (v: number) => v.toFixed(2);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <defs>
        <radialGradient id="uvGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(56,189,248,0.6)" />
          <stop offset="100%" stopColor="rgba(56,189,248,0)" />
        </radialGradient>
      </defs>
      <circle cx={fmt(half)} cy={fmt(half)} r={fmt(half)} fill="url(#uvGlow)" />
      <g stroke="hsl(199 89% 60%)" strokeOpacity="0.8">
        {points.map((p, i) => (
          <line
            key={i}
            x1={fmt(half)}
            y1={fmt(half)}
            x2={fmt(half + p.u * scale)}
            y2={fmt(half - p.v * scale)}
            strokeWidth={0.7}
          />
        ))}
      </g>
      <circle cx={fmt(half)} cy={fmt(half)} r={1.5} fill="hsl(199 89% 60%)" />
    </svg>
  );
}


