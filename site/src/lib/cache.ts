// Intelligent caching utilities for API responses
// This maintains exact functionality while improving performance

export class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  constructor(private defaultTTL = 5 * 60 * 1000) {} // 5 minutes default
  
  set(key: string, data: any, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
  
  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instances
export const apiCache = new APICache();
export const youtubeCache = new APICache(30 * 60 * 1000); // 30 minutes for YouTube
export const supabaseCache = new APICache(10 * 60 * 1000); // 10 minutes for Supabase

// Cache wrapper function that preserves exact API behavior
export function withCache<T>(
  cacheInstance: APICache,
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try cache first
      const cached = cacheInstance.get(key);
      if (cached) {
        resolve(cached);
        return;
      }
      
      // Fetch fresh data
      const data = await fetcher();
      
      // Cache the result
      cacheInstance.set(key, data, ttl);
      
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

// Cleanup expired cache entries every 10 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    apiCache.cleanup();
    youtubeCache.cleanup();
    supabaseCache.cleanup();
  }, 10 * 60 * 1000);
}
