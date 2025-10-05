// app/api/user/package-reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
// Remove verifyToken import

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    const { packageId, userId, rating, title, comment } = body;

    // Validate required fields including userId
    if (!packageId || !userId || !rating || !title || !comment) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: packageId, userId, rating, title, comment",
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
    let packageObjectId: ObjectId;
    let userObjectId: ObjectId;
    try {
      packageObjectId = new ObjectId(packageId);
      userObjectId = new ObjectId(userId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Verify package exists
    const travelPackage = await db
      .collection("packages")
      .findOne({ _id: packageObjectId, status: "active" });

    if (!travelPackage) {
      return NextResponse.json(
        { success: false, error: "Package not found or not active" },
        { status: 404 }
      );
    }

    // Check for duplicate review
    const existingReview = await db
      .collection("package_reviews")
      .findOne({
        userId: userObjectId,
        packageId: packageObjectId,
      });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already reviewed this package",
        },
        { status: 400 }
      );
    }

    // Create review document
    const reviewDocument = {
      userId: userObjectId,
      packageId: packageObjectId,
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert review
    const result = await db
      .collection("package_reviews")
      .insertOne(reviewDocument);

    if (!result.insertedId) {
      return NextResponse.json(
        { success: false, error: "Failed to create review" },
        { status: 500 }
      );
    }

    // Recalculate package ratings
    const reviews = await db
      .collection("package_reviews")
      .find({ packageId: packageObjectId })
      .toArray();

    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const totalReviews = reviews.length;

    // Update package statistics
    await db.collection("packages").updateOne(
      { _id: packageObjectId },
      {
        $set: {
          averageRating: Math.round(averageRating * 10) / 10,
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
    console.error("Error creating package review:", error);
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