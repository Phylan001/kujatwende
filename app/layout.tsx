import type React from "react";
import type { Metadata } from "next";
import { Nunito_Sans, Fredoka, Baloo_2 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import "./globals.css";

// Body text font - clean and readable
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

// Playful heading font - rounded and friendly
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

// Adventure accent font - bold and bubbly for special elements
const baloo2 = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kuja Twende Adventures - Explore Kenya Like Never Before",
  description:
    "Premium adventure travel experiences across Kenya. Discover breathtaking destinations, wildlife safaris, and cultural experiences with expert guides.",
  keywords:
    "Kenya travel, adventure tours, safari, cultural experiences, travel packages, wildlife, Masai Mara, Mount Kenya",
  authors: [{ name: "Kuja Twende Adventures" }],
  creator: "Kuja Twende Adventures",
  publisher: "Kuja Twende Adventures",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kujatwende.com",
    title: "Kuja Twende Adventures - Explore Kenya Like Never Before",
    description:
      "Premium adventure travel experiences across Kenya. Book your next adventure today!",
    siteName: "Kuja Twende Adventures",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kuja Twende Adventures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuja Twende Adventures - Explore Kenya Like Never Before",
    description: "Premium adventure travel experiences across Kenya.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} ${fredoka.variable} ${baloo2.variable}`}
    >
      <body className="font-nunito antialiased dark overflow-x-hidden">
        <Suspense fallback={null}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
