'use server'

import { createClient } from '@/src/utils/supabase/server'

export async function login(email: string, password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
        console.error('Login error:', error.message)
        return { success: false, error: error.message }
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { data: userLocale, error: userError } = await supabase
        .from('users')
        .select('locale')
        .eq('id', user?.id)
        .single()
    if (userError) {
        console.error('Error fetching user locale:', userError)
        return { success: false, error: userError.message }
    }

    const locale = userLocale?.locale || 'es'
    return { success: true, locale }
}