import { AppLayout } from "@/components/layout/app-layout";
import { OverviewTable } from "@/components/overview/overview-table";

export default function OverviewPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Progress Overview
          </h1>
          <p className="text-gray-600">
            Track the teams progress and view all successful submissions
          </p>
        </div>

        <OverviewTable />
      </div>
    </AppLayout>
  );
}
