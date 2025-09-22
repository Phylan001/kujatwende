import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { transactionId: string } }) {
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

    // Find booking by transaction ID
    const booking = await db.collection("bookings").findOne({
      transactionId: params.transactionId,
      userId: new ObjectId(user.id),
    })

    if (!booking) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({
      transactionId: params.transactionId,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.status,
      amount: booking.totalAmount,
      updatedAt: booking.updatedAt,
    })
  } catch (error) {
    console.error("Error checking payment status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
