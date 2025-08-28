import { AppLayout } from '@/components/layout/app-layout';
import { AnalyticsCharts } from '@/components/analytics/analytics-charts';
import { ContributionShare } from '@/components/analytics/contribution-share';
import { ChannelMetrics } from '@/components/analytics/channel-metrics';

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Detailed insights into your channel's performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContributionShare />
          <ChannelMetrics />
        </div>

        <AnalyticsCharts />
      </div>
    </AppLayout>
  );
}