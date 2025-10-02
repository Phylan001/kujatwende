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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

interface Payment {
  _id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      const data = await response.json();
      if (data.payments) {
        setPayments(data.payments);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" || payment.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

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
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "pending":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "failed":
        return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "refunded":
        return <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return null;
    }
  };

  const totalRevenue = filteredPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 sm:h-32 sm:w-32 border-b-2 border-cyan-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Payments</h2>
          <p className="text-slate-400 mt-1 text-xs sm:text-base">
            Track and manage all payment transactions
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Total Revenue
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-400 mt-2">
              KSh {totalRevenue.toLocaleString()}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Total Transactions
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-400 mt-2">
              {payments.length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Pending
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-yellow-400 mt-2">
              {payments.filter((p) => p.status === "pending").length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Failed
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-red-400 mt-2">
              {payments.filter((p) => p.status === "failed").length}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white text-lg sm:text-xl">
                Payment Transactions
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm">
                View and manage all payment records
              </CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-sm w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="block lg:hidden space-y-3">
            {filteredPayments.map((payment) => (
              <Card
                key={payment._id}
                className="bg-slate-700/30 border-slate-600/50"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium text-sm">
                        {payment.customerName}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {payment.customerEmail}
                      </p>
                    </div>
                    <Badge className={getStatusColor(payment.status)}>
                      <span className="flex items-center gap-1 text-xs">
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Amount:</span>
                      <span className="text-white font-semibold">
                        KSh {payment.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Method:</span>
                      <span className="text-white uppercase">
                        {payment.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="text-cyan-400 font-mono">
                        {payment.transactionId}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Date:</span>
                      <span className="text-white">
                        {format(new Date(payment.createdAt), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-lg border border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-slate-700/30">
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Transaction ID
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Customer
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Amount
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Method
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Status
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 text-cyan-400 font-mono text-sm">
                      {payment.transactionId}
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-white/80 text-sm">
                          {payment.customerName}
                        </p>
                        <p className="text-white/50 text-xs">
                          {payment.customerEmail}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-white/80 font-semibold text-sm">
                      KSh {payment.amount.toLocaleString()}
                    </td>
                    <td className="p-3 text-white/80 uppercase text-sm">
                      {payment.paymentMethod}
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(payment.status)}>
                        <span className="flex items-center gap-1 text-xs">
                          {getStatusIcon(payment.status)}
                          {payment.status}
                        </span>
                      </Badge>
                    </td>
                    <td className="p-3 text-white/80 text-sm">
                      {format(new Date(payment.createdAt), "MMM dd, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-white/70 text-sm sm:text-base">
                No payments found
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
