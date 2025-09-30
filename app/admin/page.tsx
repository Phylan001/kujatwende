"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TrendingUp, Settings, Eye, Shield, AlertCircle } from "lucide-react";
import { AdminStats } from "@/components/admin/AdminStats";
import { BookingsManagement } from "@/components/admin/BookingsManagement";
import { PackagesManagement } from "@/components/admin/PackagesManagement";
import { UsersManagement } from "@/components/admin/UsersManagement";

/**
 * Admin Dashboard Page Component
 *
 * SECURITY FEATURES:
 * - Role-based access control (admin only)
 * - Automatic redirect for non-admin users
 * - Token verification on mount and data fetch
 * - Unauthorized access prevention
 *
 * ROUTING LOGIC:
 * - If not logged in → redirect to /auth/login
 * - If logged in as user (not admin) → redirect to /dashboard
 * - If logged in as admin → show admin dashboard
 *
 * This ensures:
 * 1. Admins cannot access user dashboard (/dashboard)
 * 2. Users cannot access admin dashboard (/admin)
 * 3. Each role has access only to their designated routes
 */
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPackages: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activePackages: 0,
  });
  const [accessDenied, setAccessDenied] = useState(false);

  /**
   * Effect: Role-based access control
   * Checks user authentication and role, redirects if unauthorized
   *
   * Access Rules:
   * 1. No user logged in → Login page
   * 2. User logged in but not admin → User dashboard
   * 3. Admin logged in → Admin dashboard (allowed)
   */
  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    if (!user) {
      // Not logged in - redirect to login
      router.push("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      // Logged in but not admin - show access denied briefly then redirect
      setAccessDenied(true);

      // Brief delay to show access denied message
      setTimeout(() => {
        router.push("/dashboard"); // Redirect to user dashboard
      }, 1500);
    }
  }, [user, loading, router]);

  /**
   * Effect: Fetch admin statistics
   * Only runs for authenticated admin users
   * Fetches dashboard stats from protected API endpoint
   */
  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.stats) {
            setStats(data.stats);
          }
        } else if (response.status === 401 || response.status === 403) {
          // Token invalid or insufficient permissions
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      }
    };

    fetchAdminStats();
  }, [user, router]);

  /**
   * Render: Loading State
   * Shows spinner while authentication is being verified
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  /**
   * Render: Access Denied State
   * Shows when a non-admin user tries to access admin dashboard
   * Displays briefly before redirecting to appropriate dashboard
   */
  if (accessDenied || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <Card className="glass border-red-500/20 max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-400">
              Access Denied
            </CardTitle>
            <CardDescription className="text-white/70">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-white/80 text-sm">
                This area is restricted to administrators only.
                {user &&
                  user.role === "user" &&
                  " Redirecting to your dashboard..."}
              </p>
            </div>
            <Button
              onClick={() => router.push(user ? "/dashboard" : "/auth/login")}
              className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
            >
              {user ? "Go to Dashboard" : "Go to Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Render: Not Authenticated
   * Should not normally reach here due to redirect in useEffect
   * Acts as a safety fallback
   */
  if (!user) {
    return null;
  }

  /**
   * Render: Admin Dashboard
   * Main admin interface with stats, management tabs, and actions
   * Only visible to authenticated admin users
   */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-white/70 mt-2">
              Manage your travel agency operations
            </p>
            <p className="text-white/50 text-sm mt-1">
              Logged in as: <span className="text-cyan-400">{user.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Site
            </Button>
            <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <AdminStats stats={stats} />

        {/* Management Tabs */}
        <Tabs defaultValue="bookings" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
            <TabsTrigger
              value="bookings"
              className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
            >
              Bookings
            </TabsTrigger>
            <TabsTrigger
              value="packages"
              className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
            >
              Packages
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-6">
            <BookingsManagement />
          </TabsContent>

          <TabsContent value="packages" className="mt-6">
            <PackagesManagement />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  Analytics & Reports
                </CardTitle>
                <CardDescription className="text-white/70">
                  Detailed analytics and reporting features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-white/70">
                    Advanced analytics and reporting features will be available
                    here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
