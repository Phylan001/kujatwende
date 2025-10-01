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
} from "lucide-react";

interface TravelPackage {
  _id: string;
  name: string;
  destination: string;
  duration: number;
  price: number;
  description: string;
  image: string;
  availableSeats: number;
  totalSeats: number;
  startDate: string;
  endDate: string;
  featured: boolean;
  status: "active" | "inactive" | "soldout";
  inclusions: string[];
  exclusions: string[];
  difficulty: "easy" | "moderate" | "challenging";
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);

  // Form state for adding/editing packages
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    duration: "",
    price: "",
    description: "",
    image: "",
    totalSeats: "",
    startDate: "",
    endDate: "",
    featured: false,
    difficulty: "moderate",
    inclusions: "",
    exclusions: "",
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      const data = await response.json();
      if (data.packages) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    try {
      const response = await fetch("/api/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          totalSeats: parseInt(formData.totalSeats),
          inclusions: formData.inclusions.split(",").map((item) => item.trim()),
          exclusions: formData.exclusions.split(",").map((item) => item.trim()),
        }),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        fetchPackages();
        resetForm();
      }
    } catch (error) {
      console.error("Error creating package:", error);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      if (response.ok) {
        fetchPackages();
      }
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      destination: "",
      duration: "",
      price: "",
      description: "",
      image: "",
      totalSeats: "",
      startDate: "",
      endDate: "",
      featured: false,
      difficulty: "moderate",
      inclusions: "",
      exclusions: "",
    });
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || pkg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "soldout":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Travel Packages
          </h2>
          <p className="text-slate-400 mt-1 text-xs sm:text-base">
            Manage your travel package offerings
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Total Packages
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-purple-400 mt-2">
              {packages.length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Active Packages
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-400 mt-2">
              {packages.filter((p) => p.status === "active").length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Featured
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-yellow-400 mt-2">
              {packages.filter((p) => p.featured).length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Sold Out
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-red-400 mt-2">
              {packages.filter((p) => p.status === "soldout").length}
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
                View and manage all travel packages
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-sm sm:text-base w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Package
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Package</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Add a new travel package to your offerings
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Package Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        value={formData.destination}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            destination: e.target.value,
                          })
                        }
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (days)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (KSh)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalSeats">Total Seats</Label>
                      <Input
                        id="totalSeats"
                        type="number"
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({ ...formData, startDate: e.target.value })
                        }
                        className="bg-slate-700/50 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) =>
                        setFormData({ ...formData, difficulty: value })
                      }
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
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="bg-slate-700/50 border-slate-600"
                      rows={3}
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
                      rows={2}
                      placeholder="Accommodation, Meals, Transport"
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
                      rows={2}
                      placeholder="Personal expenses, Insurance"
                    />
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
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePackage}
                    className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                  >
                    Create Package
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/10 border-white/20 text-white text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="soldout">Sold Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackages.map((pkg) => (
              <Card
                key={pkg._id}
                className="bg-slate-700/30 border-slate-600/50 overflow-hidden hover:border-cyan-400/50 transition-colors"
              >
                <div className="relative h-48 bg-slate-600/50">
                  {pkg.image ? (
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-slate-500" />
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
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">
                      {pkg.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      {pkg.destination}
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm line-clamp-2">
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

                  <div className="flex items-center justify-between pt-2 border-t border-slate-600/50">
                    <div>
                      <p className="text-xs text-slate-400">Price</p>
                      <p className="text-cyan-400 font-bold text-lg">
                        KSh {pkg.price.toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getDifficultyColor(pkg.difficulty)}>
                      {pkg.difficulty}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-600 text-white hover:bg-slate-700 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
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
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-white/70 text-base">No packages found</p>
              <p className="text-slate-500 text-sm mt-2">
                Try adjusting your search or add a new package
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
