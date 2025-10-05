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
import { AlertTriangle, Ban, DollarSign } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  _id: string;
  packageId: {
    name: string;
  };
  totalAmount: number;
  paymentStatus: string;
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

  if (!booking) return null;

  const handleCancelBooking = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to cancel booking",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const userId = (user as any)?._id || (user as any)?.id;
      
      const response = await fetch("/api/user/bookings/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking._id,
          userId: userId,
          reason: cancellationReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        toast({
          title: "Cancellation Failed",
          description: data.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({
        title: "Cancellation Error",
        description: "An error occurred while cancelling your booking",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
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
          {/* Warning Message */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-yellow-400 font-semibold">Important Notice</h4>
                <ul className="text-yellow-300 text-sm space-y-1 list-disc list-inside">
                  <li>This action cannot be undone</li>
                  <li>All related payments will be refunded</li>
                  <li>Package availability will be updated</li>
                  <li>You may be charged a cancellation fee</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Booking Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="text-white">{booking.packageId.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="text-orange-400">
                  KSh {booking.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className="text-yellow-400 capitalize">{booking.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="space-y-2">
            <Label htmlFor="cancellationReason">
              Reason for Cancellation (Optional)
            </Label>
            <Textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white min-h-[80px]"
              placeholder="Please tell us why you are cancelling..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleCancelBooking}
              disabled={isProcessing}
              variant="destructive"
              className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Cancel Booking
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}