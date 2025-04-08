"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUserInfo } from "../../context/user-context"

// Income ranges with their median values
const incomeRanges = [
  { label: "Less than $25,000", min: 0, max: 25000, median: 12500 },
  { label: "$25,000 - $50,000", min: 25000, max: 50000, median: 37500 },
  { label: "$50,000 - $75,000", min: 50000, max: 75000, median: 62500 },
  { label: "$75,000 - $100,000", min: 75000, max: 100000, median: 87500 },
  { label: "$100,000 - $150,000", min: 100000, max: 150000, median: 125000 },
  { label: "$150,000 - $200,000", min: 150000, max: 200000, median: 175000 },
  { label: "$200,000 - $300,000", min: 200000, max: 300000, median: 250000 },
  { label: "More than $300,000", min: 300000, max: null, median: 350000 },
  { label: "Prefer not to say", min: null, max: null, median: -1 },
]

export default function FamilyIncomePage() {
  const { userInfo, updateUserInfo } = useUserInfo()
  const [selectedIncomeRange, setSelectedIncomeRange] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Find the selected income range object
    const selectedRange = incomeRanges.find((range) => range.label === selectedIncomeRange)

    // Store the median value (or null if "Prefer not to say" was selected)
    updateUserInfo({
      parental_income: selectedRange?.median || -1,
    })

    // Navigate to race page
    router.push("/onboarding/race")
  }

  return (
    <>
      {/* Progress indicators */}
      <div className="flex justify-center gap-2 pt-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step, index) => (
          <div key={index} className={`h-2 w-2 rounded-full ${index <= 5 ? "bg-[#ffffff]" : "bg-[#373737]"}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-10 pt-16 pb-20">
        <label className="mb-8 font-serif text-2xl">your family income</label>

        <div className="w-full">
          <div className="relative">
            <select
              id="income"
              value={selectedIncomeRange}
              onChange={(e) => setSelectedIncomeRange(e.target.value)}
              className="w-full appearance-none rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
            >
              <option value="" className="bg-[#1d1b20] text-[#ffffff]">
                Select your family income
              </option>
              {incomeRanges.map((range) => (
                <option key={range.label} value={range.label} className="bg-[#1d1b20] text-[#ffffff]">
                  {range.label}
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

