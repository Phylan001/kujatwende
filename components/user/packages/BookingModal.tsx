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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, DollarSign } from "lucide-react";

interface TravelPackage {
  _id: string;
  name: string;
  price: number;
  isFree: boolean;
  availableSeats: number;
  duration: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: TravelPackage | null;
  onSubmit: (bookingData: {
    numberOfTravelers: number;
    travelDate: string;
    specialRequests?: string;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
      emergencyContact: string;
    };
  }) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  package: pkg,
  onSubmit,
}: BookingModalProps) {
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);
  const [travelDate, setTravelDate] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pkg) return null;

  const totalAmount = pkg.isFree ? 0 : pkg.price * numberOfTravelers;

  const handleSubmit = async () => {
    if (
      !travelDate ||
      !customerInfo.name ||
      !customerInfo.email ||
      !customerInfo.phone ||
      !customerInfo.emergencyContact
    ) {
      return;
    }

    if (numberOfTravelers > pkg.availableSeats) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        numberOfTravelers,
        travelDate,
        specialRequests,
        customerInfo,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book {pkg.name}</DialogTitle>
          <DialogDescription className="text-slate-400">
            Complete your booking details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Booking Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Package</p>
                <p className="text-white">{pkg.name}</p>
              </div>
              <div>
                <p className="text-slate-400">Duration</p>
                <p className="text-white">{pkg.duration} days</p>
              </div>
              <div>
                <p className="text-slate-400">Price per person</p>
                <p className="text-white">
                  {pkg.isFree ? "FREE" : `KSh ${pkg.price.toLocaleString()}`}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Available Seats</p>
                <p className="text-white">{pkg.availableSeats}</p>
              </div>
            </div>
          </div>

          {/* Travel Details */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Travel Details</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="numberOfTravelers"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Number of Travelers *
                </Label>
                <Input
                  id="numberOfTravelers"
                  type="number"
                  min="1"
                  max={pkg.availableSeats}
                  value={numberOfTravelers}
                  onChange={(e) =>
                    setNumberOfTravelers(parseInt(e.target.value) || 1)
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400">
                  Maximum: {pkg.availableSeats} travelers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Travel Date *
                </Label>
                <Input
                  id="travelDate"
                  type="date"
                  min={minDate}
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Customer Information</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) =>
                    handleCustomerInfoChange("name", e.target.value)
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    handleCustomerInfoChange("email", e.target.value)
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    handleCustomerInfoChange("phone", e.target.value)
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="+254 XXX XXX XXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                <Input
                  id="emergencyContact"
                  value={customerInfo.emergencyContact}
                  onChange={(e) =>
                    handleCustomerInfoChange("emergencyContact", e.target.value)
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="Emergency contact details"
                />
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white min-h-[80px]"
              placeholder="Any special requirements or requests..."
            />
          </div>

          {/* Total Amount */}
          {!pkg.isFree && (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Amount</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-bold text-xl">
                    KSh {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Payment will be required after booking confirmation
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !travelDate ||
              !customerInfo.name ||
              !customerInfo.email ||
              !customerInfo.phone ||
              !customerInfo.emergencyContact ||
              numberOfTravelers > pkg.availableSeats
            }
            className="w-full btn-adventure"
          >
            {isSubmitting ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
