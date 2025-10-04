import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Star, Image as ImageIcon } from "lucide-react";
import { Destination } from "./types";

interface DestinationCardProps {
  destination: Destination;
  onView: (destination: Destination) => void;
  onEdit: (destination: Destination) => void;
  onDelete: (id: string) => void;
}

export default function DestinationCard({
  destination,
  onView,
  onEdit,
  onDelete,
}: DestinationCardProps) {
  return (
    <Card className="bg-slate-700/30 border-slate-600/50 overflow-hidden hover:border-cyan-400/50 transition-colors">
      <div className="relative h-40 sm:h-48 bg-slate-600/50">
        {destination.bannerImage?.url ? (
          <img
            src={destination.bannerImage.url}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500" />
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
          <span className="text-slate-300 text-xs">
            ({destination.totalReviews})
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-white font-bold text-base sm:text-lg mb-1">
          {destination.name}
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm mb-3">
          {destination.location.region}
        </p>
        <p className="text-slate-300 text-xs sm:text-sm mb-4 line-clamp-2">
          {destination.description}
        </p>
        <div className="flex items-center justify-between mb-4 text-xs sm:text-sm">
          <span className="text-cyan-400 font-medium">
            {destination.packagesCount} packages
          </span>
          <Badge
            variant={destination.active ? "default" : "secondary"}
            className="text-xs"
          >
            {destination.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(destination)}
            className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs sm:text-sm"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(destination)}
            className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs sm:text-sm"
          >
            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(destination._id)}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
