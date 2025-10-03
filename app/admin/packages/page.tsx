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
import { Plus, Package, AlertCircle } from "lucide-react";
import Header from "@/components/admin/packages/Header";
import SummaryCards from "@/components/admin/packages/SummaryCards";
import Filters from "@/components/admin/packages/Filters";
import PackageCard from "@/components/admin/packages/PackageCard";
import PackageForm from "@/components/admin/packages/PackageForm";
import PackageView from "@/components/admin/packages/PackageView";
import EmptyState from "@/components/admin/packages/EmptyState";
import { Destination, TravelPackage } from "@/components/admin/packages/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function PackagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [accessDenied, setAccessDenied] = useState(false);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(
    null
  );
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
  const [formData, setFormData] = useState({
    name: "",
    destinationId: "",
    duration: "",
    price: "",
    isFree: false,
    description: "",
    totalSeats: "",
    startDate: "",
    endDate: "",
    featured: false,
    difficulty: "moderate" as "easy" | "moderate" | "challenging",
    category: "Adventure",
    inclusions: "",
    exclusions: "",
    highlights: "",
    minGroupSize: "1",
    maxGroupSize: "",
    requirements: "",
  });

  // Image upload states
  const [packageImage, setPackageImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Itinerary state
  const [itinerary, setItinerary] = useState<
    Array<{
      day: number;
      title: string;
      description: string;
      activities: string;
      meals: string;
    }>
  >([]);

  useEffect(() => {
    fetchDestinations();
    fetchPackages();
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
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/admin/packages", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      const data = await response.json();
      if (data.success && data.packages) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (file: File | null) => {
    setPackageImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const addItineraryDay = () => {
    setItinerary([
      ...itinerary,
      {
        day: itinerary.length + 1,
        title: "",
        description: "",
        activities: "",
        meals: "",
      },
    ]);
  };

  const updateItineraryDay = (index: number, field: string, value: string) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const removeItineraryDay = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  const handleCreatePackage = async () => {
    if (!formData.name || !formData.destinationId || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const packageFormData = new FormData();

      // Basic fields
      packageFormData.append("name", formData.name);
      packageFormData.append("destinationId", formData.destinationId);
      packageFormData.append("duration", formData.duration);
      packageFormData.append("price", formData.isFree ? "0" : formData.price);
      packageFormData.append("isFree", formData.isFree.toString());
      packageFormData.append("description", formData.description);
      packageFormData.append("totalSeats", formData.totalSeats);
      packageFormData.append("startDate", formData.startDate);
      packageFormData.append("endDate", formData.endDate);
      packageFormData.append("difficulty", formData.difficulty);
      packageFormData.append("category", formData.category);
      packageFormData.append("featured", formData.featured.toString());
      packageFormData.append("minGroupSize", formData.minGroupSize);
      packageFormData.append(
        "maxGroupSize",
        formData.maxGroupSize || formData.totalSeats
      );

      // Arrays
      packageFormData.append(
        "inclusions",
        JSON.stringify(
          formData.inclusions
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        )
      );
      packageFormData.append(
        "exclusions",
        JSON.stringify(
          formData.exclusions
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean)
        )
      );
      packageFormData.append(
        "highlights",
        JSON.stringify(
          formData.highlights
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean)
        )
      );
      packageFormData.append(
        "requirements",
        JSON.stringify(
          formData.requirements
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean)
        )
      );

      // Itinerary
      const processedItinerary = itinerary.map((day) => ({
        day: day.day,
        title: day.title,
        description: day.description,
        activities: day.activities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        meals: day.meals
          ? day.meals
              .split(",")
              .map((m) => m.trim())
              .filter(Boolean)
          : [],
      }));
      packageFormData.append("itinerary", JSON.stringify(processedItinerary));

      // Image
      if (packageImage) {
        packageFormData.append("image", packageImage);
      }

      const response = await fetch("/api/admin/packages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: packageFormData,
      });

      const data = await response.json();

      if (data.success) {
        setIsAddDialogOpen(false);
        resetForm();
        fetchPackages();
        fetchDestinations(); // Refresh to update package counts
        toast({
          title: "Success",
          description: "Package created successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create package",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating package:", error);
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePackage = async () => {
    if (!selectedPackage) return;
    setSubmitting(true);

    try {
      const packageFormData = new FormData();

      packageFormData.append("name", formData.name);
      packageFormData.append("destinationId", formData.destinationId);
      packageFormData.append("duration", formData.duration);
      packageFormData.append("price", formData.isFree ? "0" : formData.price);
      packageFormData.append("isFree", formData.isFree.toString());
      packageFormData.append("description", formData.description);
      packageFormData.append("totalSeats", formData.totalSeats);
      packageFormData.append("startDate", formData.startDate);
      packageFormData.append("endDate", formData.endDate);
      packageFormData.append("difficulty", formData.difficulty);
      packageFormData.append("category", formData.category);
      packageFormData.append("featured", formData.featured.toString());
      packageFormData.append("minGroupSize", formData.minGroupSize);
      packageFormData.append(
        "maxGroupSize",
        formData.maxGroupSize || formData.totalSeats
      );

      packageFormData.append(
        "inclusions",
        JSON.stringify(
          formData.inclusions
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        )
      );
      packageFormData.append(
        "exclusions",
        JSON.stringify(
          formData.exclusions
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean)
        )
      );
      packageFormData.append(
        "highlights",
        JSON.stringify(
          formData.highlights
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean)
        )
      );
      packageFormData.append(
        "requirements",
        JSON.stringify(
          formData.requirements
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean)
        )
      );

      const processedItinerary = itinerary.map((day) => ({
        day: day.day,
        title: day.title,
        description: day.description,
        activities: day.activities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        meals: day.meals
          ? day.meals
              .split(",")
              .map((m) => m.trim())
              .filter(Boolean)
          : [],
      }));
      packageFormData.append("itinerary", JSON.stringify(processedItinerary));

      if (packageImage) {
        packageFormData.append("image", packageImage);
      }

      const response = await fetch(
        `/api/admin/packages/${selectedPackage._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: packageFormData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsEditDialogOpen(false);
        resetForm();
        fetchPackages();
        fetchDestinations();
        toast({
          title: "Success",
          description: "Package updated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update package",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating package:", error);
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      const response = await fetch(`/api/admin/packages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchPackages();
        fetchDestinations();
        toast({
          title: "Success",
          description: "Package deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete package",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      destinationId: pkg.destinationId,
      duration: pkg.duration.toString(),
      price: pkg.price.toString(),
      isFree: pkg.isFree,
      description: pkg.description,
      totalSeats: pkg.totalSeats.toString(),
      startDate: pkg.startDate.split("T")[0],
      endDate: pkg.endDate.split("T")[0],
      featured: pkg.featured,
      difficulty: pkg.difficulty,
      category: pkg.category,
      inclusions: pkg.inclusions.join(", "),
      exclusions: pkg.exclusions.join(", "),
      highlights: pkg.highlights.join(", "),
      minGroupSize: pkg.minGroupSize.toString(),
      maxGroupSize: pkg.maxGroupSize.toString(),
      requirements: pkg.requirements.join(", "),
    });

    setItinerary(
      pkg.itinerary.map((day) => ({
        day: day.day,
        title: day.title,
        description: day.description,
        activities: day.activities.join(", "),
        meals: day.meals?.join(", ") || "",
      }))
    );

    setImagePreview(pkg.image?.url || "");
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      destinationId: "",
      duration: "",
      price: "",
      isFree: false,
      description: "",
      totalSeats: "",
      startDate: "",
      endDate: "",
      featured: false,
      difficulty: "moderate",
      category: "Adventure",
      inclusions: "",
      exclusions: "",
      highlights: "",
      minGroupSize: "1",
      maxGroupSize: "",
      requirements: "",
    });
    setPackageImage(null);
    setImagePreview("");
    setItinerary([]);
    setSelectedPackage(null);
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destinationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || pkg.status === statusFilter;
    const matchesDestination =
      destinationFilter === "all" || pkg.destinationId === destinationFilter;
    return matchesSearch && matchesStatus && matchesDestination;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "soldout":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "moderate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "challenging":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

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
      <SummaryCards packages={packages} />

      {/* Main Card */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white text-lg sm:text-xl">
                All Packages
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm">
                View and manage travel packages
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-sm sm:text-base w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Package
                </Button>
              </DialogTrigger>
              <PackageForm
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onSubmit={handleCreatePackage}
                mode="create"
                formData={formData}
                onFormDataChange={setFormData}
                packageImage={packageImage}
                onImageChange={handleImageChange}
                imagePreview={imagePreview}
                itinerary={itinerary}
                onItineraryAdd={addItineraryDay}
                onItineraryUpdate={updateItineraryDay}
                onItineraryRemove={removeItineraryDay}
                destinations={destinations}
                submitting={submitting}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Filters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            destinationFilter={destinationFilter}
            onDestinationFilterChange={setDestinationFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            destinations={destinations}
          />

          {/* Packages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                onView={(pkg) => {
                  setSelectedPackage(pkg);
                  setIsViewDialogOpen(true);
                }}
                onEdit={openEditDialog}
                onDelete={handleDeletePackage}
                getStatusColor={getStatusColor}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </div>

          {filteredPackages.length === 0 && <EmptyState />}
        </CardContent>
      </Card>

      <PackageForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdatePackage}
        mode="edit"
        formData={formData}
        onFormDataChange={setFormData}
        packageImage={packageImage}
        onImageChange={handleImageChange}
        imagePreview={imagePreview}
        itinerary={itinerary}
        onItineraryAdd={addItineraryDay}
        onItineraryUpdate={updateItineraryDay}
        onItineraryRemove={removeItineraryDay}
        destinations={destinations}
        submitting={submitting}
        selectedPackage={selectedPackage}
      />

      <PackageView
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        selectedPackage={selectedPackage}
        getStatusColor={getStatusColor}
        getDifficultyColor={getDifficultyColor}
      />
    </div>
  );
}
