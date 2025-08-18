"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Globe, Menu, X, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

type Currency = "PHP" | "USD"

interface NavigationProps {
  currency: Currency
  setCurrency: (currency: Currency) => void
  loading: boolean
  onRefresh: () => void
  showBackButton?: boolean
  title?: string
  icon?: React.ReactNode
}

export function Navigation({
  currency,
  setCurrency,
  loading,
  onRefresh,
  showBackButton = false,
  title = "Ronke Rice Farmer Calculator",
  icon = <Calculator className="h-5 w-5 text-primary-foreground" />,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="relative z-20 bg-background/95 backdrop-blur-md border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            {showBackButton && (
              <a
                href="/"
                className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Back</span>
              </a>
            )}
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">{icon}</div>
            <span className="text-lg sm:text-xl font-bold text-foreground truncate">
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">{showBackButton ? "Custom Setup" : "Calculator"}</span>
            </span>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="nav-currency" className="font-semibold text-foreground">
                Currency:
              </Label>
              <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
                <SelectTrigger className="w-36 bg-background border-2 border-border hover:border-primary h-10 text-sm font-semibold rounded-lg transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-0 shadow-xl">
                  <SelectItem value="PHP" className="text-sm font-medium">
                    🇵🇭 PHP
                  </SelectItem>
                  <SelectItem value="USD" className="text-sm font-medium">
                    🇺🇸 USD
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ThemeToggle />
            <Button
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2 hover:bg-primary/90 text-primary-foreground font-medium rounded-full bg-primary"
              size="sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                <span>Refresh</span>
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-semibold text-foreground">Currency:</Label>
                </div>
                <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
                  <SelectTrigger className="w-28 bg-background border-2 border-border hover:border-primary h-9 text-sm font-semibold rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-0 shadow-xl">
                    <SelectItem value="PHP" className="text-sm font-medium">
                      🇵🇭 PHP
                    </SelectItem>
                    <SelectItem value="USD" className="text-sm font-medium">
                      🇺🇸 USD
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => {
                  onRefresh()
                  setMobileMenuOpen(false)
                }}
                disabled={loading}
                className="w-full px-4 py-2 hover:bg-primary/90 text-primary-foreground font-medium rounded-lg bg-primary"
                size="sm"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground"></div>
                    <span>Updating Prices...</span>
                  </div>
                ) : (
                  <span>Refresh Prices</span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
