import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Destination } from "./types";

interface FiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  destinationFilter: string;
  onDestinationFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  destinations: Destination[];
}

export default function Filters({
  searchQuery,
  onSearchChange,
  destinationFilter,
  onDestinationFilterChange,
  statusFilter,
  onStatusFilterChange,
  destinations
}: FiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="relative sm:col-span-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
        <Input
          placeholder="Search packages..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 text-sm"
        />
      </div>
      <Select
        value={destinationFilter}
        onValueChange={onDestinationFilterChange}
      >
        <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
          <SelectValue placeholder="All Destinations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Destinations</SelectItem>
          {destinations.map((dest) => (
            <SelectItem key={dest._id} value={dest._id}>
              {dest.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="soldout">Sold Out</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}