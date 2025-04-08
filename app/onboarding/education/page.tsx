"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUserInfo } from "../../context/user-context"

const degreeOptions = [
  "High School",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Professional Degree",
  "Other",
]

export default function EducationPage() {
  const { userInfo, updateUserInfo } = useUserInfo()
  const [highestDegree, setHighestDegree] = useState(userInfo.highestDegree || "")
  const [school, setSchool] = useState(userInfo.school || "")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (highestDegree && school.trim()) {
      // Save education info to context and navigate to life page
      updateUserInfo({
        highestDegree,
        school,
      })
      router.push("/onboarding/life")
    }
  }

  return (
    <>
      {/* Progress indicators */}
      <div className="flex justify-center gap-2 pt-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step, index) => (
          <div key={index} className={`h-2 w-2 rounded-full ${index <= 3 ? "bg-[#ffffff]" : "bg-[#373737]"}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-10 pt-16 pb-20">
        <label className="mb-8 font-serif text-2xl">your education</label>

        <div className="w-full space-y-8">
          <div className="space-y-2">
            <label htmlFor="degree" className="block pl-2 text-sm font-mono">
              highest degree
            </label>
            <div className="relative">
              <select
                id="degree"
                value={highestDegree}
                onChange={(e) => setHighestDegree(e.target.value)}
                className="w-full appearance-none rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
              >
                <option value="" disabled className="bg-[#1d1b20] text-[#ffffff]">
                  Select your highest degree
                </option>
                {degreeOptions.map((degree) => (
                  <option key={degree} value={degree} className="bg-[#1d1b20] text-[#ffffff]">
                    {degree}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <ChevronDown className="h-4 w-4 text-[#d9d9d9]" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="school" className="block pl-2 text-sm font-mono">
              school of your highest degree
            </label>
            <input
              id="school"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-auto pt-16">
          <button
            type="submit"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffffff] text-[#0c0c0c] transition-all hover:bg-opacity-90"
            disabled={!highestDegree || !school.trim()}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </>
  )
}

