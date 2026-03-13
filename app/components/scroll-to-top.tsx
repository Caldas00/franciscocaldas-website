"use client"

import { useState, useEffect } from "react"

// Custom ChevronUp icon to avoid import issues
const ChevronUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
  </svg>
)

interface ScrollToTopProps {
  secondaryColor: string
  isLightMode?: boolean
}

export default function ScrollToTop({ secondaryColor, isLightMode = false }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  const bgColor = isLightMode ? '#f5f5f5' : '#000000'
  const textColor = isLightMode ? '#1a1a1a' : '#ffffff'
  const hoverTextColor = isLightMode ? '#f5f5f5' : '#000000'

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-40 p-4 transition-all duration-300 group"
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${secondaryColor}`,
        color: secondaryColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = secondaryColor
        e.currentTarget.style.color = hoverTextColor
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = bgColor
        e.currentTarget.style.color = secondaryColor
        e.currentTarget.style.transform = 'translateY(0)'
      }}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  )
}
