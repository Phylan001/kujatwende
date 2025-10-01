import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

/**
 * POST /api/destinations/[id]/images
 * Upload images (banner and/or gallery) for a destination
 * Expects multipart/form-data with 'bannerImage' and/or 'galleryImages[]'
 *
 * Strategy: Process images in parallel with error handling for partial failures
 * Complexity: O(n) where n is number of images
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
      .collection("destinations")
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

    const updates: any = { updatedAt: new Date() };
    const uploadResults: any = {
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

        updates.bannerImage = {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
        };

        uploadResults.banner = updates.bannerImage;
      } catch (error) {
        console.error("Banner image upload failed:", error);
        uploadResults.banner = { error: "Failed to upload banner image" };
      }
    }

    // Upload gallery images if provided
    if (galleryFiles && galleryFiles.length > 0) {
      const existingGallery = destination.gallery || [];
      const newGalleryImages = [];

      // Process gallery uploads in parallel with individual error handling
      const uploadPromises = galleryFiles.map(async (file, index) => {
        if (file.size === 0) return null;

        try {
          const result = await uploadToCloudinary(
            file,
            process.env.CLOUDINARY_DESTINATION_FOLDER ||
              "kuja-twende/destinations"
          );

          return {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            caption: imageCaptions[index] || "",
          };
        } catch (error) {
          console.error(`Gallery image ${index} upload failed:`, error);
          return { error: `Failed to upload image ${index + 1}` };
        }
      });

      const results = await Promise.all(uploadPromises);

      // Filter successful uploads
      results.forEach((result) => {
        if (result && !result.error) {
          newGalleryImages.push(result);
        } else if (result?.error) {
          uploadResults.gallery.push(result);
        }
      });

      // Merge with existing gallery (limit to 20 images total)
      updates.gallery = [...existingGallery, ...newGalleryImages].slice(0, 20);
      uploadResults.gallery = newGalleryImages;
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
    const body = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid destination ID" },
        { status: 400 }
      );
    }

    const destination = await db
      .collection("destinations")
      .findOne({ _id: new ObjectId(id) });

    if (!destination) {
      return NextResponse.json(
        { success: false, error: "Destination not found" },
        { status: 404 }
      );
    }

    let updateOperation: any = { updatedAt: new Date() };

    // Delete banner image
    if (body.type === "banner" && destination.bannerImage?.publicId) {
      await deleteFromCloudinary(destination.bannerImage.publicId);
      updateOperation.bannerImage = null;
    }

    // Delete specific gallery image
    if (body.type === "gallery") {
      const gallery = destination.gallery || [];
      let imageToDelete;

      if (typeof body.galleryIndex === "number") {
        imageToDelete = gallery[body.galleryIndex];
      } else if (body.publicId) {
        imageToDelete = gallery.find((img) => img.publicId === body.publicId);
      }

      if (imageToDelete?.publicId) {
        await deleteFromCloudinary(imageToDelete.publicId);

        // Remove from gallery array
        updateOperation.gallery = gallery.filter(
          (img) => img.publicId !== imageToDelete.publicId
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
