"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Users, MapPin } from "lucide-react"
import type { TravelPackage } from "@/lib/models/Package"

export function FeaturedPackages() {
  const [packages, setPackages] = useState<TravelPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/packages?featured=true&limit=6")
      .then((res) => res.json())
      .then((data) => {
        setPackages(data.packages || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Featured Adventures
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-white/10 rounded-xl mb-4" />
                <div className="h-4 bg-white/10 rounded mb-2" />
                <div className="h-4 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Featured Adventures
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover our most popular travel experiences, carefully curated for unforgettable memories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <Card
              key={pkg._id?.toString()}
              className="glass border-white/10 overflow-hidden group hover:scale-105 transition-all duration-300 animate-fade-scale"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={
                      pkg.images[0] || `/placeholder.svg?height=300&width=400&query=${pkg.destination}-${pkg.category}`
                    }
                    alt={pkg.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gradient-to-r from-cyan-400 to-purple-600 text-white border-0">
                      {pkg.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-black/50 text-white border-0">
                      {pkg.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {pkg.title}
                </h3>
                <p className="text-white/70 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {pkg.destination}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {pkg.duration} days
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Max {pkg.maxGroupSize}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white/80 text-sm">4.8 (124 reviews)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">KSh {pkg.price.toLocaleString()}</div>
                    <div className="text-xs text-white/60">per person</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Link href={`/packages/${pkg._id}`} className="w-full">
                  <Button className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/packages">
            <Button
              variant="outline"
              size="lg"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black bg-transparent"
            >
              View All Packages
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
