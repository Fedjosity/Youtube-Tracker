import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: { code: string };
}) {
  const supabase = await createClient();

  if (searchParams.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(searchParams.code);
    
    if (!error && data.user) {
      // Create or update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }
  }

  redirect('/dashboard');
}