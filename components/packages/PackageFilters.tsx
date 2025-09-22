"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface PackageFiltersProps {
  filters: {
    category: string
    difficulty: string
    minPrice: number
    maxPrice: number
  }
  onFiltersChange: (filters: any) => void
}

export function PackageFilters({ filters, onFiltersChange }: PackageFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <Card className="glass border-white/10">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-white/80">Category</Label>
            <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="adventure">Adventure</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="wildlife">Wildlife</SelectItem>
                <SelectItem value="beach">Beach</SelectItem>
                <SelectItem value="mountain">Mountain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Difficulty</Label>
            <Select value={filters.difficulty} onValueChange={(value) => updateFilter("difficulty", value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="challenging">Challenging</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-white/80">
              Price Range: KSh {filters.minPrice.toLocaleString()} - KSh {filters.maxPrice.toLocaleString()}
            </Label>
            <div className="px-2">
              <Slider
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={([min, max]) => {
                  updateFilter("minPrice", min)
                  updateFilter("maxPrice", max)
                }}
                max={500000}
                min={0}
                step={5000}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
