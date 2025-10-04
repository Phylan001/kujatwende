import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

    // Validate required fields
    const requiredFields = ["bookingId", "amount", "paymentMethod"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verify booking exists and belongs to user
    const booking = await db
      .collection("bookings")
      .findOne({ _id: new ObjectId(body.bookingId), userId: new ObjectId(user.id) });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Generate transaction ID (in production, use proper payment gateway)
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = {
      userId: new ObjectId(user.id),
      bookingId: new ObjectId(body.bookingId),
      amount: body.amount,
      paymentMethod: body.paymentMethod,
      transactionId,
      status: "paid" as const, // In production, this would be pending until confirmed
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("payments").insertOne(payment);

    // Update booking payment status
    await db.collection("bookings").updateOne(
      { _id: new ObjectId(body.bookingId) },
      {
        $set: {
          paymentStatus: "paid",
          status: "confirmed",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      payment: {
        _id: result.insertedId,
        ...payment,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process payment" },
      { status: 500 }
    );
  }
}