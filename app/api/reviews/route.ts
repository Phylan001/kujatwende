import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Review } from "@/lib/models/Review"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { packageId, bookingId, rating, title, comment, images } = await request.json()

    // Validate required fields
    if (!packageId || !bookingId || !rating || !title || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verify booking exists and belongs to user
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(bookingId),
      userId: new ObjectId(user.id),
      status: "completed",
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not completed" }, { status: 404 })
    }

    // Check if review already exists for this booking
    const existingReview = await db.collection("reviews").findOne({
      bookingId: new ObjectId(bookingId),
    })

    if (existingReview) {
      return NextResponse.json({ error: "Review already exists for this booking" }, { status: 409 })
    }

    const newReview: Omit<Review, "_id"> = {
      userId: new ObjectId(user.id),
      packageId: new ObjectId(packageId),
      bookingId: new ObjectId(bookingId),
      rating,
      title,
      comment,
      images: images || [],
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("reviews").insertOne(newReview)

    return NextResponse.json(
      {
        review: { ...newReview, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get("packageId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const db = await getDatabase()

    const query = packageId ? { packageId: new ObjectId(packageId) } : {}

    const reviews = await db
      .collection("reviews")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
            pipeline: [{ $project: { name: 1, _id: 1 } }],
          },
        },
        { $unwind: "$user" },
        { $sort: { createdAt: -1 } },
        { $limit: limit },
      ])
      .toArray()

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
