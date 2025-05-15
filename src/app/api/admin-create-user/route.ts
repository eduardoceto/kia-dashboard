import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use environment variables for security
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, first_name, last_name, employee_id, role, is_active } = body;

    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (!email.includes('@kia.com')) {
      return NextResponse.json({ error: 'Email must be a Kia email address.' }, { status: 400 });
    }

    // 1. Create user with Supabase Admin API
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name },
    });
    if (userError || !userData?.user) {
      return NextResponse.json({ error: userError?.message || 'Failed to create user.' }, { status: 500 });
    }

    const { error: profileError } = await supabaseAdmin.from('users').update({
      id: userData.user.id,
      first_name: first_name,
      last_name: last_name,
      employee_id: employee_id || null,
      email,
      role: role || 'user',
      is_active: is_active !== false, // default to true
    }).eq('id', userData.user.id);

    if (profileError) {
      // Rollback: delete the auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json({ error: `User created but failed to save profile. Rolled back. Supabase error: ${profileError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    let message = 'Unknown error.';
    if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
      message = (error as { message: string }).message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
