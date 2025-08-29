import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function isAllowlistedAdmin(email?: string | null): boolean {
  if (!email) return false;
  const allowlist = process.env.ADMIN_EMAILS || ""; // comma-separated
  const entries = allowlist
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return entries.includes(email.toLowerCase());
}

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
      // Create or update user profile using safe upsert function
      if (data.session.user) {
        const email = data.session.user.email || null;
        const desired_role = isAllowlistedAdmin(email) ? "admin" : null;
        const { error: profileError } = await (supabase as any).rpc(
          "safe_profile_upsert",
          {
            user_id: data.session.user.id,
            user_email: data.session.user.email!,
            user_full_name: data.session.user.user_metadata?.full_name,
            user_avatar_url: data.session.user.user_metadata?.avatar_url,
            desired_role,
          }
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
      // Create or update user profile using safe upsert function
      if (data.session.user) {
        const email = data.session.user.email || null;
        const desired_role = isAllowlistedAdmin(email) ? "admin" : null;
        const { error: profileError } = await (supabase as any).rpc(
          "safe_profile_upsert",
          {
            user_id: data.session.user.id,
            user_email: data.session.user.email!,
            user_full_name: data.session.user.user_metadata?.full_name,
            user_avatar_url: data.session.user.user_metadata?.avatar_url,
            desired_role,
          }
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
