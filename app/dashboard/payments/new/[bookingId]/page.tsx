"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Smartphone,
  Building,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  _id: string;
  packageId: {
    name: string;
    destinationName: string;
  };
  totalAmount: number;
  customerInfo: {
    name: string;
    phone: string;
  };
}

export default function NewPaymentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card" | "bank">("mpesa");

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch(`/api/user/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      } else {
        throw new Error("Failed to fetch booking");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setSubmitting(true);

    try {
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/user/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          amount: booking?.totalAmount,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Payment Initiated",
          description: "Your payment has been processed successfully!",
        });
        router.push(`/dashboard/payments/${data.payment._id}`);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass border-orange-500/20 max-w-md">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-bold text-white mb-2">Booking Not Found</h3>
            <p className="text-white/70 mb-6">Cannot process payment for this booking.</p>
            <Button onClick={() => router.push("/dashboard/bookings")} className="btn-adventure">
              View My Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/bookings/${bookingId}`)}
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-white">Make Payment</h2>
            <p className="text-white/70">Complete your payment to confirm booking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="glass border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-white">Payment Method</CardTitle>
                <CardDescription className="text-white/70">
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)} className="space-y-4">
                  {/* M-Pesa Option */}
                  <div className="flex items-center space-x-3 p-4 border border-orange-500/30 rounded-lg hover:border-orange-500/50 transition-colors">
                    <RadioGroupItem value="mpesa" id="mpesa" />
                    <Label htmlFor="mpesa" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">M-Pesa</p>
                          <p className="text-white/70 text-sm">Pay via M-Pesa</p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* Card Option */}
                  <div className="flex items-center space-x-3 p-4 border border-orange-500/30 rounded-lg hover:border-orange-500/50 transition-colors">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Credit/Debit Card</p>
                          <p className="text-white/70 text-sm">Pay with card</p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* Bank Transfer Option */}
                  <div className="flex items-center space-x-3 p-4 border border-orange-500/30 rounded-lg hover:border-orange-500/50 transition-colors">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Bank Transfer</p>
                          <p className="text-white/70 text-sm">Direct bank transfer</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                <Button
                  onClick={handlePayment}
                  disabled={submitting}
                  className="w-full mt-6 btn-adventure"
                >
                  {submitting ? "Processing..." : "Complete Payment"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="glass border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-white font-bold">{booking.packageId.name}</h3>
                  <p className="text-orange-400 text-sm">{booking.packageId.destinationName}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-white/70">
                    <span>Customer</span>
                    <span className="text-white">{booking.customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Phone</span>
                    <span className="text-white">{booking.customerInfo.phone}</span>
                  </div>
                </div>

                <div className="border-t border-orange-500/20 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-white">Total Amount</span>
                    <span className="text-orange-400">
                      KSh {booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Payment Instructions */}
                {paymentMethod === "mpesa" && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-green-400 text-sm font-medium">M-Pesa Instructions</p>
                    </div>
                    <p className="text-white/70 text-xs">
                      You will receive a prompt on your phone to complete the payment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}