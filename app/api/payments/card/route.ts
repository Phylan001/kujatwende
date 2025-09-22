import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

// Card payment simulation (in production, you'd use Stripe, PayPal, etc.)
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

    const { bookingId, cardDetails, amount } = await request.json()

    if (!bookingId || !cardDetails || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Basic card validation
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      return NextResponse.json({ error: "Invalid card details" }, { status: 400 })
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

    // Simulate card processing
    const transactionId = `CD${Date.now()}${Math.random().toString(36).substr(2, 9)}`

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate 95% success rate
    const isSuccessful = Math.random() > 0.05

    if (isSuccessful) {
      // Update booking with successful payment
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

      return NextResponse.json({
        success: true,
        transactionId,
        message: "Payment successful!",
        status: "completed",
      })
    } else {
      // Update booking with failed payment
      await db.collection("bookings").updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            paymentStatus: "failed",
            updatedAt: new Date(),
          },
        },
      )

      return NextResponse.json(
        {
          success: false,
          message: "Payment failed. Please try again or use a different card.",
          status: "failed",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Card payment error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}
