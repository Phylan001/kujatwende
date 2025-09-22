import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Fredoka } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
})

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Kuja Twende Adventures - Explore Kenya Like Never Before",
  description:
    "Premium adventure travel experiences across Kenya. Book your next adventure with Kuja Twende Adventures.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${fredoka.variable}`}>
      <body className="font-sans antialiased dark">
        <Suspense fallback={null}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
