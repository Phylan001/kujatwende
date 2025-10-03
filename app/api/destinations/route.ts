import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import type { Destination } from "@/lib/models/Destination";

/**
 * GET /api/destinations
 * Fetch all destinations for public view (no authentication required)
 * Query params: featured, search, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;

    // Build query filter - only show active destinations for public
    const filter: any = { active: true };

    // Featured filter
    if (searchParams.get("featured") === "true") {
      filter.featured = true;
    }

    // Search functionality
    const search = searchParams.get("search");
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.region": { $regex: search, $options: "i" } },
        { highlights: { $in: [new RegExp(search, "i")] } },
        { activities: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Region filter
    const region = searchParams.get("region");
    if (region) {
      filter["location.region"] = { $regex: region, $options: "i" };
    }

    // Pagination
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch destinations with package count
    const destinations = await db
      .collection<Destination>("destinations")
      .find(filter)
      .sort({ featured: -1, averageRating: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await db.collection("destinations").countDocuments(filter);

    return NextResponse.json({
      success: true,
      destinations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch destinations" },
      { status: 500 }
    );
  }
}
