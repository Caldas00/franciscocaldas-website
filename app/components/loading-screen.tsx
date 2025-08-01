"use client"

import { useState, useEffect } from "react"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

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

    return () => clearInterval(progressTimer)
  }, [])

  // Create ASCII progress bar
  const barLength = 20
  const filledLength = Math.floor((progress / 100) * barLength)
  const emptyLength = barLength - filledLength
  const progressBar = "#".repeat(filledLength) + "-".repeat(emptyLength)

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
      <div className="font-mono text-[#7399C6] text-base md:text-lg text-center">
        <div className="mb-4 text-sm md:text-base opacity-80">Loading Portfolio...</div>
        <div className="text-lg md:text-xl">{progressBar}</div>
        <div className="mt-2 text-sm md:text-base">({Math.floor(progress)}%)</div>
      </div>
    </div>
  )
}
