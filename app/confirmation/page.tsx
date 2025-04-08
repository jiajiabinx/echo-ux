"use client"
import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import StarCanvas from "../../components/star-canvas"
import { useUserInfo } from "../context/user-context"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { userInfo } = useUserInfo()
  const user_id = searchParams.get("id") ? Number.parseInt(searchParams.get("order")!, 10) : null
  // Convert order_id and session_id to numbers
  const order_id = searchParams.get("order") ? Number.parseInt(searchParams.get("order")!, 10) : null
  const session_id = searchParams.get("session") ? Number.parseInt(searchParams.get("session")!, 10) : null
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [processingStep, setProcessingStep] = useState(0)
  const [processingLog, setProcessingLog] = useState<string[]>([])
  const [retryCount, setRetryCount] = useState(0)
  const [detailedError, setDetailedError] = useState<any>(null)
  const [generatedText, setGeneratedText] = useState<string>("")
  const [storyId, setStoryId] = useState<string>("")
  const [displayText, setDisplayText] = useState<string>("")

  // Maximum number of retries for client-side API calls
  const maxClientRetries = 3

  useEffect(() => {
    // Simulate loading for a better user experience
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    // Debug log to check if session_id is being received

    return () => clearTimeout(timer)
  }, [user_id, order_id, session_id])

  const addToLog = useCallback((message: string) => {
    setProcessingLog((prev) => [...prev, message])
  }, [])

  const handleContinueClick = async () => {
    // Updated validation to check for session_id
    if (!user_id || !order_id || !session_id) {
      setError("user_id or order_id or session_id is missing. Please try again.")
      return
    }

    setProcessing(true)
    setError("")
    setDetailedError(null)
    setProcessingLog([])
    setProcessingStep(1)
    setRetryCount(0)
    setGeneratedText("")
    setStoryId("")
    setDisplayText("")

    try {
      // Call tuisuan directly with user_id, order_id, and session_id
      addToLog("Sending data to tuisuan...")

      // Create tuisuan payload with session_id
      const tuisuanPayload = {
        user_id: user_id,
        order_id: order_id, // Already a number
        session_id: session_id, // Already a number
      }

      addToLog(`Tuisuan request payload: ${JSON.stringify(tuisuanPayload)}`)

      // Create a controller for the timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 1200000) // 20 minutes

      try {
        const tuisuanResponse = await fetch("/api/tuisuan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tuisuanPayload),
          signal: controller.signal,
        })

        // Clear the timeout
        clearTimeout(timeoutId)

        // Get the response text for detailed error logging
        const responseText = await tuisuanResponse.text()
        console.log("Tuisuan API Response Status:", tuisuanResponse.status)
        console.log("Tuisuan API Response Body:", responseText)

        if (!tuisuanResponse.ok) {
          let errorData
          try {
            // Try to parse the response as JSON if possible
            errorData = JSON.parse(responseText)
          } catch (e) {
            // If it's not valid JSON, use the text as is
            errorData = { message: responseText }
          }

          setDetailedError(errorData)

          // If it's a 500 error, we might want to retry
          if (tuisuanResponse.status >= 500 && retryCount < maxClientRetries) {
            setRetryCount((prev) => prev + 1)
            addToLog(`Received 500 error, retrying (${retryCount + 1}/${maxClientRetries})...`)

            // Wait a moment before retrying (with exponential backoff - 20x increase)
            const backoffTime = 20000 * Math.pow(2, retryCount) // 20 seconds base delay
            addToLog(`Waiting ${backoffTime}ms (${backoffTime / 1000} seconds) before retry...`)
            await new Promise((resolve) => setTimeout(resolve, backoffTime))

            // Retry the request
            handleContinueClick()
            return
          }

          throw new Error(`Failed to process tuisuan: ${tuisuanResponse.status} - ${errorData.error || responseText}`)
        }

        // Parse the response text as JSON
        let tuisuanData
        try {
          tuisuanData = responseText ? JSON.parse(responseText) : {}
        } catch (e) {
          console.error("Error parsing tuisuan response:", e)
          throw new Error("Invalid JSON response from tuisuan")
        }

        // Check if this is a simulated response
        if (tuisuanData.status === "simulated") {
          addToLog(`Tuisuan returned a simulated response due to API issues`)
        } else {
          addToLog(`Tuisuan processed successfully`)
        }

        // Extract the generated story text and story ID from the tuisuan response
        const generatedStoryText =
          tuisuanData.generated_story_text ||
          tuisuanData.text ||
          "Your Echo story is being generated. The threads of your life are weaving together to create a unique tapestry of connections and influences."
        const story_id = tuisuanData.story_id || `gen-${Date.now()}`

        setGeneratedText(generatedStoryText)
        setStoryId(story_id)
        setDisplayText(generatedStoryText)
        setProcessing(false)

        addToLog(`Story text received: ${generatedStoryText.substring(0, 50)}...`)
        addToLog(`Story ID: ${story_id}`)
      } catch (fetchError) {
        // Handle fetch errors specifically
        console.error("Fetch error:", fetchError)
        clearTimeout(timeoutId)

        if (fetchError.name === "AbortError") {
          addToLog(`Request timed out after 20 minutes`)
        } else {
          addToLog(`Network error: ${fetchError.message}`)
        }

        // Check if we should retry
        if (retryCount < maxClientRetries) {
          setRetryCount((prev) => prev + 1)
          addToLog(`Network error, retrying (${retryCount + 1}/${maxClientRetries})...`)

          // Wait before retrying
          const backoffTime = 20000 * Math.pow(2, retryCount)
          addToLog(`Waiting ${backoffTime}ms (${backoffTime / 1000} seconds) before retry...`)
          await new Promise((resolve) => setTimeout(resolve, backoffTime))

          // Retry the request
          handleContinueClick()
          return
        } else {
          // If we've exhausted retries, use a simulated response
          addToLog(`All retry attempts failed, using simulated response`)
          const simulatedStoryText =
            "In the tapestry of existence, your thread intertwines with countless others. Your journey from birth has led you through educational pursuits and professional endeavors that shape not only your own destiny but influence the paths of those around you. The ripples of your actions extend far beyond what you can perceive, creating patterns of cause and effect that echo through time and space."

          setGeneratedText(simulatedStoryText)
          setStoryId(`sim-${Date.now()}`)
          setDisplayText(simulatedStoryText)
          setProcessing(false)
        }
      }
    } catch (error: any) {
      console.error("Error processing request:", error)
      setError(`Error: ${error.message || "Unknown error occurred"}`)
      addToLog(`ERROR: ${error.message || "Unknown error occurred"}`)
      setProcessing(false)

      // If we have a critical error but have already tried multiple times,
      // offer a fallback option to the user
      if (retryCount >= maxClientRetries) {
        addToLog(`Offering fallback option after multiple failed attempts`)
        setError(`Multiple attempts failed. Would you like to continue with a simulated response?`)

        // Add a fallback button
        setProcessingStep(99) // Special step for fallback option
      }
    }
  }

  // Handle fallback option
  const handleFallbackClick = () => {
    const simulatedStoryText =
      "In the tapestry of existence, your thread intertwines with countless others. Your journey from birth has led you through educational pursuits and professional endeavors that shape not only your own destiny but influence the paths of those around you. The ripples of your actions extend far beyond what you can perceive, creating patterns of cause and effect that echo through time and space."

    setGeneratedText(simulatedStoryText)
    setStoryId(`sim-${Date.now()}`)
    setDisplayText(simulatedStoryText)
    setProcessingStep(0)
  }

  const getProcessingText = () => {
    return "Processing tuisuan (may take up to 20 minutes)..."
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
        <div className="absolute inset-0 z-0">
          <StarCanvas />
        </div>
        <div className="z-10 flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ffffff] border-t-transparent" />
          <p className="mt-4 font-serif">Preparing your journey...</p>
        </div>
      </main>
    )
  }

  // Show a specific error if session_id is missing
  if (!session_id) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
        <div className="absolute inset-0 z-0">
          <StarCanvas />
        </div>
        <div className="z-10 flex flex-col items-center justify-center px-4">
          <div className="w-[480px] rounded-lg border border-red-500 bg-[#0c0c0c]/80 backdrop-blur-sm p-8 text-center">
            <h1 className="text-2xl font-serif text-red-400 mb-4">Missing session_id</h1>
            <p className="mb-6">
              A session_id is required to continue with your Echo experience. Please return to the previous step.
            </p>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-full bg-[#ffffff] px-8 py-3 text-[#0c0c0c] transition-all hover:bg-opacity-90"
            >
              <span className="font-serif-semibold">Go Back</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
      <div className="absolute inset-0 z-0">
        <StarCanvas />
      </div>

      <div className="z-10 flex flex-col items-center justify-center px-4">
        <div className="w-[480px] rounded-lg border border-[#373737] bg-[#0c0c0c]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center p-10 pt-16 pb-20 text-center">
            <div className="mb-8">
              <p className="font-serif text-2xl leading-relaxed">
                Your journey begins
                <br />
                <span className="mt-4 block font-mono text-sm text-[#d9d9d9]">Order #{order_id}</span>
                <span className="mt-2 block font-serif-semibold text-xl">User ID: {user_id}</span>
                <span className="mt-1 block font-mono text-sm text-[#d9d9d9]">Session: {session_id}</span>
              </p>
            </div>

            {!displayText && !processing && processingStep !== 99 && (
              <>
                <div className="mt-8 max-w-xs">
                  <p className="font-serif text-lg leading-relaxed">
                    Your Echo experience has been confirmed.
                    <br />
                    We will guide you through the unseen threads of human connections.
                  </p>
                </div>

                <button
                  onClick={handleContinueClick}
                  disabled={processing}
                  className="mt-12 flex items-center gap-2 rounded-full bg-[#ffffff] px-8 py-3 text-[#0c0c0c] transition-all hover:bg-opacity-90 disabled:opacity-50"
                >
                  <span className="font-serif-semibold">continue to echo</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </>
            )}

            {processing && (
              <div className="mt-8 flex flex-col items-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ffffff] border-t-transparent" />
                <p className="mt-4 font-serif">{getProcessingText()}</p>
              </div>
            )}

            {processingStep === 99 && (
              <div className="mt-12 flex flex-col items-center">
                <p className="mb-4 text-amber-400">Multiple attempts failed to connect to the service.</p>
                <button
                  onClick={handleFallbackClick}
                  className="flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-[#0c0c0c] transition-all hover:bg-amber-400"
                >
                  <span className="font-serif-semibold">Continue with simulated response</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {displayText && (
              <div className="mt-8 w-full">
                <h2 className="mb-6 font-serif text-2xl">Your Echo</h2>
                <div className="rounded-lg border border-[#373737] bg-[#0c0c0c]/60 p-6">
                  <p className="font-serif text-lg leading-relaxed">{displayText}</p>
                  {storyId && (
                    <div className="mt-4 text-center">
                      <p className="font-mono text-sm text-[#d9d9d9]">Story ID: {storyId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && processingStep !== 99 && <div className="mt-4 text-sm text-red-400">{error}</div>}

            {detailedError && (
              <div className="mt-2 max-h-32 overflow-auto rounded bg-[#373737] p-2 text-xs text-[#d9d9d9]">
                <pre>{JSON.stringify(detailedError, null, 2)}</pre>
              </div>
            )}

            {processingLog.length > 0 && (
              <div className="mt-4 max-h-40 w-full max-w-xs overflow-auto rounded border border-[#373737] bg-[#1d1b20] p-3 text-left text-xs text-[#d9d9d9]">
                <div className="font-mono">
                  {processingLog.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log.startsWith("ERROR") ? (
                        <span className="text-red-400">{log}</span>
                      ) : log.includes("successfully") ? (
                        <span className="text-green-400">{log}</span>
                      ) : log.includes("retrying") ? (
                        <span className="text-yellow-400">{log}</span>
                      ) : log.includes("simulated") ? (
                        <span className="text-blue-400">{log}</span>
                      ) : log.includes("session_id") ? (
                        <span className="text-purple-400">{log}</span>
                      ) : log.includes("Network error") || log.includes("timed out") ? (
                        <span className="text-red-300">{log}</span>
                      ) : (
                        log
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

