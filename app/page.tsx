"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Coins, Calendar, Star } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface TokenPrice {
  ronke?: { php: number; usd: number }
  "rice-2"?: { php: number; usd: number }
}

type Currency = "PHP" | "USD"

const FARM_TIERS = {
  1: {
    name: "Tier 1 Farm",
    landCost: 29000,
    farmerCost: 600,
    farmersCount: 4,
    waterUse: "100/100",
    yieldRate: 850,
    description: "Entry-level farm with basic yield for beginner",
    idealFarmers: "3x Expert + 1x Free",
  },
  2: {
    name: "Tier 2 Farm",
    landCost: 72500,
    farmerCost: 2000,
    farmersCount: 6,
    waterUse: "300/300",
    yieldRate: 2750,
    description: "Advanced farm with higher yield and capacity",
    idealFarmers: "5x Master",
  },
  3: {
    name: "Tier 3 Farm",
    landCost: 188500,
    farmerCost: 3800,
    waterUse: "600/600",
    farmersCount: 8,
    yieldRate: 5300,
    description: "Premium farm with maximum yield potential",
    idealFarmers: "2x Legendary + 6x Master",
  },
}

const FARMER_TYPES = {
  basic: { name: "Basic Farmer", cost: 0, tier: "Free" },
  expert: { name: "Expert Farmer", cost: 200, tier: "Tier 1" },
  master: { name: "Master Farmer", cost: 400, tier: "Tier 2" },
  legendary: { name: "Legendary Farmer", cost: 700, tier: "Tier 3" },
}

const FARMING_FORMULA = {
  totalDailyReward: 148408.65,
  totalNetworkYield: 1705310,
}

