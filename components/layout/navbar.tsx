"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  LogOut,
  Settings,
  User as UserIcon,
  Menu,
  Home,
  FileText,
  Trophy,
  BarChart3,
  Users,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user: User;
  profile: any;
}

export function Navbar({ user, profile }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Submissions", href: "/submissions", icon: FileText },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const adminNavigation = [
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Review Queue", href: "/admin/review", icon: CheckSquare },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="border-b pb-4">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.full_name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {profile?.role}
                    </p>
                  </div>

                  <nav className="space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    ))}

                    {profile?.role === "admin" && (
                      <>
                        <div className="border-t pt-4 mt-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                            Admin
                          </p>
                          {adminNavigation.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </nav>

                  <div className="border-t pt-4 mt-auto">
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              YouTube Tracker
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={profile?.avatar_url}
                      alt={profile?.full_name}
                    />
                    <AvatarFallback>
                      {profile?.full_name?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {profile?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
