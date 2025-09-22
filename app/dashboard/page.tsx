"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Star, CreditCard, Clock } from "lucide-react"
import Link from "next/link"
import type { Booking } from "@/lib/models/Booking"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalSpent: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Fetch user bookings
      fetch("/api/bookings/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.bookings) {
            setBookings(data.bookings)
            // Calculate stats
            const total = data.bookings.length
            const upcoming = data.bookings.filter(
              (b: Booking) => new Date(b.travelDate) > new Date() && b.status === "confirmed",
            ).length
            const completed = data.bookings.filter((b: Booking) => b.status === "completed").length
            const spent = data.bookings
              .filter((b: Booking) => b.paymentStatus === "paid")
              .reduce((sum: number, b: Booking) => sum + b.totalAmount, 0)

            setStats({
              totalBookings: total,
              upcomingTrips: upcoming,
              completedTrips: completed,
              totalSpent: spent,
            })
          }
        })
        .catch(console.error)
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-400"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-light rounded-2xl p-8 border border-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold adventure-text-gradient font-fredoka mb-2">
              Welcome back, {user.name}! 🌍
            </h1>
            <p className="text-white/70 text-lg">Ready for your next adventure?</p>
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
                <p className="text-white/70 text-sm font-medium">Total Adventures</p>
                <p className="text-3xl font-bold text-orange-400 font-fredoka">{stats.totalBookings}</p>
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
                <p className="text-white/70 text-sm font-medium">Upcoming Trips</p>
                <p className="text-3xl font-bold text-cyan-400 font-fredoka">{stats.upcomingTrips}</p>
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
                <p className="text-3xl font-bold text-green-400 font-fredoka">{stats.completedTrips}</p>
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
                <p className="text-white/70 text-sm font-medium">Adventure Budget</p>
                <p className="text-3xl font-bold text-purple-400 font-fredoka">
                  KSh {stats.totalSpent.toLocaleString()}
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
              <CardTitle className="text-white text-2xl font-fredoka">Recent Adventures</CardTitle>
              <CardDescription className="text-white/70">Your latest bookings and their status</CardDescription>
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
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-adventure">
                <MapPin className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-fredoka">No adventures yet!</h3>
              <p className="text-white/70 mb-6">Start your journey with us and explore Kenya like never before</p>
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
                        {new Date(booking.travelDate).toLocaleDateString()} • {booking.numberOfTravelers} explorers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={booking.status === "confirmed" ? "default" : "secondary"}
                      className={
                        booking.status === "confirmed"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }
                    >
                      {booking.status}
                    </Badge>
                    <p className="text-orange-400 font-bold text-lg">KSh {booking.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
