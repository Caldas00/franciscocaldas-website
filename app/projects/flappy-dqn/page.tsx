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

export default function FlappyDQNPage() {
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
              Flappy Bird DQN
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold opacity-90">Deep Q-Learning Neural Network</h2>
          </div>

          <div className="mb-8 border-2 p-1" style={{ borderColor: secondaryColor }}>
            <video className="max-w-[400px] w-full h-auto block" autoPlay loop muted playsInline controls preload="auto">
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pedaco-O2t1LkINYDTe59cgPwZLdgPMUsPESa.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* GitHub Link */}
          <div className="border p-6 mb-12" style={{ borderColor: borderColor }}>
            <a
              href="https://github.com/Caldas00/flappy-bird-dqn"
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
              A reinforcement learning agent that masters Flappy Bird using Deep Q-Learning (DQN), an off-policy
              algorithm that combines Q-learning with deep neural networks.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              The agent learns through trial and error, receiving rewards for surviving and passing pipes, gradually
              improving its policy over thousands of training episodes.
            </p>
          </div>

          {/* Neural Network Architecture */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Neural Network Architecture
            </h3>
            <div className="space-y-4 text-sm sm:text-base">
              <div>
                <div className="font-bold mb-2">Algorithm:</div>
                <div className="pl-4">Deep Q-Network (DQN)</div>
              </div>
              <div>
                <div className="font-bold mb-2">Input (State Vector):</div>
                <div className="pl-4">6 continuous features:</div>
                <ul className="list-disc pl-8 mt-2 space-y-1 opacity-90">
                  <li>Bird vertical position</li>
                  <li>Velocity</li>
                  <li>Distance to next pipe</li>
                  <li>Pipe gaps</li>
                  <li>Additional environmental features</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-2">Output:</div>
                <div className="pl-4">2 Q-values for actions: flap or no flap</div>
              </div>
              <div>
                <div className="font-bold mb-2">Structure:</div>
                <ul className="list-disc pl-8 space-y-1 opacity-90">
                  <li>Input layer: 6 neurons</li>
                  <li>Hidden layer 1: 128 neurons, ReLU activation</li>
                  <li>Hidden layer 2: 128 neurons, ReLU activation</li>
                  <li>Output layer: 2 neurons (linear activation for Q-values)</li>
                </ul>
              </div>
              <div>
                <div className="font-bold mb-2">Total Parameters:</div>
                <div className="pl-4">20,000 to 30,000</div>
              </div>
            </div>
          </div>

          {/* Training Mechanism */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Training Mechanism
            </h3>
            <div className="space-y-4 text-sm sm:text-base">
              <div>
                <div className="font-bold mb-2">Method:</div>
                <div className="pl-4">Deep Q-Learning (off-policy reinforcement learning)</div>
              </div>
              <div>
                <div className="font-bold mb-2">Key Components:</div>
                <ul className="list-disc pl-8 space-y-2 opacity-90">
                  <li>
                    <strong>Replay buffer:</strong> Stores experience tuples (state, action, reward, next_state, done)
                  </li>
                  <li>
                    <strong>Sampling:</strong> Mini-batches randomly drawn from buffer to decorrelate samples
                  </li>
                  <li>
                    <strong>Target network:</strong> Updated periodically to stabilize learning
                  </li>
                  <li>
                    <strong>Loss function:</strong> Mean squared error between predicted and target Q-values
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Loss Formula */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Loss Function
            </h3>
            <div
              className="border p-4 font-mono text-sm mb-4 overflow-x-auto"
              style={{ borderColor: borderColor, backgroundColor: isLightMode ? "#e5e5e5" : "#000000" }}
            >
              <div className="whitespace-nowrap">
                L = (r + γ × max_a&apos; Q_target(s&apos;, a&apos;) − Q_policy(s, a))²
              </div>
            </div>
            <div className="space-y-3 text-sm sm:text-base opacity-90">
              <div className="flex gap-2">
                <span className="font-bold min-w-[80px]">r</span>
                <span>Reward at the current step</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-[80px]">γ</span>
                <span>Discount factor (typically 0.99)</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-[80px]">Q_target</span>
                <span>Target network&apos;s estimate of the next state&apos;s Q-values</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-[80px]">Q_policy</span>
                <span>Main network&apos;s predicted Q-value for the current state-action pair</span>
              </div>
            </div>
          </div>

          {/* Training Parameters */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Training Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <div className="font-bold">Optimizer:</div>
                <div className="opacity-90">Adam</div>
              </div>
              <div>
                <div className="font-bold">Discount Factor (γ):</div>
                <div className="opacity-90">0.99</div>
              </div>
              <div>
                <div className="font-bold">Exploration Policy:</div>
                <div className="opacity-90">Epsilon-greedy</div>
              </div>
              <div>
                <div className="font-bold">Epsilon Range:</div>
                <div className="opacity-90">1.0 → 0.01</div>
              </div>
            </div>
          </div>

          {/* Training Loop */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Training Loop
            </h3>
            <ol className="list-decimal pl-6 space-y-3 text-sm sm:text-base opacity-90">
              <li>Interact with the environment to collect transitions</li>
              <li>Store each transition in the replay buffer</li>
              <li>Sample a mini-batch from the buffer</li>
              <li>Compute the target Q-values and the loss using the formula above</li>
              <li>Backpropagate the loss to update network weights</li>
              <li>Update the target network every fixed number of steps</li>
              <li>Repeat this process for thousands of episodes</li>
            </ol>
          </div>

          {/* Learning Objective */}
          <div className="border p-6" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Learning Objective
            </h3>
            <p className="text-sm sm:text-base leading-relaxed opacity-90">
              The goal is to maximize expected cumulative rewards. The agent receives small rewards for surviving each
              frame and larger rewards for passing pipes successfully. Through thousands of training episodes, the
              network learns an optimal policy that balances short-term survival with long-term score maximization.
            </p>
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
