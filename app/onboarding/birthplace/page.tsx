"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUserInfo } from "../../context/user-context"

export default function BirthPage() {
  const { userInfo, updateUserInfo } = useUserInfo()
  const [birthDate, setBirthDate] = useState(userInfo.birth_date || "")
  const [birthLocation, setBirthLocation] = useState(userInfo.birth_location || "")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (birthLocation.trim()) {
      // Save birth info to context and navigate to residency page
      updateUserInfo({
        birth_date: birthDate.trim() || "",
        birth_location: birthLocation.trim(),
      })
      router.push("/onboarding/residency")
    }
  }

  return (
    <>
      {/* Progress indicators */}
      <div className="flex justify-center gap-2 pt-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step, index) => (
          <div key={index} className={`h-2 w-2 rounded-full ${index <= 1 ? "bg-[#ffffff]" : "bg-[#373737]"}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-10 pt-16 pb-20">
        <label className="mb-8 font-serif text-2xl">your birth</label>

        <div className="w-full space-y-8">
          <div className="space-y-2">
            <label htmlFor="birth-date" className="block pl-2 text-sm font-mono">
              birth date
            </label>
            <input
              id="birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="birth-place" className="block pl-2 text-sm font-mono">
              birth place
            </label>
            <input
              id="birth-place"
              type="text"
              value={birthLocation}
              onChange={(e) => setBirthLocation(e.target.value)}
              className="w-full rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
              autoComplete="off"
              required
            />
          </div>
        </div>

        <div className="mt-auto pt-16">
          <button
            type="submit"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffffff] text-[#0c0c0c] transition-all hover:bg-opacity-90"
            disabled={!birthLocation.trim()}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </>
  )
}

