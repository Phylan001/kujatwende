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
  Users,
  Package,
  TrendingUp,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalBookings: number;
  upcomingTrips: number;
  completedTrips: number;
  totalSpent: number;
  pendingBookings: number;
  totalDestinations: number;
  totalPackages: number;
  recentActivity: Array<{
    type: "booking" | "payment" | "review";
    message: string;
    date: string;
    _id: string;
  }>;
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
    totalDestinations: 0,
    totalPackages: 0,
    recentActivity: [],
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
        // Extract user ID from user object
        const userId = (user as any)?._id || (user as any)?.id;

        if (!userId) {
          console.error("Unable to get user ID");
          return;
        }

        const response = await fetch(`/api/user/stats?userId=${userId}`);

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        } else {
          console.error("Failed to fetch user stats");
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
    <div className="space-y-8 p-4 sm:p-6">
      {/* Welcome Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 flex-shrink-0" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            User Dashboard
          </h2>
          <p className="text-slate-400 mt-1 text-xs sm:text-base">
            Explore different dream destinations in Kenya
          </p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bookings Card */}
        <Card className="glass border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">
                  Total Adventures
                </p>
                <p className="text-5xl font-bold text-orange-400">
                  {loadingData ? "..." : stats.totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips Card */}
        <Card className="glass border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Pending Trips</p>
                <div className="flex items-center gap-4 mt-2">
                  
                  <div>
                    <p className="text-5xl font-bold text-green-400">
                      {stats.pendingBookings}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Card */}
        <Card className="glass border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
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
                <p className="text-white/60 text-xs mt-2">
                  Total spent on adventures
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="glass border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-orange-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-white/70">
              Start your next adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => router.push("/dashboard/destinations")}
                className="h-20 glass border-orange-500/20 hover:border-orange-500/40 transition-all group"
              >
                <div className="text-center w-full">
                  <MapPin className="w-8 h-8 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-white font-medium">
                    Explore Destinations
                  </span>
                </div>
              </Button>

              <Button
                onClick={() => router.push("/dashboard/packages")}
                className="h-20 glass border-cyan-500/20 hover:border-cyan-500/40 transition-all group"
              >
                <div className="text-center w-full">
                  <Package className="w-8 h-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-white font-medium">View Packages</span>
                </div>
              </Button>

              <Button
                onClick={() => router.push("/dashboard/bookings")}
                className="h-20 glass border-green-500/20 hover:border-green-500/40 transition-all group"
              >
                <div className="text-center w-full">
                  <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-white font-medium">My Bookings</span>
                </div>
              </Button>

              <Button
                onClick={() => router.push("/dashboard/payments")}
                className="h-20 glass border-purple-500/20 hover:border-purple-500/40 transition-all group"
              >
                <div className="text-center w-full">
                  <CreditCard className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-white font-medium">
                    Payment History
                  </span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-white/70">
              Your latest adventures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "booking"
                          ? "bg-orange-500/20"
                          : activity.type === "payment"
                          ? "bg-green-500/20"
                          : "bg-blue-500/20"
                      }`}
                    >
                      {activity.type === "booking" && (
                        <Calendar className="w-4 h-4 text-orange-400" />
                      )}
                      {activity.type === "payment" && (
                        <CreditCard className="w-4 h-4 text-green-400" />
                      )}
                      {activity.type === "review" && (
                        <Star className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.message}</p>
                      <p className="text-white/60 text-xs">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
                  <p className="text-white/70">No recent activity</p>
                  <p className="text-white/50 text-sm mt-1">
                    Your adventures will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
