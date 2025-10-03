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
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Star,
  CreditCard,
  Clock,
  AlertCircle,
  Shield,
} from "lucide-react";
import Link from "next/link";
import type { Booking } from "@/lib/models/Booking";

/**
 * User Dashboard Page Component
 *
 * SECURITY FEATURES:
 * - Role-based access control (user only)
 * - Automatic redirect for admin users to /admin
 * - Token verification on mount and data fetch
 * - Unauthorized access prevention
 *
 * ROUTING LOGIC:
 * - If not logged in → redirect to /auth/login
 * - If logged in as admin → redirect to /admin
 * - If logged in as user → show user dashboard
 *
 * This ensures role separation:
 * - Users can only access user dashboard
 * - Admins are redirected to their admin dashboard
 * - Each role stays in their designated area
 */
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalSpent: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  /**
   * Effect: Role-based access control
   * Checks user authentication and role, redirects if unauthorized
   *
   * Access Rules:
   * 1. No user logged in → Login page
   * 2. Admin logged in → Admin dashboard
   * 3. Regular user logged in → User dashboard (allowed)
   */
  useEffect(() => {
    if (loading) return; // Wait for auth check to complete

    if (!user) {
      // Not logged in - redirect to login
      router.push("/auth/login");
      return;
    }

    if (user.role === "admin") {
      // Admin trying to access user dashboard - redirect to admin
      setAccessDenied(true);

      // Brief delay to show access message
      setTimeout(() => {
        router.push("/admin"); // Redirect to admin dashboard
      }, 1500);
    }
  }, [user, loading, router]);

  /**
   * Effect: Fetch user bookings and calculate stats
   * Only runs for authenticated regular users (not admins)
   * Fetches user-specific booking data from protected API endpoint
   */
  useEffect(() => {
    if (!user || user.role !== "user") return;

    const fetchUserBookings = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        if (!token) {
          router.push("/auth/login");
          return;
        }

        const response = await fetch("/api/bookings/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.bookings) {
            setBookings(data.bookings);

            // Calculate dashboard statistics
            const total = data.bookings.length;
            const upcoming = data.bookings.filter(
              (b: Booking) =>
                new Date(b.travelDate) > new Date() && b.status === "confirmed"
            ).length;
            const completed = data.bookings.filter(
              (b: Booking) => b.status === "completed"
            ).length;
            const spent = data.bookings
              .filter((b: Booking) => b.paymentStatus === "paid")
              .reduce((sum: number, b: Booking) => sum + b.totalAmount, 0);

            setStats({
              totalBookings: total,
              upcomingTrips: upcoming,
              completedTrips: completed,
              totalSpent: spent,
            });
          }
        } else if (response.status === 401 || response.status === 403) {
          // Token invalid or insufficient permissions
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Failed to fetch user bookings:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserBookings();
  }, [user, router]);

  /**
   * Render: Loading State
   * Shows spinner while authentication is being verified
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  /**
   * Render: Access Denied State
   * Shows when an admin tries to access user dashboard
   * Displays briefly before redirecting to admin dashboard
   */
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
              className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
            >
              Go to Admin Dashboard
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
   * Render: User Dashboard
   * Main user interface with stats, bookings, and actions
   * Only visible to authenticated regular users
   */
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-light rounded-2xl p-8 border border-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold adventure-text-gradient font-fredoka mb-2">
              Welcome back, {user.name}! 🌍
            </h1>
            <p className="text-white/70 text-lg">
              Ready for your next adventure?
            </p>
            <p className="text-white/50 text-sm mt-1">
              Account: <span className="text-orange-400">{user.email}</span>
            </p>
          </div>
          <div className="animate-bounce-gentle">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 animate-fade-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">
                  Total Adventures
                </p>
                <p className="text-3xl font-bold text-orange-400 font-fredoka">
                  {loadingData ? "..." : stats.totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 animate-fade-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">
                  Upcoming Trips
                </p>
                <p className="text-3xl font-bold text-cyan-400 font-fredoka">
                  {loadingData ? "..." : stats.upcomingTrips}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-green-500/20 hover:border-green-500/40 transition-all duration-300 animate-fade-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-400 font-fredoka">
                  {loadingData ? "..." : stats.completedTrips}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 animate-fade-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">
                  Adventure Budget
                </p>
                <p className="text-3xl font-bold text-purple-400 font-fredoka">
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

      {/* Recent Adventures */}
      <Card className="glass border-orange-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl font-fredoka">
                Recent Adventures
              </CardTitle>
              <CardDescription className="text-white/70">
                Your latest bookings and their status
              </CardDescription>
            </div>
            <Link href="/dashboard/bookings">
              <Button
                variant="outline"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 bg-transparent"
              >
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto"></div>
              <p className="text-white/70 mt-4">Loading your adventures...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-adventure">
                <MapPin className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-fredoka">
                No adventures yet!
              </h3>
              <p className="text-white/70 mb-6">
                Start your journey with us and explore Kenya like never before
              </p>
              <Link href="/packages">
                <Button className="btn-adventure">Discover Adventures</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking, index) => (
                <div
                  key={booking._id?.toString()}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-500/5 to-cyan-500/5 rounded-xl border border-orange-500/10 hover:border-orange-500/20 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg font-fredoka">
                        Adventure #{booking._id?.toString().slice(-6)}
                      </h4>
                      <p className="text-white/70">
                        {new Date(booking.travelDate).toLocaleDateString()} •{" "}
                        {booking.numberOfTravelers} explorers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        booking.status === "confirmed" ? "default" : "secondary"
                      }
                      className={
                        booking.status === "confirmed"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {booking.status}
                    </Badge>
                    <p className="text-orange-400 font-bold text-lg">
                      KSh {booking.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
