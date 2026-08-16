import { getSession } from '@/lib/auth'
import { redirect } from '@tanstack/react-router'

export async function requireAuth() {
    const session = getSession()
    if (!session) {
        throw redirect({ to: '/auth/login', search: { redirect: window.location.pathname } })
    }
    return session
}