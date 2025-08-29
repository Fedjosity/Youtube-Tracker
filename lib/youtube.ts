export interface YouTubeVideoData {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  publishedAt: string;
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    // Regular YouTube watch URLs
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    // YouTube live URLs
    /youtube\.com\/live\/([^&\n?#]+)/,
    // YouTube shorts URLs
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    // Direct video ID (11 characters)
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export async function fetchYouTubeMetadata(
  videoId: string
): Promise<YouTubeVideoData | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("YouTube API key not configured - skipping metadata fetch");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${apiKey}`
    );

    if (!response.ok) {
      console.error(
        `YouTube API error: ${response.status} - ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.warn(`No video found for ID: ${videoId}`);
      return null;
    }

    const video = data.items[0];

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnails: video.snippet.thumbnails,
      publishedAt: video.snippet.publishedAt,
      statistics: {
        viewCount: video.statistics?.viewCount || "0",
        likeCount: video.statistics?.likeCount || "0",
        commentCount: video.statistics?.commentCount || "0",
      },
    };
  } catch (error) {
    console.error("Error fetching YouTube metadata:", error);
    return null;
  }
}
