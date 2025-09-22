"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TrendingUp, Settings, Eye } from "lucide-react"
import { AdminStats } from "@/components/admin/AdminStats"
import { BookingsManagement } from "@/components/admin/BookingsManagement"
import { PackagesManagement } from "@/components/admin/PackagesManagement"
import { UsersManagement } from "@/components/admin/UsersManagement"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPackages: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activePackages: 0,
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && user.role === "admin") {
      // Fetch admin stats
      fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.stats) {
            setStats(data.stats)
          }
        })
        .catch(console.error)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-white/70 mt-2">Manage your travel agency operations</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Site
            </Button>
            <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <AdminStats stats={stats} />

        {/* Management Tabs */}
        <Tabs defaultValue="bookings" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
            <TabsTrigger
              value="bookings"
              className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
            >
              Bookings
            </TabsTrigger>
            <TabsTrigger
              value="packages"
              className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
            >
              Packages
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-6">
            <BookingsManagement />
          </TabsContent>

          <TabsContent value="packages" className="mt-6">
            <PackagesManagement />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Analytics & Reports</CardTitle>
                <CardDescription className="text-white/70">Detailed analytics and reporting features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Analytics Coming Soon</h3>
                  <p className="text-white/70">Advanced analytics and reporting features will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
