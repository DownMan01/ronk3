"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Coins, Settings, Plus, Minus, Star } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface TokenPrice {
  ronke?: { php: number; usd: number }
  "rice-2"?: { php: number; usd: number }
}

type Currency = "PHP" | "USD"

const FARMER_TYPES = {
  basic: { name: "Basic Farmer", cost: 0, tier: "Free", yieldRate: 100, allowedTiers: [1, 2, 3], waterUsage: 10 },
  expert: { name: "Expert Farmer", cost: 200, tier: "Tier 1", yieldRate: 250, allowedTiers: [1, 2, 3], waterUsage: 30 },
  master: { name: "Master Farmer", cost: 400, tier: "Tier 2", yieldRate: 550, allowedTiers: [2, 3], waterUsage: 60 },
  legendary: {
    name: "Legendary Farmer",
    cost: 700,
    tier: "Tier 3",
    yieldRate: 1000,
    allowedTiers: [3],
    waterUsage: 120,
  },
}

const LAND_TIERS = {
  1: { cost: 29000, slots: 4, name: "Tier 1 Land", allowedFarmers: ["basic", "expert"], waterCapacity: 100 },
  2: { cost: 72500, slots: 6, name: "Tier 2 Land", allowedFarmers: ["basic", "expert", "master"], waterCapacity: 300 },
  3: {
    cost: 188500,
    slots: 8,
    name: "Tier 3 Land",
    allowedFarmers: ["basic", "expert", "master", "legendary"],
    waterCapacity: 600,
  },
}

const FARMING_FORMULA = {
  totalDailyReward: 163249.52,
  totalNetworkYield: 2222510,
}

const NFT_MULTIPLIERS = {
  standard: [
    { count: 5, multiplier: 1.2 },
    { count: 10, multiplier: 1.3 },
    { count: 15, multiplier: 1.4 },
    { count: 25, multiplier: 1.5 },
  ],
  oneOfOne: [
    { count: 1, multiplier: 1.2 },
    { count: 3, multiplier: 1.3 },
    { count: 5, multiplier: 1.4 },
    { count: 8, multiplier: 1.5 },
  ],
}

