"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Eye,
  MapPin,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface AdminDashboardLayoutProps {
  children: ReactNode
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/packages", icon: Package, label: "Packages" },
    { href: "/admin/destinations", icon: MapPin, label: "Destinations" },
    { href: "/admin/bookings", icon: Calendar, label: "Bookings" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/payments", icon: CreditCard, label: "Payments" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-800/50 to-gray-900/50 backdrop-blur-xl border-r border-slate-700/50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-slate-700/50">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">KT</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Admin Panel</h2>
              <p className="text-blue-300 text-sm">Kuja Twende Adventures</p>
            </div>
          </div>

          {/* Admin Info */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <Avatar className="w-14 h-14 border-2 border-blue-500/30">
                <AvatarImage src={user?.profilePicture?.secure_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-lg">{user?.name}</p>
                <p className="text-blue-300 text-sm">System Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/30"
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

          {/* Quick Actions */}
          <div className="p-4 border-t border-slate-700/50">
            <Link href="/">
              <Button
                variant="outline"
                className="w-full mb-2 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700/50 bg-transparent"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Admin Control Center
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
