import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all profiles with their submission counts
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("total_submissions", { ascending: false });

    if (!profiles) {
      return NextResponse.json({ error: "No profiles found" }, { status: 404 });
    }

    const results = [];

    for (const profile of profiles) {
      // Get actual submission count
      const { count: actualSubmissions } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);

      // Get actual published count
      const { count: actualPublished } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("status", "published");

      // Update profile counts if they don't match
      if (
        profile.total_submissions !== (actualSubmissions || 0) ||
        profile.total_published !== (actualPublished || 0)
      ) {
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .update({
            total_submissions: actualSubmissions || 0,
            total_published: actualPublished || 0,
          })
          .eq("id", profile.id)
          .select()
          .single();

        results.push({
          user_id: profile.id,
          full_name: profile.full_name,
          stored_total_submissions: profile.total_submissions,
          stored_total_published: profile.total_published,
          actual_total_submissions: actualSubmissions || 0,
          actual_total_published: actualPublished || 0,
          submissions_match:
            profile.total_submissions === (actualSubmissions || 0),
          published_match: profile.total_published === (actualPublished || 0),
          updated: true,
        });
      }
    }

    return NextResponse.json({
      message: "Profile counts debugged and updated",
      results,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
