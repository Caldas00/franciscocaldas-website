"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Stickman from "../../components/stickman"
import CursorTrail from "../../components/cursor-trail"
import HelpOverlay from "../../components/help-overlay"
import ScrollToTop from "../../components/scroll-to-top"

export default function LLMInterfacePage() {
  const [secondaryColor, setSecondaryColor] = useState("#7399C6")
  const [colorIndex, setColorIndex] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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

  const handleSubmit = async () => {
   if (!prompt.trim()) {
     setError("Please enter a prompt")
     return
   }

   setIsLoading(true)
   setError("")
   setResponse("")

   try {
     const res = await fetch("https://ollama.franciscocaldas.me/api/generate", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "granite4:350m",
         prompt,
         stream: false,
       }),
     })

     if (!res.ok) {
       const errText = await res.text()
       throw new Error(errText || `HTTP ${res.status}`)
     }

     // O Ollama devolve { response: "..." }
     const data = await res.json()
     setResponse(data.response || "No response received")
   } catch (err) {
     console.error("Fetch error:", err)
     setError(err instanceof Error ? err.message : "Unknown error")
   } finally {
     setIsLoading(false)
   }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {!isMobile && <CursorTrail />}
      <Stickman secondaryColor={secondaryColor} onColorCycle={cycleColor} />
      {!isMobile && <HelpOverlay isVisible={showHelp} />}
      <ScrollToTop secondaryColor={secondaryColor} />

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
              Self-Hosted LLM Interface
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold opacity-90">Llama 3.1 — 8B on Custom Server</h2>
          </div>

          {/* Description */}
          <div className="space-y-6 mb-12">
            <p className="text-base sm:text-lg leading-relaxed">
              This project is a simple front-end interface that connects to my self-hosted server, running an open-source LLM.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Behind the scenes, I'm running an open-source language model (Llama 3.1 — 8B) on a custom Ubuntu 22 server
              powered by an Intel i7 CPU and an RTX 3070 GPU.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              The model runs entirely on the GPU for faster inference and lower latency.
            </p>
          </div>

          {/* LLM Interface */}
          <div className="border border-white p-6 mb-12">
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Try it Out
            </h3>

            <div className="space-y-6">
              {/* Input Area */}
              <div>
                <label htmlFor="prompt" className="block text-sm font-bold mb-2 uppercase">
                  Your Prompt
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full border border-white bg-black text-white p-3 focus:outline-none focus:bg-white focus:text-black transition-colors resize-none font-mono text-sm"
                  placeholder="Type your message here..."
                  disabled={isLoading}
                />
              </div>

              {/* Run Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full border border-white bg-black text-white p-4 font-black uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={
                  !isLoading
                    ? {
                        borderColor: secondaryColor,
                        color: secondaryColor,
                      }
                    : {}
                }
              >
                {isLoading ? "PROCESSING..." : "RUN LLM"}
              </button>

              {/* Error Display */}
              {error && (
                <div className="border border-red-500 bg-black p-4">
                  <div className="text-red-500 font-bold mb-2 uppercase">Error</div>
                  <div className="text-sm text-red-400">{error}</div>
                </div>
              )}

              {/* Response Display */}
              {response && (
                <div className="border border-white bg-black p-4">
                  <div className="font-bold mb-3 uppercase" style={{ color: secondaryColor }}>
                    Response
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono">{response}</div>
                </div>
              )}
            </div>
          </div>

          {/* Technical Details */}
          <div className="border border-white p-6">
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Technical Details
            </h3>
            <div className="space-y-4 text-sm sm:text-base">
              <div>
                <div className="font-bold mb-2">Model:</div>
                <div className="pl-4">Llama 3.1 (8B parameters)</div>
              </div>
              <div>
                <div className="font-bold mb-2">Server:</div>
                <div className="pl-4">Custom Ubuntu 22 Server</div>
              </div>
              <div>
                <div className="font-bold mb-2">Hardware:</div>
                <ul className="list-disc pl-8 space-y-1 opacity-90">
                  <li>Intel i7 CPU</li>
                  <li>NVIDIA RTX 3070 GPU</li>
                  <li>Full GPU acceleration for inference</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-2">API Endpoint:</div>
                <div className="pl-4 font-mono text-xs break-all">https://ollama.franciscocaldas.me/api/generate</div>
              </div>
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
