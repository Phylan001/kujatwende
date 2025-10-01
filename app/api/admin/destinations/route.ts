// app/api/destinations/route.ts
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"
import type { Destination, CreateDestinationDTO } from "@/lib/models/Destination"

/**
 * GET /api/destinations
 * Fetch all destinations with optional filtering
 * Query params: featured, active, search, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const searchParams = request.nextUrl.searchParams
    
    // Build query filter
    const filter: any = {}
    
    if (searchParams.get("featured") === "true") {
      filter.featured = true
    }
    
    if (searchParams.get("active") !== null) {
      filter.active = searchParams.get("active") === "true"
    }
    
    // Search functionality
    const search = searchParams.get("search")
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.region": { $regex: search, $options: "i" } }
      ]
    }
    
    // Pagination
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    
    // Fetch destinations with package count
    const destinations = await db
      .collection<Destination>("destinations")
      .find(filter)
      .sort({ featured: -1, averageRating: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()
    
    // Get total count for pagination
    const total = await db.collection("destinations").countDocuments(filter)
    
    return NextResponse.json({
      success: true,
      destinations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error("Error fetching destinations:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch destinations" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/destinations
 * Create a new destination
 * Requires: authentication and admin role
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication middleware check
    // const user = await verifyAuth(request)
    // if (user.role !== "admin") throw new Error("Unauthorized")
    
    const db = await getDb()
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ["name", "description", "region", "bestTimeToVisit"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    
    // Check if destination with same slug exists
    const existing = await db.collection("destinations").findOne({ slug })
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Destination with this name already exists" },
        { status: 409 }
      )
    }
    
    // Create destination document (without images initially)
    const destination: Omit<Destination, "_id" | "bannerImage" | "gallery"> & {
      bannerImage?: any
      gallery: any[]
    } = {
      name: body.name,
      slug,
      description: body.description,
      location: {
        region: body.region,
        coordinates: body.coordinates
      },
      bestTimeToVisit: body.bestTimeToVisit,
      highlights: body.highlights || [],
      activities: body.activities || [],
      averageRating: 0,
      totalReviews: 0,
      packagesCount: 0,
      featured: body.featured || false,
      active: true,
      gallery: [],
      metaDescription: body.metaDescription,
      keywords: body.keywords || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Insert destination to get the ID
    const result = await db.collection("destinations").insertOne(destination as any)
    
    return NextResponse.json({
      success: true,
      destination: {
        _id: result.insertedId,
        ...destination
      },
      message: "Destination created successfully. Upload images next."
    }, { status: 201 })
    
  } catch (error) {
    console.error("Error creating destination:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create destination" },
      { status: 500 }
    )
  }
}