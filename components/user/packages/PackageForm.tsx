import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Destination, TravelPackage } from "./types";

interface PackageFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  mode: "create" | "edit";
  formData: any;
  onFormDataChange: (data: any) => void;
  packageImage: File | null;
  onImageChange: (file: File | null) => void;
  imagePreview: string;
  itinerary: any[];
  onItineraryAdd: () => void;
  onItineraryUpdate: (index: number, field: string, value: string) => void;
  onItineraryRemove: (index: number) => void;
  destinations: Destination[];
  submitting: boolean;
  selectedPackage?: TravelPackage | null;
}

export default function PackageForm({
  isOpen,
  onClose,
  onSubmit,
  mode,
  formData,
  onFormDataChange,
  packageImage,
  onImageChange,
  imagePreview,
  itinerary,
  onItineraryAdd,
  onItineraryUpdate,
  onItineraryRemove,
  destinations,
  submitting,
  selectedPackage
}: PackageFormProps) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageChange(file);
  };

  const updateFormData = (field: string, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Package" : "Edit Package"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {mode === "create" ? "Add a new travel package" : "Update package information"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
                placeholder="e.g., 3-Day Maasai Mara Safari"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Select
                value={formData.destinationId}
                onValueChange={(value) => updateFormData("destinationId", value)}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((dest) => (
                    <SelectItem key={dest._id} value={dest._id}>
                      {dest.name} ({dest.packagesCount} packages)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              className="bg-slate-700/50 border-slate-600 min-h-[100px]"
              placeholder="Describe the package..."
            />
          </div>

          {/* Pricing & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => updateFormData("duration", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (KES) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => updateFormData("price", e.target.value)}
                disabled={formData.isFree}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalSeats">Total Seats *</Label>
              <Input
                id="totalSeats"
                type="number"
                min="1"
                value={formData.totalSeats}
                onChange={(e) => updateFormData("totalSeats", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFree"
              checked={formData.isFree}
              onChange={(e) => updateFormData("isFree", e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="isFree">Free Package</Label>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData("startDate", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormData("endDate", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: any) => updateFormData("difficulty", value)}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="challenging">Challenging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateFormData("category", value)}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Wildlife">Wildlife</SelectItem>
                  <SelectItem value="Beach">Beach</SelectItem>
                  <SelectItem value="Mountain">Mountain</SelectItem>
                  <SelectItem value="Safari">Safari</SelectItem>
                  <SelectItem value="Hiking">Hiking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Group Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minGroupSize">Min Group Size</Label>
              <Input
                id="minGroupSize"
                type="number"
                min="1"
                value={formData.minGroupSize}
                onChange={(e) => updateFormData("minGroupSize", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGroupSize">Max Group Size</Label>
              <Input
                id="maxGroupSize"
                type="number"
                min="1"
                value={formData.maxGroupSize}
                onChange={(e) => updateFormData("maxGroupSize", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
                placeholder="Leave empty to use total seats"
              />
            </div>
          </div>

          {/* Package Image */}
          <div className="space-y-2">
            <Label htmlFor="packageImage">Package Image</Label>
            <Input
              id="packageImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="bg-slate-700/50 border-slate-600"
            />
            {imagePreview && (
              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Package preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Package Details */}
          <div className="space-y-2">
            <Label htmlFor="highlights">Highlights (comma-separated)</Label>
            <Textarea
              id="highlights"
              value={formData.highlights}
              onChange={(e) => updateFormData("highlights", e.target.value)}
              className="bg-slate-700/50 border-slate-600"
              placeholder="e.g., Big Five, Sunset Views, Cultural Experience"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inclusions">Inclusions (comma-separated)</Label>
            <Textarea
              id="inclusions"
              value={formData.inclusions}
              onChange={(e) => updateFormData("inclusions", e.target.value)}
              className="bg-slate-700/50 border-slate-600"
              placeholder="e.g., Accommodation, Meals, Transport, Guide"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exclusions">Exclusions (comma-separated)</Label>
            <Textarea
              id="exclusions"
              value={formData.exclusions}
              onChange={(e) => updateFormData("exclusions", e.target.value)}
              className="bg-slate-700/50 border-slate-600"
              placeholder="e.g., Personal expenses, Insurance, Tips"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements (comma-separated)</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => updateFormData("requirements", e.target.value)}
              className="bg-slate-700/50 border-slate-600"
              placeholder="e.g., Valid ID, Travel Insurance, Fitness Level"
              rows={2}
            />
          </div>

          {/* Itinerary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Itinerary (Optional)</Label>
              <Button
                type="button"
                size="sm"
                onClick={onItineraryAdd}
                className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Day
              </Button>
            </div>
            {itinerary.map((day, index) => (
              <div
                key={index}
                className="p-3 bg-slate-700/30 rounded-lg space-y-2 border border-slate-600/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400 font-semibold text-sm">
                    Day {day.day}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onItineraryRemove(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Day title"
                  value={day.title}
                  onChange={(e) =>
                    onItineraryUpdate(index, "title", e.target.value)
                  }
                  className="bg-slate-700/50 border-slate-600 text-sm"
                />
                <Textarea
                  placeholder="Description"
                  value={day.description}
                  onChange={(e) =>
                    onItineraryUpdate(index, "description", e.target.value)
                  }
                  className="bg-slate-700/50 border-slate-600 text-sm"
                  rows={2}
                />
                <Input
                  placeholder="Activities (comma-separated)"
                  value={day.activities}
                  onChange={(e) =>
                    onItineraryUpdate(index, "activities", e.target.value)
                  }
                  className="bg-slate-700/50 border-slate-600 text-sm"
                />
                <Input
                  placeholder="Meals (comma-separated, optional)"
                  value={day.meals}
                  onChange={(e) =>
                    onItineraryUpdate(index, "meals", e.target.value)
                  }
                  className="bg-slate-700/50 border-slate-600 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => updateFormData("featured", e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="featured">Featured Package</Label>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-white hover:bg-slate-700 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              submitting ||
              !formData.name ||
              !formData.destinationId ||
              !formData.description
            }
            className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 w-full sm:w-auto"
          >
            {submitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Package"
              : "Update Package"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}