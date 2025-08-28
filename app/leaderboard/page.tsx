import { AppLayout } from '@/components/layout/app-layout';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { TopContributors } from '@/components/leaderboard/top-contributors';

export default function LeaderboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600">See how you rank among your fellow contributors</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LeaderboardTable />
          </div>
          <div>
            <TopContributors />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}