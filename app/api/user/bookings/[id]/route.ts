import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const booking = await db
      .collection("bookings")
      .aggregate([
        { $match: { _id: new ObjectId(params.id), userId: new ObjectId(user.id) } },
        {
          $lookup: {
            from: "packages",
            localField: "packageId",
            foreignField: "_id",
            as: "packageId"
          }
        },
        { $unwind: "$packageId" },
      ])
      .next();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const body = await request.json();

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Only allow status updates for cancellation
    if (body.status === "cancelled") {
      const booking = await db
        .collection("bookings")
        .findOne({ _id: new ObjectId(params.id), userId: new ObjectId(user.id) });

      if (!booking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404 }
        );
      }

      // Update booking status
      await db.collection("bookings").updateOne(
        { _id: new ObjectId(params.id) },
        {
          $set: {
            status: "cancelled",
            updatedAt: new Date(),
          },
        }
      );

      // Return seats to package
      await db.collection("packages").updateOne(
        { _id: booking.packageId },
        {
          $inc: {
            availableSeats: booking.numberOfTravelers,
            bookedSeats: -booking.numberOfTravelers,
          },
          $set: { updatedAt: new Date() },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid update" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}