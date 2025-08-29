import { createClient } from "@/lib/supabase/server";
import { SubmissionDetail } from "@/components/submissions/submission-detail";
import { CommentsSection } from "@/components/submissions/comments-section";
import { StatusTimeline } from "@/components/submissions/status-timeline";
import { redirect } from "next/navigation";

export default async function SubmissionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = (await createClient()) as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Check if user is admin
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = (profile as any)?.role === "admin";
  }

  const { data: submission } = await supabase
    .from("submissions")
    .select(
      `
      *,
      profiles (
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (!submission) {
    redirect("/submissions");
  }

  // Check if user can view this submission (admin or owner)
  if (!isAdmin && submission.user_id !== user.id) {
    redirect("/submissions");
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <SubmissionDetail submission={submission} isAdmin={isAdmin} />
      <StatusTimeline submission={submission} />
      <CommentsSection submissionId={params.id} />
    </div>
  );
}
