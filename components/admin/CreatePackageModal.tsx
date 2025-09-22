"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreatePackageModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreatePackageModal({ onClose, onSuccess }: CreatePackageModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    category: "",
    difficulty: "",
    duration: "",
    price: "",
    maxGroupSize: "",
    images: [""],
    itinerary: [{ day: 1, title: "", description: "" }],
    included: [""],
    excluded: [""],
    requirements: [""],
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const packageData = {
        ...formData,
        duration: Number.parseInt(formData.duration),
        price: Number.parseFloat(formData.price),
        maxGroupSize: Number.parseInt(formData.maxGroupSize),
        images: formData.images.filter((img) => img.trim() !== ""),
        included: formData.included.filter((item) => item.trim() !== ""),
        excluded: formData.excluded.filter((item) => item.trim() !== ""),
        requirements: formData.requirements.filter((req) => req.trim() !== ""),
        available: true,
        featured: false,
      }

      const response = await fetch("/api/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify(packageData),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Package created successfully.",
        })
        onSuccess()
      } else {
        throw new Error("Failed to create package")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create package. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].map((item: any, i: number) => (i === index ? value : item)),
    }))
  }

  const addArrayItem = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev], ""],
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].filter((_: any, i: number) => i !== index),
    }))
  }

  const addItineraryDay = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: "", description: "" }],
    }))
  }

  const removeItineraryDay = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index),
    }))
  }

  const handleItineraryChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Create New Package</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white/80">
                  Package Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                  placeholder="e.g., Maasai Mara Safari Adventure"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-white/80">
                  Destination *
                </Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => handleInputChange("destination", e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                  placeholder="e.g., Maasai Mara"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white/80">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
                rows={4}
                className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                placeholder="Describe the package experience..."
              />
            </div>

            {/* Package Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white/80">
                  Category *
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Wildlife">Wildlife</SelectItem>
                    <SelectItem value="Beach">Beach</SelectItem>
                    <SelectItem value="Mountain">Mountain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-white/80">
                  Difficulty *
                </Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Challenging">Challenging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-white/80">
                  Duration (days) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxGroupSize" className="text-white/80">
                  Max Group Size *
                </Label>
                <Input
                  id="maxGroupSize"
                  type="number"
                  min="1"
                  value={formData.maxGroupSize}
                  onChange={(e) => handleInputChange("maxGroupSize", e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-white/80">
                Price (KSh) *
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                placeholder="e.g., 50000"
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label className="text-white/80">Package Images</Label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => handleArrayChange("images", index, e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                    placeholder="Image URL"
                  />
                  {formData.images.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem("images", index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem("images")}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </div>

            {/* Itinerary */}
            <div className="space-y-2">
              <Label className="text-white/80">Itinerary</Label>
              {formData.itinerary.map((day, index) => (
                <div key={index} className="space-y-2 p-4 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/60">Day {day.day}</Label>
                    {formData.itinerary.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItineraryDay(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={day.title}
                    onChange={(e) => handleItineraryChange(index, "title", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                    placeholder="Day title"
                  />
                  <Textarea
                    value={day.description}
                    onChange={(e) => handleItineraryChange(index, "description", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                    placeholder="Day description"
                    rows={2}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItineraryDay}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Day
              </Button>
            </div>

            {/* Included/Excluded/Requirements */}
            {["included", "excluded", "requirements"].map((field) => (
              <div key={field} className="space-y-2">
                <Label className="text-white/80 capitalize">{field}</Label>
                {formData[field as keyof typeof formData].map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayChange(field, index, e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                      placeholder={`Add ${field.slice(0, -1)}`}
                    />
                    {formData[field as keyof typeof formData].length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(field, index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(field)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {field.slice(0, -1)}
                </Button>
              </div>
            ))}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
              >
                {loading ? "Creating..." : "Create Package"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
