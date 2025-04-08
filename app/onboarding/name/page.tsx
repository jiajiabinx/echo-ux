"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUserInfo } from "../../context/user-context"

export default function NamePage() {
  const { userInfo, updateUserInfo } = useUserInfo()
  const [name, setName] = useState(userInfo.name)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      // Save name to context and navigate
      updateUserInfo({ name })
      router.push("/onboarding/birthplace")
    }
  }

  return (
    <>
      {/* Progress indicators */}
      <div className="flex justify-center gap-2 pt-6">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step, index) => (
          <div key={index} className={`h-2 w-2 rounded-full ${index === 0 ? "bg-[#ffffff]" : "bg-[#373737]"}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center p-10 pt-20 pb-20">
        <label htmlFor="name" className="mb-8 font-serif text-2xl">
          your name
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none"
          autoComplete="off"
        />

        <div className="mt-auto pt-20">
          <button
            type="submit"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffffff] text-[#0c0c0c] transition-all hover:bg-opacity-90"
            disabled={!name.trim()}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </>
  )
}

