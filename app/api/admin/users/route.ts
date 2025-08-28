import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateUserSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['admin', 'editor']),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = updateUserSchema.parse(body);

    // Get current user data for audit log
    const { data: currentUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Update user role
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    // Log admin action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action: 'role_update',
        target_type: 'user',
        target_id: userId,
        old_values: { role: currentUser?.role },
        new_values: { role },
      });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}