import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await (supabase as any).auth.exchangeCodeForSession(
      code
    );
    if (!error && data.session) {
      // Create or update user profile with default 'editor' role
      if (data.session.user) {
        const { error: profileError } = await (supabase as any)
          .from("profiles")
          .upsert(
            {
              id: data.session.user.id,
              email: data.session.user.email!,
              full_name: data.session.user.user_metadata?.full_name,
              avatar_url: data.session.user.user_metadata?.avatar_url,
              role: "editor",
            },
            { onConflict: "id" }
          );

        if (profileError) {
          console.error("Error creating/updating profile:", profileError);
        }
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}${next}`);
}

export async function POST(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await (supabase as any).auth.exchangeCodeForSession(
      code
    );
    if (!error && data.session) {
      // Create or update user profile with default 'editor' role
      if (data.session.user) {
        const { error: profileError } = await (supabase as any)
          .from("profiles")
          .upsert(
            {
              id: data.session.user.id,
              email: data.session.user.email!,
              full_name: data.session.user.user_metadata?.full_name,
              avatar_url: data.session.user.user_metadata?.avatar_url,
              role: "editor",
            },
            { onConflict: "id" }
          );

        if (profileError) {
          console.error("Error creating/updating profile:", profileError);
        }
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}${next}`);
}
