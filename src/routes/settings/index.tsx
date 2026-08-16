import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/components/auth/auth-provider'
import { useState } from 'react'
import { User, Bell, Shield, Eye, LogOut, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { getSupabase } from '@/lib/supabase'

export const Route = createFileRoute('/settings/')({
    component: SettingsPage,
})

function SettingsPage() {
    const { user, signOut: signOutUser } = useAuth()
    const [activeTab, setActiveTab] = useState('account')
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        username: user?.user_metadata?.username || '',
        display_name: user?.user_metadata?.display_name || '',
        bio: '',
        location: '',
        website: '',
        is_private: false,
    })

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account, preferences, and privacy</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="account"><User className="size-4 mr-2" /> Account</TabsTrigger>
                    <TabsTrigger value="profile"><User className="size-4 mr-2" /> Profile</TabsTrigger>
                    <TabsTrigger value="notifications"><Bell className="size-4 mr-2" /> Notifications</TabsTrigger>
                    <TabsTrigger value="privacy"><Eye className="size-4 mr-2" /> Privacy</TabsTrigger>
                    <TabsTrigger value="security"><Shield className="size-4 mr-2" /> Security</TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                    <AccountSettings user={user} onSignOut={signOutUser} />
                </TabsContent>

                <TabsContent value="profile">
                    <ProfileSettings profile={profile} setProfile={setProfile} onSave={handleSaveProfile} saving={saving} user={user} />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationSettings />
                </TabsContent>

                <TabsContent value="privacy">
                    <PrivacySettings profile={profile} setProfile={setProfile} onSave={handleSaveProfile} saving={saving} />
                </TabsContent>

                <TabsContent value="security">
                    <SecuritySettings user={user} />
                </TabsContent>
            </Tabs>
        </div>
    )

    async function handleSaveProfile() {
        setSaving(true)
        try {
            const supabase = getSupabase()
            const { error } = await supabase.auth.updateUser({
                data: {
                    username: profile.username,
                    display_name: profile.display_name,
                },
            })
            if (error) throw error

            // Also update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    username: profile.username,
                    display_name: profile.display_name,
                    bio: profile.bio,
                    location: profile.location,
                    website: profile.website,
                    is_private: profile.is_private,
                })
                .eq('id', user?.id)

            if (profileError) throw profileError

            toast.success('Profile saved successfully')
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save profile')
        } finally {
            setSaving(false)
        }
    }
}

function AccountSettings({ user, onSignOut }: { user: any; onSignOut: () => Promise<void> }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Basic details about your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Email</Label>
                            <Input value={user?.email || ''} disabled />
                        </div>
                        <div>
                            <Label>User ID</Label>
                            <Input value={user?.id || ''} disabled />
                        </div>
                        <div>
                            <Label>Created</Label>
                            <Input value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''} disabled />
                        </div>
                        <div>
                            <Label>Last Sign In</Label>
                            <Input value={user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'} disabled />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={async () => { if (confirm('Are you sure you want to sign out?')) await onSignOut() }}>
                        <LogOut className="size-4 mr-2" /> Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function ProfileSettings({ profile, setProfile, onSave, saving, user }: any) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>How you appear to other users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
                            <AvatarFallback className="text-2xl">
                                {profile.username?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <Label>Username</Label>
                            <Input
                                value={profile.username}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                disabled={saving}
                                minLength={3}
                                maxLength={30}
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                                3-30 characters, alphanumeric and underscore only
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Display Name</Label>
                            <Input
                                value={profile.display_name}
                                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                placeholder="Your name"
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <Label>Website</Label>
                            <Input
                                value={profile.website}
                                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                                placeholder="https://example.com"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Bio</Label>
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            className="w-full min-h-[100px] p-3 border rounded-md bg-background disabled:opacity-50"
                            placeholder="Tell others about yourself..."
                            disabled={saving}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Location</Label>
                            <Input
                                value={profile.location}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                placeholder="City, Country"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <Button onClick={onSave} disabled={saving}>
                        {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                        {saving ? 'Saving...' : 'Save Profile'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function NotificationSettings() {
    const [settings, setSettings] = useState({
        email_episodes: true,
        email_reviews: true,
        email_system: false,
        push_episodes: true,
        push_reviews: true,
    })

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>Receive email updates for these events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <NotificationToggle label="New episode releases" checked={settings.email_episodes} onChange={(c) => setSettings({ ...settings, email_episodes: c })} />
                    <NotificationToggle label="Review replies & likes" checked={settings.email_reviews} onChange={(c) => setSettings({ ...settings, email_reviews: c })} />
                    <NotificationToggle label="System announcements" checked={settings.email_system} onChange={(c) => setSettings({ ...settings, email_system: c })} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Push Notifications</CardTitle>
                    <CardDescription>Receive browser push notifications (requires permission)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <NotificationToggle label="New episode releases" checked={settings.push_episodes} onChange={(c) => setSettings({ ...settings, push_episodes: c })} />
                    <NotificationToggle label="Review replies & likes" checked={settings.push_reviews} onChange={(c) => setSettings({ ...settings, push_reviews: c })} />
                </CardContent>
            </Card>
        </div>
    )
}

function NotificationToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <div className="flex items-center justify-between">
            <Label className="cursor-pointer">{label}</Label>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    )
}

function PrivacySettings({ profile, setProfile, onSave, saving }: any) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Visibility</CardTitle>
                    <CardDescription>Control who can see your profile and activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Private Profile</Label>
                            <p className="text-sm text-muted-foreground">
                                Only you can see your watchlist, favorites, and ratings
                            </p>
                        </div>
                        <Switch
                            checked={profile.is_private}
                            onCheckedChange={(c) => setProfile({ ...profile, is_private: c })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data & Activity</CardTitle>
                    <CardDescription>Manage your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline">Download My Data</Button>
                    <Button variant="destructive">Delete Account</Button>
                </CardContent>
            </Card>
        </div>
    )
}

function SecuritySettings({ user }: { user: any }) {
    const [mfaEnabled, setMfaEnabled] = useState(false)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" asChild>
                        <a href="/auth/reset">Change Password</a>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Authenticator App</p>
                            <p className="text-sm text-muted-foreground">
                                Use Google Authenticator, Authy, or similar
                            </p>
                        </div>
                        <Switch
                            checked={mfaEnabled}
                            onCheckedChange={setMfaEnabled}
                            disabled={!mfaEnabled} // Would enable after setup
                        />
                    </div>
                    {!mfaEnabled && (
                        <Button variant="outline">Set Up 2FA</Button>
                    )}
                    {mfaEnabled && (
                        <Button variant="outline" className="text-destructive border-destructive">Disable 2FA</Button>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>Devices currently signed in</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted rounded">
                            <div>
                                <p className="font-medium">Current Session</p>
                                <p className="text-sm text-muted-foreground">This device · Active now</p>
                            </div>
                            <Badge variant="default">Current</Badge>
                        </div>
                    </div>
                    <Button variant="outline" className="mt-4">Sign Out Everywhere</Button>
                </CardContent>
            </Card>
        </div>
    )
}