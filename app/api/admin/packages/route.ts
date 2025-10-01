// app/api/packages/route.ts (Updated)
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/db"
import { uploadToCloudinary } from "@/lib/cloudinary"
import type { TravelPackage, CreatePackageDTO } from "@/lib/models/Package"

/**
 * GET /api/packages
 * Fetch packages with advanced filtering and pagination
 * Query params: destinationId, status, featured, category, priceMin, priceMax, limit, offset
 * 
 * Performance: O(n log n) due to sorting, optimized with MongoDB indexes
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const searchParams = request.nextUrl.searchParams
    
    // Build comprehensive filter pipeline
    const filter: any = {}
    
    // Destination filter
    const destinationId = searchParams.get("destinationId")
    if (destinationId && ObjectId.isValid(destinationId)) {
      filter.destinationId = new ObjectId(destinationId)
    }
    
    // Status filter
    const status = searchParams.get("status")
    if (status && ["active", "inactive", "soldout", "upcoming"].includes(status)) {
      filter.status = status
    }
    
    // Featured filter
    if (searchParams.get("featured") === "true") {
      filter.featured = true
    }
    
    // Category filter
    const category = searchParams.get("category")
    if (category) {
      filter.category = category
    }
    
    // Price range filter
    const priceMin = searchParams.get("priceMin")
    const priceMax = searchParams.get("priceMax")
    if (priceMin || priceMax) {
      filter.price = {}
      if (priceMin) filter.price.$gte = parseFloat(priceMin)
      if (priceMax) filter.price.$lte = parseFloat(priceMax)
    }
    
    // Free packages filter
    if (searchParams.get("isFree") === "true") {
      filter.isFree = true
    }
    
    // Search functionality
    const search = searchParams.get("search")
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { destinationName: { $regex: search, $options: "i" } }
      ]
    }
    
    // Pagination
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    
    // Sorting
    const sortField = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1
    const sortQuery: any = {}
    sortQuery[sortField] = sortOrder
    
    // Fetch packages with aggregation for enriched data
    const packages = await db
      .collection<TravelPackage>("packages")
      .find(filter)
      .sort(sortQuery)
      .skip(offset)
      .limit(limit)
      .toArray()
    
    const total = await db.collection("packages").countDocuments(filter)
    
    return NextResponse.json({
      success: true,
      packages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch packages" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/packages
 * Create a new travel package
 * Requires: authentication and admin role
 * 
 * Business Logic:
 * 1. Validates destination exists
 * 2. Handles image upload
 * 3. Calculates initial seat availability
 * 4. Increments destination package count
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication middleware
    const db = await getDb()
    const formData = await request.formData()
    
    // Extract form fields
    const packageData: CreatePackageDTO = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      destinationId: formData.get("destinationId") as string,
      duration: parseInt(formData.get("duration") as string),
      price: parseFloat(formData.get("price") as string),
      isFree: formData.get("isFree") === "true",
      totalSeats: parseInt(formData.get("totalSeats") as string),
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      difficulty: formData.get("difficulty") as any,
      category: formData.get("category") as string,
      inclusions: JSON.parse(formData.get("inclusions") as string || "[]"),
      exclusions: JSON.parse(formData.get("exclusions") as string || "[]"),
      highlights: JSON.parse(formData.get("highlights") as string || "[]"),
      minGroupSize: parseInt(formData.get("minGroupSize") as string || "1"),
      maxGroupSize: parseInt(formData.get("maxGroupSize") as string),
      featured: formData.get("featured") === "true",
      requirements: JSON.parse(formData.get("requirements") as string || "[]"),
      itinerary: JSON.parse(formData.get("itinerary") as string || "[]")
    }
    
    // Validate required fields
    const requiredFields = ["name", "description", "destinationId", "duration", "price", "totalSeats", "startDate", "endDate"]
    for (const field of requiredFields) {
      if (!packageData[field as keyof CreatePackageDTO]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Validate destination exists
    if (!ObjectId.isValid(packageData.destinationId)) {
      return NextResponse.json(
        { success: false, error: "Invalid destination ID" },
        { status: 400 }
      )
    }
    
    const destination = await db
      .collection("destinations")
      .findOne({ _id: new ObjectId(packageData.destinationId) })
    
    if (!destination) {
      return NextResponse.json(
        { success: false, error: "Destination not found" },
        { status: 404 }
      )
    }
    
    // Handle package image upload
    const imageFile = formData.get("image") as File | null
    let imageData: any = null
    
    if (imageFile && imageFile.size > 0) {
      try {
        const result = await uploadToCloudinary(
          imageFile,
          process.env.CLOUDINARY_PACKAGE_FOLDER || "kuja-twende/packages"
        )
        imageData = {
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height
        }
      } catch (error) {
        console.error("Package image upload failed:", error)
        return NextResponse.json(
          { success: false, error: "Failed to upload package image" },
          { status: 500 }
        )
      }
    }
    
    // Generate slug
    const slug = packageData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    
    // Determine status based on dates
    const now = new Date()
    const startDate = new Date(packageData.startDate)
    const endDate = new Date(packageData.endDate)
    
    let status: "active" | "inactive" | "soldout" | "upcoming" = "upcoming"
    if (now >= startDate && now <= endDate) {
      status = "active"
    } else if (now > endDate) {
      status = "inactive"
    }
    
    // Create package document
    const travelPackage: Omit<TravelPackage, "_id"> = {
      name: packageData.name,
      slug,
      description: packageData.description,
      destinationId: new ObjectId(packageData.destinationId),
      destinationName: destination.name,
      duration: packageData.duration,
      price: packageData.price,
      isFree: packageData.isFree || packageData.price === 0,
      image: imageData || { publicId: "", url: "", width: 0, height: 0 },
      itinerary: packageData.itinerary || [],
      inclusions: packageData.inclusions,
      exclusions: packageData.exclusions,
      highlights: packageData.highlights || [],
      totalSeats: packageData.totalSeats,
      availableSeats: packageData.totalSeats,
      bookedSeats: 0,
      startDate: new Date(packageData.startDate),
      endDate: new Date(packageData.endDate),
      difficulty: packageData.difficulty,
      category: packageData.category as any,
      minGroupSize: packageData.minGroupSize || 1,
      maxGroupSize: packageData.maxGroupSize || packageData.totalSeats,
      averageRating: 0,
      totalReviews: 0,
      featured: packageData.featured || false,
      status,
      requirements: packageData.requirements || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Insert package
    const result = await db.collection("packages").insertOne(travelPackage)
    
    // Increment destination package count
    await db.collection("destinations").updateOne(
      { _id: new ObjectId(packageData.destinationId) },
      { 
        $inc: { packagesCount: 1 },
        $set: { updatedAt: new Date() }
      }
    )
    
    return NextResponse.json({
      success: true,
      package: {
        _id: result.insertedId,
        ...travelPackage
      },
      message: "Package created successfully"
    }, { status: 201 })
    
  } catch (error) {
    console.error("Error creating package:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create package" },
      { status: 500 }
    )
  }
}