import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all profiles with their counts
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, total_submissions, total_published");

    if (profilesError) {
      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 }
      );
    }

    // Get actual submission counts for each user
    const debugData = await Promise.all(
      profiles.map(async (profile) => {
        const { count: actualSubmissions } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.id);

        const { count: actualPublished } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.id)
          .eq("status", "published");

        return {
          user_id: profile.id,
          full_name: profile.full_name,
          stored_total_submissions: profile.total_submissions,
          stored_total_published: profile.total_published,
          actual_total_submissions: actualSubmissions || 0,
          actual_total_published: actualPublished || 0,
          submissions_match:
            profile.total_submissions === (actualSubmissions || 0),
          published_match: profile.total_published === (actualPublished || 0),
        };
      })
    );

    return NextResponse.json({
      debug_data: debugData,
      summary: {
        total_users: profiles.length,
        users_with_mismatched_submissions: debugData.filter(
          (d) => !d.submissions_match
        ).length,
        users_with_mismatched_published: debugData.filter(
          (d) => !d.published_match
        ).length,
      },
    });
  } catch (error) {
    console.error("Error in debug-profile-counts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
