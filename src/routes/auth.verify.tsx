import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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
import { resendVerification } from '@/lib/auth'

export const Route = createFileRoute('/auth/verify')({
    component: VerifyPage,
})

function VerifyPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [autoResent, setAutoResent] = useState(false)

    useEffect(() => {
        if (!autoResent) {
            const resend = async () => {
                try {
                    await resendVerification(email)
                    setAutoResent(true)
                } catch {
                    // ignore
                }
            }
            if (email) resend()
        }
    }, [email, autoResent])

    async function onResend(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        try {
            await resendVerification(email)
            toast.success('Verification email sent')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to send'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Check your email</CardTitle>
                <CardDescription>
                    We sent a verification link. Click it to activate your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onResend} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" disabled={loading || !email}>
                        {loading ? 'Sending…' : 'Resend verification'}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Didn't receive it? Check spam or try a different email.
                    </p>
                </form>
            </CardContent>
        </Card>
    )
}