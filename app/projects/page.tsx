"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Stickman from "../components/stickman"
import CursorTrail from "../components/cursor-trail"
import HelpOverlay from "../components/help-overlay"
import ScrollToTop from "../components/scroll-to-top"

export default function ProjectsPage() {
  const [secondaryColor, setSecondaryColor] = useState("#7399C6")
  const [colorIndex, setColorIndex] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLightMode, setIsLightMode] = useState(true)

  const colors = ["#7399C6", "#FFB366", "#98D8A8"]
  const lightModeColors = ["#4A6FA5", "#CC8A3D", "#5A9B6B"]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const cycleColor = () => {
    const nextIndex = (colorIndex + 1) % colors.length
    setColorIndex(nextIndex)
    setSecondaryColor(isLightMode ? lightModeColors[nextIndex] : colors[nextIndex])
  }

  const toggleLightMode = () => {
    const newMode = !isLightMode
    setIsLightMode(newMode)
    setSecondaryColor(newMode ? lightModeColors[colorIndex] : colors[colorIndex])
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c") {
        cycleColor()
      } else if (e.key === "?") {
        setShowHelp(!showHelp)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [colorIndex, showHelp, isLightMode])

  const projects = [
    {
      id: "yolo-liga",
      name: "YOLO Liga",
      description:
        "Computer vision system to automatically detect sponsor advertisements in Portuguese football broadcasts, giving companies a data-driven way to measure their broadcast ROI.",
      link: "/projects/yolo-liga",
    },
    {
      id: "flappy-dqn",
      name: "Flappy Bird DQN",
      description:
        "Deep Q-Learning neural network that learns to play Flappy Bird through reinforcement learning with 25K parameters and epsilon-greedy exploration.",
      link: "/projects/flappy-dqn",
    },
  ]

  const bgColor = isLightMode ? "#f5f5f5" : "#000000"
  const textColor = isLightMode ? "#1a1a1a" : "#ffffff"
  const borderColor = isLightMode ? "#1a1a1a" : "#ffffff"

  return (
    <div
      className="min-h-screen relative overflow-x-hidden transition-colors duration-300"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {!isMobile && <CursorTrail isLightMode={isLightMode} />}
      <Stickman
        secondaryColor={secondaryColor}
        onColorCycle={cycleColor}
        isLightMode={isLightMode}
        onToggleLightMode={toggleLightMode}
      />
      {!isMobile && <HelpOverlay isVisible={showHelp} />}
      <ScrollToTop secondaryColor={secondaryColor} />

      <div className="pt-24 px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1
              className="text-4xl sm:text-6xl font-black uppercase tracking-wider mb-4"
              style={{ color: secondaryColor }}
            >
              Projects
            </h1>
            <div className="w-full h-px" style={{ backgroundColor: borderColor }}></div>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-8">
            {projects.map((project) => (
              <div key={project.id}>
                <Link
                  href={project.link}
                  className="border p-6 block transition-all"
                  style={{ borderColor: borderColor }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.borderColor = secondaryColor
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.borderColor = borderColor
                    }
                  }}
                >

                  <h2
                    className="text-2xl sm:text-3xl font-black mb-3 uppercase transition-colors"
                    style={{ color: secondaryColor }}
                  >
                    {project.name}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed mb-4 opacity-90">{project.description}</p>
                  <div
                    className="text-sm font-bold uppercase tracking-wide inline-block"
                    style={{ color: secondaryColor }}
                  >
                    Read more
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: borderColor }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm opacity-80 mb-2">&copy; 2025 Francisco Caldas. All rights reserved.</div>
          <div className="text-sm opacity-60">Daily reader | Tennis enthusiast | Future Software Engineer</div>
        </div>
      </footer>
    </div>
  )
}
