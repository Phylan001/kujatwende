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
  MapPin,
  Search,
  Star,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Destination {
  _id: string;
  name: string;
  description: string;
  bannerImage?: {
    url: string;
  };
  location: {
    region: string;
  };
  averageRating: number;
  totalReviews: number;
  packagesCount: number;
  featured: boolean;
  highlights: string[];
  activities: string[];
  bestTimeToVisit: string;
}

export default function DestinationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchDestinations();
  }, [user, authLoading, router]);

  const fetchDestinations = async () => {
    try {
      const response = await fetch("/api/user/destinations");
      const data = await response.json();
      if (data.success) {
        setDestinations(data.destinations);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      toast({
        title: "Error",
        description: "Failed to load destinations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewPackages = (destinationId: string) => {
    router.push(`/packages?destination=${destinationId}`);
  };

  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Loading destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MapPin className="w-8 h-8 text-orange-400" />
        <div>
          <h2 className="text-3xl font-bold text-white">Destinations</h2>
          <p className="text-white/70">Discover amazing places in Kenya</p>
        </div>
      </div>

      {/* Search */}
      <Card className="glass border-orange-500/20">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5" />
            <Input
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-orange-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((destination) => (
          <Card
            key={destination._id}
            className="glass border-orange-500/20 hover:border-orange-500/40 transition-all"
          >
            <CardContent className="p-0">
              {/* Banner Image */}
              <div className="relative h-48 bg-slate-600/50">
                {destination.bannerImage?.url ? (
                  <img
                    src={destination.bannerImage.url}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-slate-500" />
                  </div>
                )}
                {destination.featured && (
                  <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full font-semibold">
                    Featured
                  </div>
                )}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-white text-xs font-medium">
                    {destination.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    {destination.name}
                  </h3>
                  <p className="text-orange-400 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {destination.location.region}
                  </p>
                </div>

                <p className="text-white/70 text-sm line-clamp-2">
                  {destination.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-400 font-medium">
                    {destination.packagesCount} packages
                  </span>
                  <div className="flex items-center gap-1 text-white/60">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">
                      {destination.bestTimeToVisit}
                    </span>
                  </div>
                </div>

                {/* Highlights */}
                {destination.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {destination.highlights
                      .slice(0, 3)
                      .map((highlight, index) => (
                        <Badge
                          key={index}
                          className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"
                        >
                          {highlight}
                        </Badge>
                      ))}
                  </div>
                )}

                <Button
                  onClick={() => handleViewPackages(destination._id)}
                  className="w-full btn-adventure"
                >
                  View Packages
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDestinations.length === 0 && (
        <Card className="glass border-orange-500/20">
          <CardContent className="text-center py-12">
            <MapPin className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No destinations found
            </h3>
            <p className="text-white/70">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
