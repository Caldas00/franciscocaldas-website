"use client"

import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"

interface ScrollToTopProps {
  secondaryColor: string
}

export default function ScrollToTop({ secondaryColor }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

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
      className="fixed bottom-8 right-8 z-40 p-3 bg-transparent border border-white text-white transition-all duration-300 hover:text-black"
      style={{
        "--hover-bg": secondaryColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = secondaryColor
        e.currentTarget.style.borderColor = secondaryColor
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent"
        e.currentTarget.style.borderColor = "white"
      }}
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  )
}
