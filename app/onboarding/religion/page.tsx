"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUserInfo } from "../../context/user-context"

const religionOptions = [
  "Agnostic",
  "Atheist",
  "Buddhism",
  "Christianity",
  "Hinduism",
  "Islam",
  "Judaism",
  "Sikhism",
  "Spiritual but not religious",
  "Other",
  "Prefer not to say",
]

export default function ReligionPage() {
  const { userInfo, updateUserInfo } = useUserInfo()
  const [religion, setReligion] = useState(userInfo.religion || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [detailedError, setDetailedError] = useState<any>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")
    setDetailedError(null)

    // Save religion to context
    const updatedReligion = religion || ""
    updateUserInfo({ religion: updatedReligion })

    // Map our collected data to the exact format required by the API
    // Skip any fields we don't have matching data for
    const userData = {
      display_name: userInfo.name || "",
      birth_date: userInfo.birth_date || "",
      birth_location: userInfo.birth_location || "",
      primary_residence: userInfo.primaryResidence || "",
      current_location: userInfo.currentResidence || "",
      college: userInfo.school || "",
      educational_level: userInfo.highestDegree || "",
      parental_income: userInfo.parental_income,
      primary_interest: userInfo.hobby || "",
      profession: userInfo.occupation || "",
      religion: updatedReligion,
      race: userInfo.race || "",
    }

    try {
      console.log("Sending user data:", userData)

      // Use our proxy API route
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error("API error response:", responseData)
        setDetailedError(responseData.details)
        throw new Error(responseData.error || `API error: ${response.status}`)
      }

      console.log("User data saved successfully:", responseData)

      // Store the user_id from the response
      if (responseData.user_id) {
        updateUserInfo({ user_id: responseData.user_id })
      }

      // Navigate to completion page
      router.push("/onboarding/complete")
    } catch (error: any) {
      console.error("Error saving user data:", error)
      setSubmitError(`Failed to save your information: ${error.message || "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Progress indicators */}
      <div className="flex justify-center gap-2 pt-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step, index) => (
          <div key={index} className={`h-2 w-2 rounded-full bg-[#ffffff]`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-10 pt-16 pb-20">
        <label className="mb-8 font-serif text-2xl">your religion</label>

        <div className="w-full">
          <div className="relative">
            <select
              id="religion"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              className="w-full appearance-none rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
              disabled={isSubmitting}
            >
              <option value="" className="bg-[#1d1b20] text-[#ffffff]">
                Select your religion
              </option>
              {religionOptions.map((option) => (
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

        {submitError && <div className="mt-4 text-sm text-red-400">{submitError}</div>}

        {detailedError && (
          <div className="mt-2 max-h-32 overflow-auto rounded bg-[#373737] p-2 text-xs text-[#d9d9d9]">
            <pre>{JSON.stringify(detailedError, null, 2)}</pre>
          </div>
        )}

        <div className="mt-auto pt-16">
          <button
            type="submit"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffffff] text-[#0c0c0c] transition-all hover:bg-opacity-90 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0c0c0c] border-t-transparent" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </>
  )
}

