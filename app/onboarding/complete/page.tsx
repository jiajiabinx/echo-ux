"use client"
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUserInfo } from "../../context/user-context"
import { generateCompleteStory } from "@/src/api"

export default function CompletePage() {
  const { userInfo } = useUserInfo()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  const generateStoryWithRetry = async (userId: string): Promise<number> => {
    try {
      // Add debug logging to check what's being sent
      console.log("Calling generateCompleteStory with userId:", userId);
      console.log("User ID type:", typeof userId);
      
      // Validate that userId is a proper string
      if (typeof userId !== 'string' || !userId.trim()) {
        throw new Error("Invalid user ID format");
      }
      
      return await generateCompleteStory(userId)
    } catch (error: any) {
      // More detailed error logging
      console.error("Story generation error details:", error);
      
      if (error.message && error.message.includes("Expecting ',' delimiter")) {
        console.error("JSON formatting error. This might be caused by invalid characters in the input data.");
      }
      
      if (retryCount < MAX_RETRIES) {
        const nextRetryCount = retryCount + 1
        setRetryCount(nextRetryCount)
        
        const waitTime = 2000 * nextRetryCount // Exponential backoff: 2s, 4s, 6s
        console.log(`Attempt failed. Retrying in ${waitTime/1000} seconds... (${nextRetryCount}/${MAX_RETRIES})`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, waitTime))
        
        console.log(`Retrying story generation... Attempt ${nextRetryCount + 1}`);
        return generateStoryWithRetry(userId)
      }
      
      // If we've reached max retries, throw the error
      console.error(`Max retries (${MAX_RETRIES}) reached. Story generation failed.`);
      throw error
    }
  }

  const handleReadyClick = async () => {
    if (!userInfo.user_id) {
      setError("user_id is missing. Please try again.")
      return
    }

    setIsProcessing(true)
    setError("")
    setRetryCount(0)

    try {
      // Use the simplified generateCompleteStory API with retry logic
      console.log("Starting story generation process...");
      console.log("Generating story for user:", userInfo.user_id)
      
      const storyId = await generateStoryWithRetry(userInfo.user_id.toString())
      
      console.log("Story generated successfully!");
      console.log(`Story ID: ${storyId}`);
      
      // Short delay to show the success message
      setTimeout(() => {
        console.log("Redirecting to visualization page...");
        router.push(`/visual?user_id=${userInfo.user_id}&story_id=${storyId}`)
      }, 1000)
    } catch (error: any) {
      console.error("Error generating story:", error)
      setError(`Error: ${error.message || "Unknown error occurred"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const getProcessingText = () => {
    if (retryCount > 0) {
      return `Retrying... (${retryCount}/${MAX_RETRIES})`
    }
    return "Generating your story..."
  }

  return (
    <div className="flex flex-col items-center p-10 pt-16 pb-20 text-center">
      <div className="mb-16">
        <p className="font-serif text-2xl leading-relaxed">
          {userInfo.name},
          <br />
          are you ready to
          <br />
          embark your journey
          <br />
          with Echo?
        </p>
      </div>

      <button
        onClick={handleReadyClick}
        disabled={isProcessing}
        className="flex items-center gap-2 rounded-full bg-[#ffffff] px-8 py-3 text-[#0c0c0c] transition-all hover:bg-opacity-90 disabled:opacity-50"
      >
        <span className="font-serif-semibold">{isProcessing ? getProcessingText() : "i am ready"}</span>
        {!isProcessing && <ArrowRight className="h-5 w-5" />}
        {isProcessing && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0c0c0c] border-t-transparent" />
        )}
      </button>

      {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
    </div>
  )
}

