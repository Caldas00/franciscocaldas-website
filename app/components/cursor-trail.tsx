"use client"

import { useState, useEffect, useRef } from "react"

const ASCII_TRAIL_CHARS = ["█", "▓", "▒", "░", "▄", "▀", "■", "□"]

interface TrailPoint {
  id: number
  x: number
  y: number
  char: string
  opacity: number
  age: number
}

export default function CursorTrail() {
  const [trail, setTrail] = useState<TrailPoint[]>([])
  const mousePos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }

      setTrail((prev) => {
        const newPoint: TrailPoint = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          char: ASCII_TRAIL_CHARS[Math.floor(Math.random() * ASCII_TRAIL_CHARS.length)],
          opacity: 1,
          age: 0,
        }

        return [...prev, newPoint].slice(-15) // Keep only last 15 points
      })
    }

    const updateTrail = () => {
      setTrail((prev) =>
        prev
          .map((point) => ({
            ...point,
            age: point.age + 1,
            opacity: Math.max(0, 1 - point.age * 0.1),
          }))
          .filter((point) => point.opacity > 0),
      )
    }

    const trailTimer = setInterval(updateTrail, 50)

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearInterval(trailTimer)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trail.map((point) => (
        <div
          key={point.id}
          className="absolute text-[#f4f4f4] font-mono text-sm select-none"
          style={{
            left: point.x,
            top: point.y,
            opacity: point.opacity,
            transform: "translate(-50%, -50%)",
            transition: "opacity 0.1s ease-out",
          }}
        >
          {point.char}
        </div>
      ))}
    </div>
  )
}
