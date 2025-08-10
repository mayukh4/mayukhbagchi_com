"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface VideoPost {
  id: string;
  youtube_id: string;
  title: string;
  slug: string;
  summary: string;
  hero_image: string;
  content_md: string;
  tags: string[];
  status: 'draft' | 'published';
  auto_published: boolean;
  needs_review: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  youtube_title?: string;
  youtube_description?: string;
  processing_status?: string;
}

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<VideoPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'youtube'>('content');

  useEffect(() => {
    fetch(`/api/admin/posts/${id}`)
      .then(r => r.json())
      .then(setPost)
      .catch(error => {
        console.error('Error fetching post:', error);
        if (error.status === 401) {
          router.push('/admin/login');
        }
      });
  }, [id, router]);

  async function save(status?: 'published' | 'draft') {
    if (!post) return;
    
    setSaving(true);
    try {
      // Guard: require slug before publishing
      if (status === 'published' && !post.slug) {
        alert('Please set a slug before publishing.');
        setSaving(false);
        return;
      }
      const cleanSlug = (post.slug || '').trim();
      const updatedPost = { 
        ...post, 
        slug: cleanSlug,
        status: status || post.status,
        published_at: status === 'published' ? new Date().toISOString() : post.published_at,
        needs_review: false
      };
      
      await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updatedPost)
      });
      
      setPost(updatedPost);
      
      if (status === 'published') {
        if (!updatedPost.slug) {
          alert('Please set a slug before publishing.');
        } else {
          router.push(`/blogs/${encodeURIComponent(updatedPost.slug)}`);
        }
      } else {
        alert('Post saved successfully!');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving post');
    } finally {
      setSaving(false);
    }
  }

  async function revertToDraft() {
    if (!post || post.status !== 'published') return;
    
    const updatedPost = { 
      ...post, 
      status: 'draft' as const,
      needs_review: false
    };
    
    setPost(updatedPost);
    
    try {
      await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(updatedPost)
      });
      alert('Post reverted to draft');
    } catch (error) {
      console.error('Error reverting to draft:', error);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !post) return;

    setUploading(true);
    try {
      // Convert to base64 data URL for now (you can enhance this to use a proper image service)
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPost({ ...post, hero_image: dataUrl });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  }

  async function handleContentImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !post) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      
      // Insert markdown image syntax at the end of content
      const imageMarkdown = `\n\n![${file.name.split('.')[0]}](${result.url})\n\n`;
      setPost({ 
        ...post, 
        content_md: (post.content_md || '') + imageMarkdown 
      });

      // Reset file input
      e.target.value = '';
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
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

  if (!post) return <div className="mt-10">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Link 
            href="/admin/dashboard" 
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors text-sm"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-semibold">Edit Post</h1>
        </div>
        <div className="flex items-center gap-3">
          {post.needs_review && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Needs Review</span>
          )}
          {post.auto_published && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Auto Published</span>
          )}
          <span className={`px-2 py-1 text-xs rounded ${
            post.status === 'published' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {post.status}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          disabled={saving}
          onClick={() => save()}
          className="rounded px-4 py-2 border border-muted/40 hover:bg-muted/20"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          disabled={saving}
          onClick={() => save('published')}
          className="rounded px-4 py-2 border border-accent text-accent hover:bg-accent/10"
        >
          Publish
        </button>
        {post.status === 'published' && (
          <button
            onClick={revertToDraft}
            className="px-4 py-2 border border-yellow-500 text-yellow-400 rounded hover:bg-yellow-500/10"
          >
            Revert to Draft
          </button>
        )}
        {post.slug && (
          <a
            href={`/blogs/${encodeURIComponent(post.slug.trim())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-muted/40 rounded hover:bg-muted/20"
          >
            View Live
          </a>
        )}
      </div>

      <div className="border-b border-muted/30">
        <nav className="flex space-x-8">
          {(['content', 'seo', 'youtube'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-accent text-accent'
                  : 'border-transparent text-foreground/70 hover:text-foreground/90'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {activeTab === 'content' && (
            <>
              <label className="space-y-1">
                <span className="text-sm font-medium">Title</span>
                <input
                  className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2"
                  value={post.title || ''}
                  onChange={e => setPost({ ...post, title: e.target.value })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Slug</span>
                <input
                  className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2"
                  value={post.slug || ''}
                  onChange={e => setPost({ ...post, slug: e.target.value })}
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">Hero Image</span>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-accent file:text-background"
                  />
                  <input
                    type="text"
                    placeholder="Or paste image URL"
                    className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2"
                    value={post.hero_image || ''}
                    onChange={e => setPost({ ...post, hero_image: e.target.value })}
                  />
                  {post.hero_image && (
                    <div className="relative">
                      <img 
                        src={post.hero_image} 
                        alt="Hero preview" 
                        className="w-full max-w-md h-32 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setPost({ ...post, hero_image: '' })}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Tags (comma separated)</span>
                <input
                  className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2"
                  value={post.tags?.join(', ') || ''}
                  onChange={e => setPost({ ...post, tags: e.target.value.split(',').map(t => t.trim()) })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Content (Markdown)</span>
                <div className="space-y-2">
                  {/* Image Upload Toolbar */}
                  <div className="flex items-center gap-2 p-2 bg-muted/20 rounded border">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleContentImageUpload}
                      className="hidden"
                      id="content-image-upload"
                    />
                    <label
                      htmlFor="content-image-upload"
                      className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-background rounded text-sm cursor-pointer hover:bg-accent/90"
                    >
                      📷 Add Image
                    </label>
                    {uploading && <span className="text-sm text-foreground/60">Uploading...</span>}
                  </div>
                  <textarea
                    className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2 min-h-[40vh] font-mono text-sm"
                    value={post.content_md || ''}
                    onChange={e => setPost({ ...post, content_md: e.target.value })}
                  />
                </div>
              </label>
            </>
          )}

          {activeTab === 'seo' && (
            <>
              <label className="space-y-1">
                <span className="text-sm font-medium">SEO Title</span>
                <input
                  className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2"
                  value={post.seo_title || ''}
                  onChange={e => setPost({ ...post, seo_title: e.target.value })}
                />
                <p className="text-xs text-foreground/60">Recommended: 50-60 characters</p>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">SEO Description</span>
                <textarea
                  className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2 h-20"
                  value={post.seo_description || ''}
                  onChange={e => setPost({ ...post, seo_description: e.target.value })}
                />
                <p className="text-xs text-foreground/60">Recommended: 150-160 characters</p>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Keywords (comma separated)</span>
                <input
                  className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2"
                  value={post.seo_keywords?.join(', ') || ''}
                  onChange={e => setPost({ ...post, seo_keywords: e.target.value.split(',').map(k => k.trim()) })}
                />
              </label>
            </>
          )}

          {activeTab === 'youtube' && (
            <>
              <label className="space-y-1">
                <span className="text-sm font-medium">YouTube ID</span>
                <input
                  className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2"
                  value={post.youtube_id || ''}
                  onChange={e => setPost({ ...post, youtube_id: e.target.value })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">YouTube Title</span>
                <input
                  className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2"
                  value={post.youtube_title || ''}
                  readOnly
                />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">YouTube Description</span>
                <textarea
                  className="w-full rounded border border-muted/40 bg-background/50 px-3 py-2 h-32"
                  value={post.youtube_description || ''}
                  readOnly
                />
              </label>
              <div>
                <span className="text-sm font-medium">Processing Status</span>
                <div className="mt-1">
                  <span className={`px-2 py-1 text-xs rounded ${
                    post.processing_status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    post.processing_status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                    post.processing_status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {post.processing_status || 'pending'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Preview</h3>
          <div className="border border-muted/30 rounded-lg p-4 space-y-4">
            {post.hero_image && (
              <img 
                src={post.hero_image} 
                alt={post.title} 
                className="w-full h-48 object-cover rounded"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{post.title || 'Untitled'}</h2>
              {post.summary && (
                <p className="text-foreground/70 mt-2">{post.summary}</p>
              )}
            </div>
            {post.youtube_id && (
              <div className="aspect-video w-full rounded overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${post.youtube_id}`}
                  title={post.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {post.content_md && (
              <div className="prose prose-invert max-w-none text-sm">
                <div dangerouslySetInnerHTML={{
                  __html: post.content_md
                    .replace(/^###\s(.+)$/gm, '<h3>$1</h3>')
                    .replace(/^##\s(.+)$/gm, '<h2>$1</h2>')
                    .replace(/^#\s(.+)$/gm, '<h1>$1</h1>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>')
                    .replace(/\n\n/g, '<br/><br/>')
                }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}