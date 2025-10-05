import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "12months";

    // Calculate date ranges based on time range
    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "12months":
      default:
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get revenue analytics
    const revenueData = await db
      .collection("bookings")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            amount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray();

    // Get bookings analytics
    const bookingsData = await db
      .collection("bookings")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray();

    // Get user growth analytics
    const usersData = await db
      .collection("users")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray();

    // Get top packages by revenue
    const topPackages = await db
      .collection("bookings")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startDate },
          },
        },
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
          $group: {
            _id: "$packageId",
            name: { $first: "$package.name" },
            bookings: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    // Get top destinations
    const topDestinations = await db
      .collection("bookings")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
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
          $group: {
            _id: "$package.destinationName",
            name: { $first: "$package.destinationName" },
            bookings: { $sum: 1 },
          },
        },
        { $sort: { bookings: -1 } },
        { $limit: 6 },
      ])
      .toArray();

    // Get payment methods distribution
    const paymentMethods = await db
      .collection("bookings")
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            method: "$_id",
            count: 1,
            percentage: {
              $multiply: [{ $divide: ["$count", { $sum: "$count" }] }, 100],
            },
          },
        },
      ])
      .toArray();

    // Calculate growth percentages (simplified - in real app, compare with previous period)
    const totalRevenue = revenueData.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const totalBookings = bookingsData.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const totalUsers = usersData.reduce((sum, item) => sum + item.count, 0);

    const analytics = {
      revenue: {
        total: totalRevenue,
        growth: 15.3, // This would be calculated by comparing with previous period
        monthly: revenueData.map((item) => ({
          month: new Date(item._id.year, item._id.month - 1).toLocaleString(
            "default",
            { month: "short" }
          ),
          amount: item.amount,
        })),
      },
      bookings: {
        total: totalBookings,
        growth: 12.5, // This would be calculated by comparing with previous period
        monthly: bookingsData.map((item) => ({
          month: new Date(item._id.year, item._id.month - 1).toLocaleString(
            "default",
            { month: "short" }
          ),
          count: item.count,
        })),
      },
      users: {
        total: totalUsers,
        growth: 18.7, // This would be calculated by comparing with previous period
        newUsers: usersData.map((item) => ({
          month: new Date(item._id.year, item._id.month - 1).toLocaleString(
            "default",
            { month: "short" }
          ),
          count: item.count,
        })),
      },
      topPackages: topPackages,
      topDestinations: topDestinations,
      paymentMethods: paymentMethods,
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
