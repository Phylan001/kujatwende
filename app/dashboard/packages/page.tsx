"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Package,
  MapPin,
  Calendar,
  Users,
  Star,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PackageDetailsModal from "@/components/user/packages/PackageDetailsModal";
import BookingModal from "@/components/user/packages/BookingModal";

interface TravelPackage {
  _id: string;
  name: string;
  description: string;
  destinationName: string;
  destinationId: string;
  duration: number;
  price: number;
  isFree: boolean;
  image?: { url: string };
  availableSeats: number;
  totalSeats: number;
  startDate: string;
  endDate: string;
  featured: boolean;
  status: string;
  difficulty: string;
  category: string;
  averageRating: number;
  totalReviews: number;
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
  }>;
  requirements?: string[];
}

export default function PackagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const destinationFilter = searchParams.get("destination") || "all";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchPackages();
  }, [user, authLoading, router, destinationFilter]);

  const fetchPackages = async () => {
    try {
      const url =
        destinationFilter !== "all"
          ? `/api/user/packages?destination=${destinationFilter}`
          : "/api/user/packages";

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setIsDetailsModalOpen(true);
  };

  const handleBookNow = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (bookingData: {
    numberOfTravelers: number;
    travelDate: string;
    specialRequests?: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
      emergencyContact: string;
    };
  }) => {
    if (!selectedPackage) return;

    // Extract user ID from user object
    const userId = (user as any)?._id || (user as any)?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "Unable to identify user. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/user/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: selectedPackage._id,
          userId: userId,
          ...bookingData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Booking created successfully!",
        });
        setIsBookingModalOpen(false);
        // Redirect to booking page with the booking ID
        router.push(`/dashboard/bookings?booking=${data.booking._id}`);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create booking",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: "Failed to create booking",
        variant: "destructive",
      });
    }
  };

  const handlePackageReviewSubmit = async (reviewData: {
    rating: number;
    comment: string;
    title: string;
  }) => {
    if (!selectedPackage) return;

    // Extract user ID from user object
    const userId = (user as any)?._id || (user as any)?.id;

    if (!userId) {
      toast({
        title: "Error",
        description: "Unable to identify user. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/user/package-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: selectedPackage._id,
          userId: userId,
          rating: reviewData.rating,
          title: reviewData.title,
          comment: reviewData.comment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Review submitted successfully!",
        });
        setIsDetailsModalOpen(false);
        // Refresh packages to update ratings
        fetchPackages();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit review",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "soldout":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "moderate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "challenging":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Package className="w-8 h-8 text-orange-400" />
        <div>
          <h2 className="text-3xl font-bold text-white">Travel Packages</h2>
          <p className="text-white/70">Find your perfect adventure</p>
          {destinationFilter !== "all" && (
            <p className="text-orange-400 text-sm">
              Showing packages for selected destination
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      <Card className="glass border-orange-500/20">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
            <Input
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-orange-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <Card
            key={pkg._id}
            className="glass border-orange-500/20 hover:border-orange-500/40 transition-all"
          >
            <CardContent className="p-0">
              {/* Package Image */}
              <div className="relative h-48 bg-slate-600/50">
                {pkg.image?.url ? (
                  <img
                    src={pkg.image.url}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-500" />
                  </div>
                )}
                {pkg.featured && (
                  <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full font-semibold">
                    Featured
                  </div>
                )}
                <Badge
                  className={`absolute top-2 left-2 ${getStatusColor(
                    pkg.status
                  )}`}
                >
                  {pkg.status}
                </Badge>
                {pkg.isFree && (
                  <div className="absolute bottom-2 left-2 bg-cyan-500/90 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    FREE
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-orange-400 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {pkg.destinationName}
                  </p>
                </div>

                <p className="text-white/70 text-sm line-clamp-2">
                  {pkg.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-white/70">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    {pkg.duration} days
                  </div>
                  <div className="flex items-center gap-1 text-white/70">
                    <Users className="w-4 h-4 text-orange-400" />
                    {pkg.availableSeats}/{pkg.totalSeats} seats
                  </div>
                </div>

                {pkg.averageRating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">
                      {pkg.averageRating.toFixed(1)}
                    </span>
                    <span className="text-white/70">({pkg.totalReviews})</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-orange-500/20">
                  <div>
                    {pkg.isFree ? (
                      <p className="text-cyan-400 font-bold text-lg">FREE</p>
                    ) : (
                      <>
                        <p className="text-xs text-white/70">From</p>
                        <p className="text-orange-400 font-bold text-lg">
                          KSh {pkg.price.toLocaleString()}
                        </p>
                      </>
                    )}
                  </div>
                  <Badge className={getDifficultyColor(pkg.difficulty)}>
                    {pkg.difficulty}
                  </Badge>
                </div>

                {/* Highlights */}
                {pkg.highlights?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {pkg.highlights.slice(0, 3).map((highlight, index) => (
                      <Badge
                        key={index}
                        className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewDetails(pkg)}
                    variant="outline"
                    className="flex-1 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleBookNow(pkg)}
                    disabled={
                      pkg.status !== "active" || pkg.availableSeats === 0
                    }
                    className="flex-1 btn-adventure"
                  >
                    {pkg.status !== "active"
                      ? "Not Available"
                      : pkg.availableSeats === 0
                      ? "Sold Out"
                      : "Book Now"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <Card className="glass border-orange-500/20">
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No packages found
            </h3>
            <p className="text-white/70">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <PackageDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        package={selectedPackage}
        onReviewSubmit={handlePackageReviewSubmit}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        package={selectedPackage}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
}
