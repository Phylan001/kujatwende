"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  MapPin,
  CreditCard,
  User,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/destinations", icon: MapPin, label: "Destinations" },
    { href: "/admin/packages", icon: Package, label: "Packages" },
    { href: "/admin/bookings", icon: Calendar, label: "Bookings" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/payments", icon: CreditCard, label: "Payments" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="KujaTwende"
                width={28}
                height={28}
                className="w-7 h-7"
              />
            </div>
            <h2 className="text-white font-bold text-sm">Admin Panel</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-800/50 to-gray-900/50 backdrop-blur-xl border-r border-slate-700/50 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo - Desktop Only */}
        <div className="hidden lg:flex items-center gap-3 p-6 border-b border-slate-700/50 flex-shrink-0">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="KujaTwende Icon"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Admin Panel</h2>
            <p className="text-blue-300 text-xs">Kuja Twende Adventures</p>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="KujaTwende"
                width={36}
                height={36}
                className="w-9 h-9"
              />
            </div>
            <div>
              <h2 className="text-white font-bold">Admin Panel</h2>
              <p className="text-blue-300 text-xs">Kuja Twende Adventures</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
              >
                <div
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/30"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-700/30 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {user?.name}
              </p>
              <p className="text-blue-300 text-xs truncate">
                System Administrator
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              logout();
              setSidebarOpen(false);
            }}
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        {/* Top Bar */}
        <div className="sticky top-16 lg:top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 p-4 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-slate-400 text-xs sm:text-sm truncate">
                Logged in as:{" "}
                <span className="text-cyan-400">{user?.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  );
}
