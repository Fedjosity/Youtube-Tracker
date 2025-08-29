import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const updateSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(["published", "rejected", "uploaded"]),
  timestamp: z.string(),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { submissionId, status, timestamp } = updateSchema.parse(body);

    // Get current submission data for audit log
    const { data: currentSubmission } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    // Update submission status
    const updateData: any = { status };

    if (status === "published") updateData.published_at = timestamp;
    if (status === "rejected") updateData.rejected_at = timestamp;
    if (status === "uploaded") updateData.uploaded_at = timestamp;

    // Update submission
    const { data: updatedSubmission, error } = await supabase
      .from("submissions")
      .update(updateData)
      .eq("id", submissionId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update submission" },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: `status_update_${status}`,
      target_type: "submission",
      target_id: submissionId,
      old_values: { status: currentSubmission?.status },
      new_values: { status },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
