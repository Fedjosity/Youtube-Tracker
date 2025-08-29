"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Home,
  Trophy,
  Users,
  Settings,
  CheckSquare,
  User,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Overview", href: "/overview", icon: Eye },
    { name: "Submissions", href: "/submissions", icon: FileText },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const adminNavigation = [
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Review Queue", href: "/admin/review", icon: CheckSquare },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                pathname.startsWith(item.href)
                  ? "bg-blue-50 border-r-2 border-blue-600 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50",
                "group flex items-center px-2 py-2 text-sm font-medium rounded-l-md transition-colors"
              )}
            >
              <item.icon
                className={cn(
                  pathname.startsWith(item.href)
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-gray-700",
                  "mr-3 h-5 w-5 transition-colors"
                )}
              />
              {item.name}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="border-t border-gray-200 mt-6 pt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-3">
                  Admin
                </p>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      pathname.startsWith(item.href)
                        ? "bg-red-50 border-r-2 border-red-600 text-red-700"
                        : "text-gray-700 hover:bg-gray-50",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-l-md transition-colors"
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname.startsWith(item.href)
                          ? "text-red-600"
                          : "text-gray-500 group-hover:text-gray-700",
                        "mr-3 h-5 w-5 transition-colors"
                      )}
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>
      </div>
    </div>
  );
}
