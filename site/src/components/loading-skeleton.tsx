// Loading skeletons that match your design aesthetic
// These maintain the visual consistency while content loads

export function VLBIBackgroundSkeleton() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 select-none">
      <div className="w-full h-full bg-gradient-to-b from-slate-900/20 to-slate-800/20 animate-pulse" />
    </div>
  );
}

export function TravelGlobeSkeleton() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-80 h-80 rounded-full border-2 border-accent/30 animate-pulse" />
      </div>
    </div>
  );
}

export function CarouselSkeleton({ className }: { className?: string }) {
  return (
    <div className={`rounded-2xl overflow-hidden border border-[hsl(var(--muted)/0.35)] bg-[hsl(var(--background)/0.2)]/80 animate-pulse ${className}`}>
      <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/10" />
    </div>
  );
}

export function FFTPortraitSkeleton() {
  return (
    <div className="grid place-items-center">
      <div className="relative w-[420px] h-[560px] rounded-2xl border border-transparent bg-gradient-to-br from-muted/30 to-muted/10 animate-pulse shadow-2xl" />
    </div>
  );
}
