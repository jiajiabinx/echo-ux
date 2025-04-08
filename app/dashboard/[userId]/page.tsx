"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import React from "react"
import {
  ArrowRight,
  User,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Heart,
  Edit,
  Save,
  X,
  Loader2,
  DollarSign,
  Plus,
  RefreshCw,
} from "lucide-react"
import StarCanvas from "@/components/star-canvas"
import { 
  userAPI, 
  storyAPI, 
  generateCompleteStory,
  UserData as ApiUserData,
  StoryData as ApiStoryData
} from "@/src/api"

// Use the imported interfaces
interface UserData extends ApiUserData {}
interface StoryData extends ApiStoryData {}

// Income range options with their median values
const INCOME_RANGES = [
  { label: "Prefer not to say", value: -1 },
  { label: "Less than $25,000", value: 12500 },
  { label: "$25,000 - $50,000", value: 37500 },
  { label: "$50,000 - $75,000", value: 62500 },
  { label: "$75,000 - $100,000", value: 87500 },
  { label: "$100,000 - $150,000", value: 125000 },
  { label: "$150,000 - $200,000", value: 175000 },
  { label: "$200,000 - $300,000", value: 250000 },
  { label: "More than $300,000", value: 350000 },
]

// Helper function to get the display label for a parental income value
const getIncomeLabel = (value: number | string | undefined): string => {
  if (value === undefined || value === "") return "Not specified"

  const numValue = typeof value === "string" ? Number.parseInt(value as string, 10) : value
  const range = INCOME_RANGES.find((r) => r.value === numValue)
  return range ? range.label : "Not specified"
}

