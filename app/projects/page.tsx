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

  const colors = ["#7399C6", "#FFB366", "#98D8A8"]

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
    setSecondaryColor(colors[nextIndex])
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
  }, [colorIndex, showHelp])

  const projects = [
    {
      id: "aiexec",
      name: "AI Executable Prompt",
      description:
        "Execute .ai scripts directly from your terminal, turning natural-language instructions into real actions with local-first architecture.",
      link: "/projects/aiexec",
    },
    {
      id: "flappy-dqn",
      name: "Flappy Bird DQN",
      description:
        "Deep Q-Learning neural network that learns to play Flappy Bird through reinforcement learning with ~25K parameters and epsilon-greedy exploration.",
      link: "/projects/flappy-dqn",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {!isMobile && <CursorTrail />}
      <Stickman secondaryColor={secondaryColor} onColorCycle={cycleColor} />
      {!isMobile && <HelpOverlay isVisible={showHelp} />}
      <ScrollToTop secondaryColor={secondaryColor} />

      {/* Add top padding to account for fixed header */}
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
            <div className="w-full h-px bg-white"></div>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-8">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={project.link}
                className="border border-white p-6 hover:border-opacity-100 transition-all group"
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.borderColor = secondaryColor
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.borderColor = "white"
                  }
                }}
              >
                <h2
                  className="text-2xl sm:text-3xl font-black mb-3 uppercase transition-colors"
                  style={{
                    color: secondaryColor,
                  }}
                >
                  {project.name}
                </h2>
                <p className="text-sm sm:text-base leading-relaxed mb-4 opacity-90">{project.description}</p>
                <div
                  className="text-sm font-bold uppercase tracking-wide inline-block"
                  style={{ color: secondaryColor }}
                >
                  Read more →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm opacity-80 mb-2">&copy; 2025 Francisco Caldas. All rights reserved.</div>
          <div className="text-sm opacity-60">Daily reader • Tennis enthusiast • Future Software Engineer</div>
        </div>
      </footer>
    </div>
  )
}
