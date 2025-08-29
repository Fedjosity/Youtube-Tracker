import { getProfile, requireAuth } from "@/lib/auth";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} profile={profile} />
      <div className="flex">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <Sidebar isAdmin={(profile as any)?.role === "admin"} />
        </div>
        {/* Main content - full width on mobile, adjusted on desktop */}
        <main className="flex-1 p-4 md:p-6 w-full md:ml-0">{children}</main>
      </div>
    </div>
  );
}
