import type React from "react"
import { UserDashboardLayout } from "@/components/layout/DashboardLayout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <UserDashboardLayout>{children}</UserDashboardLayout>
}
