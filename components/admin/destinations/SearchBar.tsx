import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
      <Input
        placeholder="Search destinations..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 text-sm sm:text-base"
      />
    </div>
  );
}