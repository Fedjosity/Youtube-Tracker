import { AppLayout } from "@/components/layout/app-layout";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  await requireAuth(); // This will redirect to "/" if not authenticated

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Track your team's YouTube collaboration progress
          </p>
        </div>
        <DashboardStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeeklyChart />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
