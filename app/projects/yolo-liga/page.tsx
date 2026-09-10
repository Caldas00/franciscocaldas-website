"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Stickman from "../../components/stickman"
import CursorTrail from "../../components/cursor-trail"
import HelpOverlay from "../../components/help-overlay"
import ScrollToTop from "../../components/scroll-to-top"

export default function YoloLigaPage() {
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
              YOLO Liga
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold opacity-90">Sponsor Detection in Football Broadcasts</h2>
          </div>

          {/* Video Demo */}
          <div className="mb-8 border-2 p-1" style={{ borderColor: secondaryColor }}>
            <video className="w-full h-auto block" autoPlay loop muted playsInline controls preload="auto">
              <source src="/yolo_liga_demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Overview */}
          <div className="space-y-6 mb-12">
            <p className="text-base sm:text-lg leading-relaxed">
              Developed a computer vision system to automatically detect sponsor advertisements in Portuguese football broadcasts, giving companies a data-driven way to measure their broadcast ROI.
            </p>
            <p className="text-base sm:text-lg leading-relaxed">
              Benchmarked YOLOv8 (s, m) and YOLO11 (m, l) on a dataset of 8,000+ images. YOLO11l, trained on a cloud NVIDIA RTX 6000 Ada, achieved a mAP50-95 of 0.73 — sufficient for production deployment in real-time stream analysis.
            </p>
          </div>

          {/* Dataset */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Dataset
            </h3>
            <div className="space-y-4 text-sm sm:text-base">
              <div>
                <div className="font-bold mb-2">Source:</div>
                <div className="pl-4">Portuguese Liga broadcasts</div>
              </div>
              <div>
                <div className="font-bold mb-2">Size:</div>
                <div className="pl-4">8,000+ annotated images</div>
              </div>
              <div>
                <div className="font-bold mb-2">Task:</div>
                <div className="pl-4">Object detection of sponsor advertisements (billboards, LED boards, overlays)</div>
              </div>
            </div>
          </div>

          {/* Models Benchmarked */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Models Benchmarked
            </h3>
            <div className="space-y-4 text-sm sm:text-base">
              <ul className="list-disc pl-8 space-y-2 opacity-90">
                <li>YOLOv8s (small)</li>
                <li>YOLOv8m (medium)</li>
                <li>YOLO11m (medium)</li>
                <li>YOLO11l (large)</li>
              </ul>
            </div>
          </div>

          {/* Best Model */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Best Model: YOLO11l
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <div className="font-bold">Architecture:</div>
                <div className="opacity-90">YOLO11 Large</div>
              </div>
              <div>
                <div className="font-bold">mAP50-95:</div>
                <div className="opacity-90">0.73</div>
              </div>
              <div>
                <div className="font-bold">Training Hardware:</div>
                <div className="opacity-90">NVIDIA RTX 6000 Ada (Cloud)</div>
              </div>
              <div>
                <div className="font-bold">Deployment:</div>
                <div className="opacity-90">Real-time stream analysis ready</div>
              </div>
            </div>
          </div>

          {/* Training Results */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Training Results
            </h3>
            <div className="border-2 p-1" style={{ borderColor: secondaryColor }}>
              <Image
                src="/results.png"
                alt="YOLO11l training results showing loss curves and mAP metrics"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Use Case */}
          <div className="border p-6 mb-8" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Use Case
            </h3>
            <p className="text-sm sm:text-base leading-relaxed opacity-90">
              This system enables sponsors and broadcasters to automatically measure advertisement visibility during live football matches. By detecting when and how long sponsor logos appear on screen, companies can quantify their broadcast ROI with precise, frame-by-frame data instead of relying on manual estimates.
            </p>
          </div>

          {/* Sample Output */}
          <div className="border p-6" style={{ borderColor: borderColor }}>
            <h3 className="text-2xl font-black uppercase mb-6" style={{ color: secondaryColor }}>
              Sample Output
            </h3>
            <p className="text-sm sm:text-base leading-relaxed opacity-90 mb-6">
              Full frame-by-frame sponsor detection report for the second half of Sporting CP vs. AFS (Liga Portugal Betclic, Matchday 14, 14/12/2025).
            </p>
            <a
              href="/2526_LIGAPORTUGALBETCLIC_J14_SPORTINGCP-AFS_14122025_2P_analysis.xlsx"
              download="YOLO-Liga_SportingCP-AFS_analysis.xlsx"
              className="inline-flex items-center gap-3 border-2 px-6 py-3 text-sm uppercase font-bold hover:opacity-70 transition-opacity"
              style={{ borderColor: secondaryColor, color: secondaryColor }}
            >
              <span>↓</span> Download Analysis (XLSX, 7.9 MB)
            </a>
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
