'use client';
import { useState, useEffect } from 'react';

interface ChannelStats {
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

export default function YouTubeStatsCard() {
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial fetch on mount
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/youtube/channel-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else if (response.status === 500) {
          // Handle configuration error gracefully
          console.log('YouTube API not configured - showing placeholder stats');
        }
      } catch (error) {
        console.error('Failed to fetch channel stats:', error);
        // Don't show error to user, just keep loading state or show placeholder
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []); // Empty dependency array - only run on mount

  // Separate effect for setting up refresh interval
  useEffect(() => {
    if (!stats) return; // Don't set up interval until we have stats

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('/api/youtube/channel-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to refresh channel stats:', error);
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, [stats]); // Only run when stats change from null to non-null

  // Calculate estimated watch hours (rough estimate: avg 8 min per view)
  const estimatedWatchHours = stats ? Math.round((stats.viewCount * 8) / 60) : 0;

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  if (loading) {
    return (
      <div className="bg-[hsl(var(--background)/0.3)] border border-muted/30 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-8 bg-muted/30 rounded"></div>
          <div className="w-32 h-6 bg-muted/30 rounded"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="w-16 h-8 bg-muted/30 rounded mx-auto"></div>
              <div className="w-20 h-4 bg-muted/30 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show placeholder when API is not configured
  if (!stats) {
    return (
      <div className="bg-[hsl(var(--background)/0.3)] border border-muted/30 rounded-xl p-4 hover:border-accent/50 transition-colors w-full max-w-lg">
        {/* Compact Header */}
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span className="text-sm font-semibold">YouTube Channel</span>
        </div>

        {/* Placeholder Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-accent">
              --
            </div>
            <div className="text-xs text-foreground/70 font-medium">Subscribers</div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-accent">
              --
            </div>
            <div className="text-xs text-foreground/70 font-medium">Total Views</div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-lg font-bold text-accent">
              --
            </div>
            <div className="text-xs text-foreground/70 font-medium">Watch Hours*</div>
          </div>
        </div>

        {/* Compact Footer note */}
        <div className="text-[10px] text-foreground/50 mt-2 text-center">
          *Configure YouTube API for live stats
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--background)/0.3)] border border-muted/30 rounded-xl p-4 hover:border-accent/50 transition-colors w-full max-w-lg">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span className="text-sm font-semibold">YouTube Channel</span>
        </div>
        <a
          href="https://www.youtube.com/@mayukh_bagchi"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium transition-colors hover:bg-red-600"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Subscribe
        </a>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center space-y-1">
          <div className="text-lg font-bold text-accent">
            {stats ? formatNumber(stats.subscriberCount) : '0'}
          </div>
          <div className="text-xs text-foreground/70 font-medium">Subscribers</div>
        </div>

        <div className="text-center space-y-1">
          <div className="text-lg font-bold text-accent">
            {stats ? formatNumber(stats.viewCount) : '0'}
          </div>
          <div className="text-xs text-foreground/70 font-medium">Total Views</div>
        </div>

        <div className="text-center space-y-1">
          <div className="text-lg font-bold text-accent">
            {formatNumber(estimatedWatchHours)}
          </div>
          <div className="text-xs text-foreground/70 font-medium">Watch Hours*</div>
        </div>
      </div>

      {/* Compact Footer note */}
      <div className="text-[10px] text-foreground/50 mt-2 text-center">
        *Estimated based on average view duration
      </div>
    </div>
  );
}
