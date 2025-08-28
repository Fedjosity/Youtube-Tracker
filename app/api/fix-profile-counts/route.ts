import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

    // Parse request body to check if we're fixing a specific user
    const body = await request.json().catch(() => ({}));
    const { userId } = body;

    let result;
    if (userId) {
      // Fix counts for specific user
      const { error } = await supabase.rpc("recalculate_user_profile_counts", {
        user_uuid: userId,
      });

      if (error) {
        console.error("Error recalculating user profile counts:", error);
        return NextResponse.json(
          { error: "Failed to recalculate user profile counts" },
          { status: 500 }
        );
      }

      result = { message: `Profile counts recalculated for user ${userId}` };
    } else {
      // Fix counts for all users
      const { error } = await supabase.rpc("recalculate_all_profile_counts");

      if (error) {
        console.error("Error recalculating profile counts:", error);
        return NextResponse.json(
          { error: "Failed to recalculate profile counts" },
          { status: 500 }
        );
      }

      result = { message: "Profile counts recalculated for all users" };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in fix-profile-counts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
