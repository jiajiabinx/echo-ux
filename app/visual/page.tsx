"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import EventVisualization from "./event-visualization"
import StarCanvas from "@/components/star-canvas"
import { AnnotatedText } from "./annotated-text"
// Import the API client and utilities
import { storyAPI, eventAPI, StoryData as ApiStoryData } from "@/src/api"

// Use the imported StoryData interface and extend it
interface StoryData extends ApiStoryData {
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
  const userId = searchParams?.get("user_id") || null
  const storyId = searchParams?.get("story_id") || null
  const storyTextRef = useRef<HTMLDivElement>(null)

  const [story, setStory] = useState<StoryData | null>(null)
  const [events, setEvents] = useState<EventData[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [eventsLoaded, setEventsLoaded] = useState<boolean>(false)
  const [generatingEvents, setGeneratingEvents] = useState<boolean>(false)

  useEffect(() => {
    // Set a flag to avoid multiple API calls
    let isMounted = true;

    const fetchData = async () => {
      if (!userId || !storyId) {
        setError("Missing required parameters: user_id and story_id")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Fetch story data using our API client
        console.log(`Fetching story data for story_id: ${storyId}`)
        const storyData = await storyAPI.getStory(Number(storyId));
        
        if (isMounted) {
          setStory(storyData);
          
          // Only fetch events if we haven't already loaded them
          if (!eventsLoaded) {
            try {
              // Fetch events using our event API
              console.log(`Fetching events for story_id: ${storyId}`)
              const eventsData = await eventAPI.getEvents(userId, storyId);
              
              if (isMounted) {
                setEvents(Array.isArray(eventsData) ? eventsData : []);
                setEventsLoaded(true);
                setEventsError(null);
              }
            } catch (evtErr: any) {
              console.error("Error fetching events:", evtErr);
              if (isMounted) {
                setEventsError(evtErr.message || "Failed to load events");
                setEventsLoaded(true); // Mark as loaded even on error to prevent retries
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching story data:", err)
        if (isMounted) {
          setError(`Error fetching story data: ${err.message || String(err)}`)

        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    
    // Cleanup function to handle component unmount
    return () => {
      isMounted = false;
    }
    
  }, [userId, storyId, eventsLoaded]); // Remove story from dependency array

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

  // Add function to generate events
  const generateEvents = async () => {
    if (!story || !userId || !storyId || generatingEvents) return;
    
    setGeneratingEvents(true);
    
    try {
      // First get processed events from the story text
      console.log('Getting processed events from story text...');
      const processedEvents = await eventAPI.getProcessedEvents(
        story.generated_story_text,
        Number(story.story_id),
        Number(userId)
      );
      
      // Then create the events
      console.log('Creating events...');
      await eventAPI.createEvents(processedEvents);
      
      // After creation, fetch the events again to get properly formatted data
      console.log('Fetching created events...');
      const eventsData = await eventAPI.getEvents(userId, storyId);
      
      // Update events state with the freshly fetched events
      console.log('Setting events...', eventsData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setEventsError(null);
    } catch (err: any) {
      console.error("Error generating events:", err);
      setEventsError(err.message || "Failed to generate events");
    } finally {
      setGeneratingEvents(false);
    }
  };

  // Add useEffect to log annotated text when selectedEvent changes
  useEffect(() => {
    if (selectedEvent && selectedEvent.annotated_text) {
      console.log("Event annotated text (raw):", selectedEvent.annotated_text);

      // Try to directly process and look at the annotated text format
      try {
        if (typeof selectedEvent.annotated_text === 'string') {
          // Use correct regex pattern [TAG]text[/TAG]
          const matches = selectedEvent.annotated_text.match(/\[([\w_]+)\](.*?)\[\/([\w_]+)\]/g);
          console.log("Found entity matches:", matches);
          
          if (matches && matches.length > 0) {
            console.log("First match:", matches[0]);
            
            // Extract entity type and text using the new pattern
            const firstMatchResult = matches[0]?.match(/\[([\w_]+)\](.*?)\[\/[\w_]+\]/);
            if (firstMatchResult && firstMatchResult.length >= 3) {
              console.log("Extracted entity:", firstMatchResult[1]);
              console.log("Extracted text:", firstMatchResult[2]);
            }
          }
        }
      } catch (e) {
        console.error("Error examining annotated text:", e);
      }
    }
  }, [selectedEvent]);

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

  if (error || !story) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
        <div className="absolute inset-0 z-0">
          <StarCanvas />
        </div>
        <div className="z-10 max-w-4xl text-center">
          <h1 className="mb-6 font-serif text-2xl">Visualization Error</h1>
          <p>{error || "Failed to load story data"}</p>
          <Link
            href={userId ? `/dashboard/${userId}` : "/"}
            className="mt-6 inline-flex items-center text-sm text-[#ffffff99] hover:text-[#ffffff]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>
      </main>
    )
  }

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
            {events.length > 0 ? (
              <EventVisualization
                events={events}
                onSelectEvent={handleEventSelect}
                onHoverEvent={handleEventHover}
                selectedEventId={selectedEvent?.event_id}
                hoveredEventId={hoveredEvent?.event_id}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <p className="text-center text-[#ffffff99] mb-6">
                  {eventsError 
                    ? `Error loading events: ${eventsError}` 
                    : "No events available for visualization"}
                </p>
                
                <button
                  onClick={generateEvents}
                  disabled={generatingEvents}
                  className="flex items-center gap-2 rounded-full bg-[#ffffff] px-6 py-3 text-[#0c0c0c] transition-all hover:bg-opacity-90 disabled:opacity-50"
                >
                  <span className="font-serif-semibold">
                    {generatingEvents ? "Generating events..." : "Generate events"}
                  </span>
                  {generatingEvents && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0c0c0c] border-t-transparent" />
                  )}
                </button>
              </div>
            )}

            {/* Hovering event details tooltip - only shown when there's an active event */}
            {selectedEvent && (
              <div
                className="absolute pointer-events-none bg-[#0c0c0c]/90 backdrop-blur-md rounded-lg border border-[#ffffff]/20 p-4 shadow-lg transition-all duration-200 ease-in-out z-20"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  maxWidth: "350px",
                  opacity: selectedEvent ? 1 : 0,
                }}
              >
                <div className="mb-2">
                  <div className="text-sm mb-3">
                    <AnnotatedText text={selectedEvent.annotated_text || ""} />
                    
                    {/* Fallback in case the annotated text isn't processed correctly */}
                    {!selectedEvent.annotated_text && (
                      <p className="text-white/70 italic">No annotated text available</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-[#ffffff]/10">{selectedEvent.event_type}</span>
                  <span className="px-2 py-1 rounded-full bg-[#ffffff]/10">
                    {selectedEvent.future_ind ? "future event" : "past event"}
                  </span>
                  {selectedEvent.event_date && (
                    <span className="px-2 py-1 rounded-full bg-[#ffffff]/10">
                      {new Date(selectedEvent.event_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Instructions overlay */}
            <div className="absolute bottom-4 right-4 bg-black/80 p-4 rounded-lg text-xs max-w-xs backdrop-blur-sm shadow-lg">
              <h3 className="font-bold mb-2 text-white text-sm">controls:</h3>
              <ul className="list-disc pl-4 space-y-1.5 text-white/90">
                <li>left-click + drag: rotate the visualization</li>
                <li>scroll: zoom in/out to explore events</li>
                <li>right-click + drag: pan around the scene</li>
                <li>hover or click on a point: view event details</li>
              </ul>
              
              <div className="mt-3 pt-3 border-t border-white/20">
                <h4 className="font-bold mb-1 text-white text-xs">event colors:</h4>
                <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                  <li className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-[#70f7ff] mr-2"></span>
                    <span className="text-white/90">education</span>
                  </li>
                  <li className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-[#ff8f8f] mr-2"></span>
                    <span className="text-white/90">career</span>
                  </li>
                  <li className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-[#ffdf7f] mr-2"></span>
                    <span className="text-white/90">serendipity</span>
                  </li>
                  <li className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-[#53ffd1] mr-2"></span>
                    <span className="text-white/90">personal</span>
                  </li>
                  <li className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-[#a78bfa] mr-2"></span>
                    <span className="text-white/90">social</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

