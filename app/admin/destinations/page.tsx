"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Star,
  Upload,
  X,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Destination {
  _id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage?: {
    url: string;
    publicId: string;
  };
  gallery: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  location: {
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  bestTimeToVisit: string;
  highlights: string[];
  activities: string[];
  averageRating: number;
  totalReviews: number;
  packagesCount: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    region: "",
    bestTimeToVisit: "",
    highlights: "",
    activities: "",
    featured: false,
    latitude: "",
    longitude: "",
    metaDescription: "",
    keywords: "",
  });

  // Image upload states
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryCaptions, setGalleryCaptions] = useState<string[]>([]);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await fetch("/api/admin/destinations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      const data = await response.json();
      if (data.success && data.destinations) {
        setDestinations(data.destinations);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    setGalleryImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews((prev) => [...prev, reader.result as string]);
        setGalleryCaptions((prev) => [...prev, ""]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    setGalleryCaptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateDestination = async () => {
    setSubmitting(true);
    try {
      // Create destination first
      const destinationPayload = {
        name: formData.name,
        description: formData.description,
        region: formData.region,
        bestTimeToVisit: formData.bestTimeToVisit,
        highlights: formData.highlights
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean),
        activities: formData.activities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        featured: formData.featured,
        coordinates:
          formData.latitude && formData.longitude
            ? {
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
              }
            : undefined,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      };

      const createResponse = await fetch("/api/admin/destinations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify(destinationPayload),
      });

      const createData = await createResponse.json();

      if (!createData.success) {
        alert(createData.error || "Failed to create destination");
        return;
      }

      const destinationId = createData.destination._id;

      // Upload images if provided
      if (bannerImage || galleryImages.length > 0) {
        const imageFormData = new FormData();

        if (bannerImage) {
          imageFormData.append("bannerImage", bannerImage);
        }

        galleryImages.forEach((file, index) => {
          imageFormData.append("galleryImages", file);
          imageFormData.append("captions", galleryCaptions[index] || "");
        });

        await fetch(`/api/admin/destinations/${destinationId}/images`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: imageFormData,
        });
      }

      setIsAddDialogOpen(false);
      resetForm();
      fetchDestinations();
      alert("Destination created successfully!");
    } catch (error) {
      console.error("Error creating destination:", error);
      alert("Failed to create destination");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateDestination = async () => {
    if (!selectedDestination) return;
    setSubmitting(true);

    try {
      const updatePayload = {
        name: formData.name,
        description: formData.description,
        region: formData.region,
        bestTimeToVisit: formData.bestTimeToVisit,
        highlights: formData.highlights
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean),
        activities: formData.activities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        featured: formData.featured,
        coordinates:
          formData.latitude && formData.longitude
            ? {
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
              }
            : undefined,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      };

      const response = await fetch(
        `/api/admin/destinations/${selectedDestination._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      const data = await response.json();

      if (!data.success) {
        alert(data.error || "Failed to update destination");
        return;
      }

      // Upload new images if provided
      if (bannerImage || galleryImages.length > 0) {
        const imageFormData = new FormData();

        if (bannerImage) {
          imageFormData.append("bannerImage", bannerImage);
        }

        galleryImages.forEach((file, index) => {
          imageFormData.append("galleryImages", file);
          imageFormData.append("captions", galleryCaptions[index] || "");
        });

        await fetch(
          `/api/admin/destinations/${selectedDestination._id}/images`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
            },
            body: imageFormData,
          }
        );
      }

      setIsEditDialogOpen(false);
      resetForm();
      fetchDestinations();
      alert("Destination updated successfully!");
    } catch (error) {
      console.error("Error updating destination:", error);
      alert("Failed to update destination");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDestination = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this destination? This will also delete all associated images."
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/destinations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchDestinations();
        alert("Destination deleted successfully!");
      } else {
        alert(data.error || "Failed to delete destination");
      }
    } catch (error) {
      console.error("Error deleting destination:", error);
      alert("Failed to delete destination");
    }
  };

  const openEditDialog = (destination: Destination) => {
    setSelectedDestination(destination);
    setFormData({
      name: destination.name,
      description: destination.description,
      region: destination.location.region,
      bestTimeToVisit: destination.bestTimeToVisit,
      highlights: destination.highlights.join(", "),
      activities: destination.activities.join(", "),
      featured: destination.featured,
      latitude: destination.location.coordinates?.latitude.toString() || "",
      longitude: destination.location.coordinates?.longitude.toString() || "",
      metaDescription: "",
      keywords: "",
    });
    setBannerPreview(destination.bannerImage?.url || "");
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      region: "",
      bestTimeToVisit: "",
      highlights: "",
      activities: "",
      featured: false,
      latitude: "",
      longitude: "",
      metaDescription: "",
      keywords: "",
    });
    setBannerImage(null);
    setBannerPreview("");
    setGalleryImages([]);
    setGalleryPreviews([]);
    setGalleryCaptions([]);
    setSelectedDestination(null);
  };

  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-3 sm:p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Total
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-cyan-400 mt-1 sm:mt-2">
              {destinations.length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-3 sm:p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Featured
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-yellow-400 mt-1 sm:mt-2">
              {destinations.filter((d) => d.featured).length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-3 sm:p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Active
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-green-400 mt-1 sm:mt-2">
              {destinations.filter((d) => d.active).length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-3 sm:p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Packages
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-purple-400 mt-1 sm:mt-2">
              {destinations.reduce((sum, d) => sum + d.packagesCount, 0)}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white text-lg sm:text-xl">
                All Destinations
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm">
                Manage and organize destinations
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-sm sm:text-base w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Destination
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Destination</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Add a new travel destination to your offerings
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Destination Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="bg-slate-700/50 border-slate-600"
                        placeholder="e.g., Maasai Mara"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region *</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) =>
                          setFormData({ ...formData, region: e.target.value })
                        }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="bg-slate-700/50 border-slate-600 min-h-[100px]"
                      placeholder="Describe the destination..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bestTimeToVisit">
                      Best Time to Visit *
                    </Label>
                    <Input
                      id="bestTimeToVisit"
                      value={formData.bestTimeToVisit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bestTimeToVisit: e.target.value,
                        })
                      }
                      className="bg-slate-700/50 border-slate-600"
                      placeholder="e.g., July - October"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="highlights">
                      Highlights (comma-separated)
                    </Label>
                    <Textarea
                      id="highlights"
                      value={formData.highlights}
                      onChange={(e) =>
                        setFormData({ ...formData, highlights: e.target.value })
                      }
                      className="bg-slate-700/50 border-slate-600"
                      placeholder="e.g., Big Five, Great Migration, Hot Air Balloons"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activities">
                      Activities (comma-separated)
                    </Label>
                    <Textarea
                      id="activities"
                      value={formData.activities}
                      onChange={(e) =>
                        setFormData({ ...formData, activities: e.target.value })
                      }
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
                        onChange={(e) =>
                          setFormData({ ...formData, latitude: e.target.value })
                        }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: e.target.value,
                          })
                        }
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
                    <Label htmlFor="galleryImages">
                      Gallery Images (multiple)
                    </Label>
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
                              onClick={() => removeGalleryImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <Input
                              placeholder="Caption (optional)"
                              value={galleryCaptions[index]}
                              onChange={(e) => {
                                const newCaptions = [...galleryCaptions];
                                newCaptions[index] = e.target.value;
                                setGalleryCaptions(newCaptions);
                              }}
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
                      onChange={(e) =>
                        setFormData({ ...formData, featured: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <Label htmlFor="featured">Featured Destination</Label>
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="border-slate-600 text-white hover:bg-slate-700 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateDestination}
                    disabled={
                      submitting || !formData.name || !formData.description
                    }
                    className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 w-full sm:w-auto"
                  >
                    {submitting ? "Creating..." : "Create Destination"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
            <Input
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 text-sm sm:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDestinations.map((dest) => (
              <Card
                key={dest._id}
                className="bg-slate-700/30 border-slate-600/50 overflow-hidden hover:border-cyan-400/50 transition-colors"
              >
                <div className="relative h-40 sm:h-48 bg-slate-600/50">
                  {dest.bannerImage?.url ? (
                    <img
                      src={dest.bannerImage.url}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500" />
                    </div>
                  )}
                  {dest.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full font-semibold">
                      Featured
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-white text-xs font-medium">
                      {dest.averageRating.toFixed(1)}
                    </span>
                    <span className="text-slate-300 text-xs">
                      ({dest.totalReviews})
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1">
                    {dest.name}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm mb-3">
                    {dest.location.region}
                  </p>
                  <p className="text-slate-300 text-xs sm:text-sm mb-4 line-clamp-2">
                    {dest.description}
                  </p>
                  <div className="flex items-center justify-between mb-4 text-xs sm:text-sm">
                    <span className="text-cyan-400 font-medium">
                      {dest.packagesCount} packages
                    </span>
                    <Badge
                      variant={dest.active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {dest.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDestination(dest);
                        setIsViewDialogOpen(true);
                      }}
                      className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs sm:text-sm"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(dest)}
                      className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs sm:text-sm"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDestination(dest._id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDestinations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-white/70 text-sm sm:text-base">
                No destinations found
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">
                Try adjusting your search or add a new destination
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update destination information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Destination Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-region">Region *</Label>
                <Input
                  id="edit-region"
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-bestTimeToVisit">Best Time to Visit *</Label>
              <Input
                id="edit-bestTimeToVisit"
                value={formData.bestTimeToVisit}
                onChange={(e) =>
                  setFormData({ ...formData, bestTimeToVisit: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-highlights">
                Highlights (comma-separated)
              </Label>
              <Textarea
                id="edit-highlights"
                value={formData.highlights}
                onChange={(e) =>
                  setFormData({ ...formData, highlights: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-activities">
                Activities (comma-separated)
              </Label>
              <Textarea
                id="edit-activities"
                value={formData.activities}
                onChange={(e) =>
                  setFormData({ ...formData, activities: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600"
                rows={2}
              />
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="edit-bannerImage">Update Banner Image</Label>
              <Input
                id="edit-bannerImage"
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

            {/* Gallery Images Upload */}
            <div className="space-y-2">
              <Label htmlFor="edit-galleryImages">Add Gallery Images</Label>
              <Input
                id="edit-galleryImages"
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
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <Input
                        placeholder="Caption (optional)"
                        value={galleryCaptions[index]}
                        onChange={(e) => {
                          const newCaptions = [...galleryCaptions];
                          newCaptions[index] = e.target.value;
                          setGalleryCaptions(newCaptions);
                        }}
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
                id="edit-featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="edit-featured">Featured Destination</Label>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-slate-600 text-white hover:bg-slate-700 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDestination}
              disabled={submitting || !formData.name || !formData.description}
              className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 w-full sm:w-auto"
            >
              {submitting ? "Updating..." : "Update Destination"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDestination?.name}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedDestination?.location.region}
            </DialogDescription>
          </DialogHeader>
          {selectedDestination && (
            <div className="space-y-4">
              {/* Banner Image */}
              {selectedDestination.bannerImage?.url && (
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={selectedDestination.bannerImage.url}
                    alt={selectedDestination.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-700/50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">
                    {selectedDestination.averageRating.toFixed(1)}
                  </span>
                  <span className="text-slate-400 text-sm">
                    ({selectedDestination.totalReviews} reviews)
                  </span>
                </div>
                {selectedDestination.featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    Featured
                  </Badge>
                )}
                <Badge
                  variant={selectedDestination.active ? "default" : "secondary"}
                >
                  {selectedDestination.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-white font-semibold mb-2">Description</h4>
                <p className="text-slate-300 text-sm">
                  {selectedDestination.description}
                </p>
              </div>

              {/* Best Time to Visit */}
              <div>
                <h4 className="text-white font-semibold mb-2">
                  Best Time to Visit
                </h4>
                <p className="text-slate-300 text-sm">
                  {selectedDestination.bestTimeToVisit}
                </p>
              </div>

              {/* Highlights */}
              {selectedDestination.highlights.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestination.highlights.map((highlight, index) => (
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

              {/* Activities */}
              {selectedDestination.activities.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Activities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestination.activities.map((activity, index) => (
                      <Badge
                        key={index}
                        className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {selectedDestination.gallery.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">
                    Gallery ({selectedDestination.gallery.length} images)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedDestination.gallery.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden group"
                      >
                        <img
                          src={image.url}
                          alt={image.caption || `Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Packages Count */}
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Total Packages</span>
                <span className="text-cyan-400 font-bold text-xl">
                  {selectedDestination.packagesCount}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
