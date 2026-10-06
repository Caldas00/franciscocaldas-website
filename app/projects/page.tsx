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

  const colors = ["#7399C6", "#FFB366", "#98D8A8", "#F08BA0"]
  const lightModeColors = ["#4A6FA5", "#CC8A3D", "#5A9B6B", "#C94F6D"]

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
      color: isLightMode ? "#4A6FA5" : "#7399C6",
      tag: "Computer Vision",
    },
    {
      id: "flappy-dqn",
      name: "Flappy Bird DQN",
      description:
        "Deep Q-Learning neural network that learns to play Flappy Bird through reinforcement learning with 25K parameters and epsilon-greedy exploration.",
      link: "/projects/flappy-dqn",
      color: isLightMode ? "#CC8A3D" : "#FFB366",
      tag: "Reinforcement Learning",
    },
    {
      id: "rag-financial-accounting",
      name: "RAG Financial Accounting",
      description:
        "Retrieval-Augmented Generation chatbot built to help my brother study Financial Accounting, answering questions only from the course notes and citing the source slide and page.",
      link: "/projects/rag-financial-accounting",
      color: isLightMode ? "#5A9B6B" : "#98D8A8",
      tag: "LLM / RAG",
    },
    {
      id: "marios-bombs-away",
      name: "Mario's Bombs Away",
      description:
        "Double DQN agent that learned to play the original 1983 Nintendo Game & Watch in MAME, using LCD segments and hidden variables reverse-engineered from the chip's RAM. Best run: 44 bombs delivered in a single life.",
      link: "/projects/marios-bombs-away",
      color: isLightMode ? "#C94F6D" : "#F08BA0",
      tag: "Reinforcement Learning",
    },
    {
      id: "pixel-airport",
      name: "Pixelport ATC",
      description:
        "A small pixel-art airport game in plain JavaScript where you are the controller: clear arrivals to land, release them from the gate and send them off again before anyone runs out of fuel.",
      // Static game served from public/pixelart, opened directly with no project write-up
      link: "/pixelart/index.html",
      color: isLightMode ? "#4A6FA5" : "#7399C6",
      tag: "Game",
      cta: "Play",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              // The game is a static page in public/, so it needs a full page load rather than client-side routing
              const CardLink = project.link.startsWith("/projects/") ? Link : "a"
              return (
                <div key={project.id}>
                  <CardLink
                    href={project.link}
                    className="border-2 p-6 h-full flex flex-col items-start transition-all group relative overflow-hidden"
                    style={{ borderColor: project.color }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.backgroundColor = isLightMode 
                          ? `${project.color}10` 
                          : `${project.color}15`
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    {/* Tag */}
                    <div 
                      className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4"
                      style={{ 
                        backgroundColor: project.color,
                        color: isLightMode ? '#f5f5f5' : '#000000'
                      }}
                    >
                      {project.tag}
                    </div>
                    
                    <h2
                      className="text-2xl sm:text-3xl font-black mb-3 uppercase transition-colors"
                      style={{ color: project.color }}
                    >
                      {project.name}
                    </h2>
                    <p className="text-sm sm:text-base leading-relaxed mb-4 opacity-90">{project.description}</p>
                    
                    {/* Accent line */}
                    <div 
                      className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300"
                      style={{ backgroundColor: project.color }}
                    />
                    
                    <div
                      className="mt-auto text-sm font-bold uppercase tracking-wide inline-flex items-center gap-2"
                      style={{ color: project.color }}
                    >
                      {project.cta ?? "Read more"}
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </CardLink>
                </div>
                )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: borderColor }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm opacity-80">&copy; 2025 Francisco Caldas. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
