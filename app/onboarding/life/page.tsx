"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUserInfo } from "../../context/user-context"

const occupationOptions = [
  "Artist",
  "Business Owner",
  "Designer",
  "Developer",
  "Doctor",
  "Engineer",
  "Entrepreneur",
  "Manager",
  "Marketing",
  "Researcher",
  "Student",
  "Teacher",
  "Writer",
  "Other",
]

export default function LifePage() {
  const { userInfo, updateUserInfo } = useUserInfo()
  const [occupation, setOccupation] = useState(userInfo.occupation || "")
  const [hobby, setHobby] = useState(userInfo.hobby || "")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (occupation && hobby.trim()) {
      // Save life info to context and navigate to family income page
      updateUserInfo({
        occupation,
        hobby,
      })
      router.push("/onboarding/family")
    }
  }

  return (
    <>
      {/* Progress indicators */}
      <div className="flex justify-center gap-2 pt-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step, index) => (
          <div key={index} className={`h-2 w-2 rounded-full ${index <= 4 ? "bg-[#ffffff]" : "bg-[#373737]"}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-10 pt-16 pb-20">
        <label className="mb-8 font-serif text-2xl">your life</label>

        <div className="w-full space-y-8">
          <div className="space-y-2">
            <label htmlFor="occupation" className="block pl-2 text-sm font-mono">
              occupation
            </label>
            <div className="relative">
              <select
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full appearance-none rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
              >
                <option value="" disabled className="bg-[#1d1b20] text-[#ffffff]">
                  Select your occupation
                </option>
                {occupationOptions.map((option) => (
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

          <div className="space-y-2">
            <label htmlFor="hobby" className="block pl-2 text-sm font-mono">
              hobby
            </label>
            <input
              id="hobby"
              type="text"
              value={hobby}
              onChange={(e) => setHobby(e.target.value)}
              className="w-full rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-auto pt-16">
          <button
            type="submit"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffffff] text-[#0c0c0c] transition-all hover:bg-opacity-90"
            disabled={!occupation || !hobby.trim()}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </>
  )
}

