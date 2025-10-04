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
import { X } from "lucide-react";
import { FormData } from "./types";

interface DestinationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  mode: "create" | "edit";
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  bannerImage: File | null;
  onBannerImageChange: (file: File | null) => void;
  bannerPreview: string;
  galleryImages: File[];
  onGalleryImagesChange: (files: File[]) => void;
  galleryPreviews: string[];
  galleryCaptions: string[];
  onGalleryCaptionChange: (index: number, caption: string) => void;
  onRemoveGalleryImage: (index: number) => void;
  submitting: boolean;
}

export default function DestinationForm({
  isOpen,
  onClose,
  onSubmit,
  mode,
  formData,
  onFormDataChange,
  bannerImage,
  onBannerImageChange,
  bannerPreview,
  galleryImages,
  onGalleryImagesChange,
  galleryPreviews,
  galleryCaptions,
  onGalleryCaptionChange,
  onRemoveGalleryImage,
  submitting
}: DestinationFormProps) {
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onBannerImageChange(file);
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onGalleryImagesChange([...galleryImages, ...files]);
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Destination" : "Edit Destination"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {mode === "create" 
              ? "Add a new travel destination to your offerings" 
              : "Update destination information"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Destination Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
                placeholder="e.g., Maasai Mara"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => updateFormData("region", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
                placeholder="e.g., Rift Valley"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              className="bg-slate-700/50 border-slate-600 min-h-[100px]"
              placeholder="Describe the destination..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bestTimeToVisit">Best Time to Visit *</Label>
            <Input
              id="bestTimeToVisit"
              value={formData.bestTimeToVisit}
              onChange={(e) => updateFormData("bestTimeToVisit", e.target.value)}
              className="bg-slate-700/50 border-slate-600"
              placeholder="e.g., July - October"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="highlights">Highlights (comma-separated)</Label>
            <Textarea
              id="highlights"
              value={formData.highlights}
              onChange={(e) => updateFormData("highlights", e.target.value)}
              className="bg-slate-700/50 border-slate-600"
              placeholder="e.g., Big Five, Great Migration, Hot Air Balloons"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activities">Activities (comma-separated)</Label>
            <Textarea
              id="activities"
              value={formData.activities}
              onChange={(e) => updateFormData("activities", e.target.value)}
              className="bg-slate-700/50 border-slate-600"
              placeholder="e.g., Game Drives, Bird Watching, Cultural Tours"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (optional)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => updateFormData("latitude", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
                placeholder="-1.5858"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (optional)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => updateFormData("longitude", e.target.value)}
                className="bg-slate-700/50 border-slate-600"
                placeholder="35.2683"
              />
            </div>
          </div>

          {/* Banner Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="bannerImage">Banner Image</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="bannerImage"
                type="file"
                accept="image/*"
                onChange={handleBannerImageChange}
                className="bg-slate-700/50 border-slate-600"
              />
              {bannerPreview && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Gallery Images Upload */}
          <div className="space-y-2">
            <Label htmlFor="galleryImages">Gallery Images (multiple)</Label>
            <Input
              id="galleryImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImagesChange}
              className="bg-slate-700/50 border-slate-600"
            />
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveGalleryImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <Input
                      placeholder="Caption (optional)"
                      value={galleryCaptions[index]}
                      onChange={(e) => onGalleryCaptionChange(index, e.target.value)}
                      className="mt-1 text-xs bg-slate-700/50 border-slate-600"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => updateFormData("featured", e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="featured">Featured Destination</Label>
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
            disabled={submitting || !formData.name || !formData.description}
            className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 w-full sm:w-auto"
          >
            {submitting
              ? mode === "create" ? "Creating..." : "Updating..."
              : mode === "create" ? "Create Destination" : "Update Destination"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}