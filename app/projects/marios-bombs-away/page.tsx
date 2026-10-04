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

export default function MariosBombsAwayPage() {
  const [secondaryColor, setSecondaryColor] = useState("#4A6FA5")
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
              Mario&apos;s Bombs Away
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold opacity-90">
              Double DQN Agent on the Original Game &amp; Watch
            </h2>
          </div>

          {/* Video Demo */}
          <div className="mb-8 border-2 p-1" style={{ borderColor: secondaryColor }}>
            <video className="w-full h-auto block" autoPlay loop muted playsInline controls preload="auto">
              <source src="/best-mbaway-compressed.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* GitHub Link */}
          <div className="border p-6 mb-12" style={{ borderColor: borderColor }}>
            <a
              href="https://github.com/Caldas00/RL-marios-bombs-away"
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
              A Double DQN agent that learned to play Mario&apos;s Bombs Away (Nintendo Game &amp; Watch, 1983) on the
              original game, emulated in MAME. The game was not reimplemented: the agent presses the same 3 buttons a
              human would (left, right, bomb) through a Lua script running inside MAME, which talks to Python over named
              pipes.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              The network sees the LCD segments of the screen plus two hidden variables read straight from the RAM of the
              Sharp SM511 chip, found by reverse-engineering the game&apos;s memory.
            </p>
          </div>

          {/* Key Results */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Key Results
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <div className="font-bold">Best Life:</div>
                <div className="opacity-90">44 bombs delivered without dying (~10 min of play)</div>
              </div>
              <div>
                <div className="font-bold">Greedy Evaluation (ε = 0):</div>
                <div className="opacity-90">~8–12 bombs per life</div>
              </div>
              <div>
                <div className="font-bold">Network:</div>
                <div className="opacity-90">MLP 38 → 128 → 128 → 4 (22,020 parameters)</div>
              </div>
              <div>
                <div className="font-bold">Training:</div>
                <div className="opacity-90">~300K decisions, ~1h20 on a MacBook M2</div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              How It Works
            </h3>
            <div className="space-y-4 text-sm sm:text-base">
              <div>
                <div className="font-bold mb-2">MAME + Lua (the environment server):</div>
                <ul className="list-disc pl-8 space-y-1 opacity-90">
                  <li>Reads the 131 LCD segments and key RAM addresses every frame</li>
                  <li>Repeats each action for 8 frames (~0.13 s of play)</li>
                  <li>Detects deaths, deliveries and a cutscene bug</li>
                  <li>On death, instantly reloads a savestate at the start of Game B, in the same frame</li>
                  <li>Skips frames during the delivery animation, when no input has any effect</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-2">Python:</div>
                <div className="pl-4 opacity-90">
                  A Gymnasium environment wraps the text protocol (RESET / STEP over FIFOs), with separate scripts for
                  training and greedy evaluation.
                </div>
              </div>
            </div>
          </div>

          {/* The RL Problem */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              The RL Problem
            </h3>
            <div className="space-y-4 text-sm sm:text-base">
              <div>
                <div className="font-bold mb-2">Episode:</div>
                <div className="pl-4 opacity-90">One life, with a random 0–29 no-op steps on reset to desync the chip&apos;s timers</div>
              </div>
              <div>
                <div className="font-bold mb-2">Observation (38 values in [0, 1]):</div>
                <ul className="list-disc pl-8 space-y-1 opacity-90">
                  <li>36 game segments: torches, Mario&apos;s positions, the cigar man, ground fires and the final man</li>
                  <li>Speed level (RAM 0x0B)</li>
                  <li>Tick phase (RAM 0x0C), i.e. how long until the game&apos;s next tick</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-2">Actions:</div>
                <div className="pl-4 opacity-90">Nothing, left, right, button (raise or lower the bomb)</div>
              </div>
            </div>
          </div>

          {/* Reward */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Reward Function
            </h3>
            <div className="space-y-3 text-sm sm:text-base opacity-90 mb-6">
              <div className="flex gap-2">
                <span className="font-bold min-w-[120px]">+1</span>
                <span>Bomb delivered</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-[120px]">−1</span>
                <span>Death (end of episode)</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-[120px]">−0.01</span>
                <span>Every decision, including standing still</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-[120px]">Shaping</span>
                <span>Potential-based, with Φ = 0.05 × Mario&apos;s row</span>
              </div>
            </div>
            <div
              className="border p-4 font-mono text-sm mb-4 overflow-x-auto"
              style={{ borderColor: borderColor, backgroundColor: isLightMode ? "#e5e5e5" : "#000000" }}
            >
              <div className="whitespace-nowrap">F(s, s&apos;) = γ × Φ(s&apos;) − Φ(s)</div>
            </div>
            <p className="text-sm sm:text-base leading-relaxed opacity-90">
              Because the shaping is potential-based, it does not change the optimal policy (Ng, Harada &amp; Russell,
              1999). It only speeds up learning early on.
            </p>
          </div>

          {/* Training Parameters */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Training Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <div className="font-bold">Algorithm:</div>
                <div className="opacity-90">Double DQN</div>
              </div>
              <div>
                <div className="font-bold">Replay Buffer:</div>
                <div className="opacity-90">100,000 transitions</div>
              </div>
              <div>
                <div className="font-bold">Batch Size:</div>
                <div className="opacity-90">64, one update per decision</div>
              </div>
              <div>
                <div className="font-bold">Target Sync:</div>
                <div className="opacity-90">Every 1,000 steps</div>
              </div>
              <div>
                <div className="font-bold">Optimizer:</div>
                <div className="opacity-90">Adam, lr 1e-4</div>
              </div>
              <div>
                <div className="font-bold">Loss:</div>
                <div className="opacity-90">Smooth L1 (Huber), gradient clipping at 10</div>
              </div>
              <div>
                <div className="font-bold">Discount Factor (γ):</div>
                <div className="opacity-90">0.99</div>
              </div>
              <div>
                <div className="font-bold">Exploration:</div>
                <div className="opacity-90">ε-greedy 1.0 → 0.05, then 0.01 floor</div>
              </div>
            </div>
          </div>

          {/* Reverse Engineering */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Finding the Hidden Variables
            </h3>
            <p className="text-sm sm:text-base leading-relaxed opacity-90 mb-4">
              The screen does not show everything. The game speeds up with each delivery and an internal clock decides
              when torches and fires move, so from a single frame the network cannot know how much time it has.
            </p>
            <ol className="list-decimal pl-6 space-y-3 text-sm sm:text-base opacity-90 mb-4">
              <li>Record all 131 segments and the 128 RAM addresses of the SM511 to a CSV every frame while playing</li>
              <li>
                Look for candidates: automatic correlation scripts were inconclusive, so 0x0B was found by inspecting
                the data directly, as the address that steps down (5 → 4 → 3) right after each delivery
              </li>
              <li>
                Prove causality: writing 3 to 0x0B every frame cut the tick from ~28 to ~18 frames, so 0x0B controls the
                speed
              </li>
            </ol>
            <div className="space-y-3 text-sm sm:text-base opacity-90">
              <div className="flex gap-2">
                <span className="font-bold min-w-[80px]">0x0B</span>
                <span>Speed level (5 slow … 1 fast), fixed at 3 during training</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-[80px]">0x0C</span>
                <span>Tick phase, counts down from 0x0B to 0 between ticks</span>
              </div>
            </div>
          </div>

          {/* Training History */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              What Made the Difference
            </h3>
            <ol className="list-decimal pl-6 space-y-3 text-sm sm:text-base opacity-90">
              <li>Clean death and delivery detection in Lua, with the reset happening on the exact frame of death</li>
              <li>Fixing the speed and feeding the tick phase (0x0C) to the network, so it knows when danger arrives</li>
              <li>Lowering the exploration floor from 0.05 to 0.01 in phase 2, which doubled the training average</li>
              <li>Keeping truncated episodes in the buffer as non-terminal, instead of discarding the best runs</li>
            </ol>
          </div>

          {/* Limitations */}
          <div className="border p-6" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Limitations &amp; Next Steps
            </h3>
            <ul className="list-disc pl-6 space-y-3 text-sm sm:text-base opacity-90">
              <li>Only one life and a fixed speed, while the full game has 3 lives and keeps accelerating</li>
              <li>
                The torch timer is still unidentified, likely the missing information to go from ~91% to ~98% success
                per bomb
              </li>
              <li>
                Planned experiments: tabular Q-learning, DQN vs Double DQN, full-RAM input with permutation importance,
                frame stacking and a CNN on the screen image
              </li>
            </ul>
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
