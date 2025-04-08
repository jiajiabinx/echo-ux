import { ArrowRight } from "lucide-react"
import Link from "next/link"
import StarCanvas from "@/components/star-canvas"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
      {/* Stars background */}
      <div className="absolute inset-0 z-0">
        <StarCanvas />
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl space-y-6 font-serif">
          <h1 className="text-3xl sm:text-4xl">echo is</h1>
          <p className="text-xl sm:text-2xl leading-relaxed">
            where you draw inspiration from the
            <br />
            unseen threads of human connections
            <br />
            where you find yourself within the
            <br />
            intricate web of cause and effect
          </p>
        </div>

        <div className="mt-20 flex flex-col gap-4 items-center">
          <Link
            href="/onboarding/name"
            className="group flex items-center gap-2 rounded-full bg-[#ffffff] px-6 py-3 text-[#0c0c0c] transition-all hover:bg-opacity-90"
          >
            <span className="font-serif">Get started</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full border border-[#ffffff] px-6 py-3 text-[#ffffff] transition-all hover:bg-white/10"
          >
            <span className="font-serif">Login</span>
          </Link>
        </div>
      </div>
    </main>
  )
}

