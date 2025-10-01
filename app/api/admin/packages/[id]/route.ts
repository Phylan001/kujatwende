import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import type { TravelPackage, UpdatePackageDTO } from "@/lib/models/Package";

/**
 * GET /api/packages/[id]
 * Fetch a single package with destination details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid package ID" },
        { status: 400 }
      );
    }

    const travelPackage = await db
      .collection<TravelPackage>("packages")
      .findOne({ _id: new ObjectId(id) });

    if (!travelPackage) {
      return NextResponse.json(
        { success: false, error: "Package not found" },
        { status: 404 }
      );
    }

    // Optionally fetch destination details
    const includeDestination =
      request.nextUrl.searchParams.get("includeDestination") === "true";
    let destination = null;

    if (includeDestination) {
      destination = await db
        .collection("destinations")
        .findOne({ _id: travelPackage.destinationId });
    }

    return NextResponse.json({
      success: true,
      package: travelPackage,
      destination: includeDestination ? destination : undefined,
    });
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch package" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/packages/[id]
 * Update a package with optional image replacement
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid package ID" },
        { status: 400 }
      );
    }

    // Get existing package
    const existingPackage = await db
      .collection<TravelPackage>("packages")
      .findOne({ _id: new ObjectId(id) });

    if (!existingPackage) {
      return NextResponse.json(
        { success: false, error: "Package not found" },
        { status: 404 }
      );
    }

    const contentType = request.headers.get("content-type");
    let updateData: UpdatePackageDTO;
    let newImageFile: File | null = null;

    // Handle multipart/form-data (with image)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      newImageFile = formData.get("image") as File | null;

      // Parse other fields
      updateData = {};
      for (const [key, value] of formData.entries()) {
        if (key !== "image") {
          try {
            // Try to parse JSON fields
            updateData[key as keyof UpdatePackageDTO] = JSON.parse(
              value as string
            );
          } catch {
            // If not JSON, use as is
            updateData[key as keyof UpdatePackageDTO] = value as any;
          }
        }
      }
    } else {
      // Handle JSON body
      updateData = await request.json();
    }

    // Build update document
    const updateDoc: any = {
      ...updateData,
      updatedAt: new Date(),
    };

    // Handle image replacement
    if (newImageFile && newImageFile.size > 0) {
      try {
        // Delete old image
        if (existingPackage.image?.publicId) {
          await deleteFromCloudinary(existingPackage.image.publicId);
        }

        // Upload new image
        const result = await uploadToCloudinary(
          newImageFile,
          process.env.CLOUDINARY_PACKAGE_FOLDER || "kuja-twende/packages"
        );

        updateDoc.image = {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
        };
      } catch (error) {
        console.error("Image upload failed:", error);
        return NextResponse.json(
          { success: false, error: "Failed to upload new image" },
          { status: 500 }
        );
      }
    }

    // Update slug if name changed
    if (updateData.name) {
      updateDoc.slug = updateData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Convert date strings to Date objects
    if (updateData.startDate)
      updateDoc.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateDoc.endDate = new Date(updateData.endDate);

    // Handle destination change
    if (
      updateData.destinationId &&
      updateData.destinationId !== existingPackage.destinationId.toString()
    ) {
      const newDestination = await db
        .collection("destinations")
        .findOne({ _id: new ObjectId(updateData.destinationId) });

      if (!newDestination) {
        return NextResponse.json(
          { success: false, error: "New destination not found" },
          { status: 404 }
        );
      }

      updateDoc.destinationId = new ObjectId(updateData.destinationId);
      updateDoc.destinationName = newDestination.name;

      // Update package counts
      await db
        .collection("destinations")
        .updateOne(
          { _id: existingPackage.destinationId },
          { $inc: { packagesCount: -1 } }
        );
      await db
        .collection("destinations")
        .updateOne(
          { _id: new ObjectId(updateData.destinationId) },
          { $inc: { packagesCount: 1 } }
        );
    }

    // Update availableSeats if totalSeats changed
    if (
      updateData.totalSeats &&
      updateData.totalSeats !== existingPackage.totalSeats
    ) {
      const difference = updateData.totalSeats - existingPackage.totalSeats;
      updateDoc.availableSeats = Math.max(
        0,
        existingPackage.availableSeats + difference
      );
    }

    // Auto-update status based on seat availability
    if (updateDoc.availableSeats === 0) {
      updateDoc.status = "soldout";
    } else if (
      existingPackage.status === "soldout" &&
      updateDoc.availableSeats > 0
    ) {
      updateDoc.status = "active";
    }

    // Update package
    const result = await db
      .collection("packages")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: "after" }
      );

    return NextResponse.json({
      success: true,
      package: result,
      message: "Package updated successfully",
    });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update package" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/packages/[id]
 * Delete a package and cleanup references
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid package ID" },
        { status: 400 }
      );
    }

    const travelPackage = await db
      .collection<TravelPackage>("packages")
      .findOne({ _id: new ObjectId(id) });

    if (!travelPackage) {
      return NextResponse.json(
        { success: false, error: "Package not found" },
        { status: 404 }
      );
    }

    // Check for active bookings
    const activeBookings = await db.collection("bookings").countDocuments({
      packageId: new ObjectId(id),
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete package with ${activeBookings} active booking(s)`,
        },
        { status: 409 }
      );
    }

    // Delete package image from Cloudinary
    if (travelPackage.image?.publicId) {
      await deleteFromCloudinary(travelPackage.image.publicId).catch((err) =>
        console.error("Failed to delete image from Cloudinary:", err)
      );
    }

    // Delete package
    await db.collection("packages").deleteOne({ _id: new ObjectId(id) });

    // Decrement destination package count
    await db.collection("destinations").updateOne(
      { _id: travelPackage.destinationId },
      {
        $inc: { packagesCount: -1 },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete package" },
      { status: 500 }
    );
  }
}
