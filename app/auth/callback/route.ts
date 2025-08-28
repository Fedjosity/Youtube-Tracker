import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/database";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Create response for cookie setting
  const response = NextResponse.redirect(new URL(next, request.url));

  // Create Supabase client with cookie management
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/?error=auth", request.url));
  }

  // Create or update user profile with default 'editor' role
  if (data.session.user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.session.user.id,
        email: data.session.user.email!,
        full_name: data.session.user.user_metadata?.full_name,
        avatar_url: data.session.user.user_metadata?.avatar_url,
        role: "editor", // Default role for new users
      },
      {
        onConflict: "id",
      }
    );

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }
  }

  return response;
}
