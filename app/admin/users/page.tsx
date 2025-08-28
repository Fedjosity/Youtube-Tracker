import { AppLayout } from '@/components/layout/app-layout';
import { requireAdmin } from '@/lib/auth';
import { UsersTable } from '@/components/admin/users-table';

export default async function AdminUsersPage() {
  await requireAdmin();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>

        <UsersTable />
      </div>
    </AppLayout>
  );
}