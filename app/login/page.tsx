"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import StarCanvas from "@/components/star-canvas"

export default function LoginPage() {
  const [userId, setUserId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId.trim()) {
      setError("Please enter your user ID")
      return
    }

    setLoading(true)
    setError("")

    try {
      // In a real app, you would validate the user ID with your backend
      // For now, we'll just redirect to the dashboard with the provided ID
      router.push(`/dashboard/${userId}`)
    } catch (err) {
      console.error("Login error:", err)
      setError("Failed to login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
      {/* Stars background */}
      <div className="absolute inset-0 z-0">
        <StarCanvas />
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-[#373737] bg-[#0c0c0c]/80 backdrop-blur-sm p-10">
          <form onSubmit={handleLogin} className="flex flex-col items-center">
            <label htmlFor="userId" className="mb-8 font-serif text-2xl">
              your user id
            </label>

            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-full border border-[#373737] bg-transparent px-6 py-3 text-center font-serif text-lg focus:border-[#d9d9d9] focus:outline-none mb-16"
              autoComplete="off"
            />

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffffff] text-[#0c0c0c] transition-all hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0c0c0c] border-t-transparent" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

