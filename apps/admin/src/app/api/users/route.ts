
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, phone, role } = body;

        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                role: role || 'commercial'
            }
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // 2. The profile should be created automatically via Trigger if you have one.
        // However, if you don't have a trigger, we should insert it here.
        // Let's assume we might need to insert it manually or update it if the trigger is slow/missing.
        // Safe bet: Update the profile if it exists (trigger) or Insert if not.

        // Check if profile exists (if trigger runs fast)
        // Actually, usually we rely on the trigger. 
        // But to be safe, let's just return success and let the client refresh.
        // Or we can manually insert into public.profiles if no trigger exists.

        // Let's try to update the profile with the specific role and phone just in case the trigger only does basic info.
        if (authData.user) {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    role: role || 'commercial',
                    phone: phone,
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Don't fail the request if auth user was created, but warn.
            }
        }

        return NextResponse.json({ user: authData.user }, { status: 200 });

    } catch (error: any) {
        console.error('Create user error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
