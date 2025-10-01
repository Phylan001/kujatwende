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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Image as ImageIcon,
  X,
} from "lucide-react";

interface Destination {
  _id: string;
  name: string;
  slug: string;
  location: {
    region: string;
  };
  packagesCount: number;
}

interface TravelPackage {
  _id: string;
  name: string;
  slug: string;
  destinationId: string;
  destinationName: string;
  duration: number;
  price: number;
  isFree: boolean;
  description: string;
  image?: {
    url: string;
    publicId: string;
  };
  availableSeats: number;
  totalSeats: number;
  bookedSeats: number;
  startDate: string;
  endDate: string;
  featured: boolean;
  status: "active" | "inactive" | "soldout" | "upcoming";
  inclusions: string[];
  exclusions: string[];
  highlights: string[];
  difficulty: "easy" | "moderate" | "challenging";
  category: string;
  minGroupSize: number;
  maxGroupSize: number;
  averageRating: number;
  totalReviews: number;
  requirements: string[];
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
    meals?: string[];
  }>;
}

export default function PackagesPage() {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPackageImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
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
      alert("Please fill in all required fields");
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
        alert("Package created successfully!");
      } else {
        alert(data.error || "Failed to create package");
      }
    } catch (error) {
      console.error("Error creating package:", error);
      alert("Failed to create package");
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
        alert("Package updated successfully!");
      } else {
        alert(data.error || "Failed to update package");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      alert("Failed to update package");
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
        alert("Package deleted successfully!");
      } else {
        alert(data.error || "Failed to delete package");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Failed to delete package");
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
        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Travel Packages
          </h2>
          <p className="text-slate-400 mt-1 text-xs sm:text-base">
            Manage packages for destinations
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-3 sm:p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Total
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-purple-400 mt-1 sm:mt-2">
              {packages.length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-3 sm:p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Active
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-green-400 mt-1 sm:mt-2">
              {packages.filter((p) => p.status === "active").length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-3 sm:p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Featured
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-yellow-400 mt-1 sm:mt-2">
              {packages.filter((p) => p.featured).length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-3 sm:p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Free
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-cyan-400 mt-1 sm:mt-2">
              {packages.filter((p) => p.isFree).length}
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
              <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Package</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Add a new travel package
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
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="bg-slate-700/50 border-slate-600"
                        placeholder="e.g., 3-Day Maasai Mara Safari"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination *</Label>
                      <Select
                        value={formData.destinationId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, destinationId: value })
                        }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
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
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
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
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            totalSeats: e.target.value,
                          })
                        }
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={formData.isFree}
                      onChange={(e) =>
                        setFormData({ ...formData, isFree: e.target.checked })
                      }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
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
                        onValueChange={(value: any) =>
                          setFormData({ ...formData, difficulty: value })
                        }
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="challenging">
                            Challenging
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minGroupSize: e.target.value,
                          })
                        }
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxGroupSize: e.target.value,
                          })
                        }
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
                      placeholder="e.g., Big Five, Sunset Views, Cultural Experience"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inclusions">
                      Inclusions (comma-separated)
                    </Label>
                    <Textarea
                      id="inclusions"
                      value={formData.inclusions}
                      onChange={(e) =>
                        setFormData({ ...formData, inclusions: e.target.value })
                      }
                      className="bg-slate-700/50 border-slate-600"
                      placeholder="e.g., Accommodation, Meals, Transport, Guide"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exclusions">
                      Exclusions (comma-separated)
                    </Label>
                    <Textarea
                      id="exclusions"
                      value={formData.exclusions}
                      onChange={(e) =>
                        setFormData({ ...formData, exclusions: e.target.value })
                      }
                      className="bg-slate-700/50 border-slate-600"
                      placeholder="e.g., Personal expenses, Insurance, Tips"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">
                      Requirements (comma-separated)
                    </Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requirements: e.target.value,
                        })
                      }
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
                        onClick={addItineraryDay}
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
                            onClick={() => removeItineraryDay(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Day title"
                          value={day.title}
                          onChange={(e) =>
                            updateItineraryDay(index, "title", e.target.value)
                          }
                          className="bg-slate-700/50 border-slate-600 text-sm"
                        />
                        <Textarea
                          placeholder="Description"
                          value={day.description}
                          onChange={(e) =>
                            updateItineraryDay(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="bg-slate-700/50 border-slate-600 text-sm"
                          rows={2}
                        />
                        <Input
                          placeholder="Activities (comma-separated)"
                          value={day.activities}
                          onChange={(e) =>
                            updateItineraryDay(
                              index,
                              "activities",
                              e.target.value
                            )
                          }
                          className="bg-slate-700/50 border-slate-600 text-sm"
                        />
                        <Input
                          placeholder="Meals (comma-separated, optional)"
                          value={day.meals}
                          onChange={(e) =>
                            updateItineraryDay(index, "meals", e.target.value)
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
                      onChange={(e) =>
                        setFormData({ ...formData, featured: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <Label htmlFor="featured">Featured Package</Label>
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
                    onClick={handleCreatePackage}
                    disabled={
                      submitting ||
                      !formData.name ||
                      !formData.destinationId ||
                      !formData.description
                    }
                    className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 w-full sm:w-auto"
                  >
                    {submitting ? "Creating..." : "Create Package"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 text-sm"
              />
            </div>
            <Select
              value={destinationFilter}
              onValueChange={setDestinationFilter}
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

          {/* Packages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackages.map((pkg) => (
              <Card
                key={pkg._id}
                className="bg-slate-700/30 border-slate-600/50 overflow-hidden hover:border-cyan-400/50 transition-colors"
              >
                <div className="relative h-40 sm:h-48 bg-slate-600/50">
                  {pkg.image?.url ? (
                    <img
                      src={pkg.image.url}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500" />
                    </div>
                  )}
                  {pkg.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                  <Badge
                    className={`absolute top-2 left-2 ${getStatusColor(
                      pkg.status
                    )}`}
                  >
                    {pkg.status}
                  </Badge>
                  {pkg.isFree && (
                    <div className="absolute bottom-2 left-2 bg-cyan-500/90 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      FREE
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-white font-bold text-base sm:text-lg mb-1 line-clamp-1">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      {pkg.destinationName}
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs sm:text-sm line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {pkg.duration} days
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Users className="w-3 h-3" />
                      {pkg.availableSeats}/{pkg.totalSeats} seats
                    </div>
                  </div>

                  {pkg.averageRating > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-white font-medium">
                        {pkg.averageRating.toFixed(1)}
                      </span>
                      <span className="text-slate-400">
                        ({pkg.totalReviews})
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-600/50">
                    <div>
                      {pkg.isFree ? (
                        <p className="text-cyan-400 font-bold text-lg">FREE</p>
                      ) : (
                        <>
                          <p className="text-xs text-slate-400">Price</p>
                          <p className="text-cyan-400 font-bold text-base sm:text-lg">
                            KSh {pkg.price.toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                    <Badge className={getDifficultyColor(pkg.difficulty)}>
                      {pkg.difficulty}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setIsViewDialogOpen(true);
                      }}
                      className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(pkg)}
                      className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePackage(pkg._id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-white/70 text-sm sm:text-base">
                No packages found
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">
                Try adjusting your filters or add a new package
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog - Same structure as Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update package information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Same form fields as Add Dialog */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Package Name *</Label>
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
                <Label htmlFor="edit-destination">Destination *</Label>
                <Select
                  value={formData.destinationId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, destinationId: value })
                  }
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((dest) => (
                      <SelectItem key={dest._id} value={dest._id}>
                        {dest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (days) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (KES) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  disabled={formData.isFree}
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalSeats">Total Seats *</Label>
                <Input
                  id="edit-totalSeats"
                  type="number"
                  min="1"
                  value={formData.totalSeats}
                  onChange={(e) =>
                    setFormData({ ...formData, totalSeats: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isFree"
                checked={formData.isFree}
                onChange={(e) =>
                  setFormData({ ...formData, isFree: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="edit-isFree">Free Package</Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date *</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-packageImage">Update Package Image</Label>
              <Input
                id="edit-packageImage"
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
              <Label htmlFor="edit-inclusions">
                Inclusions (comma-separated)
              </Label>
              <Textarea
                id="edit-inclusions"
                value={formData.inclusions}
                onChange={(e) =>
                  setFormData({ ...formData, inclusions: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-exclusions">
                Exclusions (comma-separated)
              </Label>
              <Textarea
                id="edit-exclusions"
                value={formData.exclusions}
                onChange={(e) =>
                  setFormData({ ...formData, exclusions: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600"
                rows={2}
              />
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
              <Label htmlFor="edit-featured">Featured Package</Label>
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
              onClick={handleUpdatePackage}
              disabled={
                submitting ||
                !formData.name ||
                !formData.destinationId ||
                !formData.description
              }
              className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 w-full sm:w-auto"
            >
              {submitting ? "Updating..." : "Update Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPackage?.name}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedPackage?.destinationName}
            </DialogDescription>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-4">
              {selectedPackage.image?.url && (
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={selectedPackage.image.url}
                    alt={selectedPackage.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getStatusColor(selectedPackage.status)}>
                  {selectedPackage.status}
                </Badge>
                <Badge
                  className={getDifficultyColor(selectedPackage.difficulty)}
                >
                  {selectedPackage.difficulty}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {selectedPackage.category}
                </Badge>
                {selectedPackage.featured && (
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    Featured
                  </Badge>
                )}
                {selectedPackage.isFree && (
                  <Badge className="bg-cyan-500/20 text-cyan-400">Free</Badge>
                )}
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Description</h4>
                <p className="text-slate-300 text-sm">
                  {selectedPackage.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-semibold mb-1 text-sm">
                    Duration
                  </h4>
                  <p className="text-slate-300 text-sm">
                    {selectedPackage.duration} days
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1 text-sm">
                    Price
                  </h4>
                  <p className="text-cyan-400 font-bold text-base">
                    {selectedPackage.isFree
                      ? "FREE"
                      : `KSh ${selectedPackage.price.toLocaleString()}`}
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1 text-sm">
                    Availability
                  </h4>
                  <p className="text-slate-300 text-sm">
                    {selectedPackage.availableSeats}/
                    {selectedPackage.totalSeats} seats
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1 text-sm">
                    Group Size
                  </h4>
                  <p className="text-slate-300 text-sm">
                    {selectedPackage.minGroupSize}-
                    {selectedPackage.maxGroupSize} people
                  </p>
                </div>
              </div>

              {selectedPackage.highlights.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPackage.highlights.map((highlight, index) => (
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

              {selectedPackage.inclusions.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Inclusions</h4>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                    {selectedPackage.inclusions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPackage.exclusions.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Exclusions</h4>
                  <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                    {selectedPackage.exclusions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPackage.itinerary.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Itinerary</h4>
                  <div className="space-y-3">
                    {selectedPackage.itinerary.map((day, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/50"
                      >
                        <h5 className="text-cyan-400 font-semibold text-sm mb-1">
                          Day {day.day}: {day.title}
                        </h5>
                        <p className="text-slate-300 text-sm mb-2">
                          {day.description}
                        </p>
                        {day.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {day.activities.map((activity, i) => (
                              <Badge
                                key={i}
                                className="text-xs bg-purple-500/20 text-purple-400"
                              >
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {day.meals && day.meals.length > 0 && (
                          <p className="text-slate-400 text-xs">
                            Meals: {day.meals.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
