"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, CreditCard, Clock, Phone, Mail, User } from "lucide-react"
import type { Booking } from "@/lib/models/Booking"
import { format } from "date-fns"

export default function BookingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetch("/api/bookings/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.bookings) {
            setBookings(data.bookings)
          }
        })
        .catch(console.error)
        .finally(() => setLoadingBookings(false))
    }
  }, [user])

  if (loading || loadingBookings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const upcomingBookings = bookings.filter(
    (booking) => new Date(booking.travelDate) > new Date() && booking.status !== "cancelled",
  )

  const pastBookings = bookings.filter(
    (booking) => new Date(booking.travelDate) <= new Date() || booking.status === "completed",
  )

  const cancelledBookings = bookings.filter((booking) => booking.status === "cancelled")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "refunded":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="glass border-white/10 hover:border-cyan-400/30 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Booking #{booking._id?.toString().slice(-6)}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
            <Badge className={getPaymentStatusColor(booking.paymentStatus)}>{booking.paymentStatus}</Badge>
          </div>
        </div>
        <CardDescription className="text-white/70">
          Booked on {format(new Date(booking.createdAt), "PPP")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Travel Date: {format(new Date(booking.travelDate), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>
                {booking.numberOfTravelers} {booking.numberOfTravelers === 1 ? "traveler" : "travelers"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>KSh {booking.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white/80">
              <User className="w-4 h-4 text-cyan-400" />
              <span>{booking.customerInfo.name}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>{booking.customerInfo.email}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>{booking.customerInfo.phone}</span>
            </div>
          </div>
        </div>

        {booking.specialRequests && (
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-white/70 text-sm">
              <strong>Special Requests:</strong> {booking.specialRequests}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
            View Details
          </Button>
          {booking.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-400/30 text-red-400 hover:bg-red-400/10 bg-transparent"
            >
              Cancel Booking
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />

      <main className="pt-20">
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-white/70">Manage your travel bookings and view your adventure history</p>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20 mb-8">
                <TabsTrigger
                  value="upcoming"
                  className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
                >
                  Upcoming ({upcomingBookings.length})
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
                >
                  Past ({pastBookings.length})
                </TabsTrigger>
                <TabsTrigger
                  value="cancelled"
                  className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
                >
                  Cancelled ({cancelledBookings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6">
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No upcoming bookings</h3>
                    <p className="text-white/70 mb-6">Ready for your next adventure?</p>
                    <Button
                      onClick={() => router.push("/packages")}
                      className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                    >
                      Explore Packages
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {upcomingBookings.map((booking) => (
                      <BookingCard key={booking._id?.toString()} booking={booking} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-6">
                {pastBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No past bookings</h3>
                    <p className="text-white/70">Your completed adventures will appear here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pastBookings.map((booking) => (
                      <BookingCard key={booking._id?.toString()} booking={booking} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-6">
                {cancelledBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white/60 text-2xl">✓</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No cancelled bookings</h3>
                    <p className="text-white/70">Great! You haven't cancelled any bookings</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {cancelledBookings.map((booking) => (
                      <BookingCard key={booking._id?.toString()} booking={booking} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
