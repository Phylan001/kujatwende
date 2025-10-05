import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Fetch all payments with user, booking, and package details
    const payments = await db
      .collection("payments")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $lookup: {
            from: "bookings",
            localField: "bookingId",
            foreignField: "_id",
            as: "booking",
          },
        },
        { $unwind: "$booking" },
        {
          $lookup: {
            from: "packages",
            localField: "booking.packageId",
            foreignField: "_id",
            as: "package",
          },
        },
        { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            bookingId: 1,
            customerName: "$user.name",
            customerEmail: "$user.email",
            customerPhone: "$user.phone",
            amount: 1,
            paymentMethod: 1,
            transactionId: 1,
            status: 1,
            packageName: "$package.name",
            packageDestination: "$package.destinationName",
            numberOfTravelers: "$booking.numberOfTravelers",
            createdAt: 1,
          },
        },
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
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
