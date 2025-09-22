import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import type { Booking } from "@/lib/models/Booking"
import { ObjectId } from "mongodb"

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

    const bookings = await db
      .collection<Booking>("bookings")
      .find({ userId: new ObjectId(user.id) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
