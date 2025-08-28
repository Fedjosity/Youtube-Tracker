import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Not available in production" },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Create test submissions with realistic YouTube data
    const testSubmissions = [
      {
        user_id: user.id,
        title: "How to Build a React App",
        description: "Complete tutorial on building a modern React application",
        youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        link_type: "youtube",
        status: "published",
        youtube_video_id: "dQw4w9WgXcQ",
        youtube_title: "How to Build a React App - Complete Tutorial",
        youtube_description:
          "Learn React from scratch with this comprehensive tutorial",
        youtube_thumbnail:
          "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        youtube_published_at: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        youtube_view_count: 15420,
        youtube_like_count: 892,
        youtube_comment_count: 156,
        submitted_at: new Date(
          Date.now() - 35 * 24 * 60 * 60 * 1000
        ).toISOString(),
        published_at: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        user_id: user.id,
        title: "TypeScript Best Practices",
        description: "Essential TypeScript patterns and practices",
        youtube_url: "https://www.youtube.com/watch?v=example2",
        link_type: "youtube",
        status: "published",
        youtube_video_id: "example2",
        youtube_title: "TypeScript Best Practices for 2024",
        youtube_description: "Master TypeScript with these essential patterns",
        youtube_thumbnail: "https://img.youtube.com/vi/example2/hqdefault.jpg",
        youtube_published_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        youtube_view_count: 8920,
        youtube_like_count: 445,
        youtube_comment_count: 89,
        submitted_at: new Date(
          Date.now() - 18 * 24 * 60 * 60 * 1000
        ).toISOString(),
        published_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        user_id: user.id,
        title: "Next.js 14 Features",
        description: "Exploring the latest Next.js features",
        youtube_url: "https://www.youtube.com/watch?v=example3",
        link_type: "youtube",
        status: "published",
        youtube_video_id: "example3",
        youtube_title: "Next.js 14: What's New and Exciting",
        youtube_description: "Discover the latest features in Next.js 14",
        youtube_thumbnail: "https://img.youtube.com/vi/example3/hqdefault.jpg",
        youtube_published_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        youtube_view_count: 12340,
        youtube_like_count: 678,
        youtube_comment_count: 123,
        submitted_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        published_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        user_id: user.id,
        title: "Supabase Tutorial",
        description: "Building with Supabase backend",
        youtube_url: "https://www.youtube.com/watch?v=example4",
        link_type: "youtube",
        status: "edited",
        submitted_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        user_id: user.id,
        title: "Tailwind CSS Tips",
        description: "Advanced Tailwind CSS techniques",
        youtube_url: "https://www.youtube.com/watch?v=example5",
        link_type: "youtube",
        status: "draft",
        submitted_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .insert(testSubmissions)
      .select();

    if (submissionsError) {
      console.error("Error creating test submissions:", submissionsError);
      return NextResponse.json(
        { error: "Failed to create test submissions" },
        { status: 500 }
      );
    }

    // Update user's profile with submission counts
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        total_submissions: 5,
        total_published: 3,
      })
      .eq("id", user.id);

    if (profileUpdateError) {
      console.error("Error updating profile:", profileUpdateError);
    }

    return NextResponse.json({
      message: "Test data created successfully",
      submissions: submissions?.length || 0,
    });
  } catch (error) {
    console.error("Error creating test data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
