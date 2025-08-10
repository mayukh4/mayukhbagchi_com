"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Sales = {
  currency: string;
  totalCents: number;
  series: Array<{ label: string; cents: number }>;
};

type Props = {
  title: string;
  href: string;
  description: string;
};

export default function IndieCard({ title, href, description }: Props) {
  const [sales, setSales] = useState<Sales | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/indie/sales", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Sales;
        if (mounted) setSales(data);
      } catch (e: any) {
        if (mounted) setError("—");
      }
    })();
    return () => { mounted = false; };
  }, []);

  const total = useMemo(() => {
    if (!sales) return "—";
    const dollars = sales.totalCents / 100;
    return dollars.toLocaleString("en-US", { style: "currency", currency: (sales.currency || "USD").toUpperCase() });
  }, [sales]);

  const values = useMemo(() => (sales?.series?.map(s => s.cents) ?? []), [sales]);

  // Build sparkline path
  const { lineD, areaD, lastPoint } = useMemo(() => {
    const w = 100; const h = 40; const pad = 2;
    const arr = values.length > 1 ? values : [0, 0];
    const maxV = Math.max(1, ...arr);
    const n = arr.length;
    const pts = arr.map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / (n - 1);
      const y = h - pad - (v / maxV) * (h - pad * 2);
      return { x, y };
    });
    const line = `M ${pts[0].x} ${pts[0].y}` + pts.slice(1).map(p => ` L ${p.x} ${p.y}`).join("");
    const area = `${line} L ${pts[pts.length - 1].x} ${h - pad} L ${pts[0].x} ${h - pad} Z`;
    const lp = pts[pts.length - 1];
    return { lineD: line, areaD: area, lastPoint: lp };
  }, [values]);

  return (
    <div className="rounded-2xl border border-[hsl(var(--muted)/0.25)] bg-[hsl(var(--background)/0.06)]/80 backdrop-blur-2xl shadow-2xl p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h3>
        <Link href={href} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-4 text-sm">Visit</Link>
      </div>
      <p className="mt-2 text-foreground/85 max-w-prose text-sm md:text-base">{description}</p>

      {/* Sparkline graph (no month labels) */}
      <div className="mt-5">
        <svg viewBox="0 0 100 40" className="w-full h-28 md:h-32">
          <defs>
            <linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#revFill)" />
          {/* soft glow underlay */}
          <path d={lineD} fill="none" stroke="hsl(var(--accent))" strokeOpacity="0.25" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* main thin line */}
          <path d={lineD} fill="none" stroke="hsl(var(--accent))" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          {lastPoint && (
            <g>
              <circle cx={lastPoint.x} cy={lastPoint.y} r={1.8} fill="hsl(var(--accent))" />
            </g>
          )}
        </svg>
      </div>

      <div
        className="mt-2 text-sm text-foreground/80 flex items-center gap-2 cursor-help"
        title="Live from Stripe API — updates in real time"
        aria-label="All-time revenue. Live from Stripe API — updates in real time"
      >
        <svg
          viewBox="0 0 32 32"
          width="24"
          height="24"
          aria-hidden
          className="opacity-95"
        >
          <rect x="1" y="1" width="30" height="30" rx="7" fill="#635BFF" />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            fontSize="16"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          >
            s
          </text>
        </svg>
        <span className="font-medium">All‑time revenue:</span> {total}
      </div>
    </div>
  );
}


