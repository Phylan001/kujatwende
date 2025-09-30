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
import { MapPin, Plus, Search, Edit, Trash2, Image as ImageIcon } from "lucide-react";

interface Destination {
  _id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  packagesCount: number;
  featured: boolean;
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await fetch("/api/destinations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      const data = await response.json();
      if (data.destinations) {
        setDestinations(data.destinations);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter((dest) =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Destinations</h2>
          <p className="text-slate-400 mt-1 text-xs sm:text-base">
            Manage travel destinations
          </p>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white text-lg sm:text-xl">All Destinations</CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm">
                Manage and organize destinations
              </CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-sm sm:text-base w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Destination
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
            <Input
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDestinations.map((dest) => (
              <Card key={dest._id} className="bg-slate-700/30 border-slate-600/50 overflow-hidden hover:border-cyan-400/50 transition-colors">
                <div className="relative h-40 sm:h-48 bg-slate-600/50">
                  {dest.image ? (
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500" />
                    </div>
                  )}
                  {dest.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full font-semibold">
                      Featured
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1">{dest.name}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm mb-3">{dest.country}</p>
                  <p className="text-slate-300 text-xs sm:text-sm mb-4 line-clamp-2">
                    {dest.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-cyan-400 text-xs sm:text-sm font-medium">
                      {dest.packagesCount} packages
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs sm:text-sm"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDestinations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-white/70 text-sm sm:text-base">No destinations found</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">
                Try adjusting your search or add a new destination
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
