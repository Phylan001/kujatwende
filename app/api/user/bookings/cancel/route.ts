// app/api/user/bookings/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();
    const { bookingId, userId, reason } = body;

    // Validate required fields
    if (!bookingId || !userId) {
      return NextResponse.json(
        { success: false, error: "Booking ID and User ID required" },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    let bookingObjectId: ObjectId;
    let userObjectId: ObjectId;
    try {
      bookingObjectId = new ObjectId(bookingId);
      userObjectId = new ObjectId(userId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await db
      .collection("bookings")
      .findOne({ 
        _id: bookingObjectId, 
        userId: userObjectId 
      });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { success: false, error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    // Check if booking is completed
    if (booking.status === "completed") {
      return NextResponse.json(
        { success: false, error: "Cannot cancel a completed booking" },
        { status: 400 }
      );
    }

    // Update booking status to cancelled
    const updateResult = await db.collection("bookings").updateOne(
      { _id: bookingObjectId },
      { 
        $set: { 
          status: "cancelled",
          cancellationReason: reason || "User cancelled booking",
          cancelledAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to cancel booking" },
        { status: 500 }
      );
    }

    // Restore package available seats
    await db.collection("packages").updateOne(
      { _id: booking.packageId },
      { 
        $inc: { 
          availableSeats: booking.numberOfTravelers,
          bookedSeats: -booking.numberOfTravelers
        },
        $set: { updatedAt: new Date() }
      }
    );

    // Handle refund if payment was made
    if (booking.paymentStatus === "paid") {
      // Update the existing payment record to refunded status
      await db.collection("payments").updateOne(
        { 
          bookingId: bookingObjectId,
          status: "paid"
        },
        {
          $set: {
            status: "refunded",
            refundReason: reason || "Booking cancellation",
            refundedAt: new Date(),
            updatedAt: new Date(),
          }
        }
      );

      // Create a refund transaction record
      const refundTransaction = {
        bookingId: bookingObjectId,
        userId: userObjectId,
        amount: booking.totalAmount,
        paymentMethod: booking.paymentMethod,
        transactionType: "refund",
        status: "refunded",
        refundReason: reason || "Booking cancellation",
        transactionId: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("payments").insertOne(refundTransaction);

      // Update booking payment status to refunded
      await db.collection("bookings").updateOne(
        { _id: bookingObjectId },
        { 
          $set: { 
            paymentStatus: "refunded",
            updatedAt: new Date()
          } 
        }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Booking cancelled successfully",
      refunded: booking.paymentStatus === "paid"
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to cancel booking",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}