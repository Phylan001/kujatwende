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
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Booking {
  _id: string;
  packageId: {
    _id: string;
    name: string;
    destinationName: string;
    image?: { url: string };
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    emergencyContact: string;
  };
  travelDate: string;
  numberOfTravelers: number;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  createdAt: string;
}

export default function BookingDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/user/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      } else {
        throw new Error("Failed to fetch booking");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = () => {
    router.push(`/dashboard/payments/new/${bookingId}`);
  };

  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/user/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been cancelled successfully",
        });
        fetchBooking();
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass border-orange-500/20 max-w-md">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-bold text-white mb-2">Booking Not Found</h3>
            <p className="text-white/70 mb-6">The booking you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/dashboard/bookings")} className="btn-adventure">
              View My Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-orange-400" />
          <div>
            <h2 className="text-3xl font-bold text-white">Booking Details</h2>
            <p className="text-white/70">Manage your booking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
          <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
            {booking.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white">Package Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                {booking.packageId.image?.url && (
                  <img
                    src={booking.packageId.image.url}
                    alt={booking.packageId.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-white font-bold text-xl mb-2">
                    {booking.packageId.name}
                  </h3>
                  <p className="text-orange-400 flex items-center gap-1 mb-4">
                    <MapPin className="w-4 h-4" />
                    {booking.packageId.destinationName}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      {format(new Date(booking.travelDate), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Users className="w-4 h-4 text-orange-400" />
                      {booking.numberOfTravelers} travelers
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <DollarSign className="w-4 h-4 text-orange-400" />
                      KSh {booking.totalAmount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="w-4 h-4 text-orange-400" />
                      {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="glass border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-white/70 text-sm">Name</p>
                  <p className="text-white font-medium">{booking.customerInfo.name}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Email</p>
                  <p className="text-white font-medium">{booking.customerInfo.email}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Phone</p>
                  <p className="text-white font-medium">{booking.customerInfo.phone}</p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Emergency Contact</p>
                  <p className="text-white font-medium">{booking.customerInfo.emergencyContact}</p>
                </div>
              </div>
              {booking.specialRequests && (
                <div className="mt-4">
                  <p className="text-white/70 text-sm">Special Requests</p>
                  <p className="text-white mt-1">{booking.specialRequests}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card className="glass border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.paymentStatus === "pending" && booking.status !== "cancelled" && (
                <Button onClick={handleMakePayment} className="w-full btn-adventure">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Make Payment
                </Button>
              )}
              
              {booking.status === "pending" && (
                <Button
                  onClick={handleCancelBooking}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              )}

              <Button
                onClick={() => router.push(`/packages/${booking.packageId._id}`)}
                variant="outline"
                className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                View Package
              </Button>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card className="glass border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Amount</span>
                  <span className="text-orange-400 font-bold">
                    KSh {booking.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Status</span>
                  <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                    {booking.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}