"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Calendar } from "lucide-react"
import Link from "next/link"

interface Destination {
  id: string
  name: string
  description: string
  image: string
  rating: number
  packages: number
  bestTime: string
  highlights: string[]
}

const destinations: Destination[] = [
  {
    id: "maasai-mara",
    name: "Maasai Mara",
    description: "World-famous wildlife reserve known for the Great Migration and Big Five game viewing.",
    image: "/maasai-mara-safari-landscape.jpg",
    rating: 4.9,
    packages: 12,
    bestTime: "July - October",
    highlights: ["Great Migration", "Big Five", "Maasai Culture", "Hot Air Balloons"],
  },
  {
    id: "amboseli",
    name: "Amboseli National Park",
    description: "Spectacular views of Mount Kilimanjaro and large elephant herds.",
    image: "/amboseli-elephants-kilimanjaro.jpg",
    rating: 4.8,
    packages: 8,
    bestTime: "June - October",
    highlights: ["Mount Kilimanjaro Views", "Elephant Herds", "Maasai Villages", "Bird Watching"],
  },
  {
    id: "diani-beach",
    name: "Diani Beach",
    description: "Pristine white sand beaches and crystal clear waters on the Kenyan coast.",
    image: "/diani-beach-coastal-paradise.jpg",
    rating: 4.7,
    packages: 15,
    bestTime: "December - March",
    highlights: ["White Sand Beaches", "Water Sports", "Coral Reefs", "Beach Resorts"],
  },
  {
    id: "mount-kenya",
    name: "Mount Kenya",
    description: "Africa's second highest peak offering challenging climbs and stunning scenery.",
    image: "/mount-kenya-adventure-hiking.jpg",
    rating: 4.6,
    packages: 6,
    bestTime: "January - February",
    highlights: ["Mountain Climbing", "Alpine Lakes", "Unique Flora", "Adventure Sports"],
  },
  {
    id: "samburu",
    name: "Samburu National Reserve",
    description: "Unique wildlife and cultural experiences in Kenya's northern frontier.",
    image: "/samburu-national-reserve-kenya-wildlife.jpg",
    rating: 4.5,
    packages: 7,
    bestTime: "June - September",
    highlights: ["Unique Wildlife", "Samburu Culture", "Ewaso River", "Desert Landscapes"],
  },
  {
    id: "lake-nakuru",
    name: "Lake Nakuru",
    description: "Famous for flamingos and rhino sanctuary in the Great Rift Valley.",
    image: "/lake-nakuru-flamingos-kenya.jpg",
    rating: 4.4,
    packages: 9,
    bestTime: "Year Round",
    highlights: ["Flamingo Flocks", "Rhino Sanctuary", "Bird Watching", "Rift Valley Views"],
  },
]

export default function DestinationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [filteredDestinations, setFilteredDestinations] = useState(destinations)

  const categories = [
    { id: "all", name: "All Destinations" },
    { id: "wildlife", name: "Wildlife" },
    { id: "beach", name: "Beach" },
    { id: "mountain", name: "Mountain" },
    { id: "cultural", name: "Cultural" },
  ]

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredDestinations(destinations)
    } else {
      // Simple filtering logic - in a real app, you'd have proper categories
      const filtered = destinations.filter((dest) => {
        if (selectedCategory === "wildlife")
          return ["maasai-mara", "amboseli", "samburu", "lake-nakuru"].includes(dest.id)
        if (selectedCategory === "beach") return dest.id === "diani-beach"
        if (selectedCategory === "mountain") return dest.id === "mount-kenya"
        if (selectedCategory === "cultural") return ["maasai-mara", "samburu"].includes(dest.id)
        return true
      })
      setFilteredDestinations(filtered)
    }
  }, [selectedCategory])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Discover Kenya's Wonders
              </h1>
              <p className="text-xl text-white/80 mb-8">
                From wildlife safaris to pristine beaches, explore the diverse landscapes and rich culture of Kenya
              </p>
            </div>
          </div>
        </section>

        {/* Filter Categories */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-cyan-400 to-purple-600"
                      : "border-white/20 text-white/80 hover:border-cyan-400"
                  }
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Destinations Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination) => (
                <div
                  key={destination.id}
                  className="glass rounded-2xl overflow-hidden group hover:scale-105 transition-transform duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={destination.image || "/placeholder.svg"}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 glass rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm">{destination.rating}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{destination.name}</h3>
                    <p className="text-white/70 mb-4 line-clamp-2">{destination.description}</p>

                    <div className="flex items-center gap-4 mb-4 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{destination.packages} packages</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{destination.bestTime}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {destination.highlights.slice(0, 2).map((highlight) => (
                        <span key={highlight} className="px-2 py-1 bg-cyan-400/20 text-cyan-400 text-xs rounded-full">
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <Link href={`/packages?destination=${destination.id}`}>
                      <Button className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
                        View Packages
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
