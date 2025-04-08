import StarCanvas from "@/components/star-canvas"

export default function Loading() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
      <div className="absolute inset-0 z-0">
        <StarCanvas />
      </div>
      <div className="z-10 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ffffff] border-t-transparent" />
        <p className="mt-4 font-serif">Loading visualization...</p>
      </div>
    </main>
  )
}

