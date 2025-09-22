import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Users, MapPin } from "lucide-react"
import type { TravelPackage } from "@/lib/models/Package"

interface PackageCardProps {
  package: TravelPackage
  index: number
}

export function PackageCard({ package: pkg, index }: PackageCardProps) {
  return (
    <Card
      className="glass border-white/10 overflow-hidden group hover:scale-105 transition-all duration-300 animate-fade-scale"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={pkg.images[0] || `/placeholder.svg?height=300&width=400&query=${pkg.destination}-${pkg.category}`}
            alt={pkg.title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-gradient-to-r from-cyan-400 to-purple-600 text-white border-0">{pkg.category}</Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              {pkg.difficulty}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{pkg.title}</h3>
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
  )
}
