'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/src/utils/supabase/server'

export async function login(email: string, password: string) {
    const supabase = await createClient()

    const data = {
        email: email,
        password: password,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        // Consider redirecting back to login with an error message
        // instead of a generic error page
        redirect('/login?error=Authentication Failed') // Redirect without locale
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard') // Redirect to dashboard without locale
}