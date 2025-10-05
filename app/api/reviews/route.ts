// app/api/user/reviews/route.ts
/**
 * Unified Reviews API Route
 * Fetches and merges both package and destination reviews
 * Provides unified interface for testimonials display
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

/**
 * Unified Review Interface
 * Represents both package and destination reviews in a single structure
 */
interface UnifiedReview {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
  type: "package" | "destination"; // Review source type
  itemName: string; // Package or destination name
  itemId: string; // Original item ID
}

/**
 * GET /api/user/reviews
 * Query Parameters:
 * - limit: number (optional) - Max number of reviews to return
 * - offset: number (optional) - Pagination offset
 * - type: 'package' | 'destination' | 'all' (optional) - Filter by review type
 * - sortBy: 'recent' | 'rating' | 'helpful' (optional) - Sort criteria
 * 
 * Returns unified array of reviews from both packages and destinations
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    
    // Extract and validate query parameters
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Cap at 50
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);
    const type = searchParams.get("type") || "all";
    const sortBy = searchParams.get("sortBy") || "recent";

    // Determine sort criteria based on sortBy parameter
    const sortCriteria: any = 
      sortBy === "rating" ? { rating: -1, createdAt: -1 } :
      sortBy === "helpful" ? { helpful: -1, createdAt: -1 } :
      { createdAt: -1 }; // Default: recent

    const aggregationPipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { 
        $unwind: { 
          path: "$user", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      {
        $project: {
          rating: 1,
          title: 1,
          comment: 1,
          helpful: 1,
          createdAt: 1,
          updatedAt: 1,
          "user.name": 1,
          "user.email": 1,
          packageId: 1,
          destinationId: 1,
        },
      },
      { $sort: sortCriteria },
    ];

    let allReviews: UnifiedReview[] = [];

    // Fetch package reviews if requested
    if (type === "all" || type === "package") {
      const packageReviews = await db
        .collection("package_reviews")
        .aggregate(aggregationPipeline)
        .toArray();

      // Enrich with package information
      for (const review of packageReviews) {
        const packageData = await db
          .collection("packages")
          .findOne(
            { _id: review.packageId },
            { projection: { name: 1 } }
          );

        allReviews.push({
          _id: review._id.toString(),
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          helpful: review.helpful,
          createdAt: review.createdAt,
          user: {
            name: review.user?.name || "Anonymous",
            email: review.user?.email || "",
          },
          type: "package",
          itemName: packageData?.name || "Unknown Package",
          itemId: review.packageId.toString(),
        });
      }
    }

    // Fetch destination reviews if requested
    if (type === "all" || type === "destination") {
      const destinationReviews = await db
        .collection("destination_reviews")
        .aggregate(aggregationPipeline)
        .toArray();

      // Enrich with destination information
      for (const review of destinationReviews) {
        const destinationData = await db
          .collection("destinations")
          .findOne(
            { _id: review.destinationId },
            { projection: { name: 1 } }
          );

        allReviews.push({
          _id: review._id.toString(),
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          helpful: review.helpful,
          createdAt: review.createdAt,
          user: {
            name: review.user?.name || "Anonymous",
            email: review.user?.email || "",
          },
          type: "destination",
          itemName: destinationData?.name || "Unknown Destination",
          itemId: review.destinationId.toString(),
        });
      }
    }

    // Sort unified reviews based on sortBy parameter
    allReviews.sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating || b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortBy === "helpful") {
        return b.helpful - a.helpful || b.createdAt.getTime() - a.createdAt.getTime();
      }
      return b.createdAt.getTime() - a.createdAt.getTime(); // Recent first
    });

    // Apply pagination
    const paginatedReviews = allReviews.slice(offset, offset + limit);
    const totalCount = allReviews.length;

    // Calculate rating distribution for analytics
    const ratingDistribution = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length,
    };

    const averageRating = totalCount > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0;

    return NextResponse.json({
      success: true,
      reviews: paginatedReviews,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      statistics: {
        totalReviews: totalCount,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching unified reviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reviews",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}