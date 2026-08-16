import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth'

export const Route = createFileRoute('/auth/signup')({
    component: SignUpPage,
})

function SignUpPage() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const navigate = useNavigate()

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
            toast.error('Username must be 3-30 chars, alphanumeric + underscore')
            return
        }

        setLoading(true)
        try {
            await signUp(formData.email, formData.password, formData.username)
            toast.success('Account created! Check your email for verification.')
            navigate({ to: '/auth/verify' })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Signup failed'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create your account</CardTitle>
                <CardDescription>
                    Track watchlists, progress, and release alerts
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            placeholder="btth_fan"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            minLength={3}
                            maxLength={30}
                            autoComplete="username"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="confirmPassword">Confirm password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating account…' : 'Sign up'}
                    </Button>
                    <Button type="button" variant="outline" disabled>
                        Continue with Google
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/auth/login" className="text-foreground hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    )
}