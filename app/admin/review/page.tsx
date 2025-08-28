import { AppLayout } from '@/components/layout/app-layout';
import { requireAdmin } from '@/lib/auth';
import { ReviewQueue } from '@/components/admin/review-queue';

export default async function AdminReviewPage() {
  await requireAdmin();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Queue</h1>
          <p className="text-gray-600">Review and approve submissions from your team</p>
        </div>

        <ReviewQueue />
      </div>
    </AppLayout>
  );
}