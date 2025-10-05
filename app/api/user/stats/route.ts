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
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId
    let userObjectId: ObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Fetch user's bookings
    const bookings = await db
      .collection("bookings")
      .find({ userId: userObjectId })
      .toArray();

    // Fetch user's payments
    const payments = await db
      .collection("payments")
      .find({ userId: userObjectId })
      .toArray();

    // Fetch available destinations and packages
    const [destinations, packages] = await Promise.all([
      db.collection("destinations").countDocuments({ active: true }),
      db.collection("packages").countDocuments({ status: "active" }),
    ]);

    // Calculate stats
    const totalBookings = bookings.length;
    const upcomingTrips = bookings.filter(
      (booking) =>
        booking.status === "confirmed" &&
        new Date(booking.travelDate) > new Date()
    ).length;
    const cancelledTrips = bookings.filter(
      (booking) => booking.status === "cancelled"
    ).length;
    const pendingBookings = bookings.filter(
      (booking) => booking.status === "pending"
    ).length;

    // Calculate total spent from successful payments
    const totalSpent = payments
      .filter(
        (payment) =>
          payment.status === "paid" && payment.transactionType === "payment"
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Generate recent activity
    const recentActivity = [
      // From bookings
      ...bookings.slice(0, 3).map((booking) => ({
        type: "booking" as const,
        message: `Booked: ${booking.packageId?.name || "Adventure Package"}`,
        date: booking.createdAt,
        _id: booking._id.toString(),
      })),
      // From payments
      ...payments
        .filter(
          (payment) =>
            payment.status === "paid" || payment.status === "completed"
        )
        .slice(0, 2)
        .map((payment) => ({
          type: "payment" as const,
          message: `Payment: KSh ${payment.amount.toLocaleString()}`,
          date: payment.createdAt,
          _id: payment._id.toString(),
        })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const stats = {
      totalBookings,
      upcomingTrips,
      cancelledTrips,
      totalSpent,
      pendingBookings,
      totalDestinations: destinations,
      totalPackages: packages,
      recentActivity,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
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
