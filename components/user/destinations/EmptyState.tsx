import { MapPin } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
      <p className="text-white/70 text-sm sm:text-base">
        No destinations found
      </p>
      <p className="text-slate-500 text-xs sm:text-sm mt-2">
        Try adjusting your search or add a new destination
      </p>
    </div>
  );
}