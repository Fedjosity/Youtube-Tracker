// middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Create initial response
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Initialize Supabase client with SSR cookie management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Get session from cookies (handles refresh)
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  // Session retrieved successfully

  // Define protected paths
  const protectedPaths = [
    "/dashboard",
    "/submissions",
    "/leaderboard",
    "/analytics",
  ];
  const adminPaths = ["/admin"];

  const pathname = request.nextUrl.pathname;

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  // Redirect unauthenticated users from protected routes
  if (isProtectedPath && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin route check
  if (isAdminPath && session?.user) {
    // You may want to check the user's role here if needed
    // ...
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
