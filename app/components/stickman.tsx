"use client"

import { useRef, useState, useEffect } from "react"

interface ReactiveAsteriskProps {
  secondaryColor: string
  onColorCycle: () => void
}

export default function ReactiveAsterisk({ secondaryColor, onColorCycle }: ReactiveAsteriskProps) {
  const asteriskRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isFCHovering, setIsFCHovering] = useState(false)

  useEffect(() => {
    // Update CSS custom property when secondary color changes
    document.documentElement.style.setProperty("--secondary-color", secondaryColor)
  }, [secondaryColor])

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return "Good morning, stranger."
    } else if (hour >= 12 && hour < 18) {
      return "Good afternoon, visitor."
    } else {
      return "Good evening, intruder."
    }
  }

  return (
    <>
      {/* FC Symbol in top left corner with always-visible message */}
      <div className="fixed top-8 left-8 z-40 cursor-default">
        <div
          className="text-2xl font-black opacity-80 select-none font-mono"
          style={{ color: secondaryColor }}
          onMouseEnter={() => setIsFCHovering(true)}
          onMouseLeave={() => setIsFCHovering(false)}
        >
          FC
        </div>
        <div className="absolute -bottom-8 left-0 text-xs font-mono text-white opacity-60 transition-all duration-300 whitespace-nowrap">
          {isFCHovering ? getTimeBasedGreeting() : "hover for greeting"}
        </div>
      </div>

      {/* Static asterisk in top right corner with color indicator */}
      <div ref={asteriskRef} className="fixed top-8 right-8 z-40 cursor-pointer">
        <div
          className="text-6xl font-black opacity-70 select-none font-mono transition-all duration-300 ease-out hover:opacity-100 hover:scale-110"
          style={{ color: secondaryColor }}
          onClick={onColorCycle}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          *
        </div>
        <div className="absolute -bottom-8 right-0 text-xs font-mono text-white opacity-60 transition-all duration-300 whitespace-nowrap">
          {isHovering ? "dot it!!!" : "click to change color"}
        </div>
      </div>
    </>
  )
}
