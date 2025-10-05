// lib/models/Payment.ts
import type { ObjectId } from "mongodb";

/**
 * Payment Model Interface
 * Represents payment transactions for bookings including regular payments and refunds
 */
export interface Payment {
  _id?: ObjectId;
  userId: ObjectId;
  bookingId: ObjectId;
  amount: number;
  paymentMethod: "mpesa" | "card" | "bank";
  transactionId: string;
  transactionType: "payment" | "refund";
  status: "pending" | "paid" | "completed" | "failed" | "refunded";
  
  // Card payment details (optional)
  cardDetails?: {
    lastFourDigits: string;
    cardType: "credit" | "debit";
  };
  
  // M-Pesa payment details (optional)
  mpesaCode?: string;
  mpesaPhone?: string;
  
  // Refund-specific fields
  refundReason?: string;
  refundedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Type guard to check if payment is a refund
 */
export function isRefund(payment: Payment): boolean {
  return payment.transactionType === "refund" || payment.status === "refunded";
}

/**
 * Type guard to check if payment is completed
 */
export function isPaymentCompleted(payment: Payment): boolean {
  return payment.status === "paid" || payment.status === "completed";
}
