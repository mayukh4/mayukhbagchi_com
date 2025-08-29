"use client";

import { useState, useEffect } from "react";
import { Download, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Printer } from "lucide-react";

type PdfViewerProps = {
  fileUrl: string;
  initialZoomPct?: number;
};

export default function FinalPdfViewer({ fileUrl, initialZoomPct = 100 }: PdfViewerProps) {
  const [zoomPct, setZoomPct] = useState(initialZoomPct);
  const [isMounted, setIsMounted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Show fallback after 2 seconds if PDF doesn't load
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const zoomIn = () => setZoomPct((z) => Math.min(160, z + 10));
  const zoomOut = () => setZoomPct((z) => Math.max(70, z - 10));
  const resetZoom = () => setZoomPct(initialZoomPct);

  const openInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };
  
  const download = () => {
    if (typeof window !== 'undefined') {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = fileUrl.split("/").pop() || "cv.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };
  
  const printPdf = () => {
    if (typeof window !== 'undefined') {
      const w = window.open(fileUrl, "_blank");
      if (!w) return;
      const onLoad = () => { try { w.focus(); w.print(); } catch { /* ignore */ } };
      w.addEventListener?.("load", onLoad, { once: true });
    }
  };

  const scale = zoomPct / 100;

  if (!isMounted) {
    return (
      <div className="w-full">
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-[hsl(var(--muted)/0.22)] bg-[hsl(var(--background)/0.08)]/80 backdrop-blur-xl p-2 md:p-3 shadow-2xl overflow-auto">
          <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full mx-auto"></div>
            <p className="text-foreground/70">Loading CV...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 mb-3 flex items-center gap-2 rounded-xl border border-[hsl(var(--muted)/0.3)] bg-[hsl(var(--background)/0.6)]/80 backdrop-blur-xl px-3 py-2">
        <button 
          onClick={download} 
          className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60"
        >
          <Download size={16} /> Download
        </button>
        <button 
          onClick={openInNewTab} 
          className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60"
        >
          <ExternalLink size={16} /> Open
        </button>
        <button 
          onClick={printPdf} 
          className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60"
        >
          <Printer size={16} /> Print
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button 
            onClick={zoomOut} 
            aria-label="Zoom out" 
            className="rounded border border-muted/40 p-1 hover:border-accent/60"
          >
            <ZoomOut size={16} />
          </button>
          <span className="px-2 text-sm tabular-nums">{zoomPct}%</span>
          <button 
            onClick={zoomIn} 
            aria-label="Zoom in" 
            className="rounded border border-muted/40 p-1 hover:border-accent/60"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={resetZoom} 
            aria-label="Reset zoom" 
            className="ml-1 rounded border border-muted/40 p-1 hover:border-accent/60"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Viewer container */}
      <div className="mx-auto w-full max-w-6xl rounded-2xl border border-[hsl(var(--muted)/0.22)] bg-white shadow-2xl overflow-hidden">
        <div
          className="mx-auto origin-top-left bg-white"
          style={{ transform: `scale(${scale})`, width: '100%', maxWidth: '1200px' }}
        >
          {/* Enhanced PDF embed with optimal sizing */}
          <object 
            data={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1&page=1&view=FitH`}
            type="application/pdf"
            className="w-full border-0"
            style={{ height: "calc(100vh - 160px)", minHeight: "800px" }}
          >
            {/* Fallback iframe for browsers that don't support object */}
            <iframe 
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1&page=1&view=FitH`}
              className="w-full h-full border-0"
              title="CV PDF"
              style={{ height: "calc(100vh - 160px)", minHeight: "800px" }}
            >
              {/* Final fallback for browsers that don't support iframes */}
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">PDF Viewer</h3>
                <p className="text-foreground/70 mb-4">
                  Your browser doesn't support inline PDF viewing.
                </p>
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 rounded-lg bg-accent text-accent-foreground px-4 py-2 font-medium hover:bg-accent/90"
                >
                  Open PDF in new tab
                </a>
              </div>
            </iframe>
          </object>
        </div>
      </div>

      {/* Quick actions for mobile */}
      <div className="mt-4 flex gap-2 md:hidden">
        <button
          onClick={openInNewTab}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-muted/40 px-3 py-2"
        >
          <ExternalLink size={16} /> Open PDF
        </button>
        <button 
          onClick={download} 
          className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-muted/40 px-3 py-2"
        >
          <Download size={16} /> Download
        </button>
      </div>
    </div>
  );
}
