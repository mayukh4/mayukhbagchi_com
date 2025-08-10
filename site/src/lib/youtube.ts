import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';

const youtube = google.youtube('v3');

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount: string;
}

export interface ChannelStats {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
}

export function getYouTubeAPI() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY environment variable is required');
  }
  return apiKey;
}

export async function getChannelStats(channelId: string): Promise<ChannelStats> {
  const apiKey = getYouTubeAPI();
  
  const response = await youtube.channels.list({
    key: apiKey,
    part: ['statistics'],
    id: [channelId],
  });

  const channel = response.data.items?.[0];
  if (!channel?.statistics) {
    throw new Error('Channel not found or no statistics available');
  }

  return {
    subscriberCount: channel.statistics.subscriberCount || '0',
    viewCount: channel.statistics.viewCount || '0',
    videoCount: channel.statistics.videoCount || '0',
  };
}

export async function getChannelVideos(
  channelId: string,
  maxResults: number = 50,
  publishedAfter?: string
): Promise<YouTubeVideo[]> {
  const apiKey = getYouTubeAPI();

  // First, get the channel's uploads playlist ID
  const channelResponse = await youtube.channels.list({
    key: apiKey,
    part: ['contentDetails'],
    id: [channelId],
  });

  const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error('Could not find uploads playlist for channel');
  }

  // Get videos from the uploads playlist
  const playlistResponse = await youtube.playlistItems.list({
    key: apiKey,
    part: ['snippet'],
    playlistId: uploadsPlaylistId,
    maxResults,
    publishedAfter,
  });

  if (!playlistResponse.data.items) {
    return [];
  }

  // Get detailed video information
  const videoIds = playlistResponse.data.items
    .map(item => item.snippet?.resourceId?.videoId)
    .filter(Boolean) as string[];

  if (videoIds.length === 0) {
    return [];
  }

  const videosResponse = await youtube.videos.list({
    key: apiKey,
    part: ['snippet', 'statistics', 'contentDetails'],
    id: videoIds,
  });

  return (videosResponse.data.items || []).map(video => ({
    id: video.id!,
    title: video.snippet?.title || '',
    description: video.snippet?.description || '',
    thumbnail: video.snippet?.thumbnails?.maxres?.url || 
               video.snippet?.thumbnails?.high?.url || 
               video.snippet?.thumbnails?.medium?.url || '',
    publishedAt: video.snippet?.publishedAt || '',
    duration: video.contentDetails?.duration || '',
    viewCount: video.statistics?.viewCount || '0',
    likeCount: video.statistics?.likeCount || '0',
  }));
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideo> {
  const apiKey = getYouTubeAPI();

  const response = await youtube.videos.list({
    key: apiKey,
    part: ['snippet', 'statistics', 'contentDetails'],
    id: [videoId],
  });

  const video = response.data.items?.[0];
  if (!video) {
    throw new Error(`Video with ID ${videoId} not found`);
  }

  return {
    id: video.id!,
    title: video.snippet?.title || '',
    description: video.snippet?.description || '',
    thumbnail: video.snippet?.thumbnails?.maxres?.url || 
               video.snippet?.thumbnails?.high?.url || 
               video.snippet?.thumbnails?.medium?.url || '',
    publishedAt: video.snippet?.publishedAt || '',
    duration: video.contentDetails?.duration || '',
    viewCount: video.statistics?.viewCount || '0',
    likeCount: video.statistics?.likeCount || '0',
  };
}

export async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map(item => item.text).join(' ');
  } catch (error) {
    console.warn(`Could not fetch transcript for video ${videoId}:`, error);
    return '';
  }
}

export function createSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 60); // Limit length
}

export function parseDuration(duration: string): number {
  // Parse ISO 8601 duration (e.g., PT4M13S) to seconds
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount);
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  }
  return `${count} views`;
}
