"use client"

import { useRef, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import type * as THREE from "three"

export default function ParticleBackground() {
  const ref = useRef<THREE.Points>(null)
  const { mouse, viewport } = useThree()

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(2000 * 3)

    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }

    return positions
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05
      ref.current.rotation.y = state.clock.elapsedTime * 0.075

      // Mouse interaction
      const mouseX = (mouse.x * viewport.width) / 2
      const mouseY = (mouse.y * viewport.height) / 2

      ref.current.position.x = mouseX * 0.1
      ref.current.position.y = mouseY * 0.1
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#7399C6"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
        />
      </Points>
    </group>
  )
}
