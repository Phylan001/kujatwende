import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Fetch all bookings with user and package details
    const bookings = await db
      .collection("bookings")
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
            from: "packages",
            localField: "packageId",
            foreignField: "_id",
            as: "package",
          },
        },
        { $unwind: "$package" },
        {
          $lookup: {
            from: "destinations",
            localField: "package.destinationId",
            foreignField: "_id",
            as: "destination",
          },
        },
        { $unwind: { path: "$destination", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            bookingNumber: {
              $concat: ["BK", { $toString: "$_id" }],
            },
            userId: "$user._id",
            userName: "$user.name",
            userEmail: "$user.email",
            userPhone: { $ifNull: ["$user.phone", "$customerInfo.phone"] },
            packageId: "$package._id",
            packageName: "$package.name",
            destination: {
              $ifNull: ["$destination.name", "$package.destinationName", "N/A"],
            },
            numberOfTravelers: 1,
            totalAmount: 1,
            paymentStatus: 1,
            paymentMethod: 1,
            bookingStatus: "$status",
            travelDate: 1,
            createdAt: 1,
            specialRequests: 1,
            customerInfo: 1,
          },
        },
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
      {
        success: false,
        error: "Failed to fetch bookings",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
