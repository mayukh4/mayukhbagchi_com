"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Download, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Printer } from "lucide-react";

type PdfViewerProps = {
  fileUrl: string;
  initialZoomPct?: number; // 100 = fit width (we simulate via container scaling)
};

export default function PdfViewer({ fileUrl, initialZoomPct = 100 }: PdfViewerProps) {
  const [zoomPct, setZoomPct] = useState(initialZoomPct);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simplified PDF loading - just use direct file URL
  useEffect(() => {
    if (!isMounted) return;

    async function loadPdf() {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Just use the direct file URL - much simpler and more reliable
        setPdfSrc(fileUrl);
        console.log('PDF set to direct URL:', fileUrl);
      } catch (error) {
        console.error('Failed to load PDF:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    // Add a small delay to ensure smooth mounting
    const timer = setTimeout(loadPdf, 100);
    return () => clearTimeout(timer);
  }, [fileUrl, isMounted]);

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
      // @ts-expect-error addEventListener may not exist on some window proxies
      w.addEventListener?.("load", onLoad, { once: true });
    }
  };

  const iframeSrc = useMemo(() => {
    if (!pdfSrc) return null;
    // Use direct URL with PDF viewer parameters
    return `${pdfSrc}#toolbar=0&navpanes=0&scrollbar=0`;
  }, [pdfSrc]);

  // We cannot zoom iframe content cross-origin. Simulate zoom by scaling iframe container.
  const scale = zoomPct / 100;

  // SSR-safe loading state - consistent rendering
  if (!isMounted || isLoading) {
    return (
      <div className="w-full">
        {/* Toolbar */}
        <div className="sticky top-0 z-20 mb-3 flex items-center gap-2 rounded-xl border border-[hsl(var(--muted)/0.3)] bg-[hsl(var(--background)/0.6)]/80 backdrop-blur-xl px-3 py-2">
          <button 
            onClick={download} 
            className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60 opacity-50 cursor-not-allowed"
          >
            <Download size={16} /> Download
          </button>
          <button 
            onClick={openInNewTab} 
            className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60 opacity-50 cursor-not-allowed"
          >
            <ExternalLink size={16} /> Open
          </button>
          <button 
            onClick={printPdf} 
            className="inline-flex items-center gap-1 rounded border border-muted/40 px-2 py-1 text-sm hover:border-accent/60 opacity-50 cursor-not-allowed"
          >
            <Printer size={16} /> Print
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button 
              onClick={zoomOut} 
              aria-label="Zoom out" 
              className="rounded border border-muted/40 p-1 hover:border-accent/60 opacity-50 cursor-not-allowed"
            >
              <ZoomOut size={16} />
            </button>
            <span className="px-2 text-sm tabular-nums">{zoomPct}%</span>
            <button 
              onClick={zoomIn} 
              aria-label="Zoom in" 
              className="rounded border border-muted/40 p-1 hover:border-accent/60 opacity-50 cursor-not-allowed"
            >
              <ZoomIn size={16} />
            </button>
            <button 
              onClick={resetZoom} 
              aria-label="Reset zoom" 
              className="ml-1 rounded border border-muted/40 p-1 hover:border-accent/60 opacity-50 cursor-not-allowed"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Viewer container */}
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-[hsl(var(--muted)/0.22)] bg-[hsl(var(--background)/0.08)]/80 backdrop-blur-xl p-2 md:p-3 shadow-2xl overflow-auto">
          <div
            ref={containerRef}
            className="mx-auto origin-top-left"
            style={{ transform: `scale(${scale})`, width: 'min(1040px, 96vw)' }}
          >
            <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full mx-auto"></div>
              <p className="text-foreground/70">Loading CV...</p>
            </div>
          </div>
        </div>

        {/* Quick actions for mobile */}
        <div className="mt-4 flex gap-2 md:hidden">
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-muted/40 px-3 py-2"
          >
            Open in new tab
          </a>
          <button 
            onClick={download} 
            className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-muted/40 px-3 py-2 opacity-50 cursor-not-allowed"
          >
            Download
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError || !iframeSrc) {
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
            <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] text-center space-y-4">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold">PDF Viewer Issue</h3>
              <p className="text-foreground/70 max-w-md">
                Having trouble loading the PDF in the embedded viewer. Try opening it in a new tab or downloading it directly.
              </p>
              <div className="flex gap-3 mt-6">
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent text-accent-foreground px-4 py-2 font-medium hover:bg-accent/90"
                >
                  <ExternalLink size={16} /> Open PDF
                </a>
                <a 
                  href={fileUrl}
                  download
                  className="inline-flex items-center gap-2 rounded-lg border border-muted/40 px-4 py-2 hover:border-accent/60"
                >
                  <Download size={16} /> Download
                </a>
              </div>
              
              {/* Alternative embed fallback */}
              <div className="mt-6 w-full max-w-md">
                <p className="text-sm text-foreground/50 mb-2">Alternative preview:</p>
                <embed 
                  src={pdfSrc || fileUrl} 
                  type="application/pdf"
                  className="w-full h-64 border border-muted/30 rounded"
                />
              </div>
            </div>
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

  // Success state - PDF loaded
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
            onError={() => {
              console.error('PDF iframe error');
              setHasError(true);
            }}
            onLoad={() => {
              console.log('PDF iframe loaded successfully');
            }}
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