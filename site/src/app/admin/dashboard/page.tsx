'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface VideoPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  needs_review?: boolean;
  auto_published?: boolean;
  created_at: string;
  updated_at: string;
  youtube_id?: string;
  processing_status?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      setError(null);
      const response = await fetch('/api/admin/posts');
      if (!response.ok) {
        if (response.status === 503) {
          const result = await response.json();
          if (result.needsSetup) {
            setError('database_setup_required');
            return;
          }
        }
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const response = await fetch('/api/youtube/sync', { method: 'POST' });
      if (response.ok) {
        await fetchPosts();
        alert('Sync completed successfully!');
      } else {
        alert('Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/admin/login');
      } else {
        alert('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed');
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filter === 'needs-review') return post.needs_review;
    if (filter === 'auto-published') return post.auto_published;
    if (filter === 'drafts') return post.status === 'draft';
    return true;
  });

  if (error === 'database_setup_required') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold text-yellow-400">Database Setup Required</h2>
          <p className="text-foreground/80">
            The video_posts table needs to be created in your Supabase database.
          </p>
          <div className="bg-background/50 rounded border p-4 font-mono text-sm text-left">
            <p className="mb-2 font-semibold">Run this SQL in your Supabase SQL editor:</p>
            <pre className="whitespace-pre-wrap">{`CREATE TABLE IF NOT EXISTS public.video_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id TEXT UNIQUE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  needs_review BOOLEAN DEFAULT false,
  auto_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.video_posts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read for published posts
DROP POLICY IF EXISTS "Allow anonymous read for published posts" ON public.video_posts;
CREATE POLICY "Allow anonymous read for published posts" ON public.video_posts
  FOR SELECT USING (status = 'published');`}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-accent text-background px-4 py-2 rounded font-medium hover:bg-accent/90"
          >
            Refresh After Setup
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="mt-10">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync All'}
          </button>
          <Link 
            href="/admin/import" 
            className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700"
          >
            Import Videos
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Posts' },
          { key: 'needs-review', label: 'Needs Review' },
          { key: 'auto-published', label: 'Auto Published' },
          { key: 'drafts', label: 'Drafts' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded text-sm ${
              filter === key
                ? 'bg-accent text-background'
                : 'bg-muted/20 text-foreground hover:bg-muted/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {error && error !== 'database_setup_required' && (
        <div className="bg-red-500/20 border border-red-500/30 rounded p-3 text-red-400">
          {error}
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className="text-center py-10 text-foreground/60">
          No posts found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/posts/${post.id}`}
              className="block p-4 rounded border border-muted/40 hover:border-accent/50 bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{post.title}</div>
                  <div className="text-sm text-foreground/60">/{post.slug}</div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {post.needs_review && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      Needs Review
                    </span>
                  )}
                  {post.auto_published && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                      Auto Published
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded ${
                    post.status === 'published' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
