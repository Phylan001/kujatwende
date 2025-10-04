"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Star,
  CreditCard,
  Clock,
  Shield,
} from "lucide-react";

interface DashboardStats {
  totalBookings: number;
  upcomingTrips: number;
  completedTrips: number;
  totalSpent: number;
  pendingBookings: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalSpent: 0,
    pendingBookings: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role === "admin") {
      setAccessDenied(true);
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== "user") return;

    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        const response = await fetch("/api/users/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserStats();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (accessDenied || (user && user.role === "admin")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <Card className="glass border-orange-500/20 max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-orange-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-orange-400">
              Admin Redirect
            </CardTitle>
            <CardDescription className="text-white/70">
              Redirecting to admin dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <p className="text-white/80 text-sm">
                You're logged in as an administrator. Admins have their own
                dedicated dashboard.
              </p>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              className="w-full btn-adventure"
            >
              Go to Admin Dashboard
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="glass border-orange-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-white/70">
                Ready for your next adventure? Explore amazing destinations and
                create unforgettable memories.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">
                  Total Adventures
                </p>
                <p className="text-3xl font-bold text-orange-400">
                  {loadingData ? "..." : stats.totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">
                  Upcoming Trips
                </p>
                <p className="text-3xl font-bold text-cyan-400">
                  {loadingData ? "..." : stats.upcomingTrips}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-green-500/20 hover:border-green-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-400">
                  {loadingData ? "..." : stats.completedTrips}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">
                  Adventure Budget
                </p>
                <p className="text-3xl font-bold text-purple-400">
                  {loadingData
                    ? "..."
                    : `KSh ${stats.totalSpent.toLocaleString()}`}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-white/70">
            Start your next adventure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push("/destinations")}
              className="h-20 bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all"
            >
              <div className="text-center">
                <MapPin className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <span className="text-white font-medium">
                  Explore Destinations
                </span>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/packages")}
              className="h-20 bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all"
            >
              <div className="text-center">
                <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <span className="text-white font-medium">View Packages</span>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/dashboard/bookings")}
              className="h-20 bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all"
            >
              <div className="text-center">
                <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <span className="text-white font-medium">My Bookings</span>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/dashboard/payments")}
              className="h-20 bg-gradient-to-r from-orange-500/10 to-cyan-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all"
            >
              <div className="text-center">
                <CreditCard className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <span className="text-white font-medium">Payment History</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
