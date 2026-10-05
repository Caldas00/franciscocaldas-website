"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Stickman from "../../components/stickman"
import CursorTrail from "../../components/cursor-trail"
import HelpOverlay from "../../components/help-overlay"
import ScrollToTop from "../../components/scroll-to-top"

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

export default function RAGFinancialAccountingPage() {
  const [secondaryColor, setSecondaryColor] = useState("#5A9B6B")
  const [colorIndex, setColorIndex] = useState(2)
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

  const bgColor = isLightMode ? "#f5f5f5" : "#000000"
  const textColor = isLightMode ? "#1a1a1a" : "#ffffff"
  const borderColor = isLightMode ? "#1a1a1a" : "#ffffff"
  const codeBgColor = isLightMode ? "#e5e5e5" : "#000000"

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
              RAG Financial Accounting
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold opacity-90">Retrieval-Augmented Study Chatbot</h2>
          </div>

          {/* GitHub Link */}
          <div className="border p-6 mb-12" style={{ borderColor: borderColor }}>
            <a
              href="https://github.com/Caldas00/rag-financial-accounting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border px-6 py-3 font-black uppercase text-sm transition-colors"
              style={{ borderColor: borderColor, color: secondaryColor }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.backgroundColor = secondaryColor
                  e.currentTarget.style.color = isLightMode ? "#f5f5f5" : "#000000"
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

          {/* Overview */}
          <div className="space-y-6 mb-12">
            <p className="text-base sm:text-lg leading-relaxed">
              This project started as a way to help my brother study for his Financial Accounting course. Instead of
              searching through dozens of slides for every doubt, he can ask a question in plain language and get an
              answer grounded in his own course notes.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              It is a small RAG (Retrieval-Augmented Generation) system with a web chatbot: the most relevant passages
              from the notes are retrieved, and an AI model answers using only those passages, citing the source PDF and
              page so every answer can be checked against the original material.
            </p>
          </div>

          {/* How It Works */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              How It Works
            </h3>
            <div
              className="border p-4 font-mono text-xs sm:text-sm overflow-x-auto"
              style={{ borderColor: borderColor, backgroundColor: codeBgColor }}
            >
              <pre className="whitespace-pre">{`documents/*.txt ──► rag_creator.py ──► chroma_db/  (vector database)
                     split into chunks,
                     compute embeddings
                                            │
question ──► chatbot.py ──► top 4 chunks ───┘
                  │
                  └──► AI API (question + chunks) ──► answer with sources`}</pre>
            </div>
          </div>

          {/* Pipeline */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Pipeline
            </h3>
            <div className="space-y-6 text-sm sm:text-base">
              <div>
                <div className="font-bold mb-2">1. Chunking</div>
                <div className="pl-4 opacity-90 mb-3">
                  The course notes are split at every label line, so each chunk is one slide or page of the course. The
                  source and page are stored as metadata and kept in the chunk text so the model can cite them.
                </div>
                <div
                  className="border p-4 font-mono text-xs sm:text-sm overflow-x-auto ml-4"
                  style={{ borderColor: borderColor, backgroundColor: codeBgColor }}
                >
                  <pre className="whitespace-pre">{`[TEMA: Financial Accounting, FONTE: 4. Inventories.pdf, página 3]
# Slide title
- content...`}</pre>
                </div>
              </div>
              <div>
                <div className="font-bold mb-2">2. Embeddings</div>
                <div className="pl-4 opacity-90">
                  Each chunk is turned into a vector with intfloat/multilingual-e5-small, a small multilingual model that
                  works well for both Portuguese and English. It runs locally on CPU, for free.
                </div>
              </div>
              <div>
                <div className="font-bold mb-2">3. Storage</div>
                <div className="pl-4 opacity-90">Vectors are stored in a local ChromaDB vector database.</div>
              </div>
              <div>
                <div className="font-bold mb-2">4. Answering</div>
                <div className="pl-4 opacity-90">
                  The question is embedded, the 4 closest chunks are retrieved and sent to the AI model with instructions
                  to answer only from that context. The retrieved sources are shown under each answer.
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Tech Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <div className="font-bold">Language:</div>
                <div className="opacity-90">Python 3.10+</div>
              </div>
              <div>
                <div className="font-bold">Embedding Model:</div>
                <div className="opacity-90">multilingual-e5-small (local)</div>
              </div>
              <div>
                <div className="font-bold">Vector Database:</div>
                <div className="opacity-90">ChromaDB</div>
              </div>
              <div>
                <div className="font-bold">Interface:</div>
                <div className="opacity-90">Gradio web chatbot</div>
              </div>
              <div>
                <div className="font-bold">LLM:</div>
                <div className="opacity-90">gpt-4.1-mini (default)</div>
              </div>
              <div>
                <div className="font-bold">Providers:</div>
                <div className="opacity-90">Any OpenAI-compatible API (Groq, OpenRouter, Gemini)</div>
              </div>
            </div>
          </div>

          {/* Known Limitations */}
          <div className="border p-6" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Known Limitations
            </h3>
            <ul className="list-disc pl-6 space-y-3 text-sm sm:text-base opacity-90">
              <li>
                Some topics, such as Taxes and Leases, only have a one-page summary in the notes, so answers on those
                topics are less detailed.
              </li>
              <li>
                Retrieval uses only the current question, so vague follow-ups like &quot;and the other one?&quot; may
                retrieve the wrong passages. Complete questions work best.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: borderColor }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm opacity-80">&copy; 2025 Francisco Caldas. All rights reserved.</div>
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
