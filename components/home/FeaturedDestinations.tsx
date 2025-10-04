"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Star, Calendar, Eye, ExternalLink } from "lucide-react";

interface Destination {
  _id: string;
  name: string;
  description: string;
  bannerImage?: {
    url: string;
    publicId: string;
  };
  location: {
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  bestTimeToVisit: string;
  highlights: string[];
  activities: string[];
  averageRating: number;
  packagesCount: number;
  totalReviews: number;
  featured: boolean;
  active: boolean;
  gallery: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
}

export function FeaturedDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch("/api/destinations?featured=true&limit=3");
        const data = await response.json();

        if (data.success && data.destinations) {
          setDestinations(data.destinations);
        }
      } catch (error) {
        console.error("Error fetching featured destinations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const handleViewDetails = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDestination(null);
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Featured Destinations
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Explore Kenya's most captivating locations, handpicked for
              extraordinary experiences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-56 bg-white/10 rounded-xl mb-4" />
                <div className="h-4 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (destinations.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Featured Destinations
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Explore Kenya's most captivating locations, handpicked for
              extraordinary experiences
            </p>
          </div>

          {/* Reusable Destination Cards - Same as destinations page */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination, index) => (
              <div
                key={destination._id}
                className="glass rounded-xl sm:rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 animate-fade-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                  <img
                    src={destination.bannerImage?.url || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 glass rounded-full px-2 sm:px-3 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-xs sm:text-sm">
                      {destination.averageRating.toFixed(1)}
                    </span>
                  </div>
                  {destination.featured && (
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-1">
                    {destination.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                    <span className="text-slate-400 text-xs sm:text-sm">
                      {destination.location.region}
                    </span>
                  </div>

                  <p className="text-white/70 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2">
                    {destination.description}
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{destination.bestTimeToVisit}</span>
                    </div>
                    <div className="text-cyan-400 font-medium">
                      {destination.packagesCount} packages
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                    {destination.highlights
                      .slice(0, 2)
                      .map((highlight, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-cyan-400/20 text-cyan-400 text-xs rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    {destination.highlights.length > 2 && (
                      <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-full">
                        +{destination.highlights.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Dual Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => handleViewDetails(destination)}
                      variant="outline"
                      className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      View Details
                    </Button>
                    <Link
                      href={`/packages?destination=${destination._id}`}
                      className="flex-1"
                    >
                      <Button className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-xs sm:text-sm h-9 sm:h-10">
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        View Packages
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/destinations">
              <Button
                variant="outline"
                size="lg"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black bg-transparent"
              >
                View All Destinations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Destination Detail Modal - Same as destinations page */}
      <Dialog open={isDetailModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedDestination?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm sm:text-base">
              {selectedDestination?.location.region}
            </DialogDescription>
          </DialogHeader>

          {selectedDestination && (
            <div className="space-y-4 sm:space-y-6">
              {/* Banner Image */}
              {selectedDestination.bannerImage?.url && (
                <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                  <img
                    src={selectedDestination.bannerImage.url}
                    alt={selectedDestination.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Rating and Status */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 bg-slate-700/50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">
                    {selectedDestination.averageRating.toFixed(1)}
                  </span>
                  <span className="text-slate-400">
                    ({selectedDestination.totalReviews} reviews)
                  </span>
                </div>
                {selectedDestination.featured && (
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
                  {selectedDestination.description}
                </p>
              </div>

              {/* Best Time to Visit */}
              <div>
                <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                  Best Time to Visit
                </h4>
                <p className="text-slate-300 text-sm sm:text-base">
                  {selectedDestination.bestTimeToVisit}
                </p>
              </div>

              {/* Highlights */}
              {selectedDestination.highlights.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                    Highlights
                  </h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {selectedDestination.highlights.map((highlight, index) => (
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

              {/* Activities */}
              {selectedDestination.activities.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                    Activities
                  </h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {selectedDestination.activities.map((activity, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {selectedDestination.gallery &&
                selectedDestination.gallery.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">
                      Gallery ({selectedDestination.gallery.length} images)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedDestination.gallery
                        .slice(0, 6)
                        .map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden group"
                          >
                            <img
                              src={image.url}
                              alt={image.caption || `Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {image.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 sm:p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                {image.caption}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Packages Count and Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-700/30 rounded-lg">
                <div className="text-center sm:text-left">
                  <span className="text-slate-300 text-sm sm:text-base">
                    Total Packages
                  </span>
                  <div className="text-cyan-400 font-bold text-xl sm:text-2xl">
                    {selectedDestination.packagesCount}
                  </div>
                </div>
                <Link
                  href={`/packages?destination=${selectedDestination._id}`}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View All Packages
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
