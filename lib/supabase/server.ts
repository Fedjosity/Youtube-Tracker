import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/database";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cases where cookies can't be set (e.g., in static generation)
            console.warn("Could not set cookie:", name, error);
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Handle cases where cookies can't be removed
            console.warn("Could not remove cookie:", name, error);
          }
        },
      },
    }
  );
}
