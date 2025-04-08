"use client"

import React, { useEffect } from "react"

interface AnnotatedTextProps {
  text: string
}

export function AnnotatedText({ text }: AnnotatedTextProps) {
  useEffect(() => {
    console.log("Raw annotated text input:", text);
  }, [text]);

  // Map entity types to colors
  const getEntityColor = (type: string): string => {
    const colors: Record<string, string> = {
      // People and organizations - blues
      "PERSON": "#60a5fa", 
      "NORP": "#93c5fd",
      "ORG": "#3b82f6",
      
      // Locations - greens
      "FAC": "#4ade80",
      "GPE": "#22c55e", 
      "LOC": "#16a34a",
      
      // Objects - purples
      "PRODUCT": "#c084fc",
      "WORK_OF_ART": "#a855f7",
      
      // Events and concepts - reds
      "EVENT": "#f87171",
      "LAW": "#ef4444",
      "LANGUAGE": "#fca5a5",
      
      // Dates and numbers - yellows/oranges
      "DATE": "#facc15",
      "TIME": "#eab308",
      "PERCENT": "#f59e0b",
      "MONEY": "#f97316",
      "QUANTITY": "#ea580c",
      "ORDINAL": "#d97706",
      "CARDINAL": "#b45309"
    };
    
    return colors[type] || "#9ca3af"; // Default gray
  };

  // Break the text into segments that are either regular text or entities
  const renderText = () => {
    if (!text) return <span>No text available</span>;
    
    try {
      // Create segments from the text
      const segments: React.ReactNode[] = [];
      let lastIndex = 0;
      
      // Match pattern [TAG]text[/TAG] instead of [TAG:text]
      const regex = /\[([\w_]+)\](.*?)\[\/([\w_]+)\]/g;
      let match;
      
      // Use RegExp.exec which maintains state between calls
      while ((match = regex.exec(text)) !== null) {
        console.log("Found entity match:", match[0]);
        
        // If there's regular text before the match, add it
        if (match.index > lastIndex) {
          segments.push(
            <span key={`text-${lastIndex}`}>
              {text.substring(lastIndex, match.index)}
            </span>
          );
        }
        
        // Add the entity with proper styling
        const entityType = match[1];
        const entityText = match[2];
        const color = getEntityColor(entityType);
        
        console.log(`Entity: [${entityType}] Text: "${entityText}"`);
        
        segments.push(
          <span 
            key={`entity-${match.index}`}
            style={{
              color: color,
              backgroundColor: `${color}20`, // 20% opacity
              border: `1px solid ${color}40`,  // 40% opacity
              borderRadius: '0.25rem',
              padding: '0.125rem 0.25rem',
              margin: '0 1px',
              display: 'inline-block'
            }}
          >
            {entityText}
          </span>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text
      if (lastIndex < text.length) {
        segments.push(
          <span key={`text-${lastIndex}`}>
            {text.substring(lastIndex)}
          </span>
        );
      }
      
      return segments.length > 0 ? segments : <span>{text}</span>;
    } catch (e) {
      console.error("Error rendering annotated text:", e);
      return <span>{text}</span>;
    }
  };

  return (
    <div className="font-serif text-white leading-relaxed">
      {renderText()}
    </div>
  );
}

export default AnnotatedText

