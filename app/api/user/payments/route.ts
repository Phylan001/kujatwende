// app/api/user/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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

    // Generate transaction ID (in production, use proper payment gateway)
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const payment = {
      userId: userObjectId,
      bookingId: bookingObjectId,
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      transactionId,
      transactionType: "payment",
      status: "paid" as const, // In production, this would be pending until confirmed
      cardDetails: body.paymentMethod === "card" ? {
        lastFourDigits: body.cardDetails?.number?.slice(-4) || "****",
        cardType: "credit", // Would be determined from card number
      } : undefined,
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