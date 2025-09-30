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
import {
  Shield,
  AlertCircle,
  Users,
  Package,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      setAccessDenied(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  }, [user, loading, router]);

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
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      }
    };

    fetchAdminStats();
  }, [user, router]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
          <p className="text-slate-400 mt-1">
            Manage your travel agency operations
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Total Users
                </p>
                <h3 className="text-4xl font-bold text-cyan-400 mt-2">
                  {stats.totalUsers}
                </h3>
              </div>
              <div className="w-14 h-14 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <Users className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Active Packages
                </p>
                <h3 className="text-4xl font-bold text-purple-400 mt-2">
                  {stats.activePackages}
                </h3>
              </div>
              <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Package className="w-7 h-7 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Total Bookings
                </p>
                <h3 className="text-4xl font-bold text-green-400 mt-2">
                  {stats.totalBookings}
                </h3>
              </div>
              <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-7 h-7 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Total Revenue
                </p>
                <h3 className="text-4xl font-bold text-orange-400 mt-2">
                  KSh {stats.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Pending Bookings
                </p>
                <h3 className="text-4xl font-bold text-yellow-400 mt-2">
                  {stats.pendingBookings}
                </h3>
              </div>
              <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">
                  Completion Rate
                </p>
                <h3 className="text-4xl font-bold text-emerald-400 mt-2">
                  94%
                </h3>
              </div>
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-slate-400">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push("/admin/packages")}
              className="h-auto flex-col gap-3 py-6 bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
            >
              <Package className="w-8 h-8 text-purple-400" />
              <span className="text-white font-medium">Manage Packages</span>
            </Button>
            <Button
              onClick={() => router.push("/admin/bookings")}
              className="h-auto flex-col gap-3 py-6 bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
            >
              <Calendar className="w-8 h-8 text-green-400" />
              <span className="text-white font-medium">View Bookings</span>
            </Button>
            <Button
              onClick={() => router.push("/admin/users")}
              className="h-auto flex-col gap-3 py-6 bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
            >
              <Users className="w-8 h-8 text-cyan-400" />
              <span className="text-white font-medium">Manage Users</span>
            </Button>
            <Button
              onClick={() => router.push("/admin/analytics")}
              className="h-auto flex-col gap-3 py-6 bg-slate-700/50 hover:bg-slate-700 border border-slate-600"
            >
              <Shield className="w-8 h-8 text-orange-400" />
              <span className="text-white font-medium">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
