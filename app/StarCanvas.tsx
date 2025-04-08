"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export default function StarCanvas() {
  const [mounted, setMounted] = useState(false)

  // Use useEffect to handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Return a placeholder with the same dimensions during SSR
  if (!mounted) {
    return <div className="absolute inset-0 bg-[#0c0c0c]" />
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="relative h-full w-full">
        <Image
          src="/images/background_pic.jpeg"
          alt="Starry night sky background"
          fill
          priority
          quality={100}
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </div>
  )
}

