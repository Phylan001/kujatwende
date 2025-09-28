import { type NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const db = await getDatabase();

    // Get stats
    const [
      totalUsers,
      totalPackages,
      totalBookings,
      pendingBookings,
      activePackages,
      paidBookings,
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("packages").countDocuments(),
      db.collection("bookings").countDocuments(),
      db.collection("bookings").countDocuments({ status: "pending" }),
      db.collection("packages").countDocuments({ available: true }),
      db.collection("bookings").find({ paymentStatus: "paid" }).toArray(),
    ]);

    const totalRevenue = paidBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

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
