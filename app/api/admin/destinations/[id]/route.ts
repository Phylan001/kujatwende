import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import type {
  Destination,
  TravelPackage,
  UpdateDestinationDTO,
} from "@/lib/mongodb-types";

/**
 * GET /api/destinations/[id]
 * Fetch a single destination by ID with related packages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const { id } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid destination ID" },
        { status: 400 }
      );
    }

    // Fetch destination
    const destination = await db
      .collection<Destination>("destinations")
      .findOne({ _id: new ObjectId(id) });

    if (!destination) {
      return NextResponse.json(
        { success: false, error: "Destination not found" },
        { status: 404 }
      );
    }

    // Optionally fetch associated packages
    const includePackages =
      request.nextUrl.searchParams.get("includePackages") === "true";
    let packages: TravelPackage[] = [];

    if (includePackages) {
      packages = await db
        .collection<TravelPackage>("packages")
        .find({ destinationId: new ObjectId(id) })
        .sort({ featured: -1, price: 1 })
        .toArray();
    }

    return NextResponse.json({
      success: true,
      destination,
      packages: includePackages ? packages : undefined,
    });
  } catch (error) {
    console.error("Error fetching destination:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch destination" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/destinations/[id]
 * Update a destination
 * Requires: authentication and admin role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication middleware
    const db = await getDatabase();
    const { id } = params;
    const body: UpdateDestinationDTO = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid destination ID" },
        { status: 400 }
      );
    }

    // Build update document
    const updateDoc: UpdateDestinationDTO & { updatedAt: Date; slug?: string } =
      {
        ...body,
        updatedAt: new Date(),
      };

    // If name is updated, regenerate slug
    if (body.name) {
      updateDoc.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Update destination
    const result = await db
      .collection("destinations")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: "after" }
      );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Destination not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      destination: result,
      message: "Destination updated successfully",
    });
  } catch (error) {
    console.error("Error updating destination:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update destination" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/destinations/[id]
 * Delete a destination and all associated images
 * Requires: authentication and admin role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication middleware
    const db = await getDatabase();
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid destination ID" },
        { status: 400 }
      );
    }

    // Fetch destination to get image public IDs
    const destination = await db
      .collection<Destination>("destinations")
      .findOne({ _id: new ObjectId(id) });

    if (!destination) {
      return NextResponse.json(
        { success: false, error: "Destination not found" },
        { status: 404 }
      );
    }

    // Check if destination has packages
    const packagesCount = await db
      .collection("packages")
      .countDocuments({ destinationId: new ObjectId(id) });

    if (packagesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete destination with ${packagesCount} active package(s). Delete packages first.`,
        },
        { status: 409 }
      );
    }

    // Delete all images from Cloudinary
    const deletePromises: Promise<boolean>[] = []; // Changed to Promise<boolean>[]

    if (destination.bannerImage?.publicId) {
      // Fixed variable name
      deletePromises.push(
        deleteFromCloudinary(destination.bannerImage.publicId)
      );
    }

    if (destination.gallery && destination.gallery.length > 0) {
      // Fixed variable name
      destination.gallery.forEach((img) => {
        if (img.publicId) {
          deletePromises.push(deleteFromCloudinary(img.publicId));
        }
      });
    }

    // Execute all deletions - Fixed method name
    await Promise.allSettled(deletePromises);

    // Delete destination document - Fixed class name
    await db.collection("destinations").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "Destination and associated images deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting destination:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete destination" },
      { status: 500 }
    );
  }
}
