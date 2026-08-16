import { Link } from '@tanstack/react-router'
import { Menu, Bell, User, Settings, Shield, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useAuth } from '@/components/auth/auth-provider'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/discover', label: 'Discover' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/calendar', label: 'Calendar' },
] as const

function NavLinks({ className }: { className?: string }) {
  return (
    <nav className={cn('flex items-center', className)}>
      {navItems.map((item) => (
        <Button key={item.to} variant="ghost" asChild size="sm">
          <Link to={item.to} activeOptions={{ exact: item.to === '/' }}>
            {({ isActive }) => (
              <span className={cn(isActive && 'font-semibold text-foreground')}>
                {item.label}
              </span>
            )}
          </Link>
        </Button>
      ))}
    </nav>
  )
}

export function AppHeader() {
  const [open, setOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">🐉</span>
          <span className="hidden sm:inline">TrackMyDonghua</span>
        </Link>

        <NavLinks className="ml-6 hidden md:flex" />

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {loading ? null : user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user.user_metadata?.display_name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase() ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user.user_metadata?.display_name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase() ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.user_metadata?.display_name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile"><User className="mr-2 size-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/watchlist"><Bell className="mr-2 size-4" /> Watchlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings"><Settings className="mr-2 size-4" /> Settings</Link>
                  </DropdownMenuItem>
                  {user.user_metadata?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin"><Shield className="mr-2 size-4" /> Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="hidden md:inline-flex">
                <Link to="/auth/signup">Sign up</Link>
              </Button>
            </>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-4">
              <div className="flex flex-col items-stretch gap-1">
                <NavLinks className="flex-col items-stretch" />
                {user ? (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to="/profile">Profile</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link to="/settings">Settings</Link>
                    </Button>
                    {user.user_metadata?.role === 'admin' && (
                      <Button variant="ghost" asChild>
                        <Link to="/admin">Admin</Link>
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => signOut()}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="mt-2">
                      <Link to="/auth/login">Sign in</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/auth/signup">Sign up</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}