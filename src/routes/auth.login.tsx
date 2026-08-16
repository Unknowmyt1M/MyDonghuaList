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
import { signIn } from '@/lib/auth'

export const Route = createFileRoute('/auth/login')({
    component: LoginPage,
})

function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ email: '', password: '' })
    const navigate = useNavigate()

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }))
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        try {
            await signIn(formData.email, formData.password)
            toast.success('Welcome back!')
            navigate({ to: '/' })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign in</CardTitle>
                <CardDescription>Welcome back to TrackMyDonghua</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="size-4" /> Remember me
                        </label>
                        <Link
                            to="/auth/reset"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </Button>
                    <Button type="button" variant="outline" disabled>
                        Continue with Google
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        No account?{' '}
                        <Link to="/auth/signup" className="text-foreground hover:underline">
                            Sign up
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    )
}