"use client"

import React from "react"

interface AnnotatedTextProps {
  text: string
}

export function AnnotatedText({ text }: AnnotatedTextProps) {
  // Simple pattern to match annotated text between markers
  // Real implementation might use a more sophisticated pattern
  const processAnnotatedText = () => {
    // For demonstration, simply highlight text wrapped in different markers
    // In a real implementation, you might parse JSON or specific annotation formats
    
    // Replace person annotations with highlighted spans
    let processed = text.replace(
      /\[PERSON:(.*?)\]/g, 
      '<span class="bg-blue-400 bg-opacity-30 px-1 rounded">$1</span>'
    )
    
    // Replace location annotations
    processed = processed.replace(
      /\[LOCATION:(.*?)\]/g, 
      '<span class="bg-green-400 bg-opacity-30 px-1 rounded">$1</span>'
    )
    
    // Replace date/time annotations
    processed = processed.replace(
      /\[DATE:(.*?)\]/g, 
      '<span class="bg-yellow-400 bg-opacity-30 px-1 rounded">$1</span>'
    )
    
    // Replace emotion annotations
    processed = processed.replace(
      /\[EMOTION:(.*?)\]/g, 
      '<span class="bg-purple-400 bg-opacity-30 px-1 rounded">$1</span>'
    )
    
    // Replace any other annotations
    processed = processed.replace(
      /\[(.*?):(.*?)\]/g, 
      '<span class="bg-gray-400 bg-opacity-30 px-1 rounded">$2</span>'
    )
    
    return processed
  }

  return (
    <div 
      className="font-serif text-[#ffffffcc]"
      dangerouslySetInnerHTML={{ __html: processAnnotatedText() }}
    />
  )
}

export default AnnotatedText