export default function InvestmentCalculator() {
  const [prices, setPrices] = useState<TokenPrice>({})
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(1)
  const [customNetworkYield, setCustomNetworkYield] = useState(FARMING_FORMULA.totalNetworkYield)
  const [currency, setCurrency] = useState<Currency>("PHP")
  const [converterAmount, setConverterAmount] = useState(1)
  const [converterToken, setConverterToken] = useState<"RICE" | "RONKE">("RICE")
  const [converterCurrency, setConverterCurrency] = useState<Currency>("PHP")
  const [riceAmount, setRiceAmount] = useState(0)

  const currentTier = FARM_TIERS[selectedTier]

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const [ronkeResponse, riceResponse, usdPhpResponse] = await Promise.all([
        fetch("https://api.geckoterminal.com/api/v2/networks/ronin/pools/0x75ae353997242927c701d4d6c2722ebef43fd2d3"),
        fetch("https://api.geckoterminal.com/api/v2/networks/ronin/pools/0x686e0f38b86a169041df554d96738bf3adb5a21f"),
        fetch("https://api.exchangerate-api.com/v4/latest/USD"),
      ])

      const ronkeData = await ronkeResponse.json()
      const riceData = await riceResponse.json()
      const usdPhpData = await usdPhpResponse.json()

      const ronkeUsdPrice = Number.parseFloat(ronkeData.data.attributes.base_token_price_usd)
      const riceUsdPrice = Number.parseFloat(riceData.data.attributes.base_token_price_usd)
      const usdToPhp = usdPhpData.rates.PHP

      setPrices({
        ronke: { php: ronkeUsdPrice * usdToPhp, usd: ronkeUsdPrice },
        "rice-2": { php: riceUsdPrice * usdToPhp, usd: riceUsdPrice },
      })
    } catch (error) {
      console.error("Error fetching prices:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateInvestment = (riceQty: number, ronkeQty: number) => {
    if (
      !prices.ronke?.[currency.toLowerCase() as keyof typeof prices.ronke] ||
      !prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]]
    )
      return 0

    const ricePrice = currency === "PHP" ? prices["rice-2"].php : prices["rice-2"].usd
    const ronkePrice = currency === "PHP" ? prices.ronke.php : prices.ronke.usd

    const riceInvestment = riceQty * ricePrice
    const ronkeInvestment = ronkeQty * ronkePrice

    return riceInvestment + ronkeInvestment
  }

  const calculateConversion = () => {
    const tokenPrice =
      converterToken === "RICE"
        ? prices["rice-2"]?.[converterCurrency.toLowerCase() as keyof (typeof prices)["rice-2"]]
        : prices.ronke?.[converterCurrency.toLowerCase() as keyof typeof prices.ronke]

    if (!tokenPrice) return 0
    return converterAmount * tokenPrice
  }

  const calculateDailyEarnings = (playerYield?: number) => {
    const ricePrice =
      currency === "PHP"
        ? prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]]
        : prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]]
    if (!ricePrice) return 0

    const Yi = playerYield || currentTier.yieldRate
    const dailyRiceReward = FARMING_FORMULA.totalDailyReward * (Yi / customNetworkYield)

    return dailyRiceReward * ricePrice
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency === "PHP" ? "en-PH" : "en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: currency === "PHP" ? 6 : 8,
    }).format(amount)
  }

  const farmSetup = calculateInvestment(currentTier.farmerCost, currentTier.landCost)
  const dailyEarnings = calculateDailyEarnings()

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

      <Navigation currency={currency} setCurrency={setCurrency} loading={loading} onRefresh={fetchPrices} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center py-8">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Ronke Rice Farmer Calculator
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Calculate your investment returns for {currentTier.name} with real-time market prices
          </p>
        </div>

        <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Current Market Prices
            </CardTitle>
            <CardDescription>Real-time prices • Updates every 30 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-center">
              <p className="text-sm text-muted-foreground">
                Use this code:{" "}
                <a
                  href="https://ronkericefarmer.com?ref=0NQ0OJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono bg-primary/10 px-2 py-1 rounded-md text-red-600 font-semibold hover:bg-primary/20 transition"
                >
                  0NQ0OJ
                </a>{" "}
                if this site is helpful for you
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Coins className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-lg text-blue-800 dark:text-blue-200">$RICE</span>
                </div>
                {loading ? (
                  <div className="animate-pulse bg-muted h-6 w-24 rounded"></div>
                ) : (
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]]
                      ? formatCurrency(currency === "PHP" ? prices["rice-2"].php : prices["rice-2"].usd)
                      : "Loading..."}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Coins className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span className="font-bold text-lg text-green-800 dark:text-green-200">$RONKE</span>
                </div>
                {loading ? (
                  <div className="animate-pulse bg-muted h-6 w-24 rounded"></div>
                ) : (
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {prices.ronke?.[currency.toLowerCase() as keyof typeof prices.ronke]
                      ? formatCurrency(currency === "PHP" ? prices.ronke.php : prices.ronke.usd)
                      : "Loading..."}
                  </span>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">Token Converter</h3>
              </div>

              <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Input Section */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="converter-amount"
                      className="text-sm font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2"
                    >
                      <Coins className="h-4 w-4" />
                      Enter Amount
                    </Label>
                    <div className="flex shadow-lg">
                      <Input
                        id="converter-amount"
                        type="number"
                        value={converterAmount}
                        onChange={(e) => setConverterAmount(Number(e.target.value) || 0)}
                        className="rounded-r-none border-r-0 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 font-semibold text-lg h-12"
                        min="0"
                        step="0.000001"
                        placeholder="0.00"
                      />
                      <select
                        value={converterToken}
                        onChange={(e) => setConverterToken(e.target.value as "RICE" | "RONKE")}
                        className="px-4 py-3 border border-l-0 rounded-l-none rounded-r-md bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 border-blue-300 dark:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold min-w-[80px] text-xs"
                      >
                        <option value="RICE">RICE</option>
                        <option value="RONKE">RONKE</option>
                      </select>
                    </div>
                  </div>

                  {/* Output Section */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Converted Value
                    </Label>
                    <div className="flex shadow-lg">
                      <div className="flex-1 px-4 py-3 border border-r-0 rounded-l-md bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-100 font-bold text-lg h-12 flex items-center border-green-300 dark:border-green-600">
                        {loading ? (
                          <div className="animate-pulse bg-green-300 dark:bg-green-700 h-5 w-24 rounded"></div>
                        ) : (
                          <span className="truncate">
                            {new Intl.NumberFormat(converterCurrency === "PHP" ? "en-PH" : "en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: converterCurrency === "PHP" ? 4 : 6,
                            }).format(calculateConversion())}
                          </span>
                        )}
                      </div>
                      <select
                        value={converterCurrency}
                        onChange={(e) => setConverterCurrency(e.target.value as Currency)}
                        className="px-4 py-3 border border-l-0 rounded-l-none rounded-r-md bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 border-green-300 dark:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold min-w-[70px] text-xs"
                      >
                        <option value="PHP">PHP</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Exchange Rate Info */}
                <div className="mt-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-center text-gray-600 dark:text-gray-300">
                    {converterToken === "RICE" ? "🌾" : "🪙"} 1 {converterToken} ={" "}
                    {loading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      <span className="font-semibold text-primary">
                        {new Intl.NumberFormat(converterCurrency === "PHP" ? "en-PH" : "en-US", {
                          style: "currency",
                          currency: converterCurrency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: converterCurrency === "PHP" ? 6 : 8,
                        }).format(
                          converterToken === "RICE"
                            ? (converterCurrency === "PHP" ? prices["rice-2"]?.php : prices["rice-2"]?.usd) || 0
                            : (converterCurrency === "PHP" ? prices.ronke?.php : prices.ronke?.usd) || 0,
                        )}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle>Select Farm Tier</CardTitle>
            <CardDescription>Choose between different farm tiers with varying costs and yields</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 text-center">
              <a
                href="/customize-farm"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-primary-foreground font-semibold shadow-lg transition-all duration-300 rounded-full leading-6"
              >
                Customize Setup
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                Need more control? Use our advanced calculator to customize your farm configuration
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Object.entries(FARM_TIERS).map(([tierNum, tier]) => {
                const isSelected = selectedTier === Number(tierNum)
                const totalSetupCost = calculateInvestment(tier.farmerCost, tier.landCost)

                return (
                  <div
                    key={tierNum}
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                    onClick={() => setSelectedTier(Number(tierNum) as 1 | 2 | 3)}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 left-4">
                        <Badge className="bg-primary text-primary-foreground px-3 py-1">✓ Selected</Badge>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Star className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <h3 className={`font-bold text-xl ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {tier.name}
                        </h3>
                      </div>

                      <p className="text-muted-foreground">{tier.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Land Cost:</span>
                          <span className="font-semibold">{tier.landCost.toLocaleString()} $RONKE</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Farmers:</span>
                          <span className="font-semibold">{tier.farmersCount} slots</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Water Use:</span>
                          <span className="font-semibold">{tier.waterUse} per Hour</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hash Rice:</span>
                          <span className="font-semibold text-primary">{tier.yieldRate} Yield Rate</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Setup:</span>
                          <span className="font-semibold">{tier.idealFarmers}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground mb-1">Total Setup Cost</div>
                          <div className="text-xl font-bold text-primary">
                            {prices.ronke?.[currency.toLowerCase() as keyof typeof prices.ronke] &&
                            prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]]
                              ? formatCurrency(totalSetupCost)
                              : "Loading..."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle>Farmer Types & Pricing</CardTitle>
            <CardDescription>Individual farmer costs and tier requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(FARMER_TYPES).map(([key, farmer]) => (
                <div
                  key={key}
                  className="text-center p-4 bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="font-semibold mb-2">{farmer.name}</div>
                  <div className="text-lg font-bold text-primary mb-2">
                    {farmer.cost === 0 ? "FREE" : `${farmer.cost.toLocaleString()} $RICE`}
                  </div>
                  <Badge variant="secondary" className="text-xs text-white">
                    {farmer.tier}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Complete {currentTier.name} Setup
            </CardTitle>
            <CardDescription>Full investment breakdown for land + {currentTier.farmersCount} farmers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4 text-center">
              <p className="text-sm text-muted-foreground">
                Use this code:{" "}
                <a
                  href="https://ronkericefarmer.com?ref=0NQ0OJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono bg-primary/10 px-2 py-1 rounded-md text-red-600 font-semibold hover:bg-primary/20 transition"
                >
                  0NQ0OJ
                </a>{" "}
                if this site is helpful for you
              </p>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>Land ({currentTier.landCost.toLocaleString()} $RONKE):</span>
              <Badge variant="secondary" className="text-base text-white">
                {formatCurrency(
                  currentTier.landCost * (prices.ronke?.[currency.toLowerCase() as keyof typeof prices.ronke] || 0),
                )}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span>
                {currentTier.farmersCount} Farmers ({currentTier.idealFarmers}):
              </span>
              <Badge variant="secondary" className="text-base text-white">
                {formatCurrency(
                  currentTier.farmerCost *
                    (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                )}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
              <span className="text-lg font-bold">Total Farm Investment:</span>
              <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
                {formatCurrency(farmSetup)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Daily $RICE Earnings
            </CardTitle>
            <CardDescription>Based on farming formula with {currentTier.yieldRate} yield rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-red-800 dark:text-red-400 mb-1 font-bold text-sm leading-7">Important Notice</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    The <strong>Current Network Yield Rate</strong> changes as players join/leave. Enter your current
                    rate from game stats for accurate earnings.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4 mb-6">
              <Label htmlFor="network-yield" className="text-lg font-bold text-center text-foreground mb-2">
                Input The Current Network Yield Rate:
              </Label>
              <div className="w-full max-w-md">
                <Input
                  id="network-yield"
                  type="number"
                  value={customNetworkYield}
                  onChange={(e) => setCustomNetworkYield(Number(e.target.value) || FARMING_FORMULA.totalNetworkYield)}
                  className="text-center text-lg font-semibold h-12 border-2 border-primary/30 focus:border-primary rounded-lg shadow-sm"
                  placeholder="Enter current network yield rate from your game"
                />
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Rd = {FARMING_FORMULA.totalDailyReward.toLocaleString()} (total daily reward pool)
                </div>
              </div>
            </div>

            <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {formatCurrency(dailyEarnings)}
              </div>
              <div className="text-sm text-slate-600">
                {(FARMING_FORMULA.totalDailyReward * (currentTier.yieldRate / customNetworkYield)).toFixed(3)} $RICE per
                day
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Earnings Over Time
            </CardTitle>
            <CardDescription>Projected earnings based on daily $RICE generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[3, 7, 15, 30].map((days) => (
                <div key={days} className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="text-lg sm:text-xl font-bold text-accent mb-1 break-words">
                    {formatCurrency(dailyEarnings * days)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {days} day{days > 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              $RICE Withdrawal Calculator
            </CardTitle>
            <CardDescription>Calculate withdrawal penalties based on your $RICE amount</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Input field for max $RICE amount */}
            <div className="space-y-6">
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-red-800 dark:text-red-400 mb-1 font-bold text-sm">Penalty Notice</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {
                        "Withdrawal penalties apply to all $RICE, even if not farmed. They remain in effect regardless of how tokens were obtained."
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rice-amount" className="text-sm font-medium">
                  Your Total $RICE Amount
                </Label>
                <Input
                  id="rice-amount"
                  type="number"
                  value={riceAmount}
                  onChange={(e) => setRiceAmount(Number(e.target.value) || 0)}
                  className="text-lg font-semibold h-12 border-2 border-primary/30 focus:border-primary"
                  placeholder="Enter your total $RICE amount"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Penalty Tiers Display */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground border-b border-border pb-2">Penalty Tiers</h4>

                <div className="space-y-3">
                  {/* 80% or more - 15-day penalty */}
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-red-800 dark:text-red-200">Withdrawals of 80% or more</span>
                      <Badge variant="destructive">15-day penalty</Badge>
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      Amount: <span className="font-semibold">{(riceAmount * 0.8).toFixed(2)} $RICE</span>
                      {riceAmount > 0 && (
                        <span className="ml-2">
                          (
                          {formatCurrency(
                            riceAmount *
                              0.8 *
                              (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                          )}
                          )
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 60-79% - 12-day penalty */}
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-orange-800 dark:text-orange-200">Withdrawals of 60-79%</span>
                      <Badge className="bg-orange-500 text-white">12-day penalty</Badge>
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      Amount:{" "}
                      <span className="font-semibold">
                        {(riceAmount * 0.6).toFixed(2)} - {(riceAmount * 0.79).toFixed(2)} $RICE
                      </span>
                      {riceAmount > 0 && (
                        <span className="ml-2">
                          (
                          {formatCurrency(
                            riceAmount *
                              0.6 *
                              (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                          )}{" "}
                          -{" "}
                          {formatCurrency(
                            riceAmount *
                              0.79 *
                              (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                          )}
                          )
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 40-59% - 9-day penalty */}
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">Withdrawals of 40-59%</span>
                      <Badge className="bg-yellow-500 text-white">9-day penalty</Badge>
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      Amount:{" "}
                      <span className="font-semibold">
                        {(riceAmount * 0.4).toFixed(2)} - {(riceAmount * 0.59).toFixed(2)} $RICE
                      </span>
                      {riceAmount > 0 && (
                        <span className="ml-2">
                          (
                          {formatCurrency(
                            riceAmount *
                              0.4 *
                              (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                          )}{" "}
                          -{" "}
                          {formatCurrency(
                            riceAmount *
                              0.59 *
                              (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                          )}
                          )
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 0.69% or above - 5-day penalty */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-blue-800 dark:text-blue-200">Withdrawals 0.69% or above</span>
                      <Badge className="bg-blue-500 text-white">5-day penalty</Badge>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      Amount:{" "}
                      <span className="font-semibold">
                        {(riceAmount * 0.0069).toFixed(2)} - {(riceAmount * 0.39).toFixed(2)} $RICE
                      </span>
                      {riceAmount > 0 && (
                        <span className="ml-2">
                          (
                          {formatCurrency(
                            riceAmount *
                              0.0069 *
                              (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                          )}{" "}
                          -{" "}
                          {formatCurrency(
                            riceAmount *
                              0.39 *
                              (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                          )}
                          )
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Below 0.69% - no penalty */}
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-green-800 dark:text-green-200">Withdrawals below 0.69%</span>
                      <Badge className="bg-green-500 text-white">No penalty</Badge>
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      Amount: <span className="font-semibold">Up to {(riceAmount * 0.0068).toFixed(2)} $RICE</span>
                      {riceAmount > 0 && (
                        <span className="ml-2">
                          (
                          {formatCurrency(
                            riceAmount *
                              0.0068 *
                              (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                          )}
                          )
                        </span>
                      )}
                    </div>
                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>Daily Limit:</strong> No penalty withdrawals are limited to 5 times per day only
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {riceAmount > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg border">
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <h6 className="font-semibold text-red-800 dark:text-red-200 mb-1">Penalty Warning</h6>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            While under penalty (in "jail"), the user's farming production rate is reduced to zero. No
                            $RICE can be earned during the penalty period.
                          </p>
                        </div>
                      </div>
                    </div>

                    <h5 className="font-semibold mb-2">Withdrawal Summary</h5>
                    <div className="text-sm space-y-1">
                      <div>
                        Total $RICE: <span className="font-semibold">{riceAmount.toFixed(2)} $RICE</span>
                      </div>
                      <div>
                        Total Value:{" "}
                        <span className="font-semibold">
                          {formatCurrency(
                            riceAmount *
                              (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        * Penalty days apply to farming activities after withdrawal
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8">
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
                className="font-mono text-red-600 hover:text-red-600/80 transition-colors underline decoration-dotted"
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
