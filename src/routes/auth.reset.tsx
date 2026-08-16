import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
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
import { updatePassword, resetPassword } from '@/lib/auth'

export const Route = createFileRoute('/auth/reset')({
    validateSearch: (search) => ({
        type: search.type as string,
        token: search.token as string,
    }),
    component: ResetPasswordPage,
})

function ResetPasswordPage() {
    const { type, _token } = useSearch()
    const isRecovery = type === 'recovery'
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })

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

        setLoading(true)
        try {
            if (isRecovery) {
                await updatePassword(formData.password)
                toast.success('Password updated! Please sign in.')
            } else {
                await resetPassword(formData.password)
                toast.success('Reset link sent to your email')
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    if (!isRecovery) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Reset your password</CardTitle>
                    <CardDescription>
                        Enter your email and we'll send you a reset link.
                    </CardDescription>
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
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Sending…' : 'Send reset link'}
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Remembered it?{' '}
                            <Link to="/auth/login" className="text-foreground hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Set new password</CardTitle>
                <CardDescription>
                    Your password reset link is valid. Enter a new password below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">New password</Label>
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
                        {loading ? 'Updating…' : 'Update password'}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        <Link to="/auth/login" className="text-foreground hover:underline">
                            Back to sign in
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    )
}