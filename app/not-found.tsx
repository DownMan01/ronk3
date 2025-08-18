"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AlertTriangle, Home, Calculator } from "lucide-react"
import { useState } from "react"

type Currency = "PHP" | "USD"

export default function NotFound() {
  const [currency, setCurrency] = useState<Currency>("PHP")
  const [loading, setLoading] = useState(false)

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://ronkericefarmer.com/assets/images/bg_layout.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70 dark:from-black/80 dark:via-black/70 dark:to-black/90 backdrop-blur-md dark:backdrop-blur-lg"></div>

      <Navigation currency={currency} setCurrency={setCurrency} loading={loading} onRefresh={handleRefresh} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <Card className="bg-card/95 backdrop-blur-md shadow-xl max-w-2xl w-full">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-16 w-16 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-6xl font-bold text-destructive mb-4">404</CardTitle>
              <CardDescription className="text-xl text-muted-foreground">This page could not be found.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <p className="text-lg text-foreground">The page you're looking for doesn't exist or has been moved.</p>
                <p className="text-muted-foreground">
                  Don't worry! You can return to our calculator to continue managing your Ronke Rice Farmer investments.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <a href="/" className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Go Home
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="/customize-farm" className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Custom Calculator
                  </a>
                </Button>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Need help? Contact us or return to the main calculator to continue your farming calculations.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="border-t border-border mt-8 pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-white/90 dark:text-gray-200">
              © 2025 Ronke Rice Farmer Calculator • Built with ❤️ for the Ronke Rice Farmer community
            </p>
            <p className="text-xs text-white/80 dark:text-gray-300">
              Donations:{" "}
              <a
                href="https://etherscan.io/address/0x17f016c583061e260435ec7AC8302B67c04b4Cde"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary hover:text-primary/80 transition-colors underline decoration-dotted"
              >
                0x17f016c583061e260435ec7AC8302B67c04b4Cde
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
