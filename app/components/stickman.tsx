"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"

const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" strokeWidth={2} />
    <path
      strokeLinecap="round"
      strokeWidth={2}
      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
    />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
    />
  </svg>
)

interface ReactiveAsteriskProps {
  secondaryColor: string
  onColorCycle: () => void
  isLightMode?: boolean
  onToggleLightMode?: () => void
}

export default function ReactiveAsterisk({
  secondaryColor,
  onColorCycle,
  isLightMode = false,
  onToggleLightMode,
}: ReactiveAsteriskProps) {
  const asteriskRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isHoveringToggle, setIsHoveringToggle] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty("--secondary-color", secondaryColor)
  }, [secondaryColor])

  const textColor = isLightMode ? "#1a1a1a" : "#ffffff"
  const borderColor = isLightMode ? "#1a1a1a" : "#ffffff"
  const bgColor = isLightMode ? "#f5f5f5" : "#000000"

  return (
    <>
      {/* Floating navigation bar */}
      <div
        className="fixed top-4 left-4 z-40 border-[3px]"
        style={{ backgroundColor: bgColor, borderColor: borderColor }}
      >
        <div className="flex items-center h-12">
          {/* FC Logo */}
          <Link
            href="/"
            className="text-lg font-black opacity-80 select-none font-mono hover:opacity-100 transition-opacity px-6 border-r-[3px] h-full flex items-center"
            style={{ color: secondaryColor, borderColor: borderColor }}
          >
            FC
          </Link>

          {/* Home Link */}
          <Link
            href="/"
            className="text-lg font-black uppercase tracking-wider hover:brightness-125 transition-all px-6 border-r-[3px] h-full flex items-center"
            style={{ color: secondaryColor, borderColor: borderColor }}
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

      <div className="fixed top-4 right-4 z-40 flex items-center gap-4 h-12">
        {/* Light/Dark mode toggle */}
        {onToggleLightMode && (
          <div className="relative">
            <button
              onClick={onToggleLightMode}
              onMouseEnter={() => setIsHoveringToggle(true)}
              onMouseLeave={() => setIsHoveringToggle(false)}
              className="w-10 h-10 flex items-center justify-center opacity-70 hover:opacity-100 transition-all hover:scale-110"
              style={{ color: secondaryColor }}
            >
              {isLightMode ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
            <div
              className="absolute -bottom-8 right-0 text-xs font-mono opacity-60 transition-all duration-300 whitespace-nowrap"
              style={{ color: textColor }}
            >
              {isHoveringToggle ? "switch!" : isLightMode ? "dark mode" : "light mode"}
            </div>
          </div>
        )}

        {/* Asterisk */}
        <div ref={asteriskRef} className="cursor-pointer relative">
          <div
            className="text-4xl md:text-6xl font-black opacity-70 select-none font-mono transition-all duration-300 ease-out hover:opacity-100 hover:scale-110"
            style={{ color: secondaryColor }}
            onClick={onColorCycle}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            *
          </div>
          <div
            className="absolute -bottom-8 right-0 text-xs font-mono opacity-60 transition-all duration-300 whitespace-nowrap"
            style={{ color: textColor }}
          >
            {isHovering ? "dot it!!!" : "click to change color"}
          </div>
        </div>
      </div>
    </>
  )
}
