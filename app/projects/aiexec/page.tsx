"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Stickman from "../../components/stickman"
import CursorTrail from "../../components/cursor-trail"
import HelpOverlay from "../../components/help-overlay"
import ScrollToTop from "../../components/scroll-to-top"

const Copy = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
)

const ExternalLink = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
)

export default function AiexecPage() {
  const [secondaryColor, setSecondaryColor] = useState("#7399C6")
  const [colorIndex, setColorIndex] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("pip install aiexec")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {!isMobile && <CursorTrail />}
      <Stickman secondaryColor={secondaryColor} onColorCycle={cycleColor} />
      {!isMobile && <HelpOverlay isVisible={showHelp} />}
      <ScrollToTop secondaryColor={secondaryColor} />

      {/* Add top padding to account for fixed header */}
      <div className="pt-24 px-4 pb-16 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 mb-8 text-sm uppercase font-bold opacity-80 hover:opacity-100 transition-opacity"
          >
            <span>←</span> Back to Projects
          </Link>

          {/* Project Title */}
          <div className="mb-8">
            <h1
              className="text-4xl sm:text-6xl font-black uppercase tracking-tight mb-3"
              style={{ color: secondaryColor }}
            >
              AI Executable Prompt
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold opacity-90">Run .ai scripts like code</h2>
          </div>

          {/* Install Box with GitHub Link */}
          <div className="border border-white p-6 mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-black border border-white px-4 py-3 font-mono text-sm font-bold flex-1">
                pip install aiexec
              </div>
              <button
                onClick={copyToClipboard}
                className="border border-white p-3 hover:bg-white hover:text-black transition-colors flex-shrink-0"
                title="Copy to clipboard"
              >
                <Copy className="w-5 h-5" />
              </button>
              {copied && <span className="text-sm opacity-80 whitespace-nowrap">Copied!</span>}
            </div>
            <a
              href="https://github.com/Caldas00/ai-executable"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white px-6 py-3 font-black uppercase text-sm hover:text-black transition-colors whitespace-nowrap"
              style={{
                color: secondaryColor,
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = secondaryColor
                  e.currentTarget.style.color = "black"
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = secondaryColor
                }
              }}
            >
              View on GitHub
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Description */}
          <div className="space-y-6 mb-12">
            <p className="text-base sm:text-lg leading-relaxed">
              Execute .ai scripts directly from your terminal, turning natural-language instructions into real actions.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Agentic Reason–Act–Verify loop that plans, executes, and re-evaluates each step until the goal is met.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Local-first architecture that works entirely offline with Ollama or other open-source language models.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Built-in safety layer with sandbox mode, permission control, and command validation to prevent harmful
              actions.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Extensible backend design allowing any local or API-based model to be plugged in easily.
            </p>
          </div>

          {/* Example */}
          <div className="border border-white p-6">
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Example Usage
            </h3>
            <div className="bg-black border border-white p-4 font-mono text-sm">
              <code>aiexec run examples/setup_fastapi.ai</code>
            </div>
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

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
