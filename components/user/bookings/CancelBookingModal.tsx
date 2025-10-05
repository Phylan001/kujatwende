// components/user/bookings/CancelBookingModal.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Ban, DollarSign, CheckCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  _id: string;
  packageId: {
    name: string;
  };
  numberOfTravelers: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
}

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess: () => void;
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: CancelBookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cancellationReason, setCancellationReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Guard clause: Return early if no booking data
  if (!booking) return null;

  /**
   * Validates booking eligibility for cancellation
   * @returns {boolean} true if booking can be cancelled
   */
  const validateCancellation = (): boolean => {
    if (booking.status === "cancelled") {
      toast({
        title: "Already Cancelled",
        description: "This booking has already been cancelled",
        variant: "destructive",
      });
      return false;
    }

    if (booking.status === "completed") {
      toast({
        title: "Cannot Cancel",
        description: "Completed bookings cannot be cancelled",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  /**
   * Handles the booking cancellation process
   * Updates booking status, restores package seats, and processes refunds if applicable
   */
  const handleCancelBooking = async () => {
    // Authentication check
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to cancel your booking",
        variant: "destructive",
      });
      return;
    }

    // Validate cancellation eligibility
    if (!validateCancellation()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Extract user ID with fallback handling
      const userId = (user as any)?._id || (user as any)?.id;

      if (!userId) {
        toast({
          title: "User Identification Error",
          description: "Unable to identify user. Please try logging in again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // API call to cancel booking
      const response = await fetch("/api/user/bookings/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking._id,
          userId: userId,
          reason: cancellationReason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      if (data.success) {
        // Construct success message with refund information
        const refundMessage = data.refunded 
          ? " Your payment of KSh " + booking.totalAmount.toLocaleString() + " has been refunded." 
          : "";
        
        toast({
          title: "Booking Cancelled Successfully",
          description: `Your booking for ${booking.packageId.name} has been cancelled.${refundMessage}`,
          duration: 5000,
        });
        
        // Reset form state
        setCancellationReason("");
        
        // Trigger success callback to refresh parent component
        onSuccess();
        
        // Close modal after successful cancellation
        onClose();
      } else {
        throw new Error(data.error || "Unexpected error occurred");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error 
          ? error.message 
          : "An error occurred while cancelling your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles modal close with state cleanup
   */
  const handleClose = () => {
    if (!isProcessing) {
      setCancellationReason("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Are you sure you want to cancel this booking?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Critical Warning Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-yellow-400 font-semibold text-sm">Important Notice</h4>
                <ul className="text-yellow-300 text-xs space-y-0.5">
                  <li>• This action is permanent and cannot be reversed</li>
                  <li>• Package seats will be restored for other travelers</li>
                  {booking.paymentStatus === "paid" && (
                    <li className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 inline" />
                      Full refund will be processed automatically
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-orange-400" />
              Booking Details
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-400">Package:</span>
                <span className="text-white text-right font-medium">
                  {booking.packageId.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Travelers:</span>
                <span className="text-white font-medium">
                  {booking.numberOfTravelers} {booking.numberOfTravelers === 1 ? 'person' : 'people'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount:</span>
                <span className="text-orange-400 font-bold">
                  KSh {booking.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className={`font-medium capitalize ${
                  booking.paymentStatus === 'paid' 
                    ? 'text-green-400' 
                    : booking.paymentStatus === 'pending'
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Refund Information (if paid) */}
          {booking.paymentStatus === "paid" && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="text-green-400 font-semibold text-sm mb-1">
                    Refund Information
                  </h5>
                  <p className="text-green-300 text-xs">
                    Your payment of <strong>KSh {booking.totalAmount.toLocaleString()}</strong> will be 
                    refunded to your original payment method within 5-10 business days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="cancellationReason" className="text-white text-sm">
              Reason for Cancellation <span className="text-slate-400 text-xs">(Optional)</span>
            </Label>
            <Textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px] text-sm focus:border-orange-400 focus:ring-orange-400/20"
              placeholder="Share your reason for cancelling..."
              disabled={isProcessing}
              maxLength={500}
            />
            <p className="text-xs text-slate-400 text-right">
              {cancellationReason.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isProcessing}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors text-sm"
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleCancelBooking}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 transition-all text-sm"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Confirm Cancellation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}