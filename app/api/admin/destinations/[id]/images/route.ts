import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import type {
  Destination,
  CloudinaryImage,
  GalleryImage,
} from "@/lib/mongodb-types";

interface UploadResults {
  banner: CloudinaryImage | { error: string } | null;
  gallery: (GalleryImage | { error: string })[];
}

interface ImageUpdates {
  updatedAt: Date;
  bannerImage?: CloudinaryImage;
  gallery?: GalleryImage[];
}

interface DeleteImageBody {
  type: "banner" | "gallery";
  publicId?: string;
  galleryIndex?: number;
}

/**
 * POST /api/destinations/[id]/images
 * Upload images (banner and/or gallery) for a destination
 * Expects multipart/form-data with 'bannerImage' and/or 'galleryImages[]'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid destination ID" },
        { status: 400 }
      );
    }

    // Verify destination exists
    const destination = await db
      .collection<Destination>("destinations")
      .findOne({ _id: new ObjectId(id) });

    if (!destination) {
      return NextResponse.json(
        { success: false, error: "Destination not found" },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const bannerImageFile = formData.get("bannerImage") as File | null;
    const galleryFiles = formData.getAll("galleryImages") as File[];
    const imageCaptions = formData.getAll("captions") as string[];

    const updates: ImageUpdates = { updatedAt: new Date() };
    const uploadResults: UploadResults = {
      banner: null,
      gallery: [],
    };

    // Upload banner image if provided
    if (bannerImageFile && bannerImageFile.size > 0) {
      try {
        // Delete old banner if exists
        if (destination.bannerImage?.publicId) {
          await deleteFromCloudinary(destination.bannerImage.publicId);
        }

        // Upload new banner
        const result = await uploadToCloudinary(
          bannerImageFile,
          process.env.CLOUDINARY_DESTINATION_FOLDER ||
            "kuja-twende/destinations"
        );

        const bannerImage: CloudinaryImage = {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
        };

        updates.bannerImage = bannerImage;
        uploadResults.banner = bannerImage;
      } catch (error) {
        console.error("Banner image upload failed:", error);
        uploadResults.banner = { error: "Failed to upload banner image" };
      }
    }

    // Upload gallery images if provided
    if (galleryFiles && galleryFiles.length > 0) {
      const existingGallery: GalleryImage[] = destination.gallery || [];
      const newGalleryImages: GalleryImage[] = [];

      // Process gallery uploads in parallel with individual error handling
      const uploadPromises = galleryFiles.map(
        async (file: File, index: number) => {
          if (file.size === 0) return null;

          try {
            const result = await uploadToCloudinary(
              file,
              process.env.CLOUDINARY_DESTINATION_FOLDER ||
                "kuja-twende/destinations"
            );

            const galleryImage: GalleryImage = {
              publicId: result.public_id,
              url: result.secure_url,
              width: result.width,
              height: result.height,
              caption: imageCaptions[index] || "",
            };

            return galleryImage;
          } catch (error) {
            console.error(`Gallery image ${index} upload failed:`, error);
            return { error: `Failed to upload image ${index + 1}` } as {
              error: string;
            };
          }
        }
      );

      const results = await Promise.all(uploadPromises);

      // Filter successful uploads
      results.forEach((result) => {
        if (result && !("error" in result)) {
          newGalleryImages.push(result);
        } else if (result && "error" in result) {
          uploadResults.gallery.push(result);
        }
      });

      // Merge with existing gallery (limit to 20 images total)
      updates.gallery = [...existingGallery, ...newGalleryImages].slice(0, 20);
    }

    // Update destination with new images
    if (Object.keys(updates).length > 1) {
      // More than just updatedAt
      await db
        .collection("destinations")
        .updateOne({ _id: new ObjectId(id) }, { $set: updates });
    }

    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully",
      results: uploadResults,
    });
  } catch (error) {
    console.error("Error uploading destination images:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/destinations/[id]/images
 * Delete specific images from a destination
 * Body: { type: 'banner' | 'gallery', publicId?: string, galleryIndex?: number }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const { id } = params;
    const body: DeleteImageBody = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid destination ID" },
        { status: 400 }
      );
    }

    const destination = await db
      .collection<Destination>("destinations")
      .findOne({ _id: new ObjectId(id) });

    if (!destination) {
      return NextResponse.json(
        { success: false, error: "Destination not found" },
        { status: 404 }
      );
    }

    interface UpdateOperation {
      updatedAt: Date;
      bannerImage?: null;
      gallery?: GalleryImage[];
    }

    let updateOperation: UpdateOperation = { updatedAt: new Date() };

    // Delete banner image
    if (body.type === "banner" && destination.bannerImage?.publicId) {
      await deleteFromCloudinary(destination.bannerImage.publicId);
      updateOperation.bannerImage = null;
    }

    // Delete specific gallery image
    if (body.type === "gallery") {
      const gallery: GalleryImage[] = destination.gallery || [];
      let imageToDelete: GalleryImage | undefined;

      if (typeof body.galleryIndex === "number") {
        imageToDelete = gallery[body.galleryIndex];
      } else if (body.publicId) {
        imageToDelete = gallery.find(
          (img: GalleryImage) => img.publicId === body.publicId
        );
      }

      if (imageToDelete?.publicId) {
        await deleteFromCloudinary(imageToDelete.publicId);

        // Remove from gallery array
        updateOperation.gallery = gallery.filter(
          (img: GalleryImage) => img.publicId !== imageToDelete!.publicId
        );
      } else {
        return NextResponse.json(
          { success: false, error: "Image not found in gallery" },
          { status: 404 }
        );
      }
    }

    // Update destination
    await db
      .collection("destinations")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateOperation });

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting destination image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
