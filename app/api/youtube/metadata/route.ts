import { NextRequest, NextResponse } from 'next/server';
import { fetchYouTubeMetadata } from '@/lib/youtube';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    const metadata = await fetchYouTubeMetadata(videoId);

    if (!metadata) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Failed to fetch video metadata' }, { status: 500 });
  }
}