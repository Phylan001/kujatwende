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
    const requiredFields = ["packageId", "travelDate", "numberOfTravelers", "emergencyContact"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verify package exists and has available seats
    const packageData = await db
      .collection("packages")
      .findOne({ _id: new ObjectId(body.packageId) });

    if (!packageData) {
      return NextResponse.json(
        { success: false, error: "Package not found" },
        { status: 404 }
      );
    }

    if (packageData.availableSeats < body.numberOfTravelers) {
      return NextResponse.json(
        { success: false, error: "Not enough available seats" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = packageData.isFree ? 0 : packageData.price * body.numberOfTravelers;

    // Create booking
    const booking = {
      userId: new ObjectId(user.id),
      packageId: new ObjectId(body.packageId),
      customerInfo: body.customerInfo,
      travelDate: new Date(body.travelDate),
      numberOfTravelers: body.numberOfTravelers,
      totalAmount,
      paymentStatus: "pending" as const,
      paymentMethod: "mpesa" as const,
      status: "pending" as const,
      specialRequests: body.specialRequests || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    // Update package available seats
    await db.collection("packages").updateOne(
      { _id: new ObjectId(body.packageId) },
      {
        $inc: { availableSeats: -body.numberOfTravelers, bookedSeats: body.numberOfTravelers },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      booking: {
        _id: result.insertedId,
        ...booking,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}