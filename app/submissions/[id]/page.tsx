import { AppLayout } from "@/components/layout/app-layout";
import { SubmissionDetail } from "@/components/submissions/submission-detail";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user and check if they're an admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
  }

  const { data: submission } = await supabase
    .from("submissions")
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url,
        role
      )
    `
    )
    .eq("id", id)
    .single();

  if (!submission) {
    notFound();
  }

  return (
    <AppLayout>
      <SubmissionDetail submission={submission} isAdmin={isAdmin} />
    </AppLayout>
  );
}
