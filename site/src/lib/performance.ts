import { useEffect, useRef } from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private onSlowFrameCallback?: () => void;
  private isMonitoring = false;

  constructor() {
    this.measureFPS = this.measureFPS.bind(this);
  }

  start(onSlowFrame?: () => void) {
    this.onSlowFrameCallback = onSlowFrame;
    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.measureFPS();
  }

  stop() {
    this.isMonitoring = false;
  }

  private measureFPS() {
    if (!this.isMonitoring) return;

    const now = performance.now();
    this.frameCount++;

    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      
      // Detect slow frames (< 30 FPS)
      if (this.fps < 30 && this.onSlowFrameCallback) {
        this.onSlowFrameCallback();
      }

      this.frameCount = 0;
      this.lastTime = now;
    }

    requestAnimationFrame(this.measureFPS);
  }

  getFPS() {
    return this.fps;
  }
}

// Hook for adaptive rendering based on performance
export function useAdaptiveRendering() {
  const fpsRef = useRef(60);
  const qualityRef = useRef(1);
  const monitorRef = useRef<PerformanceMonitor | null>(null);

  useEffect(() => {
    monitorRef.current = new PerformanceMonitor();
    
    monitorRef.current.start(() => {
      // Reduce FPS and quality when performance is poor
      fpsRef.current = Math.max(15, fpsRef.current - 5);
      qualityRef.current = Math.max(0.5, qualityRef.current - 0.1);
    });

    return () => {
      monitorRef.current?.stop();
    };
  }, []);

  return {
    targetFPS: fpsRef.current,
    quality: qualityRef.current,
    getCurrentFPS: () => monitorRef.current?.getFPS() || 60,
  };
}

// Hook for visibility-based optimization
export function useVisibilityOptimization() {
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return {
    isVisible: isVisibleRef.current,
  };
}

// Smart animation frame that respects FPS limits
export function useSmartAnimationFrame(targetFPS = 60) {
  const frameRef = useRef<number>(0);
  const lastDrawTimeRef = useRef<number>(0);
  const frameInterval = 1000 / targetFPS;

  const smartRequestFrame = (callback: () => void) => {
    frameRef.current = requestAnimationFrame((now) => {
      // Only draw if enough time has passed
      if (now - lastDrawTimeRef.current >= frameInterval) {
        callback();
        lastDrawTimeRef.current = now;
      } else {
        // Skip frame but schedule next one
        smartRequestFrame(callback);
      }
    });
  };

  const cancelFrame = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
  };

  return { smartRequestFrame, cancelFrame };
}

// GPU memory monitoring (where supported)
export function useGPUMemoryMonitor() {
  const memoryInfoRef = useRef<any>(null);

  useEffect(() => {
    // Check if GPU memory info is available (Chrome)
    if ('memory' in performance && 'webkitGetUserMedia' in navigator) {
      const checkMemory = () => {
        // @ts-ignore - webkitMemory is Chrome-specific
        if (performance.memory) {
          // @ts-ignore
          memoryInfoRef.current = {
            // @ts-ignore
            used: performance.memory.usedJSHeapSize,
            // @ts-ignore
            total: performance.memory.totalJSHeapSize,
            // @ts-ignore
            limit: performance.memory.jsHeapSizeLimit,
          };
        }
      };

      checkMemory();
      const interval = setInterval(checkMemory, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  return memoryInfoRef.current;
}
