import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Booking } from "@/lib/models/Booking"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const bookingData = await request.json()

    // Validate required fields
    const requiredFields = ["packageId", "customerInfo", "travelDate", "numberOfTravelers", "totalAmount"]
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    const db = await getDatabase()

    const newBooking: Omit<Booking, "_id"> = {
      userId: new ObjectId(user.id),
      packageId: new ObjectId(bookingData.packageId),
      customerInfo: bookingData.customerInfo,
      travelDate: new Date(bookingData.travelDate),
      numberOfTravelers: bookingData.numberOfTravelers,
      totalAmount: bookingData.totalAmount,
      paymentStatus: "pending",
      paymentMethod: bookingData.paymentMethod || "mpesa",
      status: "pending",
      specialRequests: bookingData.specialRequests || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("bookings").insertOne(newBooking)

    return NextResponse.json(
      {
        booking: { ...newBooking, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDatabase()

    // Admin can see all bookings, users can only see their own
    const query = user.role === "admin" ? {} : { userId: new ObjectId(user.id) }

    const bookings = await db.collection<Booking>("bookings").find(query).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
