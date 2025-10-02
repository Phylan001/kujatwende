import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Star, MapPin, Calendar, Users, Image as ImageIcon } from "lucide-react";
import { TravelPackage } from "./types";

interface PackageCardProps {
  pkg: TravelPackage;
  onView: (pkg: TravelPackage) => void;
  onEdit: (pkg: TravelPackage) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
  getDifficultyColor: (difficulty: string) => string;
}

export default function PackageCard({
  pkg,
  onView,
  onEdit,
  onDelete,
  getStatusColor,
  getDifficultyColor
}: PackageCardProps) {
  return (
    <Card className="bg-slate-700/30 border-slate-600/50 overflow-hidden hover:border-cyan-400/50 transition-colors">
      <div className="relative h-40 sm:h-48 bg-slate-600/50">
        {pkg.image?.url ? (
          <img
            src={pkg.image.url}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500" />
          </div>
        )}
        {pkg.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}
        <Badge
          className={`absolute top-2 left-2 ${getStatusColor(pkg.status)}`}
        >
          {pkg.status}
        </Badge>
        {pkg.isFree && (
          <div className="absolute bottom-2 left-2 bg-cyan-500/90 text-white text-xs px-2 py-1 rounded-full font-semibold">
            FREE
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="text-white font-bold text-base sm:text-lg mb-1 line-clamp-1">
            {pkg.name}
          </h3>
          <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            {pkg.destinationName}
          </div>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm line-clamp-2">
          {pkg.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3 h-3" />
            {pkg.duration} days
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Users className="w-3 h-3" />
            {pkg.availableSeats}/{pkg.totalSeats} seats
          </div>
        </div>

        {pkg.averageRating > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white font-medium">
              {pkg.averageRating.toFixed(1)}
            </span>
            <span className="text-slate-400">
              ({pkg.totalReviews})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-600/50">
          <div>
            {pkg.isFree ? (
              <p className="text-cyan-400 font-bold text-lg">FREE</p>
            ) : (
              <>
                <p className="text-xs text-slate-400">Price</p>
                <p className="text-cyan-400 font-bold text-base sm:text-lg">
                  KSh {pkg.price.toLocaleString()}
                </p>
              </>
            )}
          </div>
          <Badge className={getDifficultyColor(pkg.difficulty)}>
            {pkg.difficulty}
          </Badge>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(pkg)}
            className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(pkg)}
            className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(pkg._id)}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}