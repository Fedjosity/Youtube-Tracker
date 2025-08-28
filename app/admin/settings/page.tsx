import { AppLayout } from "@/components/layout/app-layout";
import { SystemSettingsForm } from "@/components/admin/system-settings-form";

export default function AdminSettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">
            Configure platform settings and defaults
          </p>
        </div>

        <SystemSettingsForm />
      </div>
    </AppLayout>
  );
}
