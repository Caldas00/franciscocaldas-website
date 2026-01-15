"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  opacity: number
  char: string
}

interface CursorTrailProps {
  isLightMode?: boolean
}

const ASCII_CHARS = ["*", "+", "x", "o", ".", "-", "|", "/", "\\", "^", "~"]

export default function CursorTrail({ isLightMode = false }: CursorTrailProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    let particleId = 0

    const handleMouseMove = (e: MouseEvent) => {
      const newParticle: Particle = {
        id: particleId++,
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
        char: ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
      }

      setParticles((prev) => [...prev.slice(-15), newParticle])
    }

    window.addEventListener("mousemove", handleMouseMove)

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            opacity: particle.opacity - 0.08,
          }))
          .filter((particle) => particle.opacity > 0),
      )
    }, 60)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(interval)
    }
  }, [])

  const cursorColor = isLightMode ? "#1a1a1a" : "#ffffff"

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute font-mono text-sm select-none"
          style={{
            left: particle.x - 6,
            top: particle.y - 8,
            opacity: particle.opacity * 0.6,
            transform: `scale(${particle.opacity})`,
            color: cursorColor,
          }}
        >
          {particle.char}
        </div>
      ))}
    </div>
  )
}
