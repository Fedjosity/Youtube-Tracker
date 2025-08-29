import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await (supabase as any).auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect("/");
  }
  return user;
}

export async function getProfile() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function requireAdmin() {
  const profile = await getProfile();
  if (!profile || (profile as any).role !== "admin") {
    redirect("/dashboard");
  }
  return profile;
}
