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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface TravelPackage {
  _id: string;
  name: string;
  description: string;
  destinationName: string;
  duration: number;
  price: number;
  isFree: boolean;
  image?: { url: string };
  availableSeats: number;
  startDate: string;
  endDate: string;
  inclusions: string[];
}

export default function NewBookingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const packageId = params.packageId as string;

  const [packageData, setPackageData] = useState<TravelPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [bookingData, setBookingData] = useState({
    travelDate: "",
    numberOfTravelers: 1,
    emergencyContact: "",
    specialRequests: "",
  });

  useEffect(() => {
    fetchPackage();
  }, [packageId]);

  const fetchPackage = async () => {
    try {
      const response = await fetch(`/api/user/packages/${packageId}`);
      const data = await response.json();
      if (data.success) {
        setPackageData(data.package);
      }
    } catch (error) {
      console.error("Error fetching package:", error);
      toast({
        title: "Error",
        description: "Failed to load package details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId,
          ...bookingData,
          customerInfo: {
            name: user?.name,
            email: user?.email,
            phone: user?.phone || "",
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Booking Created",
          description: "Your booking has been created successfully!",
        });
        router.push(`/dashboard/bookings/${data.booking._id}`);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = packageData ? packageData.price * bookingData.numberOfTravelers : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass border-orange-500/20 max-w-md">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-bold text-white mb-2">Package Not Found</h3>
            <p className="text-white/70 mb-6">The package you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/packages")} className="btn-adventure">
              Browse Packages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/packages")}
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Packages
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-white">Book Your Adventure</h2>
            <p className="text-white/70">Complete your booking details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="glass border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-white">Booking Details</CardTitle>
                <CardDescription className="text-white/70">
                  Please provide your travel information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="travelDate" className="text-white">
                        Travel Date *
                      </Label>
                      <Input
                        id="travelDate"
                        type="date"
                        value={bookingData.travelDate}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, travelDate: e.target.value })
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="bg-white/10 border-white/20 text-white focus:border-orange-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberOfTravelers" className="text-white">
                        Number of Travelers *
                      </Label>
                      <Input
                        id="numberOfTravelers"
                        type="number"
                        min="1"
                        max={packageData.availableSeats}
                        value={bookingData.numberOfTravelers}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            numberOfTravelers: parseInt(e.target.value),
                          })
                        }
                        className="bg-white/10 border-white/20 text-white focus:border-orange-400"
                        required
                      />
                      <p className="text-white/60 text-xs">
                        {packageData.availableSeats} seats available
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-white">
                      Emergency Contact *
                    </Label>
                    <Input
                      id="emergencyContact"
                      type="tel"
                      placeholder="+254 XXX XXX XXX"
                      value={bookingData.emergencyContact}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, emergencyContact: e.target.value })
                      }
                      className="bg-white/10 border-white/20 text-white focus:border-orange-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests" className="text-white">
                      Special Requests
                    </Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Any special requirements or requests..."
                      value={bookingData.specialRequests}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, specialRequests: e.target.value })
                      }
                      className="bg-white/10 border-white/20 text-white focus:border-orange-400 min-h-[100px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || bookingData.numberOfTravelers > packageData.availableSeats}
                    className="w-full btn-adventure"
                  >
                    {submitting ? "Creating Booking..." : "Confirm Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Package Summary */}
          <div className="space-y-6">
            <Card className="glass border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-white">Package Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {packageData.image?.url && (
                  <img
                    src={packageData.image.url}
                    alt={packageData.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="text-white font-bold text-lg">{packageData.name}</h3>
                  <p className="text-orange-400 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {packageData.destinationName}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-white/70">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Duration
                    </span>
                    <span className="text-white">{packageData.duration} days</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Travelers
                    </span>
                    <span className="text-white">{bookingData.numberOfTravelers}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Travel Date
                    </span>
                    <span className="text-white">
                      {bookingData.travelDate || "Not selected"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-orange-500/20 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-white">Total Amount</span>
                    <span className="text-orange-400">
                      {packageData.isFree ? "FREE" : `KSh ${totalAmount.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inclusions */}
            {packageData.inclusions.length > 0 && (
              <Card className="glass border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-sm">What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {packageData.inclusions.map((inclusion, index) => (
                      <li key={index} className="text-white/70 text-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        {inclusion}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}