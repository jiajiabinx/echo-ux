"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUserInfo } from "../../context/user-context"

const raceOptions = [
  "Asian",
  "Black or African American",
  "Hispanic or Latino",
  "Middle Eastern",
  "Native American or Alaska Native",
  "Native Hawaiian or Pacific Islander",
  "White",
  "Mixed or Multiple",
  "Other",
  "Prefer not to say",
]

export default function RacePage() {
  const { userInfo, updateUserInfo } = useUserInfo()
  const [race, setRace] = useState(userInfo.race || "")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Save race to context and navigate to religion page
    // Since this is optional, we allow empty values
    updateUserInfo({
      race: race || "Not provided",
    })
    router.push("/onboarding/religion")
  }

  return (
    <>
      {/* Progress indicators */}
      <div className="flex justify-center gap-2 pt-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step, index) => (
          <div key={index} className={`h-2 w-2 rounded-full ${index <= 6 ? "bg-[#ffffff]" : "bg-[#373737]"}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-10 pt-16 pb-20">
        <label className="mb-8 font-serif text-2xl">your race</label>

        <div className="w-full">
          <div className="relative">
            <select
              id="race"
              value={race}
              onChange={(e) => setRace(e.target.value)}
              className="w-full appearance-none rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
            >
              <option value="" className="bg-[#1d1b20] text-[#ffffff]">
                Select your race
              </option>
              {raceOptions.map((option) => (
                <option key={option} value={option} className="bg-[#1d1b20] text-[#ffffff]">
                  {option}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <ChevronDown className="h-4 w-4 text-[#d9d9d9]" />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-16">
          <button
            type="submit"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffffff] text-[#0c0c0c] transition-all hover:bg-opacity-90"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </>
  )
}

