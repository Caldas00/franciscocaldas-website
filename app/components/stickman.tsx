"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"

interface ReactiveAsteriskProps {
  secondaryColor: string
  onColorCycle: () => void
}

export default function ReactiveAsterisk({ secondaryColor, onColorCycle }: ReactiveAsteriskProps) {
  const asteriskRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    // Update CSS custom property when secondary color changes
    document.documentElement.style.setProperty("--secondary-color", secondaryColor)
  }, [secondaryColor])

  return (
    <>
      {/* Floating navigation bar with thicker borders and reduced height */}
      <div className="fixed top-4 left-4 z-40 bg-black border-[3px] border-white">
        <div className="flex items-center h-12">
          {/* FC Logo */}
          <Link
            href="/"
            className="text-lg font-black opacity-80 select-none font-mono hover:opacity-100 transition-opacity px-6 border-r-[3px] border-white h-full flex items-center"
            style={{ color: secondaryColor }}
          >
            FC
          </Link>

          {/* Home Link */}
          <Link
            href="/"
            className="text-lg font-black uppercase tracking-wider hover:brightness-125 transition-all px-6 border-r-[3px] border-white h-full flex items-center"
            style={{ color: secondaryColor }}
          >
            Home
          </Link>

          {/* Projects Link */}
          <Link
            href="/projects"
            className="text-lg font-black uppercase tracking-wider hover:brightness-125 transition-all px-6 h-full flex items-center"
            style={{ color: secondaryColor }}
          >
            Projects
          </Link>
        </div>
      </div>

      {/* Asterisk without box, aligned with navigation bar */}
      <div ref={asteriskRef} className="fixed top-4 right-4 z-40 cursor-pointer h-12 flex items-center">
        <div
          className="text-4xl md:text-6xl font-black opacity-70 select-none font-mono transition-all duration-300 ease-out hover:opacity-100 hover:scale-110"
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
