"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import BookingDetailsModal from "@/components/user/bookings/BookingDetailsModal";
import PaymentModal from "@/components/user/bookings/PaymentModal";
import CancelBookingModal from "@/components/user/bookings/CancelBookingModal";

interface Booking {
  _id: string;
  packageId: {
    _id: string;
    name: string;
    image?: { url: string };
    destinationName: string;
    duration: number;
    price: number;
    isFree: boolean;
    inclusions: string[];
    exclusions: string[];
    highlights: string[];
    itinerary: Array<{
      day: number;
      title: string;
      description: string;
      activities: string[];
    }>;
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
  paymentId?: string;
}

export default function UserBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const bookingId = searchParams.get("booking");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchUserBookings();
  }, [user, authLoading, router, bookingId]);

  const fetchUserBookings = async () => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;

      if (!userId) {
        toast({
          title: "Error",
          description: "Unable to identify user. Please try logging in again.",
          variant: "destructive",
        });
        return;
      }

      const url = `/api/user/bookings?userId=${userId}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        let fetchedBookings = data.bookings || [];
        
        // Filter by bookingId if present in URL
        if (bookingId) {
          fetchedBookings = fetchedBookings.filter(
            (booking: Booking) => booking._id === bookingId
          );
        }
        
        setBookings(fetchedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load your bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleMakePayment = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsPaymentModalOpen(true);
  };

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully",
    });
    setIsPaymentModalOpen(false);
    fetchUserBookings();
    router.push(`/dashboard/payments?payment=${paymentId}`);
  };

  const handleCancelSuccess = () => {
    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled successfully",
    });
    setIsCancelModalOpen(false);
    // Clear booking filter and refresh all bookings
    router.push('/dashboard/bookings');
    fetchUserBookings();
  };

  const handleViewAllBookings = () => {
    router.push('/dashboard/bookings');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-orange-400" />
          <div>
            <h2 className="text-3xl font-bold text-white">My Bookings</h2>
            <p className="text-white/70">Manage your adventure bookings</p>
            {bookingId && (
              <p className="text-orange-400 text-sm">
                Viewing booking: {bookingId}
              </p>
            )}
          </div>
        </div>
        
        {bookingId && (
          <Button
            onClick={handleViewAllBookings}
            variant="outline"
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          >
            View All Bookings
          </Button>
        )}
      </div>

      {/* Bookings Grid */}
      <div className="grid gap-6">
        {bookings.length === 0 ? (
          <Card className="glass border-orange-500/20">
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {bookingId ? "Booking not found" : "No bookings yet"}
              </h3>
              <p className="text-white/70 mb-6">
                {bookingId 
                  ? "The booking you're looking for doesn't exist or you don't have access to it"
                  : "Start your adventure by booking a package"
                }
              </p>
              <Button
                onClick={() => router.push("/packages")}
                className="btn-adventure"
              >
                Explore Packages
              </Button>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card
              key={booking._id}
              className="glass border-orange-500/20 hover:border-orange-500/40 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Package Image */}
                  <div className="w-full lg:w-48 h-32 rounded-lg overflow-hidden">
                    {booking.packageId.image?.url ? (
                      <img
                        src={booking.packageId.image.url}
                        alt={booking.packageId.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-500/10 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-orange-400" />
                      </div>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {booking.packageId.name}
                        </h3>
                        <p className="text-orange-400 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {booking.packageId.destinationName}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Badge className={getStatusColor(booking.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </span>
                        </Badge>
                        <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
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
                        <Calendar className="w-4 h-4 text-orange-400" />
                        {format(new Date(booking.createdAt), "MMM dd, yyyy")}
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                        <p className="text-orange-300 text-sm">
                          <strong>Special Requests:</strong>{" "}
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                      <Button
                        onClick={() => handleViewBooking(booking)}
                        variant="outline"
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Booking
                      </Button>
                      
                      {booking.paymentStatus !== "paid" && booking.status !== "cancelled" && (
                        <Button
                          onClick={() => handleMakePayment(booking)}
                          className="bg-gradient-to-r from-green-400 to-cyan-400 hover:from-green-500 hover:to-cyan-500"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Make Payment
                        </Button>
                      )}
                      
                      {booking.status !== "cancelled" && booking.status !== "completed" && (
                        <Button
                          onClick={() => handleCancelBooking(booking)}
                          variant="destructive"
                          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        booking={selectedBooking}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        booking={selectedBooking}
        onSuccess={handlePaymentSuccess}
      />

      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        booking={selectedBooking}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}