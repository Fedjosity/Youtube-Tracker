import { AppLayout } from "@/components/layout/app-layout";
import { ProfileForm } from "@/components/profile/profile-form";

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and profile information
          </p>
        </div>

        <ProfileForm />
      </div>
    </AppLayout>
  );
}
