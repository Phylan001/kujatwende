import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Get all stats in parallel for better performance
    const [
      totalUsers,
      totalPackages,
      totalBookings,
      pendingBookings,
      activePackages,
      paidBookings,
      totalRevenueResult,
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("packages").countDocuments(),
      db.collection("bookings").countDocuments(),
      db.collection("bookings").countDocuments({ status: "pending" }),
      db.collection("packages").countDocuments({ status: "active" }),
      db.collection("bookings").find({ paymentStatus: "paid" }).toArray(),
      // Calculate total revenue from paid bookings
      db
        .collection("bookings")
        .aggregate([
          { $match: { paymentStatus: "paid" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),
    ]);

    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const stats = {
      totalUsers,
      totalPackages,
      totalBookings,
      totalRevenue,
      pendingBookings,
      activePackages,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
