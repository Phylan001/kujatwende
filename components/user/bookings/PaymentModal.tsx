// components/user/bookings/PaymentModal.tsx
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, DollarSign } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  _id: string;
  packageId: {
    _id: string;
    name: string;
  };
  totalAmount: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess: (paymentId: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: PaymentModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  if (!booking) return null;

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to make a payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const userId = (user as any)?._id || (user as any)?.id;
      
      const response = await fetch("/api/user/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking._id,
          userId: userId,
          amount: booking.totalAmount,
          paymentMethod: paymentMethod,
          ...(paymentMethod === "card" && { cardDetails }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.payment._id);
      } else {
        toast({
          title: "Payment Failed",
          description: data.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardDetailChange = (field: string, value: string) => {
    setCardDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Make Payment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Complete payment for your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <h4 className="text-white font-semibold mb-2 text-sm">Payment Summary</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="text-white font-medium text-right">{booking.packageId.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-orange-400 font-bold">
                  KSh {booking.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-sm">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: "mpesa" | "card") => setPaymentMethod(value)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mpesa" id="mpesa" />
                <Label htmlFor="mpesa" className="flex items-center gap-2 text-sm cursor-pointer">
                  <CreditCard className="w-4 h-4" />
                  M-Pesa
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 text-sm cursor-pointer">
                  <CreditCard className="w-4 h-4" />
                  Credit/Debit Card
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Card Details */}
          {paymentMethod === "card" && (
            <div className="space-y-3 border border-slate-600 rounded-lg p-3">
              <h4 className="text-white font-semibold text-sm">Card Details</h4>
              
              <div className="space-y-1.5">
                <Label htmlFor="cardNumber" className="text-xs">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => handleCardDetailChange("number", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white text-sm h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="expiry" className="text-xs">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => handleCardDetailChange("expiry", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cvv" className="text-xs">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardDetailChange("cvv", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white text-sm h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cardName" className="text-xs">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => handleCardDetailChange("name", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white text-sm h-9"
                />
              </div>
            </div>
          )}

          {/* M-Pesa Instructions */}
          {paymentMethod === "mpesa" && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <h5 className="text-blue-400 font-semibold mb-1.5 text-sm">
                M-Pesa Payment Instructions
              </h5>
              <ol className="text-blue-300 text-xs space-y-0.5 list-decimal list-inside">
                <li>Ensure you have sufficient funds in your M-Pesa account</li>
                <li>You will receive a prompt on your phone</li>
                <li>Enter your M-Pesa PIN to complete the payment</li>
                <li>Wait for confirmation message</li>
              </ol>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full btn-adventure text-sm h-10"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Pay KSh {booking.totalAmount.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}