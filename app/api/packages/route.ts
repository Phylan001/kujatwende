import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { TravelPackage } from "@/lib/models/Package"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const minPrice = Number.parseInt(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseInt(searchParams.get("maxPrice") || "999999")

    const db = await getDatabase()

    // Build query
    const query: any = { available: true }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { destination: { $regex: search, $options: "i" } },
      ]
    }

    if (category) {
      query.category = category
    }

    if (difficulty) {
      query.difficulty = difficulty
    }

    query.price = { $gte: minPrice, $lte: maxPrice }

    const packages = await db
      .collection<TravelPackage>("packages")
      .find(query)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const packageData = await request.json()

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "destination",
      "duration",
      "price",
      "maxGroupSize",
      "difficulty",
      "category",
    ]
    for (const field of requiredFields) {
      if (!packageData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    const db = await getDatabase()

    const newPackage: Omit<TravelPackage, "_id"> = {
      ...packageData,
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("packages").insertOne(newPackage)

    return NextResponse.json(
      {
        package: { ...newPackage, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating package:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
