import { getSupabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

let currentSession: Session | null = null
let currentUser: User | null = null
const listeners = new Set<(session: Session | null) => void>()

function notify() {
    listeners.forEach((fn) => fn(currentSession))
}

export function getSession() {
    return currentSession
}

export function getUser() {
    return currentUser
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
    listeners.add(callback)
    return () => listeners.delete(callback)
}

async function _refreshSession() {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    currentSession = data.session
    currentUser = data.session?.user ?? null
    notify()
}

export async function signUp(email: string, password: string, username: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
    })
    if (error) throw error
    if (data.session) {
        currentSession = data.session
        currentUser = data.session.user
        notify()
    }
    return data
}

export async function signIn(email: string, password: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.session) {
        currentSession = data.session
        currentUser = data.session.user
        notify()
    }
    return data
}

export async function signOut() {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    currentSession = null
    currentUser = null
    notify()
}

export async function resetPassword(email: string) {
    const supabase = getSupabase()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (error) throw error
}

export async function updatePassword(password: string) {
    const supabase = getSupabase()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
}

export async function resendVerification(email: string) {
    const supabase = getSupabase()
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) throw error
}

export async function initAuth() {
    const supabase = getSupabase()
    const { data } = await supabase.auth.getSession()
    currentSession = data.session
    currentUser = data.session?.user ?? null

    supabase.auth.onAuthStateChange((_event, session) => {
        currentSession = session
        currentUser = session?.user ?? null
        notify()
    })
}