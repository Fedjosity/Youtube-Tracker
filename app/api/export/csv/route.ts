import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

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

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let csvData: any[] = [];

    if (type === "users") {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      csvData =
        data?.map((user: any) => ({
          "Full Name": user.full_name || "N/A",
          Email: user.email,
          Role: user.role,
          "Total Submissions": user.total_submissions,
          "Total Published": user.total_published,
          "Joined Date": new Date(user.created_at).toLocaleDateString(),
        })) || [];
    } else if (type === "submissions") {
      const { data } = await supabase
        .from("submissions")
        .select(
          `
          *,
          profiles (
            full_name,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      csvData =
        data?.map((submission: any) => ({
          Title: submission.title,
          Status: submission.status,
          Type: submission.link_type,
          Submitter:
            submission.profiles?.full_name ||
            submission.profiles?.email ||
            "Unknown",
          Views: submission.youtube_view_count || 0,
          Likes: submission.youtube_like_count || 0,
          Created: new Date(submission.created_at).toLocaleDateString(),
          Published: submission.published_at
            ? new Date(submission.published_at).toLocaleDateString()
            : "N/A",
        })) || [];
    } else {
      return NextResponse.json(
        { error: "Invalid export type" },
        { status: 400 }
      );
    }

    const csv = Papa.unparse(csvData);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}-export-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
