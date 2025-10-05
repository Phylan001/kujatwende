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
import { CreditCard, DollarSign, Calendar, User, Smartphone, Shield } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  _id: string;
  packageId: {
    _id: string;
    name: string;
  };
  totalAmount: number;
  paymentStatus: string;
  status: string;
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
  const [mpesaPhone, setMpesaPhone] = useState("");
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

    // Check if booking can be paid
    if (booking.status === "cancelled") {
      toast({
        title: "Cannot Pay",
        description: "This booking has been cancelled",
        variant: "destructive",
      });
      return;
    }

    if (booking.paymentStatus === "paid") {
      toast({
        title: "Already Paid",
        description: "This booking has already been paid",
        variant: "destructive",
      });
      return;
    }

    // Validate M-Pesa phone number
    if (paymentMethod === "mpesa" && !mpesaPhone) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your M-Pesa phone number",
        variant: "destructive",
      });
      return;
    }

    // Validate card details
    if (paymentMethod === "card") {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        toast({
          title: "Incomplete Card Details",
          description: "Please fill in all card details",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      const userId = (user as any)?._id || (user as any)?.id;

      if (!userId) {
        toast({
          title: "Error",
          description: "Unable to identify user. Please try logging in again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
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
          mpesaPhone: paymentMethod === "mpesa" ? mpesaPhone : undefined,
          cardDetails: paymentMethod === "card" ? cardDetails : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Payment Successful",
          description: `Your payment of KSh ${booking.totalAmount.toLocaleString()} has been processed`,
        });
        
        // Reset form
        setMpesaPhone("");
        setCardDetails({ number: "", expiry: "", cvv: "", name: "" });
        
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
    let formattedValue = value;

    // Format card number with spaces
    if (field === "number") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      if (formattedValue.length > 19) return; // Max 16 digits + 3 spaces
    }

    // Format expiry as MM/YY
    if (field === "expiry") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    }

    // Limit CVV to 3-4 digits
    if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 4) return;
    }

    setCardDetails((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const handlePhoneChange = (value: string) => {
    // Remove non-numeric characters
    let formatted = value.replace(/\D/g, "");
    
    // Limit to 12 characters (254XXXXXXXXX)
    if (formatted.length > 12) return;
    
    setMpesaPhone(formatted);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Secure Payment
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Complete payment for your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-orange-500/10 to-cyan-500/10 border border-orange-500/20 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-400" />
              Payment Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="text-white font-medium">{booking.packageId.name}</span>
              </div>
              <div className="h-px bg-slate-600/50 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">Total Amount:</span>
                <span className="text-orange-400 font-bold text-xl">
                  KSh {booking.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="text-white font-semibold">Select Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: "mpesa" | "card") => setPaymentMethod(value)}
              disabled={isProcessing}
              className="space-y-2"
            >
              <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                paymentMethod === "mpesa" 
                  ? "border-green-500/50 bg-green-500/10" 
                  : "border-slate-600 bg-slate-700/30"
              }`}>
                <RadioGroupItem value="mpesa" id="mpesa" disabled={isProcessing} />
                <Label 
                  htmlFor="mpesa" 
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Smartphone className="w-4 h-4 text-green-400" />
                  <span>M-Pesa</span>
                  <span className="text-xs text-slate-400 ml-auto">Recommended</span>
                </Label>
              </div>
              <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                paymentMethod === "card" 
                  ? "border-blue-500/50 bg-blue-500/10" 
                  : "border-slate-600 bg-slate-700/30"
              }`}>
                <RadioGroupItem value="card" id="card" disabled={isProcessing} />
                <Label 
                  htmlFor="card" 
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>Credit/Debit Card</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* M-Pesa Details */}
          {paymentMethod === "mpesa" && (
            <div className="space-y-3 border border-green-500/20 rounded-lg p-4 bg-green-500/5">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-400" />
                M-Pesa Details
              </h4>
              
              <div className="space-y-2">
                <Label htmlFor="mpesaPhone" className="text-slate-300">
                  M-Pesa Phone Number *
                </Label>
                <Input
                  id="mpesaPhone"
                  type="tel"
                  placeholder="254712345678"
                  value={mpesaPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  disabled={isProcessing}
                  className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                />
                <p className="text-xs text-slate-400">
                  Enter your phone number in format: 254XXXXXXXXX
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-3">
                <h5 className="text-blue-400 font-semibold mb-2 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Payment Instructions
                </h5>
                <ol className="text-blue-300 text-xs space-y-1 list-decimal list-inside">
                  <li>Click "Pay Now" to initiate payment</li>
                  <li>You will receive an STK push prompt on your phone</li>
                  <li>Enter your M-Pesa PIN to confirm</li>
                  <li>Wait for confirmation message</li>
                </ol>
              </div>
            </div>
          )}

          {/* Card Details */}
          {paymentMethod === "card" && (
            <div className="space-y-3 border border-blue-500/20 rounded-lg p-4 bg-blue-500/5">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                Card Details
              </h4>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-slate-300">
                  Card Number *
                </Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => handleCardDetailChange("number", e.target.value)}
                  disabled={isProcessing}
                  className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-slate-300">
                    Expiry Date *
                  </Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => handleCardDetailChange("expiry", e.target.value)}
                    disabled={isProcessing}
                    className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-slate-300">
                    CVV *
                  </Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardDetailChange("cvv", e.target.value)}
                    disabled={isProcessing}
                    maxLength={4}
                    className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName" className="text-slate-300">
                  Cardholder Name *
                </Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => handleCardDetailChange("name", e.target.value)}
                  disabled={isProcessing}
                  className="bg-slate-700/50 border-slate-600 text-white disabled:opacity-50"
                />
              </div>

              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 mt-3">
                <p className="text-slate-300 text-xs flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Your card information is encrypted and secure. We never store your full card details.
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 space-y-2">
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600 text-white font-semibold py-6 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pay KSh {booking.totalAmount.toLocaleString()}
                </>
              )}
            </Button>
            
            <Button
              onClick={handleClose}
              disabled={isProcessing}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 disabled:opacity-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}