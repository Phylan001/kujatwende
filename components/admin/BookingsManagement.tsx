"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Edit, Download } from "lucide-react"
import type { Booking } from "@/lib/models/Booking"
import { format } from "date-fns"

export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
      const data = await response.json()
      if (data.bookings) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchBookings() // Refresh the list
      }
    } catch (error) {
      console.error("Error updating booking:", error)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking._id?.toString().includes(searchQuery)

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    const matchesPayment = paymentFilter === "all" || booking.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

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

  if (loading) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Bookings Management</CardTitle>
            <CardDescription className="text-white/70">Manage all customer bookings and reservations</CardDescription>
          </div>
          <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings Table */}
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-white/80">Booking ID</TableHead>
                <TableHead className="text-white/80">Customer</TableHead>
                <TableHead className="text-white/80">Travel Date</TableHead>
                <TableHead className="text-white/80">Travelers</TableHead>
                <TableHead className="text-white/80">Amount</TableHead>
                <TableHead className="text-white/80">Status</TableHead>
                <TableHead className="text-white/80">Payment</TableHead>
                <TableHead className="text-white/80">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking._id?.toString()} className="border-white/10 hover:bg-white/5">
                  <TableCell className="text-white/80 font-mono">#{booking._id?.toString().slice(-6)}</TableCell>
                  <TableCell>
                    <div className="text-white/80">
                      <div className="font-medium">{booking.customerInfo.name}</div>
                      <div className="text-sm text-white/60">{booking.customerInfo.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/80">
                    {format(new Date(booking.travelDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-white/80">{booking.numberOfTravelers}</TableCell>
                  <TableCell className="text-white/80 font-medium">
                    KSh {booking.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusColor(booking.paymentStatus)}>{booking.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-white/60 hover:text-cyan-400">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => updateBookingStatus(booking._id!.toString(), value)}
                      >
                        <SelectTrigger className="w-24 h-8 bg-white/10 border-white/20 text-white text-xs">
                          <Edit className="w-3 h-3" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/70">No bookings found matching your criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
