"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Package,
  MapPin,
  DollarSign,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  _id: string;
  bookingNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  packageId: string;
  packageName: string;
  destination: string;
  numberOfTravelers: number;
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  bookingStatus: "confirmed" | "pending" | "cancelled" | "completed";
  travelDate: string;
  createdAt: string;
  specialRequests?: string;
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [accessDenied, setAccessDenied] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

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
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      const data = await response.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: string
  ) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchBookings();
        setIsViewDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.packageName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.bookingStatus === statusFilter;
    const matchesPayment =
      paymentFilter === "all" || booking.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "refunded":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "paid":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "pending":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "cancelled":
      case "failed":
        return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "completed":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const totalRevenue = filteredBookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 sm:h-32 sm:w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-sm sm:text-base">
            {authLoading ? "Verifying credentials..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (accessDenied || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass border-red-500/20 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-red-400">
              Access Denied
            </CardTitle>
            <CardDescription className="text-white/70 text-sm sm:text-base">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-white/80 text-xs sm:text-sm">
                This area is restricted to administrators only.
                {user &&
                  user.role === "user" &&
                  " Redirecting to your dashboard..."}
              </p>
            </div>
            <Button
              onClick={() => router.push(user ? "/dashboard" : "/auth/login")}
              className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-sm sm:text-base"
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Bookings
          </h2>
          <p className="text-slate-400 mt-1 text-xs sm:text-base">
            Manage and track all customer bookings
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Total Bookings
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-400 mt-2">
              {bookings.length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Confirmed
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-400 mt-2">
              {bookings.filter((b) => b.bookingStatus === "confirmed").length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Pending
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-yellow-400 mt-2">
              {bookings.filter((b) => b.bookingStatus === "pending").length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Revenue
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-orange-400 mt-2">
              KSh {totalRevenue.toLocaleString()}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white text-lg sm:text-xl">
                All Bookings
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm">
                View and manage customer bookings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
                  <SelectValue placeholder="Booking Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="block lg:hidden space-y-3">
            {filteredBookings.map((booking) => (
              <Card
                key={booking._id}
                className="bg-slate-700/30 border-slate-600/50 hover:border-cyan-400/50 transition-colors"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-cyan-400 font-mono text-xs font-semibold">
                        #{booking.bookingNumber}
                      </p>
                      <p className="text-white font-medium text-sm mt-1">
                        {booking.userName}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {booking.userEmail}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge
                        className={getBookingStatusColor(booking.bookingStatus)}
                      >
                        <span className="flex items-center gap-1 text-xs">
                          {getStatusIcon(booking.bookingStatus)}
                          {booking.bookingStatus}
                        </span>
                      </Badge>
                      <Badge
                        className={getPaymentStatusColor(booking.paymentStatus)}
                      >
                        <span className="flex items-center gap-1 text-xs">
                          {getStatusIcon(booking.paymentStatus)}
                          {booking.paymentStatus}
                        </span>
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-600/50">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Package className="w-3 h-3" />
                      {booking.packageName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {booking.destination}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(booking.travelDate), "MMM dd, yyyy")}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-600/50">
                    <div>
                      <p className="text-xs text-slate-400">Total Amount</p>
                      <p className="text-cyan-400 font-bold text-lg">
                        KSh {booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => viewBookingDetails(booking)}
                      className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-lg border border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-slate-700/30">
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Booking #
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Customer
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Package
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Travel Date
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Amount
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Status
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Payment
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 text-cyan-400 font-mono text-sm">
                      #{booking.bookingNumber}
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-white/80 text-sm">
                          {booking.userName}
                        </p>
                        <p className="text-white/50 text-xs">
                          {booking.userEmail}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-white/80 text-sm">
                          {booking.packageName}
                        </p>
                        <p className="text-white/50 text-xs">
                          {booking.destination}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-white/80 text-sm">
                      {format(new Date(booking.travelDate), "MMM dd, yyyy")}
                    </td>
                    <td className="p-3 text-white/80 font-semibold text-sm">
                      KSh {booking.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <Badge
                        className={getBookingStatusColor(booking.bookingStatus)}
                      >
                        <span className="flex items-center gap-1 text-xs">
                          {getStatusIcon(booking.bookingStatus)}
                          {booking.bookingStatus}
                        </span>
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        className={getPaymentStatusColor(booking.paymentStatus)}
                      >
                        <span className="flex items-center gap-1 text-xs">
                          {getStatusIcon(booking.paymentStatus)}
                          {booking.paymentStatus}
                        </span>
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        onClick={() => viewBookingDetails(booking)}
                        className="bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-white/70 text-sm sm:text-base">
                No bookings found
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Booking Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              Complete information about this booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6 py-4">
              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-xs text-slate-400">Booking Number</p>
                  <p className="text-white font-mono font-semibold">
                    #{selectedBooking.bookingNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Booking Date</p>
                  <p className="text-white">
                    {format(
                      new Date(selectedBooking.createdAt),
                      "MMM dd, yyyy"
                    )}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  Customer Information
                </h3>
                <div className="space-y-2 p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-white">
                      {selectedBooking.userName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-white">
                      {selectedBooking.userEmail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-white">
                      {selectedBooking.userPhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Package Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-400" />
                  Package Information
                </h3>
                <div className="space-y-2 p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-400">Package Name</p>
                    <p className="text-white font-medium">
                      {selectedBooking.packageName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Destination</p>
                    <p className="text-white">{selectedBooking.destination}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Travel Date</p>
                      <p className="text-white">
                        {format(
                          new Date(selectedBooking.travelDate),
                          "MMM dd, yyyy"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Travelers</p>
                      <p className="text-white">
                        {selectedBooking.numberOfTravelers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  Payment Information
                </h3>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400">Total Amount</span>
                    <span className="text-2xl font-bold text-cyan-400">
                      KSh {selectedBooking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      className={getBookingStatusColor(
                        selectedBooking.bookingStatus
                      )}
                    >
                      {selectedBooking.bookingStatus}
                    </Badge>
                    <Badge
                      className={getPaymentStatusColor(
                        selectedBooking.paymentStatus
                      )}
                    >
                      {selectedBooking.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    Special Requests
                  </h3>
                  <p className="text-slate-300 p-4 bg-slate-700/30 rounded-lg text-sm">
                    {selectedBooking.specialRequests}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <Button
                  onClick={() =>
                    handleUpdateBookingStatus(selectedBooking._id, "confirmed")
                  }
                  disabled={selectedBooking.bookingStatus === "confirmed"}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
                <Button
                  onClick={() =>
                    handleUpdateBookingStatus(selectedBooking._id, "cancelled")
                  }
                  disabled={selectedBooking.bookingStatus === "cancelled"}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
