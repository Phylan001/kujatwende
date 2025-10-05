// app/api/user/bookings/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, userId, reason } = body;

    if (!bookingId || !userId) {
      return NextResponse.json(
        { error: "Booking ID and User ID required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Find the booking
    const booking = await db
      .collection("bookings")
      .findOne({ 
        _id: new ObjectId(bookingId), 
        userId: new ObjectId(userId) 
      });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Update booking status
    await db.collection("bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { 
        $set: { 
          status: "cancelled",
          updatedAt: new Date()
        } 
      }
    );

    // Update package available seats
    await db.collection("packages").updateOne(
      { _id: booking.packageId },
      { 
        $inc: { 
          availableSeats: booking.numberOfTravelers,
          bookedSeats: -booking.numberOfTravelers
        } 
      }
    );

    // Create refund payment if payment was made
    if (booking.paymentStatus === "paid") {
      const refundPayment = {
        bookingId: new ObjectId(bookingId),
        userId: new ObjectId(userId),
        amount: booking.totalAmount,
        paymentMethod: booking.paymentMethod,
        status: "refunded",
        refundReason: reason || "Booking cancellation",
        transactionId: `REF-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("payments").insertOne(refundPayment);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Booking cancelled successfully" 
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}