import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TravelPackage } from "./types";

interface PackageViewProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: TravelPackage | null;
  getStatusColor: (status: string) => string;
  getDifficultyColor: (difficulty: string) => string;
}

export default function PackageView({
  isOpen,
  onClose,
  selectedPackage,
  getStatusColor,
  getDifficultyColor
}: PackageViewProps) {
  if (!selectedPackage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedPackage.name}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {selectedPackage.destinationName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {selectedPackage.image?.url && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={selectedPackage.image.url}
                alt={selectedPackage.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getStatusColor(selectedPackage.status)}>
              {selectedPackage.status}
            </Badge>
            <Badge className={getDifficultyColor(selectedPackage.difficulty)}>
              {selectedPackage.difficulty}
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {selectedPackage.category}
            </Badge>
            {selectedPackage.featured && (
              <Badge className="bg-yellow-500/20 text-yellow-400">
                Featured
              </Badge>
            )}
            {selectedPackage.isFree && (
              <Badge className="bg-cyan-500/20 text-cyan-400">Free</Badge>
            )}
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Description</h4>
            <p className="text-slate-300 text-sm">
              {selectedPackage.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-semibold mb-1 text-sm">Duration</h4>
              <p className="text-slate-300 text-sm">
                {selectedPackage.duration} days
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1 text-sm">Price</h4>
              <p className="text-cyan-400 font-bold text-base">
                {selectedPackage.isFree
                  ? "FREE"
                  : `KSh ${selectedPackage.price.toLocaleString()}`}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1 text-sm">Availability</h4>
              <p className="text-slate-300 text-sm">
                {selectedPackage.availableSeats}/
                {selectedPackage.totalSeats} seats
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1 text-sm">Group Size</h4>
              <p className="text-slate-300 text-sm">
                {selectedPackage.minGroupSize}-
                {selectedPackage.maxGroupSize} people
              </p>
            </div>
          </div>

          {selectedPackage.highlights.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Highlights</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPackage.highlights.map((highlight, index) => (
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

          {selectedPackage.inclusions.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Inclusions</h4>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                {selectedPackage.inclusions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedPackage.exclusions.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Exclusions</h4>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                {selectedPackage.exclusions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedPackage.itinerary.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Itinerary</h4>
              <div className="space-y-3">
                {selectedPackage.itinerary.map((day, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
                  >
                    <h5 className="text-cyan-400 font-semibold text-sm mb-1">
                      Day {day.day}: {day.title}
                    </h5>
                    <p className="text-slate-300 text-sm mb-2">
                      {day.description}
                    </p>
                    {day.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {day.activities.map((activity, i) => (
                          <Badge
                            key={i}
                            className="text-xs bg-purple-500/20 text-purple-400"
                          >
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {day.meals && day.meals.length > 0 && (
                      <p className="text-slate-400 text-xs">
                        Meals: {day.meals.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}