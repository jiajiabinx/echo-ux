"use client"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OptionalIntroPage() {
  const router = useRouter()

  const handleContinue = () => {
    // Navigate to the family page
    router.push("/onboarding/family")
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center p-10 pt-16 pb-20 min-h-[400px]">
        <div className="mb-8 font-serif text-2xl text-center max-w-md">
          All the following questions are optional. you can skip them if you do not want to answer
        </div>

        <div className="mt-auto pt-16">
          <button
            onClick={handleContinue}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffffff] text-[#0c0c0c] transition-all hover:bg-opacity-90"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  )
}

