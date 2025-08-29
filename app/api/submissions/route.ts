import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractVideoId, fetchYouTubeMetadata } from "@/lib/youtube";

const submissionSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    youtube_url: z.string().optional(),
    drive_url: z.string().optional(),
    link_type: z.enum(["youtube", "drive"]),
  })
  .refine(
    (data) => {
      // Ensure at least one URL is provided based on link_type
      if (
        data.link_type === "youtube" &&
        (!data.youtube_url || data.youtube_url.trim() === "")
      ) {
        return false;
      }
      if (
        data.link_type === "drive" &&
        (!data.drive_url || data.drive_url.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "URL is required for the selected link type",
      path: ["youtube_url", "drive_url"],
    }
  )
  .refine(
    (data) => {
      // Validate URL format if provided
      if (data.link_type === "youtube" && data.youtube_url) {
        try {
          new URL(data.youtube_url);
          return true;
        } catch {
          return false;
        }
      }
      if (data.link_type === "drive" && data.drive_url) {
        try {
          new URL(data.drive_url);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Invalid URL format",
      path: ["youtube_url", "drive_url"],
    }
  );

export async function POST(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found. Please contact support." },
        { status: 400 }
      );
    }

    console.log("Profile found:", (profile as any).id);

    const body = await request.json();
    console.log("Request body:", body);

    const validatedData = submissionSchema.parse(body);
    console.log("Validated data:", validatedData);

    let youtubeMetadata = null;
    let youtubeVideoId = null;

    // Fetch YouTube metadata if it's a YouTube submission
    if (validatedData.link_type === "youtube" && validatedData.youtube_url) {
      youtubeVideoId = extractVideoId(validatedData.youtube_url);
      console.log("YouTube video ID:", youtubeVideoId);

      if (youtubeVideoId) {
        try {
          youtubeMetadata = await fetchYouTubeMetadata(youtubeVideoId);
          console.log(
            "YouTube metadata fetched:",
            youtubeMetadata ? "success" : "failed"
          );
        } catch (error) {
          console.error("YouTube metadata fetch error:", error);
          // Continue without metadata
        }
      }
    }

    const submissionData = {
      user_id: user.id,
      title: validatedData.title,
      description: validatedData.description || "",
      youtube_url: validatedData.youtube_url || null,
      drive_url: validatedData.drive_url || null,
      link_type: validatedData.link_type,
      // Set status based on link type: YouTube = published, Drive = draft
      status: validatedData.link_type === "youtube" ? "published" : "draft",
      youtube_video_id: youtubeVideoId,
      youtube_title: youtubeMetadata?.title || null,
      youtube_description: youtubeMetadata?.description || null,
      youtube_thumbnail: youtubeMetadata?.thumbnails?.high?.url || null,
      youtube_published_at: youtubeMetadata?.publishedAt || null,
      youtube_view_count: parseInt(
        youtubeMetadata?.statistics?.viewCount || "0"
      ),
      youtube_like_count: parseInt(
        youtubeMetadata?.statistics?.likeCount || "0"
      ),
      youtube_comment_count: parseInt(
        youtubeMetadata?.statistics?.commentCount || "0"
      ),
      // Set timestamps based on status
      submitted_at: new Date().toISOString(),
      ...(validatedData.link_type === "youtube" && {
        published_at: new Date().toISOString(),
      }),
    };

    console.log("Submitting data:", submissionData);

    const { data: submission, error } = await supabase
      .from("submissions")
      .insert(submissionData)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        {
          error: "Failed to create submission",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("Submission created:", (submission as any).id);

    // Update profile submission count
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        total_submissions: ((profile as any).total_submissions || 0) + 1,
        // Only increment published count for YouTube submissions (published immediately)
        ...(validatedData.link_type === "youtube" && {
          total_published: ((profile as any).total_published || 0) + 1,
        }),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
    }

    // Check for badge awards
    await checkAndAwardBadges(user.id, supabase);

    return NextResponse.json(submission);
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function checkAndAwardBadges(userId: string, supabase: any) {
  try {
    // Get user's current submission count
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_submissions")
      .eq("id", userId)
      .single();

    if (!profile) return;

    // Get available badges that user might qualify for
    const { data: badges } = await supabase
      .from("badges")
      .select("*")
      .lte("threshold", (profile as any).total_submissions);

    if (!badges) return;

    // Get badges user already has
    const { data: userBadges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);

    const earnedBadgeIds = new Set(
      userBadges?.map((ub: any) => ub.badge_id) || []
    );

    // Award new badges
    const newBadges = badges.filter(
      (badge: any) => !earnedBadgeIds.has(badge.id)
    );

    if (newBadges.length > 0) {
      const badgeInserts = newBadges.map((badge: any) => ({
        user_id: userId,
        badge_id: badge.id,
        earned_at: new Date().toISOString(),
      }));

      await supabase.from("user_badges").insert(badgeInserts);
    }
  } catch (error) {
    console.error("Badge award error:", error);
  }
}
