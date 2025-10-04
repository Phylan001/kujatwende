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
  Eye,
  Star,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  _id: string;
  packageId: {
    _id: string;
    name: string;
    image?: { url: string };
    destinationName: string;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  travelDate: string;
  numberOfTravelers: number;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  createdAt: string;
}

export default function UserBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchUserBookings();
  }, [user, authLoading, router]);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/user/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
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
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8 text-orange-400" />
        <div>
          <h2 className="text-3xl font-bold text-white">My Bookings</h2>
          <p className="text-white/70">Manage your adventure bookings</p>
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid gap-6">
        {bookings.length === 0 ? (
          <Card className="glass border-orange-500/20">
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
              <p className="text-white/70 mb-6">Start your adventure by booking a package</p>
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
            <Card key={booking._id} className="glass border-orange-500/20 hover:border-orange-500/40 transition-all">
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
                      <Badge className={getStatusColor(booking.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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
                    </div>

                    {booking.specialRequests && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                        <p className="text-orange-300 text-sm">
                          <strong>Special Requests:</strong> {booking.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => router.push(`/packages/${booking.packageId._id}`)}
                      variant="outline"
                      className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Package
                    </Button>
                    {booking.status === "completed" && (
                      <Button
                        onClick={() => router.push(`/packages/${booking.packageId._id}/review`)}
                        className="bg-gradient-to-r from-orange-400 to-cyan-400 hover:from-orange-500 hover:to-cyan-500"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Write Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}