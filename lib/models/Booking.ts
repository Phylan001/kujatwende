import type { ObjectId } from "mongodb"

export interface Booking {
  _id?: ObjectId
  userId: ObjectId
  packageId: ObjectId
  customerInfo: {
    name: string
    email: string
    phone: string
    emergencyContact: string
  }
  travelDate: Date
  numberOfTravelers: number
  totalAmount: number
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod: "mpesa" | "card" | "bank"
  transactionId?: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  specialRequests?: string
  createdAt: Date
  updatedAt: Date
}
