import { supabaseAnon } from '@/lib/supabase';

interface ChannelStats {
  subscribers: number;
  total_views: number;
  video_count: number;
  date: string;
}

export default async function ChannelStats() {
  const sb = supabaseAnon();
  
  // Get latest stats
  const { data: latestStats } = await sb
    .from('channel_stats')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  // Get historical data for sparkline (last 30 days)
  const { data: historicalStats } = await sb
    .from('channel_stats')
    .select('subscribers,total_views,date')
    .order('date', { ascending: false })
    .limit(30);

  if (!latestStats) {
    return null; // No stats available yet
  }

  const subscriberGrowth = calculateGrowthPercentage(historicalStats, 'subscribers');
  const viewGrowth = calculateGrowthPercentage(historicalStats, 'total_views');

  return (
    <section className="bg-[hsl(var(--background)/0.3)] border border-muted/30 rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-6">Channel Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Subscribers */}
        <div className="space-y-2">
          <div className="text-sm text-foreground/70">Subscribers</div>
          <div className="text-2xl font-semibold">
            {formatNumber(latestStats.subscribers)}
          </div>
          {subscriberGrowth !== null && (
            <div className={`text-xs flex items-center gap-1 ${
              subscriberGrowth >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {subscriberGrowth >= 0 ? '↗' : '↘'}
              {Math.abs(subscriberGrowth)}% this month
            </div>
          )}
          <div className="h-8">
            <Sparkline 
              data={historicalStats?.map(s => s.subscribers) || []} 
              color="rgb(34, 197, 94)" 
            />
          </div>
        </div>

        {/* Total Views */}
        <div className="space-y-2">
          <div className="text-sm text-foreground/70">Total Views</div>
          <div className="text-2xl font-semibold">
            {formatNumber(latestStats.total_views)}
          </div>
          {viewGrowth !== null && (
            <div className={`text-xs flex items-center gap-1 ${
              viewGrowth >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {viewGrowth >= 0 ? '↗' : '↘'}
              {Math.abs(viewGrowth)}% this month
            </div>
          )}
          <div className="h-8">
            <Sparkline 
              data={historicalStats?.map(s => s.total_views) || []} 
              color="rgb(59, 130, 246)" 
            />
          </div>
        </div>

        {/* Video Count */}
        <div className="space-y-2">
          <div className="text-sm text-foreground/70">Videos</div>
          <div className="text-2xl font-semibold">
            {latestStats.video_count}
          </div>
          <div className="text-xs text-foreground/60">
            Updated {new Date(latestStats.date).toLocaleDateString()}
          </div>
          <div className="h-8 flex items-center">
            <div className="w-full bg-muted/30 rounded-full h-1">
              <div 
                className="bg-accent h-1 rounded-full"
                style={{ width: `${Math.min((latestStats.video_count / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) {
    return <div className="h-full bg-muted/10 rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  if (range === 0) {
    return <div className="h-full bg-muted/10 rounded" />;
  }

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function calculateGrowthPercentage(
  historicalData: ChannelStats[] | null, 
  field: 'subscribers' | 'total_views'
): number | null {
  if (!historicalData || historicalData.length < 2) {
    return null;
  }

  const current = historicalData[0][field];
  const previous = historicalData[historicalData.length - 1][field];
  
  if (previous === 0) return null;
  
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
}
