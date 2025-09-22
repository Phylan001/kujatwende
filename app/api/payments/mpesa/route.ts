import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

// M-Pesa STK Push simulation (in production, you'd use actual M-Pesa API)
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

    const { bookingId, phoneNumber, amount } = await request.json()

    if (!bookingId || !phoneNumber || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verify booking exists and belongs to user
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(bookingId),
      userId: new ObjectId(user.id),
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Simulate M-Pesa STK Push
    const transactionId = `MP${Date.now()}${Math.random().toString(36).substr(2, 9)}`

    // In a real implementation, you would:
    // 1. Call M-Pesa STK Push API
    // 2. Wait for callback confirmation
    // 3. Update payment status based on callback

    // For demo purposes, we'll simulate a successful payment
    setTimeout(async () => {
      try {
        await db.collection("bookings").updateOne(
          { _id: new ObjectId(bookingId) },
          {
            $set: {
              paymentStatus: "paid",
              transactionId: transactionId,
              status: "confirmed",
              updatedAt: new Date(),
            },
          },
        )
      } catch (error) {
        console.error("Error updating booking after payment:", error)
      }
    }, 3000) // Simulate 3 second processing time

    return NextResponse.json({
      success: true,
      transactionId,
      message: "Payment initiated. Please check your phone for M-Pesa prompt.",
      status: "pending",
    })
  } catch (error) {
    console.error("M-Pesa payment error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}
