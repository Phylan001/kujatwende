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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Plus } from "lucide-react";
import Header from "@/components/admin/destinations/Header";
import SummaryCards from "@/components/admin/destinations/SummaryCards";
import SearchBar from "@/components/admin/destinations/SearchBar";
import DestinationCard from "@/components/admin/destinations/DestinationCard";
import DestinationForm from "@/components/admin/destinations/DestinationForm";
import DestinationView from "@/components/admin/destinations/DestinationView";
import EmptyState from "@/components/admin/destinations/EmptyState";
import {
  Destination,
  FormData as DestinationFormData,
} from "@/components/admin/destinations/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function DestinationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [accessDenied, setAccessDenied] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      setAccessDenied(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  }, [user, authLoading, router]);

  // Form state
  const [formData, setFormData] = useState<DestinationFormData>({
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

  const handleBannerImageChange = (file: File | null) => {
    setBannerImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setBannerPreview("");
    }
  };

  const handleGalleryImagesChange = (files: File[]) => {
    setGalleryImages(files);

    // Create previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews((prev) => [...prev, reader.result as string]);
        setGalleryCaptions((prev) => [...prev, ""]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGalleryCaptionChange = (index: number, caption: string) => {
    const newCaptions = [...galleryCaptions];
    newCaptions[index] = caption;
    setGalleryCaptions(newCaptions);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    setGalleryCaptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateDestination = async () => {
    setSubmitting(true);
    try {
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
        toast({
          title: "Error",
          description: createData.error || "Failed to create destination",
          variant: "destructive",
        });
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
      toast({
        title: "Success",
        description: "Destination created successfully!",
      });
    } catch (error) {
      console.error("Error creating destination:", error);
      toast({
        title: "Error",
        description: "Failed to create destination",
        variant: "destructive",
      });
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
        toast({
          title: "Error",
          description: data.error || "Failed to update destination",
          variant: "destructive",
        });
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
      toast({
        title: "Success",
        description: "Destination updated successfully!",
      });
    } catch (error) {
      console.error("Error updating destination:", error);
      toast({
        title: "Error",
        description: "Failed to update destination",
        variant: "destructive",
      });
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
        toast({
          title: "Success",
          description: "Destination deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete destination",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting destination:", error);
      toast({
        title: "Error",
        description: "Failed to delete destination",
        variant: "destructive",
      });
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 sm:h-32 sm:w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-sm sm:text-base">
            {authLoading ? "Verifying credentials..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (accessDenied || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass border-red-500/20 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-red-400">
              Access Denied
            </CardTitle>
            <CardDescription className="text-white/70 text-sm sm:text-base">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-white/80 text-xs sm:text-sm">
                This area is restricted to administrators only.
                {user &&
                  user.role === "user" &&
                  " Redirecting to your dashboard..."}
              </p>
            </div>
            <Button
              onClick={() => router.push(user ? "/dashboard" : "/auth/login")}
              className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-sm sm:text-base"
            >
              {user ? "Go to Dashboard" : "Go to Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <Header />
      <SummaryCards destinations={destinations} />

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
              <DestinationForm
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onSubmit={handleCreateDestination}
                mode="create"
                formData={formData}
                onFormDataChange={setFormData}
                bannerImage={bannerImage}
                onBannerImageChange={handleBannerImageChange}
                bannerPreview={bannerPreview}
                galleryImages={galleryImages}
                onGalleryImagesChange={handleGalleryImagesChange}
                galleryPreviews={galleryPreviews}
                galleryCaptions={galleryCaptions}
                onGalleryCaptionChange={handleGalleryCaptionChange}
                onRemoveGalleryImage={removeGalleryImage}
                submitting={submitting}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest._id}
                destination={dest}
                onView={(dest) => {
                  setSelectedDestination(dest);
                  setIsViewDialogOpen(true);
                }}
                onEdit={openEditDialog}
                onDelete={handleDeleteDestination}
              />
            ))}
          </div>

          {filteredDestinations.length === 0 && <EmptyState />}
        </CardContent>
      </Card>

      <DestinationForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdateDestination}
        mode="edit"
        formData={formData}
        onFormDataChange={setFormData}
        bannerImage={bannerImage}
        onBannerImageChange={handleBannerImageChange}
        bannerPreview={bannerPreview}
        galleryImages={galleryImages}
        onGalleryImagesChange={handleGalleryImagesChange}
        galleryPreviews={galleryPreviews}
        galleryCaptions={galleryCaptions}
        onGalleryCaptionChange={handleGalleryCaptionChange}
        onRemoveGalleryImage={removeGalleryImage}
        submitting={submitting}
      />

      <DestinationView
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        destination={selectedDestination}
      />
    </div>
  );
}
