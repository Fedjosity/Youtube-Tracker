import { AppLayout } from '@/components/layout/app-layout';
import { SubmissionsTable } from '@/components/submissions/submissions-table';
import { NewSubmissionDialog } from '@/components/submissions/new-submission-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SubmissionsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
            <p className="text-gray-600">Manage your video submissions and track their progress</p>
          </div>
          <NewSubmissionDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Submission
            </Button>
          </NewSubmissionDialog>
        </div>

        <SubmissionsTable />
      </div>
    </AppLayout>
  );
}