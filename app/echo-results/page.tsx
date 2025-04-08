"use client"
import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import StarCanvas from "../../components/star-canvas"

export default function EchoResultsPage() {
  const searchParams = useSearchParams()
  const [storyText, setStoryText] = useState<string>("")
  const [storyId, setStoryId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSimulated, setIsSimulated] = useState(false)
  const [dataProcessed, setDataProcessed] = useState(false)

  // Use useCallback to memoize the data processing function
  const processData = useCallback(() => {
    try {
      // Only process data once
      if (dataProcessed) return

      // Get the data from URL parameters
      const textParam = searchParams.get("text")
      const storyIdParam = searchParams.get("story_id")
      const simulatedParam = searchParams.get("simulated")

      if (simulatedParam === "true") {
        setIsSimulated(true)
      }

      if (textParam) {
        setStoryText(decodeURIComponent(textParam))
      } else {
        // Try the old data parameter for backward compatibility
        const dataParam = searchParams.get("data")
        if (dataParam) {
          try {
            const parsedData = JSON.parse(decodeURIComponent(dataParam))
            setStoryText(parsedData.text || "")
            setStoryId(parsedData.event_id || parsedData.story_id || "")
          } catch (parseErr) {
            console.error("Error parsing data parameter:", parseErr)
            setError("Failed to parse story data")
          }
        } else {
          setError("No story text found")
        }
      }

      if (storyIdParam) {
        setStoryId(storyIdParam)
      }

      // Mark data as processed to prevent reprocessing
      setDataProcessed(true)
    } catch (err) {
      console.error("Error processing story data:", err)
      setError("Failed to load story data")
      setDataProcessed(true)
    }
  }, [searchParams, dataProcessed])

  useEffect(() => {
    // Process data only if not already processed
    if (!dataProcessed) {
      processData()
    }

    // Add a small delay for better UX, but only if we're still loading
    if (loading && dataProcessed) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [loading, dataProcessed, processData])

  if (loading) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
        <div className="absolute inset-0 z-0">
          <StarCanvas />
        </div>
        <div className="z-10 flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ffffff] border-t-transparent" />
          <p className="mt-4 font-serif">Revealing your echo...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
        <div className="absolute inset-0 z-0">
          <StarCanvas />
        </div>
        <div className="z-10 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-[480px] rounded-lg border border-red-500 bg-[#0c0c0c]/80 p-8 backdrop-blur-sm">
            <h1 className="mb-4 font-serif text-2xl text-red-400">Error</h1>
            <p className="font-serif">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  // Provide a fallback text if no text is available
  const fallbackText =
    "In the tapestry of existence, your thread intertwines with countless others. Your journey from birth has led you through educational pursuits and professional endeavors that shape not only your own destiny but influence the paths of those around you. The ripples of your actions extend far beyond what you can perceive, creating patterns of cause and effect that echo through time and space."

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
      <div className="absolute inset-0 z-0">
        <StarCanvas />
      </div>

      <div className="z-10 flex flex-col items-center justify-center px-4">
        <div className="w-[480px] rounded-lg border border-[#373737] bg-[#0c0c0c]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-10 pt-16 pb-20">
            <h1 className="mb-8 font-serif text-3xl">Your Echo</h1>

            <div className="w-full">
              {storyText ? (
                <p className="font-serif text-lg leading-relaxed">{storyText}</p>
              ) : (
                <p className="font-serif text-lg leading-relaxed">{fallbackText}</p>
              )}
            </div>

            {storyId && (
              <div className="mt-8 text-center">
                <p className="font-mono text-sm text-[#d9d9d9]">Story ID: {storyId}</p>
              </div>
            )}

            {isSimulated && (
              <div className="mt-4 rounded-md bg-blue-900/30 p-3 text-center text-sm text-blue-300">
                <p>
                  Note: This is a simulated response due to temporary API connectivity issues. The system attempted
                  multiple retries over an extended period (up to 20 minutes per API call) before generating this
                  fallback response.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

