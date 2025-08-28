import { AppLayout } from '@/components/layout/app-layout';
import { SubmissionDetail } from '@/components/submissions/submission-detail';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        role
      )
    `)
    .eq('id', id)
    .single();

  if (!submission) {
    notFound();
  }

  return (
    <AppLayout>
      <SubmissionDetail submission={submission} />
    </AppLayout>
  );
}