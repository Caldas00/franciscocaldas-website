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
      className="fixed bottom-8 right-8 z-40 border border-white bg-black p-3 text-white hover:text-black transition-colors duration-300"
      style={{
        "--hover-bg": secondaryColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = secondaryColor
        e.currentTarget.style.color = "black"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "black"
        e.currentTarget.style.color = "white"
      }}
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  )
}
