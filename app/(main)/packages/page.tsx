"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  MapPin,
  Star,
  Search,
  X,
  Eye,
  ExternalLink,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TravelPackage {
  _id: string;
  name: string;
  description: string;
  destinationId: string;
  destinationName: string;
  duration: number;
  price: number;
  isFree: boolean;
  image?: {
    url: string;
    publicId: string;
  };
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
  }>;
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  startDate: string;
  endDate: string;
  difficulty: "easy" | "moderate" | "challenging";
  category: string;
  minGroupSize: number;
  maxGroupSize: number;
  averageRating: number;
  totalReviews: number;
  featured: boolean;
  status: "active" | "inactive" | "soldout" | "upcoming";
  requirements: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * PackageBookingButton Component
 * ================================
 * Intelligent button that adapts based on package status and availability
 *
 * Status Logic:
 * - active: Trip is currently running → "Book Now"
 * - upcoming: Trip starts in future → "Book Now" or "Pre-Book"
 * - soldout: No seats available → Disabled "Sold Out"
 * - inactive: Trip ended → Disabled "Trip Ended"
 */
interface BookingButtonProps {
  pkg: TravelPackage;
  variant?: "full" | "compact";
}

const PackageBookingButton: React.FC<BookingButtonProps> = ({
  pkg,
  variant = "full",
}) => {
  /**
   * Determine if package is bookable
   * ================================
   * Bookable when:
   * 1. Status is "active" OR "upcoming"
   * 2. Has available seats (availableSeats > 0)
   * 3. Not sold out
   */
  const isBookable =
    (pkg.status === "active" || pkg.status === "upcoming") &&
    pkg.availableSeats > 0 &&
    pkg.status !== "soldout";

  /**
   * Get button configuration based on status
   * ========================================
   */
  const getButtonConfig = () => {
    // Sold Out: No seats available
    if (pkg.status === "soldout" || pkg.availableSeats === 0) {
      return {
        text: "Sold Out",
        icon: AlertCircle,
        disabled: true,
        className:
          "bg-red-500/20 text-red-400 cursor-not-allowed hover:bg-red-500/20",
        tooltip: "This package is fully booked",
      };
    }

    // Inactive: Trip has ended
    if (pkg.status === "inactive") {
      return {
        text: "Trip Ended",
        icon: Clock,
        disabled: true,
        className:
          "bg-gray-500/20 text-gray-400 cursor-not-allowed hover:bg-gray-500/20",
        tooltip: "This trip has already concluded",
      };
    }

    // Upcoming: Future trip - Available for booking
    if (pkg.status === "upcoming") {
      const daysUntilStart = Math.ceil(
        (new Date(pkg.startDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      return {
        text: daysUntilStart > 30 ? "Pre-Book Now" : "Book Now",
        icon: ExternalLink,
        disabled: false,
        className:
          "bg-gradient-to-r from-blue-400 to-cyan-600 hover:from-blue-500 hover:to-cyan-700",
        tooltip: `Trip starts in ${daysUntilStart} days - ${pkg.availableSeats} seats available`,
      };
    }

    // Active: Trip is currently running - Still accepting bookings
    if (pkg.status === "active") {
      return {
        text: "Book Now",
        icon: ExternalLink,
        disabled: false,
        className:
          "bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700",
        tooltip: `Trip in progress - ${pkg.availableSeats} seats still available`,
      };
    }

    // Fallback
    return {
      text: "Unavailable",
      icon: AlertCircle,
      disabled: true,
      className:
        "bg-gray-500/20 text-gray-400 cursor-not-allowed hover:bg-gray-500/20",
      tooltip: "This package is not available for booking",
    };
  };

  const config = getButtonConfig();
  const Icon = config.icon;

  /**
   * Handle booking click
   * ====================
   * Redirects to booking page with package ID
   * Authentication is handled on the booking page
   */
  const handleBookingClick = () => {
    if (!config.disabled) {
      window.location.href = `/dashboard/booking?package=${pkg._id}`;
    }
  };

  if (variant === "compact") {
    return (
      <Button
        onClick={handleBookingClick}
        disabled={config.disabled}
        className={`flex-1 text-xs sm:text-sm h-9 sm:h-10 ${config.className}`}
        title={config.tooltip}
      >
        <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        {config.text}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleBookingClick}
        disabled={config.disabled}
        className={`w-full ${config.className}`}
        title={config.tooltip}
      >
        <Icon className="w-4 h-4 mr-2" />
        {config.text}
      </Button>

      {/* Show availability alert for low stock */}
      {isBookable && pkg.availableSeats <= 3 && pkg.availableSeats > 0 && (
        <Alert className="bg-orange-500/10 border-orange-500/30">
          <AlertCircle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-xs text-orange-300">
            Only {pkg.availableSeats}{" "}
            {pkg.availableSeats === 1 ? "seat" : "seats"} left!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

/**
 * Main Packages Page Component
 * =============================
 */
export default function PackagesPage() {
  const searchParams = useSearchParams();
  const destinationId = searchParams.get("destination");

  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, [destinationId]);

  /**
   * Fetch Packages from API
   * ========================
   * Fetches packages with optional destination filter
   * Now supports both "active" and "upcoming" status
   */
  const fetchPackages = async (search = "") => {
    try {
      setLoading(true);
      let url = "/api/packages";
      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (destinationId) params.append("destinationId", destinationId);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.packages) {
        setPackages(data.packages);
      } else {
        setError("Failed to load packages");
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setError("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPackages(searchQuery);
  };

  const handleViewDetails = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPackage(null);
  };

  /**
   * Format price with KES currency
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(price);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * Get status badge styling
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "soldout":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  /**
   * Get difficulty badge styling
   */
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "moderate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "challenging":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  /**
   * Get status display text
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active Now";
      case "upcoming":
        return "Upcoming";
      case "soldout":
        return "Sold Out";
      case "inactive":
        return "Ended";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 sm:h-32 sm:w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-sm sm:text-base">
            Loading packages...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <Button
            onClick={() => fetchPackages()}
            className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 w-full sm:w-auto"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Adventure Packages
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8">
              Discover extraordinary travel experiences across Kenya's most
              stunning destinations
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  placeholder="Search destinations, activities, or experiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 text-sm h-10 sm:h-12"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-12 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <Button
                  type="submit"
                  className="absolute right-1 top-1 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 h-8 sm:h-10 text-xs sm:text-sm"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-8 sm:py-12 pb-16 sm:pb-20">
        <div className="container mx-auto px-4">
          {packages.length === 0 ? (
            // ============================================
            // EMPTY STATE
            // ============================================
            <div className="text-center py-12 sm:py-16">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-white/70 text-base sm:text-lg mb-2">
                {destinationId
                  ? "No packages found for this destination"
                  : "No packages found"}
              </p>
              <p className="text-slate-500 text-sm sm:text-base mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : destinationId
                  ? "Check back later for new packages"
                  : "Check back later for new packages"}
              </p>
              {searchQuery && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    fetchPackages();
                  }}
                  className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            // ============================================
            // PACKAGES GRID
            // ============================================
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="glass rounded-xl sm:rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
                >
                  {/* Package Image */}
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                    <img
                      src={pkg.image?.url || "/placeholder.svg"}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Rating Badge */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 glass rounded-full px-2 sm:px-3 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      <span className="text-white text-xs sm:text-sm">
                        {pkg.averageRating.toFixed(1)}
                      </span>
                    </div>

                    {/* Featured Badge */}
                    {pkg.featured && (
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                        Featured
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                      <Badge className={getStatusColor(pkg.status)}>
                        {getStatusText(pkg.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Package Content */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-1">
                      {pkg.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                      <span className="text-slate-400 text-xs sm:text-sm">
                        {pkg.destinationName}
                      </span>
                    </div>

                    <p className="text-white/70 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
                      {pkg.description}
                    </p>

                    {/* Package Meta Info */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{pkg.duration} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{pkg.availableSeats} available</span>
                      </div>
                      <div className="text-cyan-400 font-medium">
                        {pkg.isFree ? "Free" : formatPrice(pkg.price)}
                      </div>
                    </div>

                    {/* Badges: Difficulty, Category, Highlights */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                      <Badge className={getDifficultyColor(pkg.difficulty)}>
                        {pkg.difficulty}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {pkg.category}
                      </Badge>
                      {pkg.highlights.slice(0, 1).map((highlight, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-cyan-400/20 text-cyan-400 text-xs rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                      {pkg.highlights.length > 1 && (
                        <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-full">
                          +{pkg.highlights.length - 1} more
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleViewDetails(pkg)}
                        variant="outline"
                        className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs sm:text-sm h-9 sm:h-10"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        View Details
                      </Button>

                      {/* UPDATED: Dynamic Booking Button */}
                      <PackageBookingButton pkg={pkg} variant="compact" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Package Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedPackage?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm sm:text-base">
              {selectedPackage?.destinationName}
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-4 sm:space-y-6">
              {/* Package Image */}
              {selectedPackage.image?.url && (
                <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                  <img
                    src={selectedPackage.image.url}
                    alt={selectedPackage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Rating and Status */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 bg-slate-700/50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">
                    {selectedPackage.averageRating.toFixed(1)}
                  </span>
                  <span className="text-slate-400">
                    ({selectedPackage.totalReviews} reviews)
                  </span>
                </div>
                <Badge className={getStatusColor(selectedPackage.status)}>
                  {getStatusText(selectedPackage.status)}
                </Badge>
                <Badge
                  className={getDifficultyColor(selectedPackage.difficulty)}
                >
                  {selectedPackage.difficulty}
                </Badge>
                {selectedPackage.featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                  Description
                </h4>
                <p className="text-slate-300 text-sm sm:text-base">
                  {selectedPackage.description}
                </p>
              </div>

              {/* Package Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                    Duration
                  </h4>
                  <p className="text-slate-300 text-sm sm:text-base">
                    {selectedPackage.duration} days
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                    Price
                  </h4>
                  <p className="text-cyan-400 font-bold text-sm sm:text-base">
                    {selectedPackage.isFree
                      ? "Free"
                      : formatPrice(selectedPackage.price)}
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                    Available Seats
                  </h4>
                  <p className="text-slate-300 text-sm sm:text-base">
                    {selectedPackage.availableSeats} of{" "}
                    {selectedPackage.totalSeats}
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                    Group Size
                  </h4>
                  <p className="text-slate-300 text-sm sm:text-base">
                    {selectedPackage.minGroupSize} -{" "}
                    {selectedPackage.maxGroupSize} people
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                  Trip Dates
                </h4>
                <p className="text-slate-300 text-sm sm:text-base">
                  {formatDate(selectedPackage.startDate)} -{" "}
                  {formatDate(selectedPackage.endDate)}
                </p>
              </div>

              {/* Highlights */}
              {selectedPackage.highlights.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                    Highlights
                  </h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {selectedPackage.highlights.map((highlight, index) => (
                      <Badge
                        key={index}
                        className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions */}
              {selectedPackage.inclusions.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                    What's Included
                  </h4>
                  <ul className="text-slate-300 text-sm sm:text-base list-disc list-inside space-y-1">
                    {selectedPackage.inclusions.map((inclusion, index) => (
                      <li key={index}>{inclusion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {selectedPackage.requirements.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                    Requirements
                  </h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {selectedPackage.requirements.map((requirement, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"
                      >
                        {requirement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Section with Dynamic Button */}
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-slate-300 text-sm sm:text-base">
                      Total Price
                    </span>
                    <div className="text-cyan-400 font-bold text-xl sm:text-2xl">
                      {selectedPackage.isFree
                        ? "Free"
                        : formatPrice(selectedPackage.price)}
                    </div>
                  </div>

                  {/* UPDATED: Full-width Dynamic Booking Button */}
                  <div className="w-full sm:w-auto">
                    <PackageBookingButton
                      pkg={selectedPackage}
                      variant="full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
