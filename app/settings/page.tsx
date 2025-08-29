import { AppLayout } from "@/components/layout/app-layout";
import { ProfileForm } from "@/components/profile/profile-form";
import { AccountSettingsForm } from "@/components/profile/account-settings-form";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your profile and account security
          </p>
        </div>

        <ProfileForm />
        <AccountSettingsForm />
      </div>
    </AppLayout>
  );
}
