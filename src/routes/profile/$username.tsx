import { createFileRoute } from '@tanstack/react-router'
import { PlaceholderPage } from '@/components/placeholder-page'
import { requireAuth } from '@/lib/auth/guard'

export const Route = createFileRoute('/profile/$username')({
    component: PublicProfilePage,
    beforeLoad: requireAuth,
})

function PublicProfilePage() {
    const { username } = Route.useParams()
    return (
        <PlaceholderPage
            title={`@${username}`}
            description={`Public profile for ${username}. Private profiles are blocked by RLS. (Phase 3)`}
            backTo={{ to: '/profile', label: 'Your profile' }}
        />
    )
}