export default function Dashboard() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  const [userData, setUserData] = useState<UserData | null>(null)
  const [editableUserData, setEditableUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [stories, setStories] = useState<StoryData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [storyId, setStoryId] = useState<number | null>(null)

  // State for the story generation process
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("")
  
  // User prompt for story generation
  const [prompt, setPrompt] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch user data using our API client
        console.log(`Fetching user data for user_id: ${userId}`)
        const userData = await userAPI.getUser(userId)
          setUserData(userData)
        setEditableUserData(userData)

        // Fetch stories using our API client
        console.log(`Fetching stories for user_id: ${userId}`)
        const stories = await storyAPI.getStories(userId)
        setStories(Array.isArray(stories) ? stories : [])
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        setError(`Error fetching dashboard data: ${err.message || String(err)}`)
        
        // If we can't get real data, use sample data
        if (!userData) {
          setUserData(generateSampleUser(userId))
          setEditableUserData(generateSampleUser(userId))
        }
        
        if (stories.length === 0) {
          setStories(generateSampleStories(userId))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  // Generate sample user data for demonstration
  const generateSampleUser = (userId: string): UserData => {
    return {
      user_id: userId,
      display_name: "Echo User",
      birth_date: "1990-01-01",
      birth_location: "New York, USA",
      primary_residence: "San Francisco, USA",
      current_location: "Los Angeles, USA",
      college: "Stanford University",
      educational_level: "Master's Degree",
      profession: "Software Engineer",
      primary_interest: "Technology and Philosophy",
      religion: "Agnostic",
      race: "Mixed",
      parental_income: 87500, // Default sample value
    }
  }

  // Generate sample stories for demonstration
  const generateSampleStories = (userId: string): StoryData[] => {
    const stories: StoryData[] = []
    // Use fixed values that won't change between server and client
    const numStories = 3 // Fixed number to avoid hydration mismatch

    for (let i = 0; i < numStories; i++) {
      stories.push({
        story_id: i + 1,
        transaction_id: `tx-${i}-sample`,
        generated_story_text: `This story explores the interconnected nature of your experiences and how they have shaped both your life and the lives of those around you. Through a series of events, we can see the ripple effects of your choices and circumstances. The narrative begins with a pivotal moment in your childhood and traces how that moment influenced decisions you made later in life.`,
        timestamp: `2025-04-07T${12+i}:00:00.000Z`, // Fixed timestamp
      })
    }

    return stories
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return ""
    }
  }

  // Truncate text to a certain length
  const truncateText = (text: string, maxLength = 150) => {
    if (!text) return "No story text available"
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  // Handle story click
  const handleStoryClick = (storyId: number) => {
    router.push(`/visual?user_id=${userId}&story_id=${storyId}`)
  }

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true)
    setSaveError(null)
    setSaveSuccess(false)
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditableUserData(userData) // Reset to original data
    setSaveError(null)
    setSaveSuccess(false)
  }

  // Handle input change
  const handleInputChange = (field: keyof UserData, value: string) => {
    if (editableUserData) {
      setEditableUserData({
        ...editableUserData,
        [field]: value,
      })
    }
  }

  // Update the handleSaveProfile function to use our API client
  const handleSaveProfile = async () => {
    if (!editableUserData) return

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Convert parental_income to a number if it exists
      let parentalIncome = 0

      if (editableUserData.parental_income !== undefined) {
        if (typeof editableUserData.parental_income === "string") {
          // If it's a string (from select dropdown), convert to number
          parentalIncome = Number.parseInt(editableUserData.parental_income as string, 10)
        } else {
          // If it's already a number
          parentalIncome = editableUserData.parental_income as number
        }
      }

      // Map our data to the format expected by the API
      const apiData = {
        user_id: userId,
        display_name: editableUserData.display_name,
        birth_date: editableUserData.birth_date,
        birth_location: editableUserData.birth_location,
        primary_residence: editableUserData.primary_residence,
        current_location: editableUserData.current_location,
        college: editableUserData.college,
        educational_level: editableUserData.educational_level,
        profession: editableUserData.profession,
        primary_interest: editableUserData.primary_interest,
        religion: editableUserData.religion || "",
        race: editableUserData.race || "",
        parental_income: parentalIncome, // Always send a number value
      }

      // Call our API client to update the user
      const updatedData = await userAPI.updateUser(apiData)

      // Update the user data state with the response
      setUserData({
        ...userData,
        ...updatedData,
      })

      // Make sure editableUserData stays in sync
      setEditableUserData({
        ...editableUserData,
        ...updatedData,
      })

      setSaveSuccess(true)

      // Exit edit mode after a short delay to show success message
      setTimeout(() => {
        setIsEditing(false)
        setSaveSuccess(false)
      }, 2000)
    } catch (err: any) {
      console.error("Error updating user data:", err)
      setSaveError(`Failed to save: ${err.message || String(err)}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Function to generate a new story using our API client's combined function
  const handleGenerateStory = async () => {
    if (!userId) return
    
    try {
      // Set loading state
      setIsLoading(true)
      setError(null)
      
      setLoadingText("Starting story generation...")
      console.log("Starting the story generation process...")
      
      // Use our combined function that handles the entire process
      const storyId = await generateCompleteStory(userId)
      
      console.log("Story generation complete, Id:", storyId)
      
      // Update the UI with the new story ID
      setStoryId(storyId)
      
      // Refresh the stories list
      refreshStories()
      
      // Success - we can navigate to the new story
        if (storyId) {
          router.push(`/visual?user_id=${userId}&story_id=${storyId}`)
        }
      
    } catch (error: any) {
      console.error("Error generating story:", error)
      setError(error.response?.data?.error || error.message || "An unknown error occurred")
    } finally {
      setIsLoading(false)
      setLoadingText("")
    }
  }
  
  // Function to refresh the stories list using our API client
  const refreshStories = async () => {
    try {
      const stories = await storyAPI.getStories(userId)
      setStories(Array.isArray(stories) ? stories : [])
    } catch (error) {
      console.error("Error refreshing stories:", error)
    }
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
        <div className="absolute inset-0 z-0">
          <StarCanvas />
        </div>
        <div className="z-10 flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#ffffff] border-t-transparent" />
          <p className="mt-4 font-serif">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  if (error && !userData) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] text-[#ffffff]">
        <div className="absolute inset-0 z-0">
          <StarCanvas />
        </div>
        <div className="z-10 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-full max-w-md rounded-lg border border-red-500 bg-[#0c0c0c]/80 p-8 backdrop-blur-sm">
            <h1 className="mb-4 font-serif text-2xl text-red-400">Error</h1>
            <p className="font-serif">{error}</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ffffff] px-6 py-2 text-[#0c0c0c] transition-all hover:bg-opacity-90"
            >
              <span className="font-serif">Return Home</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-[#0c0c0c] text-[#ffffff]">
      <div className="absolute inset-0 z-0 opacity-30">
        <StarCanvas />
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl">echo</h1>
          <Link
            href="/"
            className="rounded-full bg-[#ffffff] px-6 py-2 text-[#0c0c0c] transition-all hover:bg-opacity-90"
          >
            <span className="font-serif">sign out</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* User Profile */}
          <div className="col-span-1 rounded-xl border border-[#ffffff]/20 bg-[#0c0c0c]/50 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffffff]/10">
                  <User className="h-8 w-8 text-[#ffffff]" />
                </div>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableUserData?.display_name || ""}
                      onChange={(e) => handleInputChange("display_name", e.target.value)}
                      className="w-full bg-transparent border-b border-[#ffffff]/30 px-1 py-1 font-serif text-2xl focus:border-[#ffffff] focus:outline-none"
                    />
                  ) : (
                    <h2 className="font-serif text-2xl">{userData?.display_name || "Echo User"}</h2>
                  )}
                  <p className="text-sm text-[#ffffff]/70">User ID: {userData?.user_id || userId}</p>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-1 rounded-full border border-[#ffffff]/30 px-3 py-1 text-sm hover:bg-[#ffffff]/10"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 rounded-full border border-[#ffffff]/30 px-3 py-1 text-sm hover:bg-[#ffffff]/10"
                    disabled={isSaving}
                  >
                    <X className="h-3 w-3" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1 rounded-full bg-[#ffffff] px-3 py-1 text-[#0c0c0c] text-sm hover:bg-opacity-90 disabled:opacity-50"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {saveError && <div className="mb-4 rounded-md bg-red-900/30 p-2 text-sm text-red-300">{saveError}</div>}

            {saveSuccess && (
              <div className="mb-4 rounded-md bg-green-900/30 p-2 text-sm text-green-300">
                Profile updated successfully!
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-5 w-5 text-[#ffffff]/70" />
                <div className="flex-1">
                  <p className="text-sm text-[#ffffff]/70">Birth Date</p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editableUserData?.birth_date || ""}
                      onChange={(e) => handleInputChange("birth_date", e.target.value)}
                      className="w-full bg-transparent border-b border-[#ffffff]/30 px-1 py-1 font-serif focus:border-[#ffffff] focus:outline-none"
                    />
                  ) : (
                    <p className="font-serif">{userData?.birth_date || "Not specified"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-[#ffffff]/70" />
                <div className="flex-1">
                  <p className="text-sm text-[#ffffff]/70">Birth Location</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableUserData?.birth_location || ""}
                      onChange={(e) => handleInputChange("birth_location", e.target.value)}
                      className="w-full bg-transparent border-b border-[#ffffff]/30 px-1 py-1 font-serif focus:border-[#ffffff] focus:outline-none"
                    />
                  ) : (
                    <p className="font-serif">{userData?.birth_location || "Not specified"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-[#ffffff]/70" />
                <div className="flex-1">
                  <p className="text-sm text-[#ffffff]/70">Primary Residence</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableUserData?.primary_residence || ""}
                      onChange={(e) => handleInputChange("primary_residence", e.target.value)}
                      className="w-full bg-transparent border-b border-[#ffffff]/30 px-1 py-1 font-serif focus:border-[#ffffff] focus:outline-none"
                    />
                  ) : (
                    <p className="font-serif">{userData?.primary_residence || "Not specified"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-[#ffffff]/70" />
                <div className="flex-1">
                  <p className="text-sm text-[#ffffff]/70">Current Location</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableUserData?.current_location || ""}
                      onChange={(e) => handleInputChange("current_location", e.target.value)}
                      className="w-full bg-transparent border-b border-[#ffffff]/30 px-1 py-1 font-serif focus:border-[#ffffff] focus:outline-none"
                    />
                  ) : (
                    <p className="font-serif">{userData?.current_location || "Not specified"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GraduationCap className="mt-1 h-5 w-5 text-[#ffffff]/70" />
                <div className="flex-1">
                  <p className="text-sm text-[#ffffff]/70">Education</p>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editableUserData?.educational_level || ""}
                        onChange={(e) => handleInputChange("educational_level", e.target.value)}
                        className="w-full bg-transparent border-b border-[#ffffff]/30 px-1 py-1 font-serif focus:border-[#ffffff] focus:outline-none"
                        placeholder="Degree"
                      />
                      <input
                        type="text"
                        value={editableUserData?.college || ""}
                        onChange={(e) => handleInputChange("college", e.target.value)}
                        className="w-full bg-transparent border-b border-[#ffffff]/30 px-1 py-1 text-sm mt-1 focus:border-[#ffffff] focus:outline-none"
                        placeholder="School"
                      />
                    </>
                  ) : (
                    <>
                      <p className="font-serif">{userData?.educational_level || "Not specified"}</p>
                      <p className="text-sm">{userData?.college || ""}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="mt-1 h-5 w-5 text-[#ffffff]/70" />
                <div className="flex-1">
                  <p className="text-sm text-[#ffffff]/70">Profession</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableUserData?.profession || ""}
                      onChange={(e) => handleInputChange("profession", e.target.value)}
                      className="w-full bg-transparent border-b border-[#ffffff]/30 px-1 py-1 font-serif focus:border-[#ffffff] focus:outline-none"
                    />
                  ) : (
                    <p className="font-serif">{userData?.profession || "Not specified"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Heart className="mt-1 h-5 w-5 text-[#ffffff]/70" />
                <div className="flex-1">
                  <p className="text-sm text-[#ffffff]/70">Primary Interest</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableUserData?.primary_interest || ""}
                      onChange={(e) => handleInputChange("primary_interest", e.target.value)}
                      className="w-full bg-transparent border-b border-[#ffffff]/30 px-1 py-1 font-serif focus:border-[#ffffff] focus:outline-none"
                    />
                  ) : (
                    <p className="font-serif">{userData?.primary_interest || "Not specified"}</p>
                  )}
                </div>
              </div>

              {/* New Parental Income Field */}
              <div className="flex items-start gap-3">
                <DollarSign className="mt-1 h-5 w-5 text-[#ffffff]/70" />
                <div className="flex-1">
                  <p className="text-sm text-[#ffffff]/70">Parental Income</p>
                  {isEditing ? (
                    <select
                      value={editableUserData?.parental_income?.toString() || "0"}
                      onChange={(e) => handleInputChange("parental_income", e.target.value)}
                      className="w-full bg-[#0c0c0c] border-b border-[#ffffff]/30 px-1 py-1 font-serif focus:border-[#ffffff] focus:outline-none"
                    >
                      {INCOME_RANGES.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-serif">{getIncomeLabel(userData?.parental_income)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stories */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl">Your Stories</h2>

              {/* Generate New Story Button */}
              <button
                onClick={handleGenerateStory}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-full bg-[#ffffff] px-4 py-2 text-[#0c0c0c] transition-all hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="font-serif">Generating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span className="font-serif">New Story</span>
                  </>
                )}
              </button>
            </div>

            {/* Story Generation Progress */}
            {isLoading && (
              <div className="mb-4 rounded-xl border border-[#ffffff]/20 bg-[#0c0c0c]/50 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-serif">{loadingText || "Processing..."}</p>
                </div>
                <div className="flex items-center justify-center py-2">
                <div className="h-2 w-full bg-[#ffffff]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#ffffff]/70 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
                </div>
                <p className="text-center text-sm text-[#ffffff]/70 mt-2">This may take a few minutes...</p>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-[#0c0c0c]/50 p-4 backdrop-blur-sm">
                <p className="text-red-300">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-[#ffffff]/70 hover:text-[#ffffff]"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Stories List */}
            {stories.length === 0 && !isLoading ? (
              <div className="rounded-xl border border-[#ffffff]/20 bg-[#0c0c0c]/50 p-6 text-center backdrop-blur-sm">
                <p className="font-serif">No stories found. Start creating your first story!</p>
                <button
                  onClick={handleGenerateStory}
                  className="mt-4 flex items-center gap-2 rounded-full bg-[#ffffff] px-4 py-2 text-[#0c0c0c] transition-all hover:bg-opacity-90 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-serif">Generate Story</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {stories.map((story) => (
                  <div
                    key={story.story_id}
                    className="group cursor-pointer rounded-xl border border-[#ffffff]/20 bg-[#0c0c0c]/50 p-6 transition-all hover:border-[#ffffff]/40 hover:bg-[#0c0c0c]/70 backdrop-blur-sm"
                    onClick={() => handleStoryClick(story.story_id)}
                  >
                    <h3 className="mb-2 font-serif text-xl">
                      {formatDate(story.timestamp)} {formatTime(story.timestamp)}
                    </h3>
                    <p className="mb-4 text-sm text-[#ffffff]/70">{truncateText(story.generated_story_text)}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-sm text-[#ffffff] opacity-0 transition-opacity group-hover:opacity-100">
                        View <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

