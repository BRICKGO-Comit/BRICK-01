import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vegkccmiluqfozynqnuf.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ2tjY21pbHVxZm96eW5xbnVmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ5OTQ2OSwiZXhwIjoyMDg1MDc1NDY5fQ.PX7W_3n81E4TTsYYY5SKuQFUW03E7FKP2oBcwOBbkRE'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function createAdmin() {
    const email = 'gobrick638@gmail.com'
    const password = 'BrickGo638'

    console.log(`Creating/Updating admin user: ${email}...`)

    // 1. Create user in Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Admin BRICK GO' }
    })

    if (userError) {
        if (userError.message.includes('already registered')) {
            console.log('User already exists in Auth, updating profile role...')
            // If user exists, find them to get the ID
            const { data: { users } } = await supabase.auth.admin.listUsers()
            const existingUser = users.find(u => u.email === email)
            if (existingUser) {
                await updateProfile(existingUser.id)
            }
        } else {
            console.error('Error creating user:', userError.message)
        }
    } else if (userData.user) {
        console.log('User created successfully in Auth.')
        await updateProfile(userData.user.id)
    }
}

async function updateProfile(userId) {
    // 2. Update/Insert in profiles table
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            email: 'gobrick638@gmail.com',
            full_name: 'Admin BRICK GO',
            role: 'admin',
            status: 'active'
        })

    if (profileError) {
        console.error('Error updating profile:', profileError.message)
    } else {
        console.log('Profile updated with admin role successfully.')
    }
}

createAdmin()
