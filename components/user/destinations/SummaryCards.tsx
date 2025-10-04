import { Card, CardContent } from "@/components/ui/card";
import { Destination } from "./types";

interface SummaryCardsProps {
  destinations: Destination[];
}

export default function SummaryCards({ destinations }: SummaryCardsProps) {
  const totalPackages = destinations.reduce((sum, d) => sum + d.packagesCount, 0);
  const featuredCount = destinations.filter((d) => d.featured).length;
  const activeCount = destinations.filter((d) => d.active).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
        <CardContent className="p-3 sm:p-4">
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Total</p>
          <h3 className="text-xl sm:text-3xl font-bold text-cyan-400 mt-1 sm:mt-2">
            {destinations.length}
          </h3>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
        <CardContent className="p-3 sm:p-4">
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Featured</p>
          <h3 className="text-xl sm:text-3xl font-bold text-yellow-400 mt-1 sm:mt-2">
            {featuredCount}
          </h3>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
        <CardContent className="p-3 sm:p-4">
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Active</p>
          <h3 className="text-xl sm:text-3xl font-bold text-green-400 mt-1 sm:mt-2">
            {activeCount}
          </h3>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
        <CardContent className="p-3 sm:p-4">
          <p className="text-slate-400 text-xs sm:text-sm font-medium">Packages</p>
          <h3 className="text-xl sm:text-3xl font-bold text-purple-400 mt-1 sm:mt-2">
            {totalPackages}
          </h3>
        </CardContent>
      </Card>
    </div>
  );
}