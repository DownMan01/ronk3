import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import ClientLayout from "@/components/client-layout"
import "./globals.css"

export const metadata: Metadata = {
  title: "Ronke Rice Farmer Calculator",
  description:
    "Calculate your investment cost and potential earnings with the Ronke Rice Farmer Calculator. Built for players and investors to estimate rewards and optimize strategies.",
  authors: [{ name: "jiecrypto0", url: "https://ronke.notedrop.xyz" }],
  keywords: [
    "Ronke Rice Farmer",
    "Investment Calculator",
    "Yield Calculator",
    "Earnings Projection",
    "Crypto Farming Game",
    "ROI Calculator",
  ],
  openGraph: {
    title: "Ronke Rice Farmer Calculator",
    description:
      "Estimate your investment costs and potential earnings with the Ronke Rice Farmer Calculator.",
    url: "https://ronke.notedrop.xyz",
    siteName: "Ronke Rice Farmer",
    images: [
      {
        url: "https://pbs.twimg.com/profile_banners/1920678776981127168/1751107488/1500x500",
        width: 1500,
        height: 500,
        alt: "Ronke Rice Farmer Earnings Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ronke Rice Farmer Calculator",
    description:
      "Easily calculate investment costs and earnings projections with the Ronke Rice Farmer Calculator.",
    images: [
      "https://pbs.twimg.com/profile_banners/1920678776981127168/1751107488/1500x500",
    ],
    creator: "@jiecrypto0",
  },
  themeColor: "#16a34a", // Tailwind green-600
  manifest: "/manifest.json",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Ronke Rice Farmer Calculator",
              url: "https://ronke.notedrop.xyz",
              author: {
                "@type": "Person",
                name: "jiecrypto0",
              },
              description:
                "Calculate your investment costs and potential earnings with the Ronke Rice Farmer Calculator.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "All",
            }),
          }}
        />
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body className="bg-background text-foreground antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
