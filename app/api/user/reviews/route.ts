import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * POST /api/user/reviews
 * Creates a new destination review
 *
 * Expected body:
 * - destinationId: string (ObjectId)
 * - rating: number (1-5)
 * - title: string
 * - comment: string
 * - userId: string (ObjectId) - Should come from session/auth
 */
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    const { destinationId, rating, title, comment, userId } = body;

    // Validate required fields
    if (!destinationId || !rating || !title || !comment) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: destinationId, rating, title, comment",
        },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    let destObjectId: ObjectId;
    let userObjectId: ObjectId;

    try {
      destObjectId = new ObjectId(destinationId);
      userObjectId = userId ? new ObjectId(userId) : new ObjectId(); // Temporary fallback
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Verify destination exists
    const destination = await db
      .collection("destinations")
      .findOne({ _id: destObjectId, active: true });

    if (!destination) {
      return NextResponse.json(
        { success: false, error: "Destination not found" },
        { status: 404 }
      );
    }

    // Check for duplicate review (if userId provided)
    if (userId) {
      const existingReview = await db
        .collection("destination_reviews")
        .findOne({
          userId: userObjectId,
          destinationId: destObjectId,
        });

      if (existingReview) {
        return NextResponse.json(
          {
            success: false,
            error: "You have already reviewed this destination",
          },
          { status: 400 }
        );
      }
    }

    // Create review document
    const reviewDocument = {
      userId: userObjectId,
      destinationId: destObjectId,
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert review
    const result = await db
      .collection("destination_reviews")
      .insertOne(reviewDocument);

    if (!result.insertedId) {
      return NextResponse.json(
        { success: false, error: "Failed to create review" },
        { status: 500 }
      );
    }

    // Recalculate destination ratings
    const reviews = await db
      .collection("destination_reviews")
      .find({ destinationId: destObjectId })
      .toArray();

    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const totalReviews = reviews.length;

    // Update destination statistics
    await db.collection("destinations").updateOne(
      { _id: destObjectId },
      {
        $set: {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalReviews,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review: {
        _id: result.insertedId,
        ...reviewDocument,
      },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/reviews?destinationId=xxx
 * Fetches reviews for a specific destination
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const destinationId = searchParams.get("destinationId");

    if (!destinationId) {
      return NextResponse.json(
        { success: false, error: "destinationId query parameter required" },
        { status: 400 }
      );
    }

    let destObjectId: ObjectId;
    try {
      destObjectId = new ObjectId(destinationId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid destination ID format" },
        { status: 400 }
      );
    }

    // Fetch reviews with user information
    const reviews = await db
      .collection("destination_reviews")
      .aggregate([
        { $match: { destinationId: destObjectId } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
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
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
