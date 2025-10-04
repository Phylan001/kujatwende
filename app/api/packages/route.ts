import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

/**
 * GET /api/packages
 * Fetch packages with search and destination filtering for public view
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;

    // Build query filter - only show active packages for public
    const filter: any = { status: "active" };

    // Destination filter
    const destinationId = searchParams.get("destinationId");
    if (destinationId && ObjectId.isValid(destinationId)) {
      filter.destinationId = new ObjectId(destinationId);
    }

    // Search functionality
    const search = searchParams.get("search");
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { destinationName: { $regex: search, $options: "i" } },
        { highlights: { $in: [new RegExp(search, "i")] } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch packages
    const packages = await db
      .collection("packages")
      .find(filter)
      .sort({ featured: -1, averageRating: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await db.collection("packages").countDocuments(filter);

    return NextResponse.json({
      success: true,
      packages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
