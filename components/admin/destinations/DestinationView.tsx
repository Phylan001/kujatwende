import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Destination } from "./types";

interface DestinationViewProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null;
}

export default function DestinationView({ 
  isOpen, 
  onClose, 
  destination 
}: DestinationViewProps) {
  if (!destination) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{destination.name}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {destination.location.region}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Banner Image */}
          {destination.bannerImage?.url && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={destination.bannerImage.url}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-700/50 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-white font-medium">
                {destination.averageRating.toFixed(1)}
              </span>
              <span className="text-slate-400 text-sm">
                ({destination.totalReviews} reviews)
              </span>
            </div>
            {destination.featured && (
              <Badge className="bg-yellow-500/20 text-yellow-400">
                Featured
              </Badge>
            )}
            <Badge
              variant={destination.active ? "default" : "secondary"}
            >
              {destination.active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-white font-semibold mb-2">Description</h4>
            <p className="text-slate-300 text-sm">
              {destination.description}
            </p>
          </div>

          {/* Best Time to Visit */}
          <div>
            <h4 className="text-white font-semibold mb-2">
              Best Time to Visit
            </h4>
            <p className="text-slate-300 text-sm">
              {destination.bestTimeToVisit}
            </p>
          </div>

          {/* Highlights */}
          {destination.highlights.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Highlights</h4>
              <div className="flex flex-wrap gap-2">
                {destination.highlights.map((highlight, index) => (
                  <Badge
                    key={index}
                    className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  >
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {destination.activities.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Activities</h4>
              <div className="flex flex-wrap gap-2">
                {destination.activities.map((activity, index) => (
                  <Badge
                    key={index}
                    className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                  >
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {destination.gallery.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">
                Gallery ({destination.gallery.length} images)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {destination.gallery.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-lg overflow-hidden group"
                  >
                    <img
                      src={image.url}
                      alt={image.caption || `Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packages Count */}
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <span className="text-slate-300">Total Packages</span>
            <span className="text-cyan-400 font-bold text-xl">
              {destination.packagesCount}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}