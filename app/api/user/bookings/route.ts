import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query parameter required" },
        { status: 400 }
      );
    }

    let userObjectId: ObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const bookings = await db
      .collection("bookings")
      .aggregate([
        { $match: { userId: userObjectId } },
        {
          $lookup: {
            from: "packages",
            localField: "packageId",
            foreignField: "_id",
            as: "packageId",
          },
        },
        { $unwind: "$packageId" },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const body = await request.json();

    const {
      packageId,
      userId, // Get userId from body instead of token
      numberOfTravelers,
      travelDate,
      specialRequests,
      customerInfo,
    } = body;

    // Validate required fields including userId
    if (
      !packageId ||
      !userId ||
      !numberOfTravelers ||
      !travelDate ||
      !customerInfo
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Validate customer info
    const { name, email, phone, emergencyContact } = customerInfo;
    if (!name || !email || !phone || !emergencyContact) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required customer information",
        },
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

    // Verify package exists and is available
    const travelPackage = await db
      .collection("packages")
      .findOne({ _id: packageObjectId, status: "active" });

    if (!travelPackage) {
      return NextResponse.json(
        { success: false, error: "Package not found or not active" },
        { status: 404 }
      );
    }

    // Check available seats
    if (numberOfTravelers > travelPackage.availableSeats) {
      return NextResponse.json(
        {
          success: false,
          error: `Only ${travelPackage.availableSeats} seats available`,
        },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = travelPackage.isFree
      ? 0
      : travelPackage.price * numberOfTravelers;

    // Create booking document
    const bookingDocument = {
      userId: userObjectId,
      packageId: packageObjectId,
      customerInfo: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        emergencyContact: emergencyContact.trim(),
      },
      travelDate: new Date(travelDate),
      numberOfTravelers: Number(numberOfTravelers),
      totalAmount: totalAmount,
      paymentStatus: "pending",
      paymentMethod: "mpesa",
      status: "pending",
      specialRequests: specialRequests?.trim() || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert booking
    const result = await db.collection("bookings").insertOne(bookingDocument);

    if (!result.insertedId) {
      return NextResponse.json(
        { success: false, error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // Update package available seats
    await db.collection("packages").updateOne(
      { _id: packageObjectId },
      {
        $inc: { availableSeats: -numberOfTravelers },
        $set: { updatedAt: new Date() },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      booking: {
        _id: result.insertedId,
        ...bookingDocument,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
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
