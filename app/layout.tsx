import type React from "react";
import type { Metadata } from "next";
import { Nunito_Sans, Fredoka, Baloo_2 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import "./globals.css";

// Body text font - clean and readable with fallback to fix font override warning
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
  adjustFontFallback: false, // This helps prevent the font override warning
});

// Playful heading font - rounded and friendly
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
});

// Adventure accent font - bold and bubbly for special elements
const baloo2 = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-accent",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
});

// Get the base URL from environment or default
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Kuja Twende Adventures",
    template: "%s | Kuja Twende Adventures",
  },
  description:
    "Premium adventure travel experiences across Kenya. Discover breathtaking destinations, wildlife safaris, and cultural experiences with expert guides.",
  keywords: [
    "Kenya travel",
    "adventure tours",
    "safari",
    "cultural experiences",
    "travel packages",
    "wildlife",
    "Masai Mara",
    "Mount Kenya",
    "beach holidays",
    "eco-tourism",
  ],
  authors: [{ name: "Kuja Twende Adventures" }],
  creator: "Kuja Twende Adventures",
  publisher: "Kuja Twende Adventures",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
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
    url: "/",
    title: "Kuja Twende Adventures",
    description:
      "Premium adventure travel experiences across Kenya. Book your next adventure today!",
    siteName: "Kuja Twende Adventures",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kuja Twende Adventures - Premium Kenya Travel Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuja Twende Adventures",
    description: "Premium adventure travel experiences across Kenya.",
    images: ["/og-image.png"],
    creator: "@kujatwende",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: "/",
  },
  category: "travel",
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
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://vercel.live" />

        {/* Viewport meta for mobile optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="msapplication-TileColor" content="#0a0a0a" />

        {/* Prevent automatic phone number detection */}
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className="font-sans antialiased dark overflow-x-hidden"
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </Suspense>
        <Analytics />

        {/* Add schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              name: "Kuja Twende Adventures",
              description: "Premium adventure travel experiences across Kenya",
              url: getBaseUrl(),
              logo: `${getBaseUrl()}/logo.png`,
              sameAs: [
                // Add your social media URLs here
                "https://facebook.com/kujatwende",
                "https://twitter.com/kujatwende",
                "https://instagram.com/kujatwende"
              ],
              address: {
                "@type": "PostalAddress",
                addressCountry: "KE",
                addressRegion: "Nairobi",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                areaServed: "KE",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
