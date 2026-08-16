import { Link } from '@tanstack/react-router'

export function AppFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>🐉 TrackMyDonghua</p>
        <nav className="flex items-center gap-4">
          <Link to="/discover" className="hover:text-foreground">
            Discover
          </Link>
          <Link to="/calendar" className="hover:text-foreground">
            Calendar
          </Link>
          <a href="#" className="hover:text-foreground">
            About
          </a>
        </nav>
        <p>© {new Date().getFullYear()} TrackMyDonghua</p>
      </div>
    </footer>
  )
}