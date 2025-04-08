"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUserInfo } from "../../context/user-context"

export default function ResidencyPage() {
  const { userInfo, updateUserInfo } = useUserInfo()
  const [primaryResidence, setPrimaryResidence] = useState(userInfo.primaryResidence || "")
  const [currentResidence, setCurrentResidence] = useState(userInfo.currentResidence || "")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (primaryResidence.trim() && currentResidence.trim()) {
      // Save residency info to context and navigate to education page
      updateUserInfo({
        primaryResidence,
        currentResidence,
      })
      router.push("/onboarding/education")
    }
  }

  return (
    <>
      {/* Progress indicators */}
      <div className="flex justify-center gap-2 pt-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step, index) => (
          <div key={index} className={`h-2 w-2 rounded-full ${index <= 2 ? "bg-[#ffffff]" : "bg-[#373737]"}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-10 pt-16 pb-20">
        <label className="mb-8 font-serif text-2xl">your residency</label>

        <div className="w-full space-y-8">
          <div className="space-y-2">
            <label htmlFor="primary" className="block pl-2 text-sm font-mono">
              primary
            </label>
            <input
              id="primary"
              type="text"
              value={primaryResidence}
              onChange={(e) => setPrimaryResidence(e.target.value)}
              className="w-full rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="current" className="block pl-2 text-sm font-mono">
              current
            </label>
            <input
              id="current"
              type="text"
              value={currentResidence}
              onChange={(e) => setCurrentResidence(e.target.value)}
              className="w-full rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-auto pt-16">
          <button
            type="submit"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffffff] text-[#0c0c0c] transition-all hover:bg-opacity-90"
            disabled={!primaryResidence.trim() || !currentResidence.trim()}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </>
  )
}

