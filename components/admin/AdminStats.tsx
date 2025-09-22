import { Card, CardContent } from "@/components/ui/card"
import { Users, Package, Calendar, CreditCard, Clock, CheckCircle } from "lucide-react"

interface AdminStatsProps {
  stats: {
    totalUsers: number
    totalPackages: number
    totalBookings: number
    totalRevenue: number
    pendingBookings: number
    activePackages: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
    },
    {
      title: "Active Packages",
      value: stats.activePackages.toLocaleString(),
      icon: Package,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      icon: Calendar,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "Total Revenue",
      value: `KSh ${stats.totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
    {
      title: "Pending Bookings",
      value: stats.pendingBookings.toLocaleString(),
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      title: "Completion Rate",
      value: "94%",
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="glass border-white/10 hover:border-cyan-400/30 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
