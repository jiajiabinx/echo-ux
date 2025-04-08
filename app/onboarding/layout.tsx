"use client"

import type React from "react"
import StarCanvas from "../StarCanvas"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
      {/* Stars background */}
      <div className="absolute inset-0 z-0">
        <StarCanvas />
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center justify-center px-4">
        <div className="w-[480px] rounded-lg border border-[#373737] bg-[#0c0c0c]/80 backdrop-blur-sm">{children}</div>
      </div>
    </main>
  )
}

