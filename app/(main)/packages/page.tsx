"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { PackageCard } from "@/components/packages/PackageCard";
import { PackageFilters } from "@/components/packages/PackageFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import type { TravelPackage } from "@/lib/models/Package";

export default function PackagesPage() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    minPrice: 0,
    maxPrice: 500000,
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filters.category) params.append("category", filters.category);
      if (filters.difficulty) params.append("difficulty", filters.difficulty);
      if (filters.minPrice > 0)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice < 500000)
        params.append("maxPrice", filters.maxPrice.toString());
      params.append("limit", "20");

      const response = await fetch(`/api/packages?${params}`);
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [searchQuery, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPackages();
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Adventure Packages
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Discover extraordinary travel experiences across Kenya's most
            stunning destinations
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search destinations, activities, or experiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="max-w-4xl mx-auto mb-8">
              <PackageFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          )}
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                  <div className="h-48 bg-white/10 rounded-xl mb-4" />
                  <div className="h-4 bg-white/10 rounded mb-2" />
                  <div className="h-4 bg-white/10 rounded w-2/3 mb-4" />
                  <div className="h-8 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-white/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                No packages found
              </h3>
              <p className="text-white/70 mb-6">
                Try adjusting your search criteria or browse all available
                packages
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({
                    category: "",
                    difficulty: "",
                    minPrice: 0,
                    maxPrice: 500000,
                  });
                }}
                className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <PackageCard
                  key={pkg._id?.toString()}
                  package={pkg}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
