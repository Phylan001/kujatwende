"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import type { TravelPackage } from "@/lib/models/Package"
import { CreatePackageModal } from "./CreatePackageModal"

export function PackagesManagement() {
  const [packages, setPackages] = useState<TravelPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages?limit=100")
      const data = await response.json()
      if (data.packages) {
        setPackages(data.packages)
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
    } finally {
      setLoading(false)
    }
  }

  const togglePackageAvailability = async (packageId: string, available: boolean) => {
    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ available }),
      })

      if (response.ok) {
        fetchPackages() // Refresh the list
      }
    } catch (error) {
      console.error("Error updating package:", error)
    }
  }

  const deletePackage = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return

    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })

      if (response.ok) {
        fetchPackages() // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting package:", error)
    }
  }

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || pkg.category.toLowerCase() === categoryFilter

    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "adventure":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "cultural":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "wildlife":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "beach":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "mountain":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "moderate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "challenging":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="glass border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Packages Management</CardTitle>
              <CardDescription className="text-white/70">Manage travel packages and destinations</CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filter by category" />
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

          {/* Packages Table */}
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/80">Package</TableHead>
                  <TableHead className="text-white/80">Category</TableHead>
                  <TableHead className="text-white/80">Difficulty</TableHead>
                  <TableHead className="text-white/80">Duration</TableHead>
                  <TableHead className="text-white/80">Price</TableHead>
                  <TableHead className="text-white/80">Status</TableHead>
                  <TableHead className="text-white/80">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.map((pkg) => (
                  <TableRow key={pkg._id?.toString()} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={pkg.images[0] || `/placeholder.svg?height=40&width=60&query=${pkg.destination}`}
                          alt={pkg.title}
                          className="w-15 h-10 object-cover rounded"
                        />
                        <div>
                          <div className="text-white/80 font-medium">{pkg.title}</div>
                          <div className="text-sm text-white/60">{pkg.destination}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(pkg.category)}>{pkg.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(pkg.difficulty)}>{pkg.difficulty}</Badge>
                    </TableCell>
                    <TableCell className="text-white/80">{pkg.duration} days</TableCell>
                    <TableCell className="text-white/80 font-medium">KSh {pkg.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => togglePackageAvailability(pkg._id!.toString(), !pkg.available)}
                        className="flex items-center gap-2"
                      >
                        {pkg.available ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 text-sm">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-red-400" />
                            <span className="text-red-400 text-sm">Inactive</span>
                          </>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-cyan-400">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-white/60 hover:text-cyan-400">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePackage(pkg._id!.toString())}
                          className="text-white/60 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white/70">No packages found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Package Modal */}
      {showCreateModal && (
        <CreatePackageModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchPackages()
          }}
        />
      )}
    </>
  )
}
