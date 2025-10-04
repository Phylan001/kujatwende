"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  _id: string;
  bookingId: {
    _id: string;
    packageId: {
      name: string;
      destinationName: string;
    };
  };
  amount: number;
  paymentMethod: "mpesa" | "card" | "bank";
  transactionId: string;
  status: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
}

export default function UserPaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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
      const token = localStorage.getItem("auth-token");
      const response = await fetch("/api/user/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "refunded":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "refunded":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const totalSpent = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

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
          <p className="text-white/70">Track your payment history</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-orange-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-orange-400">
                  KSh {totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {payments.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Successful</p>
                <p className="text-3xl font-bold text-green-400">
                  {payments.filter(p => p.status === "paid").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card className="glass border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-white">Payment History</CardTitle>
          <CardDescription className="text-white/70">
            All your payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No payments yet</h3>
                <p className="text-white/70">Your payment history will appear here</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/5 to-cyan-500/5 rounded-xl border border-orange-500/10 hover:border-orange-500/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        {payment.bookingId.packageId.name}
                      </h4>
                      <p className="text-white/70 text-sm">
                        {payment.bookingId.packageId.destinationName}
                      </p>
                      <p className="text-white/50 text-xs">
                        {format(new Date(payment.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(payment.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </Badge>
                    <div className="text-right">
                      <p className="text-orange-400 font-bold text-lg">
                        KSh {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-white/50 text-xs uppercase">
                        {payment.paymentMethod} • {payment.transactionId}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}