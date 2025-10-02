"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    monthly: Array<{ month: string; amount: number }>;
  };
  bookings: {
    total: number;
    growth: number;
    monthly: Array<{ month: string; count: number }>;
  };
  users: {
    total: number;
    growth: number;
    newUsers: Array<{ month: string; count: number }>;
  };
  topPackages: Array<{ name: string; bookings: number; revenue: number }>;
  topDestinations: Array<{ name: string; bookings: number }>;
  paymentMethods: Array<{ method: string; count: number; percentage: number }>;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("12months");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: {
      total: 4850000,
      growth: 15.3,
      monthly: [
        { month: "Jan", amount: 350000 },
        { month: "Feb", amount: 420000 },
        { month: "Mar", amount: 380000 },
        { month: "Apr", amount: 450000 },
        { month: "May", amount: 520000 },
        { month: "Jun", amount: 480000 },
        { month: "Jul", amount: 550000 },
        { month: "Aug", amount: 490000 },
        { month: "Sep", amount: 430000 },
        { month: "Oct", amount: 410000 },
        { month: "Nov", amount: 370000 },
        { month: "Dec", amount: 0 },
      ],
    },
    bookings: {
      total: 287,
      growth: 12.5,
      monthly: [
        { month: "Jan", count: 18 },
        { month: "Feb", count: 24 },
        { month: "Mar", count: 22 },
        { month: "Apr", count: 28 },
        { month: "May", count: 32 },
        { month: "Jun", count: 29 },
        { month: "Jul", count: 35 },
        { month: "Aug", count: 30 },
        { month: "Sep", count: 26 },
        { month: "Oct", count: 25 },
        { month: "Nov", count: 18 },
        { month: "Dec", count: 0 },
      ],
    },
    users: {
      total: 1247,
      growth: 18.7,
      newUsers: [
        { month: "Jan", count: 42 },
        { month: "Feb", count: 58 },
        { month: "Mar", count: 51 },
        { month: "Apr", count: 67 },
        { month: "May", count: 73 },
        { month: "Jun", count: 69 },
        { month: "Jul", count: 82 },
        { month: "Aug", count: 76 },
        { month: "Sep", count: 64 },
        { month: "Oct", count: 61 },
        { month: "Nov", count: 54 },
        { month: "Dec", count: 0 },
      ],
    },
    topPackages: [
      { name: "Masai Mara Safari", bookings: 45, revenue: 890000 },
      { name: "Zanzibar Beach Escape", bookings: 38, revenue: 720000 },
      { name: "Mt. Kenya Expedition", bookings: 32, revenue: 650000 },
      { name: "Serengeti Adventure", bookings: 28, revenue: 580000 },
      { name: "Amboseli Wildlife Tour", bookings: 24, revenue: 480000 },
    ],
    topDestinations: [
      { name: "Masai Mara", bookings: 52 },
      { name: "Zanzibar", bookings: 45 },
      { name: "Mt. Kenya", bookings: 38 },
      { name: "Serengeti", bookings: 35 },
      { name: "Amboseli", bookings: 30 },
      { name: "Diani Beach", bookings: 28 },
    ],
    paymentMethods: [
      { method: "M-Pesa", count: 158, percentage: 55 },
      { method: "Card", count: 86, percentage: 30 },
      { method: "Bank Transfer", count: 43, percentage: 15 },
    ],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      const data = await response.json();
      if (data.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    "#06b6d4",
    "#8b5cf6",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#ec4899",
  ];

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Analytics
            </h2>
            <p className="text-slate-400 mt-1 text-xs sm:text-base">
              Track your business performance and insights
            </p>
          </div>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="12months">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                Total Revenue
              </p>
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-400">
              KSh {analytics.revenue.total.toLocaleString()}
            </h3>
            <div className="flex items-center gap-1 mt-2">
              {analytics.revenue.growth >= 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">
                    +{analytics.revenue.growth}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">
                    {analytics.revenue.growth}%
                  </span>
                </>
              )}
              <span className="text-slate-400 text-xs ml-1">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                Total Bookings
              </p>
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-400">
              {analytics.bookings.total}
            </h3>
            <div className="flex items-center gap-1 mt-2">
              {analytics.bookings.growth >= 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">
                    +{analytics.bookings.growth}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">
                    {analytics.bookings.growth}%
                  </span>
                </>
              )}
              <span className="text-slate-400 text-xs ml-1">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                Total Users
              </p>
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-purple-400">
              {analytics.users.total}
            </h3>
            <div className="flex items-center gap-1 mt-2">
              {analytics.users.growth >= 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">
                    +{analytics.users.growth}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">
                    {analytics.users.growth}%
                  </span>
                </>
              )}
              <span className="text-slate-400 text-xs ml-1">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                Avg. Booking Value
              </p>
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-orange-400">
              KSh{" "}
              {Math.round(
                analytics.revenue.total / analytics.bookings.total
              ).toLocaleString()}
            </h3>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">+8.2%</span>
              <span className="text-slate-400 text-xs ml-1">
                vs last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">
              Revenue Overview
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Monthly revenue performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenue.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [
                    `KSh ${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: "#06b6d4", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">
              Bookings Trend
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Monthly booking statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.bookings.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [value, "Bookings"]}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* New Users Chart */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">
              User Growth
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              New user registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.users.newUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number) => [value, "New Users"]}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">
              Payment Methods
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Distribution of payment methods used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percentage }) => `${method} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.paymentMethods.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Packages */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              Top Packages
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Best performing travel packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPackages.map((pkg, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {pkg.name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {pkg.bookings} bookings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-400 font-bold text-sm">
                      KSh {pkg.revenue.toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-xs">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Destinations */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Top Destinations
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Most popular travel destinations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topDestinations.map((dest, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">
                      {dest.name}
                    </p>
                    <div className="mt-1 bg-slate-600/50 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-600"
                        style={{
                          width: `${
                            (dest.bookings /
                              analytics.topDestinations[0].bookings) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">
                      {dest.bookings}
                    </p>
                    <p className="text-slate-400 text-xs">bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-lg sm:text-xl">
            Key Insights
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs sm:text-sm">
            Important metrics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <p className="text-sm font-medium text-white">Peak Month</p>
              </div>
              <p className="text-2xl font-bold text-green-400">July</p>
              <p className="text-xs text-slate-400 mt-1">
                35 bookings, KSh 550K revenue
              </p>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-400" />
                <p className="text-sm font-medium text-white">Best Package</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">Masai Mara</p>
              <p className="text-xs text-slate-400 mt-1">
                45 bookings, KSh 890K revenue
              </p>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <p className="text-sm font-medium text-white">User Growth</p>
              </div>
              <p className="text-2xl font-bold text-purple-400">+18.7%</p>
              <p className="text-xs text-slate-400 mt-1">
                New users this period
              </p>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-lg border-l-4 border-orange-500">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-orange-400" />
                <p className="text-sm font-medium text-white">
                  Conversion Rate
                </p>
              </div>
              <p className="text-2xl font-bold text-orange-400">23%</p>
              <p className="text-xs text-slate-400 mt-1">
                Bookings to visitors ratio
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
