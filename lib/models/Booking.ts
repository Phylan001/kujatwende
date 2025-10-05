// lib/models/Booking.ts
import type { ObjectId } from "mongodb";

/**
 * Booking Model Interface
 * Represents a travel package booking with payment and status tracking
 */
export interface Booking {
  _id?: ObjectId;
  userId: ObjectId;
  packageId: ObjectId;
  
  // Customer Information
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    emergencyContact: string;
  };
  
  // Travel Details
  travelDate: Date;
  numberOfTravelers: number;
  totalAmount: number;
  
  // Payment Information
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "mpesa" | "card" | "bank";
  paymentId?: ObjectId; // Reference to payment document
  transactionId?: string;
  paidAt?: Date;
  
  // Booking Status
  status: "pending" | "confirmed" | "cancelled" | "completed";
  
  // Cancellation Information
  cancellationReason?: string;
  cancelledAt?: Date;
  
  // Additional Information
  specialRequests?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type guard to check if booking is paid
 */
export function isBookingPaid(booking: Booking): boolean {
  return booking.paymentStatus === "paid";
}

/**
 * Type guard to check if booking is active (not cancelled or completed)
 */
export function isBookingActive(booking: Booking): boolean {
  return booking.status !== "cancelled" && booking.status !== "completed";
}

/**
 * Type guard to check if booking can be cancelled
 */
export function canCancelBooking(booking: Booking): boolean {
  return isBookingActive(booking);
}

/**
 * Type guard to check if booking can accept payment
 */
export function canAcceptPayment(booking: Booking): boolean {
  return booking.paymentStatus === "pending" && isBookingActive(booking);
}
