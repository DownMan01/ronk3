"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Analytics />
      </ThemeProvider>
    </Suspense>
  )
}
