import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

/**
 * GET /api/packages
 * Public endpoint to fetch available travel packages
 *
 * Business Logic:
 * - Shows ONLY "active" and "upcoming" packages (hides inactive/soldout)
 * - Supports destination filtering via query param
 * - Includes search functionality across multiple fields
 * - Pagination support for better performance
 *
 * Query Parameters:
 * - destinationId: Filter by specific destination (ObjectId)
 * - search: Search term for name, description, highlights, etc.
 * - limit: Number of results per page (default: 12)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;

    /**
     * CRITICAL FIX: Show both "active" AND "upcoming" packages
     * - active: Current date is between startDate and endDate
     * - upcoming: Current date is before startDate (future trips)
     * - EXCLUDE: inactive (past trips) and soldout (no availability)
     */
    const filter: any = {
      status: { $in: ["active", "upcoming"] },
    };

    // ============================================
    // DESTINATION FILTER
    // ============================================
    /**
     * When user clicks "View Packages" from a destination card,
     * they're redirected to /packages?destination=DESTINATION_ID
     * This filters packages for that specific destination
     */
    const destinationId = searchParams.get("destinationId");
    if (destinationId && ObjectId.isValid(destinationId)) {
      filter.destinationId = new ObjectId(destinationId);
    }

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================
    /**
     * Multi-field search across:
     * - Package name
     * - Description
     * - Destination name
     * - Highlights (array search)
     * - Category
     */
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

    // ============================================
    // PAGINATION
    // ============================================
    /**
     * Limit results to prevent overloading the client
     * Default: 12 packages per page (4 cols × 3 rows on desktop)
     */
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = parseInt(searchParams.get("offset") || "0");

    // ============================================
    // DATABASE QUERY
    // ============================================
    /**
     * Sorting priority:
     * 1. Featured packages first
     * 2. Highest rated packages
     * 3. Newest packages (recently added)
     */
    const packages = await db
      .collection("packages")
      .find(filter)
      .sort({
        featured: -1, // Featured packages first
        averageRating: -1, // Then by rating
        createdAt: -1, // Then by newest
      })
      .skip(offset)
      .limit(limit)
      .toArray();

    // ============================================
    // PAGINATION METADATA
    // ============================================
    /**
     * Calculate total count and pagination info
     * Used by frontend to render pagination controls
     */
    const total = await db.collection("packages").countDocuments(filter);

    // ============================================
    // RESPONSE
    // ============================================
    return NextResponse.json({
      success: true,
      packages,
      pagination: {
        total, // Total matching packages
        limit, // Results per page
        offset, // Current offset
        hasMore: offset + limit < total, // Are there more pages?
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching packages:", error);

    // Return detailed error in development, generic in production
    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch packages",
        ...(isDevelopment && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}
