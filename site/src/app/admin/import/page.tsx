"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
}

export default function ImportVideos() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [importProgress, setImportProgress] = useState<{ [key: string]: 'pending' | 'processing' | 'completed' | 'failed' }>({});
  const router = useRouter();

  useEffect(() => {
    fetchAvailableVideos();
  }, []);

  async function fetchAvailableVideos() {
    setLoading(true);
    try {
      const res = await fetch('/api/youtube/available');
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      } else if (res.status === 401) {
        router.push('/admin/login');
      } else {
        throw new Error('Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      alert('Failed to fetch videos. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  function toggleVideo(videoId: string) {
    const newSelection = new Set(selectedVideos);
    if (newSelection.has(videoId)) {
      newSelection.delete(videoId);
    } else {
      newSelection.add(videoId);
    }
    setSelectedVideos(newSelection);
  }

  function selectAll() {
    setSelectedVideos(new Set(videos.map(v => v.id)));
  }

  function clearSelection() {
    setSelectedVideos(new Set());
  }

  async function importSelectedVideos() {
    if (selectedVideos.size === 0) {
      alert('Please select at least one video to import');
      return;
    }

    setImporting(true);
    const progress: { [key: string]: 'pending' | 'processing' | 'completed' | 'failed' } = {};
    
    // Initialize progress
    selectedVideos.forEach(videoId => {
      progress[videoId] = 'pending';
    });
    setImportProgress(progress);

    // Process videos one by one to avoid overwhelming the AI
    for (const videoId of Array.from(selectedVideos)) {
      try {
        progress[videoId] = 'processing';
        setImportProgress({ ...progress });

        const res = await fetch('/api/youtube/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId })
        });

        if (res.ok) {
          progress[videoId] = 'completed';
        } else {
          progress[videoId] = 'failed';
        }
      } catch (error) {
        console.error(`Error importing video ${videoId}:`, error);
        progress[videoId] = 'failed';
      }
      
      setImportProgress({ ...progress });
      
      // Add delay between imports to avoid rate limiting
      if (Array.from(selectedVideos).indexOf(videoId) < selectedVideos.size - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setImporting(false);
    
    // Refresh the video list to remove imported videos
    await fetchAvailableVideos();
    setSelectedVideos(new Set());
    setImportProgress({});
    
    alert('Import completed! Check the admin dashboard to review imported posts.');
  }

  function formatDuration(duration: string): string {
    // Simple duration formatting for PT format
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function formatViews(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link 
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-semibold">Import YouTube Videos</h1>
          <p className="text-foreground/70 mt-2">
            Select videos to convert into SEO-optimized blog posts. Each video will be processed individually with AI-generated content.
          </p>
        </div>
        <button
          onClick={fetchAvailableVideos}
          disabled={loading}
          className="px-4 py-2 border border-muted/40 rounded hover:bg-muted/20 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {videos.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
          <div className="text-sm">
            {selectedVideos.size} of {videos.length} videos selected
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1 text-sm border border-muted/40 rounded hover:bg-muted/20"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-sm border border-muted/40 rounded hover:bg-muted/20"
            >
              Clear
            </button>
            <button
              onClick={importSelectedVideos}
              disabled={importing || selectedVideos.size === 0}
              className="px-4 py-1 text-sm bg-accent text-background rounded hover:bg-accent/90 disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import Selected (${selectedVideos.size})`}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Loading available videos...</div>
          <div className="text-sm text-foreground/70 mt-2">This may take a moment</div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg mb-4">No videos available for import</div>
          <div className="text-sm text-foreground/70">
            All your YouTube videos have already been imported, or there was an error fetching them.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className={`border rounded-lg overflow-hidden transition-all ${
                selectedVideos.has(video.id)
                  ? 'border-accent bg-accent/10'
                  : 'border-muted/30 hover:border-muted/50'
              } ${importProgress[video.id] ? 'opacity-75' : ''}`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
                
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedVideos.has(video.id)}
                    onChange={() => toggleVideo(video.id)}
                    disabled={importing}
                    className="w-4 h-4 accent-accent"
                  />
                </div>

                {/* Import Status */}
                {importProgress[video.id] && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className={`px-3 py-1 rounded text-sm font-medium ${
                      importProgress[video.id] === 'processing' ? 'bg-yellow-500 text-black' :
                      importProgress[video.id] === 'completed' ? 'bg-green-500 text-white' :
                      importProgress[video.id] === 'failed' ? 'bg-red-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {importProgress[video.id] === 'processing' ? 'Processing...' :
                       importProgress[video.id] === 'completed' ? 'Completed' :
                       importProgress[video.id] === 'failed' ? 'Failed' :
                       'Pending'}
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <h3 className="font-medium line-clamp-2 text-sm">
                  {video.title}
                </h3>
                <div className="text-xs text-foreground/60 space-y-1">
                  <div>{formatViews(video.viewCount)}</div>
                  <div>{new Date(video.publishedAt).toLocaleDateString()}</div>
                </div>
                {video.description && (
                  <p className="text-xs text-foreground/70 line-clamp-2">
                    {video.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {importing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-muted/30 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Importing Videos</h3>
            <div className="space-y-2">
              {Array.from(selectedVideos).map(videoId => {
                const video = videos.find(v => v.id === videoId);
                const status = importProgress[videoId] || 'pending';
                return (
                  <div key={videoId} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1 mr-2">
                      {video?.title || videoId}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                      status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center text-sm text-foreground/70">
              Please wait while videos are being processed...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
