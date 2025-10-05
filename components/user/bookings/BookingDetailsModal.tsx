// components/user/bookings/BookingDetailsModal.tsx
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
  Star,
  User,
  Phone,
  Mail,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

interface Booking {
  _id: string;
  packageId: {
    _id: string;
    name: string;
    image?: { url: string };
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
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests?: string;
  createdAt: string;
}

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
}: BookingDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"package" | "booking">("package");

  if (!booking) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Booking Details</DialogTitle>
          <DialogDescription className="text-slate-400">
            {booking.packageId.name}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
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

        {activeTab === "package" && (
          <div className="space-y-6">
            {/* Package Image */}
            {booking.packageId.image?.url && (
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={booking.packageId.image.url}
                  alt={booking.packageId.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Package Info */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {booking.packageId.name}
              </h3>
              <p className="text-orange-400 flex items-center gap-1 mb-4">
                <MapPin className="w-4 h-4" />
                {booking.packageId.destinationName}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  {booking.packageId.duration} days
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <DollarSign className="w-4 h-4 text-orange-400" />
                  {booking.packageId.isFree ? "FREE" : `KSh ${booking.packageId.price.toLocaleString()}`}
                </div>
              </div>
            </div>

            {/* Highlights */}
            {booking.packageId.highlights?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {booking.packageId.highlights.map((highlight, index) => (
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
            {booking.packageId.inclusions?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-2">What's Included</h4>
                <ul className="text-slate-300 list-disc list-inside space-y-1">
                  {booking.packageId.inclusions.map((inclusion, index) => (
                    <li key={index}>{inclusion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exclusions */}
            {booking.packageId.exclusions?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-2">What's Not Included</h4>
                <ul className="text-slate-300 list-disc list-inside space-y-1">
                  {booking.packageId.exclusions.map((exclusion, index) => (
                    <li key={index}>{exclusion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Itinerary */}
            {booking.packageId.itinerary?.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Itinerary</h4>
                <div className="space-y-3">
                  {booking.packageId.itinerary.slice(0, 3).map((day) => (
                    <div
                      key={day.day}
                      className="bg-slate-700/30 rounded-lg p-3"
                    >
                      <h5 className="text-orange-400 font-semibold">
                        Day {day.day}: {day.title}
                      </h5>
                      <p className="text-slate-300 text-sm mt-1">
                        {day.description}
                      </p>
                    </div>
                  ))}
                  {booking.packageId.itinerary.length > 3 && (
                    <p className="text-slate-400 text-sm text-center">
                      +{booking.packageId.itinerary.length - 3} more days
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
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Payment Status</h4>
                <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                  {booking.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Travel Details */}
            <div>
              <h4 className="text-white font-semibold mb-3">Travel Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span>Travel Date: {format(new Date(booking.travelDate), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span>Travelers: {booking.numberOfTravelers}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <DollarSign className="w-4 h-4 text-orange-400" />
                  <span>Total Amount: KSh {booking.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span>Booked: {format(new Date(booking.createdAt), "MMM dd, yyyy")}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h4 className="text-white font-semibold mb-3">Customer Information</h4>
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-400" />
                  <span className="text-white">{booking.customerInfo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-400" />
                  <span className="text-white">{booking.customerInfo.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span className="text-white">{booking.customerInfo.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span className="text-white">Emergency: {booking.customerInfo.emergencyContact}</span>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div>
                <h4 className="text-white font-semibold mb-2">Special Requests</h4>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <p className="text-orange-300">{booking.specialRequests}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}