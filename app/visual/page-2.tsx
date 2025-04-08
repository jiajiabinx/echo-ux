"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import EventVisualization from "./event-visualization"
import StarCanvas from "@/components/star-canvas"
import { AnnotatedText } from "./annotated-text"

interface StoryData {
  story_id: number
  transaction_id: string
  generated_story_text: string
  timestamp: string
  id?: number // Some APIs might use id instead of story_id
}

interface EventData {
  user_id: number
  story_id: number
  text: string
  annotated_text: string
  event_type: string
  event_date: string | null
  event_id: number
  coordinates: [number, number, number]
  future_ind: boolean
}

export default function VisualPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get("user_id")
  const storyId = searchParams.get("story_id")
  const storyTextRef = useRef<HTMLDivElement>(null)

  const [story, setStory] = useState<StoryData | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !storyId) {
        setError("Missing required parameters: user_id and story_id")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Fetch story data using our internal API route
        console.log(`Fetching story data for story_id: ${storyId}`)
        const storyResponse = await fetch(`/api/story/detail?story_id=${storyId}`)

        if (!storyResponse.ok) {
          throw new Error(`Story API returned status: ${storyResponse.status}`)
        }

        // Get the response body as text first for logging
        const storyResponseText = await storyResponse.text()
        console.log("Story API Response Status:", storyResponse.status)
        console.log("Story API Response Body (first 100 chars):", storyResponseText.substring(0, 100))

        let storyData: StoryData | null = null
        try {
          // Try to parse the response as JSON
          const parsedStoryData = JSON.parse(storyResponseText)

          // Handle both array and single object responses
          if (Array.isArray(parsedStoryData)) {
            console.log("Story API returned an array, finding matching story or using first item")

            // Find the story with the matching ID
            const matchingStory = parsedStoryData.find(
              (s) => s.story_id === Number(storyId) || s.id === Number(storyId),
            )

            storyData = matchingStory || parsedStoryData[0]
          } else {
            // It's already a single object
            storyData = parsedStoryData
          }

          console.log("Using story data:", storyData)
          setStory(storyData)
        } catch (parseError) {
          console.error("Failed to parse story API response as JSON:", parseError)
          console.error("Response was:", storyResponseText.substring(0, 500))

          // Generate sample story data
          storyData = generateSampleStory(Number(storyId))
          setStory(storyData)
        }

        // Fetch events using our internal API route
        console.log(`Fetching events for story_id: ${storyId}`)
        const eventsResponse = await fetch(`/api/event?user_id=${userId}&story_ids=${storyId}`)

        if (!eventsResponse.ok) {
          console.error(`Events API returned status: ${eventsResponse.status}`)
          throw new Error(`Events API returned status: ${eventsResponse.status}`)
        }

        // Get the response body as text first for logging
        const eventsResponseText = await eventsResponse.text()
        console.log("Events API Response Status:", eventsResponse.status)
        console.log("Events API Response Body (first 100 chars):", eventsResponseText.substring(0, 100))

        try {
          // Try to parse the response as JSON
          const parsedEvents = JSON.parse(eventsResponseText)

          // Handle both array and single object responses for events
          if (Array.isArray(parsedEvents)) {
            setEvents(parsedEvents)
          } else if (parsedEvents && typeof parsedEvents === "object") {
            // If it's a single object, wrap it in an array
            setEvents([parsedEvents])
          } else {
            // If it's neither an array nor an object, set empty array
            setEvents([])
          }
        } catch (parseError) {
          console.error("Failed to parse events API response as JSON:", parseError)
          console.error("Response was:", eventsResponseText.substring(0, 500))
          setEvents([])
        }
      } catch (err) {
        console.error("Error fetching visualization data:", err)
        setError(`Error fetching visualization data: ${err instanceof Error ? err.message : String(err)}`)

        // Set empty data instead of generating samples
        setStory(story || null)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, storyId])

  // Effect to highlight text in story when an event is selected or hovered
  useEffect(() => {
    // Reset the story text to original content first
    if (storyTextRef.current && story) {
      storyTextRef.current.innerHTML = story.generated_story_text
    }

    // If no active event, we're done (text is already reset)
    const activeEvent = hoveredEvent || selectedEvent
    if (!activeEvent || !story || !storyTextRef.current) {
      return
    }

    // Get the plain text from the event
    const eventText = activeEvent.text.trim()

    // Try to find this text in the story
    if (eventText && story.generated_story_text.includes(eventText)) {
      // Add a unique ID to the highlighted span for easy selection
      const highlightId = `highlight-${activeEvent.event_id}`
      const storyContent = storyTextRef.current.innerHTML
      const highlightedContent = storyContent.replace(
        new RegExp(`(${escapeRegExp(eventText)})`, "g"),
        `<span id="${highlightId}" class="highlighted-text bg-yellow-300 bg-opacity-30 text-white px-1 rounded">$1</span>`,
      )
      storyTextRef.current.innerHTML = highlightedContent

      // Find the highlighted element by ID and scroll to it
      const highlightedElement = document.getElementById(highlightId)
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }

    // Cleanup function to remove highlighting when component unmounts or dependencies change
    return () => {
      if (storyTextRef.current && story) {
        storyTextRef.current.innerHTML = story.generated_story_text
      }
    }
  }, [hoveredEvent, selectedEvent, story])

  // Helper function to escape special characters in regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  // Generate sample story for demonstration
  const generateSampleStory = (storyId: number): StoryData => {
    return {
      story_id: storyId,
      transaction_id: `tx-${Date.now()}`,
      generated_story_text: `This story explores the interconnected nature of your experiences and how they have shaped both your life and the lives of those around you. Through a series of events, we can see the ripple effects of your choices and circumstances. The narrative begins with a pivotal moment in your childhood and traces how that moment influenced decisions you made later in life.`,
      timestamp: new Date().toISOString(),
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return dateString
    }
  }

  // Handle event selection from the visualization
  const handleEventSelect = (event: EventData | null) => {
    setSelectedEvent(event)
    // When selecting an event, clear any hover state to avoid conflicts
    if (event) {
      setHoveredEvent(null)
    }
  }

  // Handle event hover from the visualization
  const handleEventHover = (event: EventData | null) => {
    setHoveredEvent(event)
  }

  // Handle mouse leave from the visualization area
  const handleMouseLeave = () => {
    setHoveredEvent(null)
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
        <div className="absolute inset-0 z-0">
          <StarCanvas />
        </div>
        <div className="z-10 flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ffffff] border-t-transparent" />
          <p className="mt-4 font-serif">loading visualization...</p>
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
          <div className="w-full max-w-md rounded-lg border border-red-500 bg-[#0c0c0c]/80 p-8 backdrop-blur-sm">
            <h1 className="mb-4 font-serif text-2xl text-red-400">error</h1>
            <p className="font-serif">{error}</p>
            <Link
              href={userId ? `/dashboard/${userId}` : "/"}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ffffff] px-6 py-2 text-[#0c0c0c] transition-all hover:bg-opacity-90"
            >
              <span className="font-serif">return to dashboard</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Determine which event is active (either hovered or selected)
  const activeEvent = hoveredEvent || selectedEvent

  return (
    <main className="relative min-h-screen bg-[#0c0c0c] text-[#ffffff]">
      <div className="absolute inset-0 z-0">
        <StarCanvas />
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <header className="p-4 border-b border-[#ffffff]/10">
          <div className="flex items-center justify-between">
            <Link
              href={userId ? `/dashboard/${userId}` : "/"}
              className="inline-flex items-center gap-2 rounded-full border border-[#ffffff]/20 px-4 py-2 text-sm transition-all hover:bg-[#ffffff]/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>back to dashboard</span>
            </Link>

            <h1 className="font-serif text-xl">{story ? formatDate(story.timestamp) : "story visualization"}</h1>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Story text - left 1/3 */}
          <div className="w-1/3 p-6 overflow-y-auto border-r border-[#ffffff]/10">
            {story && (
              <div className="prose prose-invert max-w-none">
                <p ref={storyTextRef} className="text-[#ffffff]/80 leading-relaxed">
                  {story.generated_story_text}
                </p>
              </div>
            )}
          </div>

          {/* Visualization - right 2/3 */}
          <div className="w-2/3 relative" onMouseLeave={handleMouseLeave}>
            <EventVisualization
              events={events}
              onSelectEvent={handleEventSelect}
              onHoverEvent={handleEventHover}
              selectedEventId={selectedEvent?.event_id}
              hoveredEventId={hoveredEvent?.event_id}
            />

            {/* Hovering event details tooltip - only shown when there's an active event */}
            {activeEvent && (
              <div
                className="absolute pointer-events-none bg-[#0c0c0c]/80 backdrop-blur-md rounded-lg border border-[#ffffff]/20 p-3 shadow-lg transition-all duration-200 ease-in-out z-20"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  maxWidth: "250px",
                  opacity: activeEvent ? 1 : 0,
                }}
              >
                <div className="text-sm">
                  <AnnotatedText text={activeEvent.annotated_text} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-[#ffffff]/10">{activeEvent.event_type}</span>
                  <span className="px-2 py-1 rounded-full bg-[#ffffff]/10">
                    {activeEvent.future_ind ? "future event" : "past event"}
                  </span>
                </div>
              </div>
            )}

            {/* Instructions overlay */}
            <div className="absolute bottom-4 right-4 bg-black/70 p-3 rounded text-xs max-w-xs">
              <h3 className="font-bold mb-1">controls:</h3>
              <ul className="list-disc pl-4 space-y-1">
                <li>left-click + drag: rotate</li>
                <li>scroll: zoom in/out</li>
                <li>right-click + drag: pan</li>
                <li>hover or click on a point: view event details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

