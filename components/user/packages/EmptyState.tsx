import { Package } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
      <p className="text-white/70 text-sm sm:text-base">No packages found</p>
      <p className="text-slate-500 text-xs sm:text-sm mt-2">
        Try adjusting your filters or add a new package
      </p>
    </div>
  );
}