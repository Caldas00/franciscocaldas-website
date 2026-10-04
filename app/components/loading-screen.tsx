"use client"

import { useState, useEffect } from "react"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [colorIndex, setColorIndex] = useState(0)
  
  const colors = ["#7399C6", "#FFB366", "#98D8A8", "#F08BA0"]

  useEffect(() => {
    const duration = 4000 // 4 seconds
    const interval = 50 // Update every 50ms
    const increment = 100 / (duration / interval)

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          return 100
        }
        return Math.min(prev + increment, 100)
      })
    }, interval)

    // Cycle colors
    const colorTimer = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length)
    }, 800)

    return () => {
      clearInterval(progressTimer)
      clearInterval(colorTimer)
    }
  }, [])

  // Create ASCII progress bar
  const barLength = 24
  const filledLength = Math.floor((progress / 100) * barLength)
  const emptyLength = barLength - filledLength
  const progressBar = "█".repeat(filledLength) + "░".repeat(emptyLength)

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
      <div className="font-mono text-center">
        {/* Logo/Initials */}
        <div 
          className="text-6xl md:text-8xl font-black mb-8 transition-colors duration-300"
          style={{ color: colors[colorIndex] }}
        >
          FC.
        </div>
        
        {/* Progress bar */}
        <div 
          className="text-lg md:text-xl tracking-widest mb-3 transition-colors duration-300"
          style={{ color: colors[colorIndex] }}
        >
          [{progressBar}]
        </div>
        
        {/* Percentage */}
        <div 
          className="text-sm md:text-base font-bold transition-colors duration-300"
          style={{ color: colors[colorIndex] }}
        >
          {Math.floor(progress)}%
        </div>
        
        {/* Loading text */}
        <div className="mt-6 text-xs md:text-sm uppercase tracking-widest text-white opacity-50">
          Initializing...
        </div>
      </div>
    </div>
  )
}
