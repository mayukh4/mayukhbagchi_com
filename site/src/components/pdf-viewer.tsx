"use client";

import { useMemo, useRef, useState } from "react";
import { Download, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Printer } from "lucide-react";

type PdfViewerProps = {
  fileUrl: string;
  initialZoomPct?: number; // 100 = fit width (we simulate via container scaling)
};

export default function PdfViewer({ fileUrl, initialZoomPct = 100 }: PdfViewerProps) {
  const [zoomPct, setZoomPct] = useState(initialZoomPct);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setZoomPct((z) => Math.min(160, z + 10));
  const zoomOut = () => setZoomPct((z) => Math.max(70, z - 10));
  const resetZoom = () => setZoomPct(initialZoomPct);

  const openInNewTab = () => window.open(fileUrl, "_blank", "noopener,noreferrer");
  const download = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileUrl.split("/").pop() || "cv.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const printPdf = () => {
    const w = window.open(fileUrl, "_blank");
    if (!w) return;
    const onLoad = () => { try { w.focus(); w.print(); } catch { /* ignore */ } };
    // @ts-expect-error addEventListener may not exist on some window proxies
    w.addEventListener?.("load", onLoad, { once: true });
  };

  const iframeSrc = useMemo(() => {
    // Hide built-in toolbar for a cleaner look. Users can open full viewer via "Open" button.
    const base = fileUrl.includes("#") ? fileUrl.slice(0, fileUrl.indexOf("#")) : fileUrl;
    return `${base}#toolbar=0&navpanes=0&scrollbar=0`;
  }, [fileUrl]);

  // We cannot zoom iframe content cross-origin. Simulate zoom by scaling iframe container.
  const scale = zoomPct / 100;

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 mb-3 flex items-center gap-2 rounded-xl border border-[hsl(var(--muted)/0.3)] bg-[hsl(var(--background)/0.6)]/80 backdrop-blur-xl px-3 py-2">
        <button onClick={download} className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60">
          <Download size={16} /> Download
        </button>
        <button onClick={openInNewTab} className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60">
          <ExternalLink size={16} /> Open
        </button>
        <button onClick={printPdf} className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60">
          <Printer size={16} /> Print
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button onClick={zoomOut} aria-label="Zoom out" className="rounded border border-muted/40 p-1 hover:border-accent/60"><ZoomOut size={16} /></button>
          <span className="px-2 text-sm tabular-nums">{zoomPct}%</span>
          <button onClick={zoomIn} aria-label="Zoom in" className="rounded border border-muted/40 p-1 hover:border-accent/60"><ZoomIn size={16} /></button>
          <button onClick={resetZoom} aria-label="Reset zoom" className="ml-1 rounded border border-muted/40 p-1 hover:border-accent/60"><RotateCcw size={16} /></button>
        </div>
      </div>

      {/* Viewer container */}
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-[hsl(var(--muted)/0.22)] bg-[hsl(var(--background)/0.08)]/80 backdrop-blur-xl p-2 md:p-3 shadow-2xl overflow-auto">
        <div
          ref={containerRef}
          className="mx-auto origin-top-left"
          style={{ transform: `scale(${scale})`, width: 'min(1040px, 96vw)' }}
        >
          <iframe
            title="CV PDF"
            src={iframeSrc}
            className="w-full"
            style={{ height: "calc(100vh - 120px)" }}
          />
        </div>
      </div>

      {/* Quick actions for mobile */}
      <div className="mt-4 flex gap-2 md:hidden">
        <a href={fileUrl} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-muted/40 px-3 py-2">Open in new tab</a>
        <button onClick={download} className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-muted/40 px-3 py-2">Download</button>
      </div>
    </div>
  );
}


