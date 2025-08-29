import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;
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

    if (!profile || (profile as any).role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { count = 10 } = body;

    const testSubmissions = [];

    for (let i = 1; i <= count; i++) {
      const submission = {
        user_id: user.id,
        title: `Test Submission ${i}`,
        description: `This is a test submission number ${i}`,
        youtube_url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
        drive_url: null,
        link_type: "youtube" as const,
        status: "published" as const,
        youtube_video_id: "dQw4w9WgXcQ",
        youtube_title: `Test Video ${i}`,
        youtube_description: `Test video description ${i}`,
        youtube_thumbnail:
          "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        youtube_published_at: new Date().toISOString(),
        youtube_view_count: Math.floor(Math.random() * 10000),
        youtube_like_count: Math.floor(Math.random() * 1000),
        youtube_comment_count: Math.floor(Math.random() * 100),
        submitted_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      };

      const { data: createdSubmission, error } = await supabase
        .from("submissions")
        .insert(submission)
        .select()
        .single();

      if (error) {
        console.error(`Error creating test submission ${i}:`, error);
      } else {
        testSubmissions.push(createdSubmission);
      }
    }

    // Update profile counts
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("total_submissions, total_published")
      .eq("id", user.id)
      .single();

    if (currentProfile) {
      await supabase
        .from("profiles")
        .update({
          total_submissions:
            ((currentProfile as any).total_submissions || 0) + count,
          total_published:
            ((currentProfile as any).total_published || 0) + count,
        })
        .eq("id", user.id);
    }

    return NextResponse.json({
      message: `Created ${testSubmissions.length} test submissions`,
      submissions: testSubmissions,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
