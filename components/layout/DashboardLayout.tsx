"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Calendar, MapPin, CreditCard, Settings, LogOut, Bell, Search, User } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: ReactNode
}

export function UserDashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    { href: "/dashboard", icon: Home, label: "Overview" },
    { href: "/dashboard/bookings", icon: Calendar, label: "My Bookings" },
    { href: "/dashboard/wishlist", icon: MapPin, label: "Wishlist" },
    { href: "/dashboard/payments", icon: CreditCard, label: "Payments" },
    { href: "/dashboard/profile", icon: User, label: "Profile" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900/20 via-black to-cyan-900/20">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-orange-500/10 to-cyan-500/10 backdrop-blur-xl border-r border-orange-500/20">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-orange-500/20">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg font-fredoka">KT</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg font-fredoka">Kuja Twende</h2>
              <p className="text-orange-300 text-xs">Adventure Awaits</p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-orange-500/20">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-orange-500/30">
                <AvatarImage src={user?.profilePicture?.secure_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-cyan-500 text-white font-bold">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold">{user?.name}</p>
                <p className="text-orange-300 text-sm">Explorer</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500/20 to-cyan-500/20 text-white border border-orange-500/30"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }
                  `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-orange-500/20">
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start text-white/70 hover:text-white hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-xl border-b border-orange-500/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold adventure-text-gradient font-fredoka">Adventure Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                <Bell className="w-5 h-5" />
              </Button>
              <Link href="/packages">
                <Button className="btn-adventure">Book Adventure</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
