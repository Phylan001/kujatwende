"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MapPin,
  Users,
  Smartphone,
  ArrowRight,
  Package,
  Hash,
} from "lucide-react";
import { format } from "date-fns";

/**
 * Payment interface matching the payment data structure
 */
interface Payment {
  _id: string;
  bookingId: {
    _id: string;
    packageId: {
      _id: string;
      name: string;
      destinationName: string;
    };
    travelDate: string;
    numberOfTravelers: number;
  };
  amount: number;
  paymentMethod: "mpesa" | "card" | "bank";
  status: "pending" | "completed" | "paid" | "failed" | "refunded";
  transactionType: "payment" | "refund";
  transactionId?: string;
  mpesaCode?: string;
  mpesaPhone?: string;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Props interface for PaymentDetailsModal component
 */
interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

/**
 * PaymentDetailsModal Component
 *
 * Displays comprehensive payment information including:
 * - Payment status and transaction details
 * - Booking and package information
 * - Payment method specific details (M-Pesa, Card)
 * - Refund information if applicable
 * - Transaction timeline
 *
 * @param {PaymentDetailsModalProps} props - Component props
 */
export default function PaymentDetailsModal({
  isOpen,
  onClose,
  payment,
}: PaymentDetailsModalProps) {
  // Guard clause: Return null if no payment data
  if (!payment) return null;

  /**
   * Returns appropriate color classes based on payment status
   * @param {string} status - Payment status
   * @returns {string} Tailwind CSS classes for status badge
   */
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      paid: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      refunded: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };
    return (
      statusColors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
    );
  };

  /**
   * Returns appropriate icon component based on payment status
   * @param {string} status - Payment status
   * @returns {JSX.Element} Icon component
   */
  const getStatusIcon = (status: string): JSX.Element => {
    const iconProps = { className: "w-4 h-4" };
    const statusIcons: Record<string, JSX.Element> = {
      completed: <CheckCircle {...iconProps} />,
      paid: <CheckCircle {...iconProps} />,
      pending: <Clock {...iconProps} />,
      failed: <XCircle {...iconProps} />,
      refunded: <RefreshCw {...iconProps} />,
    };
    return statusIcons[status] || <Clock {...iconProps} />;
  };

  /**
   * Returns color classes for payment method badge
   * @param {string} method - Payment method
   * @returns {string} Tailwind CSS classes
   */
  const getPaymentMethodColor = (method: string): string => {
    const methodColors: Record<string, string> = {
      mpesa: "bg-green-500/20 text-green-400 border-green-500/30",
      card: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      bank: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
    return (
      methodColors[method] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
    );
  };

  /**
   * Returns color classes for transaction type badge
   * @param {string} type - Transaction type
   * @returns {string} Tailwind CSS classes
   */
  const getTransactionTypeColor = (type: string): string => {
    return type === "refund"
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-green-500/20 text-green-400 border-green-500/30";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-400" />
            Payment Details
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Complete transaction information and history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="text-slate-400 text-sm font-medium">
                Payment Status
              </h4>
              <Badge className={getStatusColor(payment.status)}>
                <span className="flex items-center gap-1.5">
                  {getStatusIcon(payment.status)}
                  <span className="capitalize">{payment.status}</span>
                </span>
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-400 text-sm font-medium">
                Payment Method
              </h4>
              <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                <span className="uppercase">{payment.paymentMethod}</span>
              </Badge>
            </div>
            <div className="space-y-2">
              <h4 className="text-slate-400 text-sm font-medium">
                Transaction Type
              </h4>
              <Badge
                className={getTransactionTypeColor(payment.transactionType)}
              >
                <span className="capitalize">{payment.transactionType}</span>
              </Badge>
            </div>
          </div>

          {/* Amount Section */}
          <div className="bg-gradient-to-br from-orange-500/10 to-cyan-500/10 border border-orange-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-slate-400 text-sm mb-1">
                  {payment.transactionType === "refund"
                    ? "Refund Amount"
                    : "Payment Amount"}
                </h4>
                <div className="flex items-baseline gap-2">
                  <DollarSign className="w-6 h-6 text-orange-400" />
                  <span className="text-3xl font-bold text-white">
                    KSh {payment.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              {payment.status === "completed" || payment.status === "paid" ? (
                <CheckCircle className="w-12 h-12 text-green-400" />
              ) : payment.status === "failed" ? (
                <XCircle className="w-12 h-12 text-red-400" />
              ) : (
                <Clock className="w-12 h-12 text-yellow-400" />
              )}
            </div>
          </div>

          {/* Booking Information */}
          <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-orange-400" />
              Booking Information
            </h4>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-400 text-sm">Package Name:</span>
                <span className="text-white font-medium text-sm text-right">
                  {payment.bookingId.packageId.name}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Destination:
                </span>
                <span className="text-orange-400 text-sm font-medium">
                  {payment.bookingId.packageId.destinationName}
                </span>
              </div>

              <div className="h-px bg-slate-600/50 my-2"></div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Travel Date:
                </span>
                <span className="text-white text-sm">
                  {format(
                    new Date(payment.bookingId.travelDate),
                    "MMM dd, yyyy"
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Travelers:
                </span>
                <span className="text-white text-sm">
                  {payment.bookingId.numberOfTravelers}{" "}
                  {payment.bookingId.numberOfTravelers === 1
                    ? "person"
                    : "people"}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {payment.transactionId && (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-white font-semibold flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-cyan-400" />
                Transaction Details
              </h4>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-400 text-sm">
                    Transaction ID:
                  </span>
                  <span className="text-cyan-400 text-sm font-mono break-all text-right">
                    {payment.transactionId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">
                    Transaction Date:
                  </span>
                  <span className="text-white text-sm">
                    {format(
                      new Date(payment.createdAt),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
                {payment.updatedAt !== payment.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">
                      Last Updated:
                    </span>
                    <span className="text-white text-sm">
                      {format(
                        new Date(payment.updatedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* M-Pesa Specific Details */}
          {payment.paymentMethod === "mpesa" &&
            (payment.mpesaPhone || payment.mpesaCode) && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold flex items-center gap-2 mb-3">
                  <Smartphone className="w-4 h-4" />
                  M-Pesa Details
                </h4>
                <div className="space-y-2">
                  {payment.mpesaPhone && (
                    <div className="flex items-center justify-between">
                      <span className="text-green-300 text-sm">
                        Phone Number:
                      </span>
                      <span className="text-white text-sm font-medium">
                        {payment.mpesaPhone}
                      </span>
                    </div>
                  )}
                  {payment.mpesaCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-green-300 text-sm">
                        M-Pesa Code:
                      </span>
                      <span className="text-white text-sm font-mono">
                        {payment.mpesaCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Refund Information */}
          {payment.transactionType === "refund" && payment.refundReason && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold flex items-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4" />
                Refund Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-blue-300 text-sm font-medium">
                    Reason:
                  </span>
                  <span className="text-white text-sm flex-1">
                    {payment.refundReason}
                  </span>
                </div>
                {payment.refundedAt && (
                  <div className="flex items-center justify-between pt-2 border-t border-blue-500/20">
                    <span className="text-blue-300 text-sm">Refunded On:</span>
                    <span className="text-white text-sm">
                      {format(
                        new Date(payment.refundedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status-specific Messages */}
          {payment.status === "pending" && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-300 text-sm flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  This payment is currently being processed. You will receive a
                  confirmation once completed.
                </span>
              </p>
            </div>
          )}

          {payment.status === "failed" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-300 text-sm flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  This payment failed. Please try again or contact support if
                  the issue persists.
                </span>
              </p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600"
            >
              Close
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
