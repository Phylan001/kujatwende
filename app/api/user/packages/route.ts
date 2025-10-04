import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    
    const filter: any = { status: "active" };
    const destinationId = searchParams.get("destinationId");
    const search = searchParams.get("search");
    
    if (destinationId && ObjectId.isValid(destinationId)) {
      filter.destinationId = new ObjectId(destinationId);
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { destinationName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const packages = await db
      .collection("packages")
      .find(filter)
      .sort({ featured: -1, averageRating: -1, createdAt: -1 })
      .project({
        name: 1,
        description: 1,
        destinationName: 1,
        duration: 1,
        price: 1,
        isFree: 1,
        image: 1,
        availableSeats: 1,
        totalSeats: 1,
        startDate: 1,
        endDate: 1,
        featured: 1,
        status: 1,
        difficulty: 1,
        category: 1,
        averageRating: 1,
        totalReviews: 1,
        inclusions: 1,
        highlights: 1,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      packages,
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}