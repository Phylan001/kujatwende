// components/user/payments/PaymentDetailsModal.tsx
"use client";

import { useState } from "react";
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
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

interface Payment {
  _id: string;
  bookingId: {
    _id: string;
    packageId: {
      _id: string;
      name: string;
      destinationName: string;
      duration: number;
      price: number;
      isFree: boolean;
      inclusions: string[];
      exclusions: string[];
      highlights: string[];
      itinerary: Array<{
        day: number;
        title: string;
        description: string;
        activities: string[];
      }>;
    };
    customerInfo: {
      name: string;
      email: string;
      phone: string;
      emergencyContact: string;
    };
    travelDate: string;
    numberOfTravelers: number;
    totalAmount: number;
    specialRequests?: string;
    status: string;
    paymentStatus: string;
  };
  amount: number;
  paymentMethod: "mpesa" | "card" | "bank";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  mpesaCode?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  payment,
}: PaymentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"package" | "booking" | "payment">("payment");

  if (!payment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "refunded":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "refunded":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "mpesa":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "card":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "bank":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Payment Details</DialogTitle>
          <DialogDescription className="text-slate-400">
            Transaction ID: {payment.transactionId}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "payment"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-slate-400"
            }`}
            onClick={() => setActiveTab("payment")}
          >
            Payment Details
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "package"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-slate-400"
            }`}
            onClick={() => setActiveTab("package")}
          >
            Package Details
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "booking"
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-slate-400"
            }`}
            onClick={() => setActiveTab("booking")}
          >
            Booking Details
          </button>
        </div>

        {activeTab === "payment" && (
          <div className="space-y-6">
            {/* Payment Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Payment Status</h4>
                <Badge className={getStatusColor(payment.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(payment.status)}
                    {payment.status}
                  </span>
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Payment Method</h4>
                <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    {payment.paymentMethod.toUpperCase()}
                  </span>
                </Badge>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h4 className="text-white font-semibold mb-3">Payment Information</h4>
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-orange-400 font-bold">
                    KSh {payment.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="text-white font-mono">
                    {payment.transactionId}
                  </span>
                </div>
                {payment.mpesaCode && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">M-Pesa Code:</span>
                    <span className="text-white font-mono">
                      {payment.mpesaCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Date:</span>
                  <span className="text-white">
                    {format(new Date(payment.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Updated:</span>
                  <span className="text-white">
                    {format(new Date(payment.updatedAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </span>
                </div>
              </div>
            </div>

            {/* Refund Information */}
            {payment.refundReason && (
              <div>
                <h4 className="text-white font-semibold mb-2">Refund Information</h4>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-300">
                    <strong>Reason:</strong> {payment.refundReason}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "package" && (
          <div className="space-y-6">
            {/* Package Info */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {payment.bookingId.packageId.name}
              </h3>
              <p className="text-orange-400 flex items-center gap-1 mb-4">
                <MapPin className="w-4 h-4" />
                {payment.bookingId.packageId.destinationName}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  {payment.bookingId.packageId.duration} days
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <DollarSign className="w-4 h-4 text-orange-400" />
                  {payment.bookingId.packageId.isFree ? "FREE" : `KSh ${payment.bookingId.packageId.price.toLocaleString()}`}
                </div>
              </div>
            </div>

            {/* Highlights */}
            {payment.bookingId.packageId.highlights?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {payment.bookingId.packageId.highlights.map((highlight, index) => (
                    <Badge
                      key={index}
                      className="bg-orange-500/20 text-orange-400 border-orange-500/30"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions */}
            {payment.bookingId.packageId.inclusions?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-2">What's Included</h4>
                <ul className="text-slate-300 list-disc list-inside space-y-1">
                  {payment.bookingId.packageId.inclusions.map((inclusion, index) => (
                    <li key={index}>{inclusion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Itinerary Preview */}
            {payment.bookingId.packageId.itinerary?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Itinerary Preview</h4>
                <div className="space-y-2">
                  {payment.bookingId.packageId.itinerary.slice(0, 2).map((day) => (
                    <div
                      key={day.day}
                      className="bg-slate-700/30 rounded-lg p-3"
                    >
                      <h5 className="text-orange-400 font-semibold text-sm">
                        Day {day.day}: {day.title}
                      </h5>
                    </div>
                  ))}
                  {payment.bookingId.packageId.itinerary.length > 2 && (
                    <p className="text-slate-400 text-sm text-center">
                      +{payment.bookingId.packageId.itinerary.length - 2} more days
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "booking" && (
          <div className="space-y-6">
            {/* Booking Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Booking Status</h4>
                <Badge className={getStatusColor(payment.bookingId.status)}>
                  {payment.bookingId.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Payment Status</h4>
                <Badge className={getStatusColor(payment.bookingId.paymentStatus)}>
                  {payment.bookingId.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Travel Details */}
            <div>
              <h4 className="text-white font-semibold mb-3">Travel Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span>Travel Date: {format(new Date(payment.bookingId.travelDate), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span>Travelers: {payment.bookingId.numberOfTravelers}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <DollarSign className="w-4 h-4 text-orange-400" />
                  <span>Total Amount: KSh {payment.bookingId.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {payment.bookingId.specialRequests && (
              <div>
                <h4 className="text-white font-semibold mb-2">Special Requests</h4>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <p className="text-orange-300">{payment.bookingId.specialRequests}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}