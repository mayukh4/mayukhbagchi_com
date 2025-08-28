"use client";

import { useEffect, useState } from 'react';
import { useAdaptiveRendering, useGPUMemoryMonitor } from '@/lib/performance';

interface PerformanceStats {
  fps: number;
  memoryUsed: number;
  memoryTotal: number;
  renderTime: number;
}

export function PerformanceMonitor({ enabled = false }: { enabled?: boolean }) {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    renderTime: 0,
  });
  
  const { targetFPS, quality, getCurrentFPS } = useAdaptiveRendering();
  const memoryInfo = useGPUMemoryMonitor();

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let renderStartTime = 0;

    const measurePerformance = () => {
      const now = performance.now();
      frameCount++;

      // Measure render time
      if (renderStartTime) {
        const renderTime = now - renderStartTime;
        setStats(prev => ({ ...prev, renderTime }));
      }
      renderStartTime = now;

      // Update FPS every second
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        
        setStats(prev => ({
          ...prev,
          fps,
          memoryUsed: memoryInfo?.used || 0,
          memoryTotal: memoryInfo?.total || 0,
        }));

        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(measurePerformance);
    };

    measurePerformance();
  }, [enabled, memoryInfo]);

  if (!enabled) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg text-xs font-mono">
      <div className="space-y-1">
        <div>FPS: {stats.fps}</div>
        <div>Target: {targetFPS}</div>
        <div>Quality: {Math.round(quality * 100)}%</div>
        <div>Render: {stats.renderTime.toFixed(1)}ms</div>
        {memoryInfo && (
          <>
            <div>Memory: {Math.round(stats.memoryUsed / 1024 / 1024)}MB</div>
            <div>Total: {Math.round(stats.memoryTotal / 1024 / 1024)}MB</div>
          </>
        )}
      </div>
    </div>
  );
}
