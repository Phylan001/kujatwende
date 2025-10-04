import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    
    const filter: any = { active: true };
    const search = searchParams.get("search");
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.region": { $regex: search, $options: "i" } },
      ];
    }

    const destinations = await db
      .collection("destinations")
      .find(filter)
      .sort({ featured: -1, averageRating: -1, name: 1 })
      .project({
        name: 1,
        description: 1,
        bannerImage: 1,
        location: 1,
        averageRating: 1,
        totalReviews: 1,
        packagesCount: 1,
        featured: 1,
        highlights: 1,
        activities: 1,
        bestTimeToVisit: 1,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      destinations,
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch destinations" },
      { status: 500 }
    );
  }
}