export default function CustomSetupPage() {
  const [prices, setPrices] = useState<TokenPrice>({})
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState<Currency>("PHP")

  const [currentLandTier, setCurrentLandTier] = useState(1)
  const [farmerCounts, setFarmerCounts] = useState({
    basic: 1,
    expert: 3,
    master: 0,
    legendary: 0,
  })
  const [customNetworkYield, setCustomNetworkYield] = useState(FARMING_FORMULA.totalNetworkYield)

  const [nftCounts, setNftCounts] = useState({
    standard: 0,
    oneOfOne: 0,
  })

  const [selectedDays, setSelectedDays] = useState(1)

  const getRequiredLandTier = () => {
    const totalFarmers = Object.values(farmerCounts).reduce((sum, count) => sum + count, 0)
    const hasLegendary = farmerCounts.legendary > 0
    const hasMaster = farmerCounts.master > 0
    const hasBasic = farmerCounts.basic > 0

    let minTierByFarmers = 1
    if (hasLegendary) minTierByFarmers = 3
    else if (hasMaster) minTierByFarmers = 2
    else if (hasBasic && !hasMaster && !hasLegendary) minTierByFarmers = 1

    let minTierBySlots = 1
    if (totalFarmers > 6) minTierBySlots = 3
    else if (totalFarmers > 4) minTierBySlots = 2

    return Math.max(minTierByFarmers, minTierBySlots)
  }

  useEffect(() => {
    const requiredTier = getRequiredLandTier()
    if (requiredTier > currentLandTier) {
      setCurrentLandTier(requiredTier)
    }
  }, [farmerCounts])

  const calculateTotalYieldRate = () => {
    return Object.entries(farmerCounts).reduce((total, [type, count]) => {
      const farmerType = FARMER_TYPES[type as keyof typeof FARMER_TYPES]
      return total + farmerType.yieldRate * count
    }, 0)
  }

  const customYieldRate = calculateTotalYieldRate()

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

  const calculateTotalFarmerCost = () => {
    return Object.entries(farmerCounts).reduce((total, [type, count]) => {
      const farmerType = FARMER_TYPES[type as keyof typeof FARMER_TYPES]
      return total + farmerType.cost * count
    }, 0)
  }

  const calculateTotalInvestment = () => {
    if (
      !prices.ronke?.[currency.toLowerCase() as keyof typeof prices.ronke] ||
      !prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]]
    )
      return 0

    const ricePrice = currency === "PHP" ? prices["rice-2"].php : prices["rice-2"].usd
    const ronkePrice = currency === "PHP" ? prices.ronke.php : prices.ronke.usd

    const totalFarmerCost = calculateTotalFarmerCost()
    const riceInvestment = totalFarmerCost * ricePrice
    const ronkeInvestment = LAND_TIERS[currentLandTier as keyof typeof LAND_TIERS].cost * ronkePrice

    return riceInvestment + ronkeInvestment
  }

  const calculateNftMultiplier = () => {
    let standardMultiplier = 1.0
    let oneOfOneMultiplier = 1.0

    // Calculate Standard ronke NFT multiplier
    for (let i = NFT_MULTIPLIERS.standard.length - 1; i >= 0; i--) {
      const tier = NFT_MULTIPLIERS.standard[i]
      if (nftCounts.standard >= tier.count) {
        standardMultiplier = tier.multiplier
        break
      }
    }

    // Calculate 1/1 Community & 1/1 Ronke NFT multiplier
    for (let i = NFT_MULTIPLIERS.oneOfOne.length - 1; i >= 0; i--) {
      const tier = NFT_MULTIPLIERS.oneOfOne[i]
      if (nftCounts.oneOfOne >= tier.count) {
        oneOfOneMultiplier = tier.multiplier
        break
      }
    }

    return Math.min(standardMultiplier * oneOfOneMultiplier, 1.5)
  }

  const calculateDailyEarnings = () => {
    const ricePrice = currency === "PHP" ? prices["rice-2"]?.php : prices["rice-2"]?.usd
    if (!ricePrice) return 0

    const dailyRiceReward = FARMING_FORMULA.totalDailyReward * (customYieldRate / customNetworkYield)
    const nftMultiplier = calculateNftMultiplier()
    return dailyRiceReward * ricePrice * nftMultiplier
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency === "PHP" ? "en-PH" : "en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: currency === "PHP" ? 6 : 8,
    }).format(amount)
  }

  const calculateTotalWaterUsage = () => {
    return Object.entries(farmerCounts).reduce((total, [type, count]) => {
      const farmerType = FARMER_TYPES[type as keyof typeof FARMER_TYPES]
      return total + farmerType.waterUsage * count
    }, 0)
  }

  const updateFarmerCount = (type: keyof typeof farmerCounts, change: number) => {
    setFarmerCounts((prev) => {
      const newCount = Math.max(0, prev[type] + change)

      if (type === "basic" && newCount > 1) {
        return prev // Don't allow more than 1 Basic Farmer
      }

      const newFarmerCounts = { ...prev, [type]: newCount }
      const newWaterUsage = Object.entries(newFarmerCounts).reduce((total, [farmerType, count]) => {
        const farmer = FARMER_TYPES[farmerType as keyof typeof FARMER_TYPES]
        return total + farmer.waterUsage * count
      }, 0)

      const currentLandData = LAND_TIERS[currentLandTier as keyof typeof LAND_TIERS]
      if (newWaterUsage > currentLandData.waterCapacity) {
        return prev // Don't allow exceeding water capacity
      }

      return newFarmerCounts
    })
  }

  const totalFarmers = Object.values(farmerCounts).reduce((sum, count) => sum + count, 0)
  const totalWaterUsage = calculateTotalWaterUsage()
  const totalInvestment = calculateTotalInvestment()
  const dailyEarnings = calculateDailyEarnings()
  const currentLand = LAND_TIERS[currentLandTier as keyof typeof LAND_TIERS]

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: "url('https://ronkericefarmer.com/assets/images/bg_layout.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navigation
        currency={currency}
        setCurrency={setCurrency}
        loading={loading}
        onRefresh={fetchPrices}
        showBackButton={true}
        title="Custom Farm Setup"
        icon={<Settings className="h-5 w-5 text-primary-foreground" />}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70 dark:from-black/80 dark:via-black/70 dark:to-black/90 backdrop-blur-md dark:backdrop-blur-lg"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center py-8">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">Custom Farm Setup</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Customize your farm configuration and calculate investment returns with real-time prices
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
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/95 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle>Land Configuration</CardTitle>
              <CardDescription>Automatically adjusted based on farmer configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-400">{currentLand.name}</div>
                    <div className="text-sm text-gray-600">
                      {currentLand.slots} slots • {currentLand.cost.toLocaleString()} $RONKE
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                      Water: {totalWaterUsage}L / {currentLand.waterCapacity}L
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">Auto-Selected</Badge>
                </div>
                <div className="text-xs text-gray-600">
                  Supports:{" "}
                  {currentLand.allowedFarmers
                    .map((type) => FARMER_TYPES[type as keyof typeof FARMER_TYPES].name)
                    .join(", ")}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Water Usage</span>
                    <span>{Math.round((totalWaterUsage / currentLand.waterCapacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        totalWaterUsage > currentLand.waterCapacity * 0.8
                          ? "bg-red-500"
                          : totalWaterUsage > currentLand.waterCapacity * 0.6
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                      }`}
                      style={{ width: `${Math.min((totalWaterUsage / currentLand.waterCapacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Manual Land Tier Selection (Optional)</Label>
                <Select value={currentLandTier.toString()} onValueChange={(value) => setCurrentLandTier(Number(value))}>
                  <SelectTrigger className="w-full bg-background border-border hover:border-primary focus:border-primary transition-colors">
                    <SelectValue placeholder="Select land tier" />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {Object.entries(LAND_TIERS).map(([tier, data]) => {
                      const requiredTier = getRequiredLandTier()
                      const isDisabled = Number(tier) < requiredTier
                      return (
                        <SelectItem key={tier} value={tier} disabled={isDisabled}>
                          {data.name} - {data.cost.toLocaleString()} $RONKE
                          {isDisabled && " (Insufficient for current farmers)"}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {currentLandTier < getRequiredLandTier() && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    ⚠️ Current farmers require at least{" "}
                    {LAND_TIERS[getRequiredLandTier() as keyof typeof LAND_TIERS].name}
                  </div>
                )}
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Land Investment:</div>
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(
                    currentLand.cost * (prices.ronke?.[currency.toLowerCase() as keyof typeof prices.ronke] || 0),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/95 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle>Yield Configuration</CardTitle>
              <CardDescription>Automated yield rate based on farmer configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Your Yield Rate (Automated)</Label>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {customYieldRate.toLocaleString()}
                  </div>
                  <div className="text-sm mt-1 text-slate-600">Calculated from your farmer configuration</div>
                  <div className="text-xs mt-2 text-slate-600">
                    {Object.entries(farmerCounts)
                      .filter(([, count]) => count > 0)
                      .map(([type, count]) => {
                        const farmer = FARMER_TYPES[type as keyof typeof FARMER_TYPES]
                        return `${count}x ${farmer.name} (${farmer.yieldRate * count} yield)`
                      })
                      .join(" + ")}
                  </div>
                </div>
              </div>
              <div>
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
                      <h4 className="text-red-800 dark:text-red-400 mb-1 font-bold text-sm">Important Notice</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Total network yield changes as farmers join/leave. Enter the current yield manually to ensure
                        accurate calculations.
                      </p>
                    </div>
                  </div>
                </div>

                <Label htmlFor="network-yield" className="text-sm font-medium mb-2 block">
                  Total Network Yield:
                </Label>
                <Input
                  id="network-yield"
                  type="number"
                  value={customNetworkYield}
                  onChange={(e) => setCustomNetworkYield(Number(e.target.value) || FARMING_FORMULA.totalNetworkYield)}
                  className="w-full text-foreground border-black"
                  placeholder="Enter network yield"
                />
              </div>
            </CardContent>
          </Card>
        </div>

                <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardContent className="p-6">
            <div
              dangerouslySetInnerHTML={{
                __html: `<script async="async" data-cfasync="false" src="//pl27596728.revenuecpmgate.com/37ae4c1f685b8f0bee4953022c6d2c65/invoke.js"></script>
<div id="container-37ae4c1f685b8f0bee4953022c6d2c65"></div>`,
              }}
            />
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle>Farmer Configuration</CardTitle>
            <CardDescription>
              Customize your farmer setup • Total: {totalFarmers}/{currentLand.slots} farmers • Water: {totalWaterUsage}
              L/{currentLand.waterCapacity}L • Yield: {customYieldRate.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(FARMER_TYPES).map(([key, farmer]) => {
                const isAllowed = currentLand.allowedFarmers.includes(key)
                const isOverCapacity = totalFarmers >= currentLand.slots
                const isBasicFarmerAtLimit = key === "basic" && farmerCounts.basic >= 1

                const wouldExceedWaterLimit = () => {
                  const newWaterUsage = totalWaterUsage + farmer.waterUsage
                  return newWaterUsage > currentLand.waterCapacity
                }

                return (
                  <div
                    key={key}
                    className={`p-3 sm:p-4 rounded-lg border ${!isAllowed ? "bg-muted opacity-60" : "bg-muted"}`}
                  >
                    <div className="text-center mb-3 space-y-1">
                      <div className="font-semibold text-sm sm:text-base mb-1 leading-tight">{farmer.name}</div>
                      <div className="text-xs sm:text-sm font-bold text-primary mb-1">
                        {farmer.cost === 0 ? "FREE" : `${farmer.cost.toLocaleString()} $RICE`}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">
                        {farmer.yieldRate} Yield Rate
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">
                        {farmer.waterUsage}L Water Usage
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {farmer.tier}
                        </Badge>
                        {key === "basic" && (
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            Limit: 1 per farm
                          </Badge>
                        )}
                        {!isAllowed && (
                          <Badge variant="destructive" className="text-xs text-center leading-tight">
                            Not allowed on {currentLand.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateFarmerCount(key as keyof typeof farmerCounts, -1)}
                        disabled={farmerCounts[key as keyof typeof farmerCounts] === 0 || !isAllowed}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <span className="text-lg sm:text-xl font-bold w-6 sm:w-8 text-center">
                        {farmerCounts[key as keyof typeof farmerCounts]}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateFarmerCount(key as keyof typeof farmerCounts, 1)}
                        disabled={!isAllowed || isOverCapacity || isBasicFarmerAtLimit || wouldExceedWaterLimit()}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    {isBasicFarmerAtLimit && isAllowed && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 text-center leading-tight">
                        Basic Farmer limit reached
                      </div>
                    )}
                    {wouldExceedWaterLimit() && isAllowed && !isBasicFarmerAtLimit && (
                      <div className="text-xs text-red-600 dark:text-red-400 text-center leading-tight">
                        Water limit exceeded
                      </div>
                    )}
                    {isOverCapacity && isAllowed && !isBasicFarmerAtLimit && !wouldExceedWaterLimit() && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 text-center leading-tight">
                        Land at capacity
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              NFT Farming Multiplier Configuration
            </CardTitle>
            <CardDescription>
              Boost your farming earnings with NFTs • Current Multiplier: {calculateNftMultiplier().toFixed(1)}x
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Standard ronke NFT Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-foreground">Standard Ronke NFT</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="standard-nft" className="text-sm font-medium">
                    Number of Standard Ronke NFTs:
                  </Label>
                  <Input
                    id="standard-nft"
                    type="number"
                    min="0"
                    value={nftCounts.standard}
                    onChange={(e) =>
                      setNftCounts((prev) => ({ ...prev, standard: Math.max(0, Number(e.target.value) || 0) }))
                    }
                    className="w-full text-foreground border-border"
                    placeholder="Enter number of Standard ronke NFTs"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Multiplier Tiers:</h4>
                  <div className="space-y-1 text-sm">
                    {NFT_MULTIPLIERS.standard.map((tier, index) => (
                      <div
                        key={index}
                        className={`flex justify-between ${nftCounts.standard >= tier.count ? "text-blue-700 dark:text-blue-300 font-semibold" : "text-blue-600 dark:text-blue-400"}`}
                      >
                        <span>{tier.count} NFTs:</span>
                        <span>
                          {tier.multiplier}x Multiplier {nftCounts.standard >= tier.count ? "✓" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1/1 Community & 1/1 Ronke NFT Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-foreground">1/1 Community & 1/1 Ronke NFTs</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oneofone-nft" className="text-sm font-medium">
                    Number of 1/1 Community & 1/1 Ronke NFTs:
                  </Label>
                  <Input
                    id="oneofone-nft"
                    type="number"
                    min="0"
                    value={nftCounts.oneOfOne}
                    onChange={(e) =>
                      setNftCounts((prev) => ({ ...prev, oneOfOne: Math.max(0, Number(e.target.value) || 0) }))
                    }
                    className="w-full text-foreground border-border"
                    placeholder="Enter number of 1/1 NFTs"
                  />
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Multiplier Tiers:</h4>
                  <div className="space-y-1 text-sm">
                    {NFT_MULTIPLIERS.oneOfOne.map((tier, index) => (
                      <div
                        key={index}
                        className={`flex justify-between ${nftCounts.oneOfOne >= tier.count ? "text-purple-700 dark:text-purple-300 font-semibold" : "text-purple-600 dark:text-purple-400"}`}
                      >
                        <span>
                          {tier.count} NFT{tier.count > 1 ? "s" : ""}:
                        </span>
                        <span>
                          {tier.multiplier}x Multiplier {nftCounts.oneOfOne >= tier.count ? "✓" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Multiplier Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  Active Farming Multiplier
                </h4>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {calculateNftMultiplier().toFixed(1)}x
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {calculateNftMultiplier() > 1.0
                    ? `Your NFTs are boosting your farming earnings by ${((calculateNftMultiplier() - 1) * 100).toFixed(0)}%!`
                    : "Add NFTs to boost your farming earnings"}
                </p>
                {calculateNftMultiplier() > 1.0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Note: NFT multipliers stack multiplicatively (max 1.5x boost)!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

                <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardContent className="p-6">
            <div
              dangerouslySetInnerHTML={{
                __html: `<script async="async" data-cfasync="false" src="//pl27596728.revenuecpmgate.com/37ae4c1f685b8f0bee4953022c6d2c65/invoke.js"></script>
<div id="container-37ae4c1f685b8f0bee4953022c6d2c65"></div>`,
              }}
            />
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader>
            <CardTitle>Investment Summary and Earnings Projection</CardTitle>
            <CardDescription>
              Complete investment breakdown and earnings projections
              {calculateNftMultiplier() > 1.0 && ` • Boosted by ${calculateNftMultiplier().toFixed(1)}x NFT multiplier`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Investment Summary Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Investment Breakdown
              </h3>

              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span>Land ({currentLand.cost.toLocaleString()} $RONKE):</span>
                <Badge variant="secondary" className="text-base text-white">
                  {formatCurrency(
                    currentLand.cost * (prices.ronke?.[currency.toLowerCase() as keyof typeof prices.ronke] || 0),
                  )}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span>Farmers ({calculateTotalFarmerCost().toLocaleString()} $RICE):</span>
                <Badge variant="secondary" className="text-base text-white">
                  {formatCurrency(
                    calculateTotalFarmerCost() *
                      (prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]] || 0),
                  )}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg">
                <span className="text-lg font-bold">Total Investment:</span>
                <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
                  {formatCurrency(totalInvestment)}
                </Badge>
              </div>
              <div className="mb-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Use this code:{" "}
                  <a
                    href="https://ronkericefarmer.com/connect?ref=0NQ0OJ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    0NQ0OJ
                  </a>{" "}
                  if this site is helpful for you
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Earnings Projection Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Earnings Projection</h3>

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
                    <h4 className="text-red-800 dark:text-red-400 mb-1 font-bold text-sm">Earnings Disclaimer</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Earnings projections are estimates only and may vary depending on market conditions and network
                      yield fluctuations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Label
                  htmlFor="projection-days"
                  className="text-sm font-medium text-blue-800 dark:text-blue-200 block mb-2"
                >
                  Projection Period (days):
                </Label>
                <Input
                  id="projection-days"
                  type="number"
                  min="1"
                  max="365"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
                  className="w-full border-blue-300 dark:border-blue-700"
                  placeholder="Enter number of days (1-365)"
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-foreground mb-3">
                  $RICE Per {selectedDays} Day{selectedDays !== 1 ? "s" : ""} Calculation Breakdown
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Daily Network Reward:</span>
                    <span className="font-mono">{FARMING_FORMULA.totalDailyReward.toLocaleString()} $RICE</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Your Yield Rate:</span>
                    <span className="font-mono">{customYieldRate.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Network Yield:</span>
                    <span className="font-mono">{customNetworkYield.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Your Share (%):</span>
                    <span className="font-mono">{((customYieldRate / customNetworkYield) * 100).toFixed(4)}%</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Base $RICE per Day:</span>
                    <span className="font-mono">
                      {(FARMING_FORMULA.totalDailyReward * (customYieldRate / customNetworkYield)).toFixed(3)} $RICE
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Base $RICE for {selectedDays} day{selectedDays !== 1 ? "s" : ""}:
                    </span>
                    <span className="font-mono">
                      {(
                        FARMING_FORMULA.totalDailyReward *
                        (customYieldRate / customNetworkYield) *
                        selectedDays
                      ).toFixed(3)}{" "}
                      $RICE
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">NFT Multiplier:</span>
                    <span className="font-mono text-green-600 dark:text-green-400">
                      {calculateNftMultiplier().toFixed(1)}x
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-semibold">
                    <span>
                      Final $RICE for {selectedDays} day{selectedDays !== 1 ? "s" : ""}:
                    </span>
                    <span className="font-mono text-primary">
                      {(
                        FARMING_FORMULA.totalDailyReward *
                        (customYieldRate / customNetworkYield) *
                        calculateNftMultiplier() *
                        selectedDays
                      ).toFixed(3)}{" "}
                      $RICE
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  Estimated {currency} Earnings for {selectedDays} Day{selectedDays !== 1 ? "s" : ""}
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 dark:text-blue-300">$RICE Price ({currency}):</span>
                    <span className="font-mono">
                      {prices["rice-2"]?.[currency.toLowerCase() as keyof (typeof prices)["rice-2"]]
                        ? formatCurrency(currency === "PHP" ? prices["rice-2"].php : prices["rice-2"].usd)
                        : "Loading..."}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 dark:text-blue-300">
                      Total $RICE Amount ({selectedDays} day{selectedDays !== 1 ? "s" : ""}):
                    </span>
                    <span className="font-mono">
                      {(
                        FARMING_FORMULA.totalDailyReward *
                        (customYieldRate / customNetworkYield) *
                        calculateNftMultiplier() *
                        selectedDays
                      ).toFixed(3)}{" "}
                      $RICE
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-blue-800 dark:text-blue-200">
                      Total {currency} Earnings ({selectedDays} day{selectedDays !== 1 ? "s" : ""}):
                    </span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 text-lg">
                      {formatCurrency(dailyEarnings * selectedDays)}
                    </span>
                  </div>

                  {calculateNftMultiplier() > 1.0 && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      💡 Without NFT boost ({selectedDays} day{selectedDays !== 1 ? "s" : ""}):{" "}
                      {formatCurrency((dailyEarnings / calculateNftMultiplier()) * selectedDays)} • NFT bonus: +
                      {formatCurrency((dailyEarnings - dailyEarnings / calculateNftMultiplier()) * selectedDays)}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold dark:text-green-400 mb-1 text-red-600">
                  {formatCurrency(dailyEarnings * selectedDays)}
                </div>
                <div className="text-sm text-red-400">
                  {(
                    FARMING_FORMULA.totalDailyReward *
                    (customYieldRate / customNetworkYield) *
                    calculateNftMultiplier() *
                    selectedDays
                  ).toFixed(3)}{" "}
                  $RICE for {selectedDays} day{selectedDays !== 1 ? "s" : ""}
                </div>
                {selectedDays > 1 && (
                  <div className="text-xs text-slate-500 mt-1">
                    Daily: {formatCurrency(dailyEarnings)} •{" "}
                    {(
                      FARMING_FORMULA.totalDailyReward *
                      (customYieldRate / customNetworkYield) *
                      calculateNftMultiplier()
                    ).toFixed(3)}{" "}
                    $RICE per day
                  </div>
                )}
                {calculateNftMultiplier() > 1.0 && (
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Base ({selectedDays} day{selectedDays !== 1 ? "s" : ""}):{" "}
                    {formatCurrency((dailyEarnings / calculateNftMultiplier()) * selectedDays)} • NFT Boost: +
                    {((calculateNftMultiplier() - 1) * 100).toFixed(0)}%
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
