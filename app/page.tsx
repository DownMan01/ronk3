"use client"

import { Wrench, Sparkles, Clock } from "lucide-react"

export default function MaintenanceMode() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://ronkericefarmer.com/assets/images/bg_layout.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-card/95 backdrop-blur-md shadow-2xl rounded-2xl p-8 md:p-12 border-2 border-primary/20">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-primary to-primary/60 p-6 rounded-full">
                <Wrench className="h-16 w-16 text-primary-foreground animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
             Under Maintenance
          </h1>

          {/* Main Message */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-6 border border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Preparing for New Features
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We're currently upgrading the calculator to bring you <span className="font-semibold text-primary">new ways to maximize your earnings</span> in Ronke Rice Farmer!
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <span>Expected to be back online soon</span>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                Use this code:{" "}
                <a
                  href="https://ronkericefarmer.com/connect?ref=0NQ0OJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono bg-primary/10 px-2 py-1 rounded-md text-red-600 font-semibold hover:bg-primary/20 transition"
                >
                  0NQ0OJ
                </a>{" "}
                when you start playing
              </p>
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full font-semibold shadow-lg">
              <Sparkles className="h-5 w-5" />
              <span>Enhanced Earning Strategies Coming Soon</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Thank you for your patience!
            </p>
            <p className="text-center text-xs text-muted-foreground mt-2">
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
