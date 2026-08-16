import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { initAuth, onAuthStateChange, type Session, type User } from '@/lib/auth'

interface AuthContextValue {
    session: Session | null
    user: User | null
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        initAuth()
        const unsubscribe = onAuthStateChange((s) => {
            setSession(s)
            setUser(s?.user ?? null)
            setLoading(false)
        })
        return unsubscribe
    }, [])

    const handleSignOut = async () => {
        const { signOut } = await import('@/lib/auth')
        await signOut()
    }

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}