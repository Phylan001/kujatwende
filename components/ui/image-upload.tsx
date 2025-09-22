"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { X, ImageIcon } from "lucide-react"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onUpload: (imageData: {
    public_id: string
    secure_url: string
    width: number
    height: number
  }) => void
  onRemove?: () => void
  currentImage?: string
  folder?: string
  className?: string
  multiple?: boolean
  maxFiles?: number
}

export function ImageUpload({
  onUpload,
  onRemove,
  currentImage,
  folder = "kuja-twende",
  className,
  multiple = false,
  maxFiles = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>(currentImage ? [currentImage] : [])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (!files.length) return

    setIsUploading(true)

    try {
      const filesToProcess = multiple ? Array.from(files).slice(0, maxFiles - uploadedImages.length) : [files[0]]

      for (const file of filesToProcess) {
        if (file.type.startsWith("image/")) {
          const result = await uploadToCloudinary(file, folder)
          onUpload(result)

          if (multiple) {
            setUploadedImages((prev) => [...prev, result.secure_url])
          } else {
            setUploadedImages([result.secure_url])
          }
        }
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    if (onRemove) onRemove()
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive
            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Label className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                {isUploading ? "Uploading..." : "Drop images here or click to upload"}
              </span>
            </Label>
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB {multiple && `(max ${maxFiles} files)`}
            </p>
          </div>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className={cn("grid gap-4", multiple ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1")}>
          {uploadedImages.map((image, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <img
                src={image || "/placeholder.svg"}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
