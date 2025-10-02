import { MapPin } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Destinations
        </h2>
        <p className="text-slate-400 mt-1 text-xs sm:text-base">
          Manage travel destinations in Kenya
        </p>
      </div>
    </div>
  );
}