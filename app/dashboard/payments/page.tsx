// app/dashboard/payments/page.tsx
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
import {
  CreditCard,
  Calendar,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import PaymentDetailsModal from "@/components/user/payments/PaymentDetailsModal";

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
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  mpesaCode?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserPaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const paymentId = searchParams.get("payment");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchUserPayments();
  }, [user, authLoading, router]);

  const fetchUserPayments = async () => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;

      if (!userId) {
        toast({
          title: "Error",
          description: "Unable to identify user. Please try logging in again.",
          variant: "destructive",
        });
        return;
      }

      const url = paymentId 
        ? `/api/user/payments?userId=${userId}&paymentId=${paymentId}`
        : `/api/user/payments?userId=${userId}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load your payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Loading your payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-orange-400" />
        <div>
          <h2 className="text-3xl font-bold text-white">My Payments</h2>
          <p className="text-white/70">View your payment history and details</p>
          {paymentId && (
            <p className="text-orange-400 text-sm">
              Showing specific payment details
            </p>
          )}
        </div>
      </div>

      {/* Payments Grid */}
      <div className="grid gap-6">
        {payments.length === 0 ? (
          <Card className="glass border-orange-500/20">
            <CardContent className="text-center py-12">
              <CreditCard className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No payments yet
              </h3>
              <p className="text-white/70 mb-6">
                Your payment history will appear here
              </p>
              <Button
                onClick={() => router.push("/dashboard/bookings")}
                className="btn-adventure"
              >
                View Bookings
              </Button>
            </CardContent>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card
              key={payment._id}
              className="glass border-orange-500/20 hover:border-orange-500/40 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Payment Icon */}
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-orange-400" />
                  </div>

                  {/* Payment Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {payment.bookingId.packageId.name}
                        </h3>
                        <p className="text-orange-400">
                          {payment.bookingId.packageId.destinationName}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Badge className={getStatusColor(payment.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(payment.status)}
                            {payment.status}
                          </span>
                        </Badge>
                        <Badge className={getPaymentMethodColor(payment.paymentMethod)}>
                          {payment.paymentMethod.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        {format(new Date(payment.bookingId.travelDate), "MMM dd, yyyy")}
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <DollarSign className="w-4 h-4 text-orange-400" />
                        KSh {payment.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        {format(new Date(payment.createdAt), "MMM dd, yyyy")}
                      </div>
                      {payment.transactionId && (
                        <div className="text-white/70">
                          ID: {payment.transactionId.slice(-8)}
                        </div>
                      )}
                    </div>

                    {payment.refundReason && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-blue-300 text-sm">
                          <strong>Refund Reason:</strong> {payment.refundReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <Button
                      onClick={() => handleViewPayment(payment)}
                      variant="outline"
                      className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
}