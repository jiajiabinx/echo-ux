import type React from "react"

interface AnnotatedTextProps {
  text: string
}

export const AnnotatedText: React.FC<AnnotatedTextProps> = ({ text }) => {
  if (!text) return <span>No text available</span>

  // Check if the text contains annotations
  if (!text.includes("[") || !text.includes("]")) {
    return <span>{text}</span>
  }

  // Entity type to color mapping
  const entityColors: Record<string, string> = {
    PERSON: "#ff9e80", // Light red
    NORP: "#b39ddb", // Light purple
    FAC: "#80cbc4", // Light teal
    ORG: "#90caf9", // Light blue
    GPE: "#ffcc80", // Light orange
    LOC: "#a5d6a7", // Light green
    PRODUCT: "#ce93d8", // Light purple
    EVENT: "#80deea", // Light cyan
    WORK_OF_ART: "#ef9a9a", // Light red
    LAW: "#c5e1a5", // Light green
    LANGUAGE: "#fff59d", // Light yellow
    DATE: "#81d4fa", // Light blue
    TIME: "#b0bec5", // Light blue grey
    PERCENT: "#9fa8da", // Light indigo
    MONEY: "#a5d6a7", // Light green
    QUANTITY: "#ffe082", // Light amber
    ORDINAL: "#bcaaa4", // Light brown
    CARDINAL: "#b0bec5", // Light blue grey
  }

  // Parse the annotated text
  const parts: React.ReactNode[] = []
  let currentIndex = 0
  let key = 0

  // Regular expression to match entity tags
  const entityRegex = /\[([A-Z_]+)\](.*?)\[\/\1\]/g
  let match

  while ((match = entityRegex.exec(text)) !== null) {
    const [fullMatch, entityType, entityText] = match
    const startIndex = match.index
    const endIndex = startIndex + fullMatch.length

    // Add text before the entity
    if (startIndex > currentIndex) {
      parts.push(<span key={key++}>{text.substring(currentIndex, startIndex)}</span>)
    }

    // Add the entity with styling
    const color = entityColors[entityType] || "#ffffff"
    parts.push(
      <span
        key={key++}
        className="rounded px-1"
        style={{ backgroundColor: color, color: "#000000" }}
        title={entityType}
      >
        {entityText}
      </span>,
    )

    currentIndex = endIndex
  }

  // Add any remaining text
  if (currentIndex < text.length) {
    parts.push(<span key={key++}>{text.substring(currentIndex)}</span>)
  }

  return <>{parts}</>
}

export default AnnotatedText

