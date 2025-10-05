// app/api/user/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET endpoint to fetch user payments
 * Supports filtering by paymentId for single payment view
 * Includes booking and package details through aggregation
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const paymentId = searchParams.get("paymentId");

    // Validate required userId parameter
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query parameter required" },
        { status: 400 }
      );
    }

    // Validate and convert userId to ObjectId
    let userObjectId: ObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Build match criteria
    const matchCriteria: any = { userId: userObjectId };

    // Add paymentId filter if provided
    if (paymentId) {
      try {
        matchCriteria._id = new ObjectId(paymentId);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Invalid payment ID format" },
          { status: 400 }
        );
      }
    }

    /**
     * Aggregation pipeline to fetch payments with related booking and package data
     * Steps:
     * 1. Filter payments by user (and optionally by payment ID)
     * 2. Lookup booking details
     * 3. Unwind booking array
     * 4. Lookup package details from booking
     * 5. Unwind package array
     * 6. Sort by creation date (newest first)
     */
    const payments = await db
      .collection("payments")
      .aggregate([
        { $match: matchCriteria },
        {
          $lookup: {
            from: "bookings",
            localField: "bookingId",
            foreignField: "_id",
            as: "bookingId",
          },
        },
        { $unwind: "$bookingId" },
        {
          $lookup: {
            from: "packages",
            localField: "bookingId.packageId",
            foreignField: "_id",
            as: "bookingId.packageId",
          },
        },
        { $unwind: "$bookingId.packageId" },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch payments",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to create a new payment
 * Validates booking, processes payment, and updates booking status
 */
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["bookingId", "userId", "amount", "paymentMethod"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate ObjectIds
    let bookingObjectId: ObjectId;
    let userObjectId: ObjectId;
    try {
      bookingObjectId = new ObjectId(body.bookingId);
      userObjectId = new ObjectId(body.userId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Verify booking exists and belongs to user
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

    // Check if booking is cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { success: false, error: "Cannot pay for a cancelled booking" },
        { status: 400 }
      );
    }

    // Check if already paid
    if (booking.paymentStatus === "paid") {
      return NextResponse.json(
        { success: false, error: "Booking is already paid" },
        { status: 400 }
      );
    }

    // Verify amount matches booking total
    if (body.amount !== booking.totalAmount) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Payment amount (${body.amount}) does not match booking total (${booking.totalAmount})` 
        },
        { status: 400 }
      );
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const payment = {
      userId: userObjectId,
      bookingId: bookingObjectId,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      transactionId,
      transactionType: "payment" as const,
      status: "paid" as const,
      cardDetails: body.paymentMethod === "card" ? {
        lastFourDigits: body.cardDetails?.number?.slice(-4) || "****",
        cardType: "credit" as const,
      } : undefined,
      mpesaPhone: body.paymentMethod === "mpesa" ? body.mpesaPhone : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("payments").insertOne(payment);

    if (!result.insertedId) {
      return NextResponse.json(
        { success: false, error: "Failed to create payment record" },
        { status: 500 }
      );
    }

    // Update booking payment status and confirmation
    const bookingUpdate = await db.collection("bookings").updateOne(
      { _id: bookingObjectId },
      {
        $set: {
          paymentStatus: "paid",
          status: "confirmed",
          paymentId: result.insertedId,
          transactionId: transactionId,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (bookingUpdate.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to update booking status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      payment: {
        _id: result.insertedId,
        transactionId: transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        createdAt: payment.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process payment",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
