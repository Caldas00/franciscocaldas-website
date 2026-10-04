"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import LoadingScreen from "./components/loading-screen"
import CursorTrail from "./components/cursor-trail"
import Stickman from "./components/stickman"
import HelpOverlay from "./components/help-overlay"
import ScrollToTop from "./components/scroll-to-top"

// Import icons individually to avoid import issues
const Mail = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const Github = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
)

const Linkedin = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const MapPin = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Phone = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

export default function Portfolio() {
  const [isLoading, setIsLoading] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [secondaryColor, setSecondaryColor] = useState("#4A6FA5")
  const [colorIndex, setColorIndex] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showCursor, setShowCursor] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLightMode, setIsLightMode] = useState(true)

  const colors = ["#7399C6", "#FFB366", "#98D8A8", "#F08BA0"]
  const lightModeColors = ["#4A6FA5", "#CC8A3D", "#5A9B6B", "#C94F6D"]
  const fullName = "Francisco Caldas."

  const educationRef = useRef<HTMLElement>(null)
  const experienceRef = useRef<HTMLElement>(null)
  const skillsRef = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)

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

  const resetTypingAnimation = () => {
    setDisplayedText("")
    setCurrentIndex(0)
    setIsTyping(true)
    setShowCursor(true)

    setTimeout(() => {
      setShowCursor(false)
      setCurrentIndex(0)
    }, 1000)
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("section-hidden")
            entry.target.classList.add("section-visible")
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    const sections = [educationRef, experienceRef, skillsRef, projectsRef, contactRef]
    sections.forEach((ref) => {
      if (ref.current) {
        ref.current.classList.add("section-hidden")
        observer.observe(ref.current)
      }
    })

    return () => observer.disconnect()
  }, [isLoading])

  useEffect(() => {
    const hasLoadedBefore = sessionStorage.getItem("hasLoadedPortfolio")

    if (!hasLoadedBefore) {
      setIsLoading(true)
      sessionStorage.setItem("hasLoadedPortfolio", "true")

      const timer = setTimeout(() => {
        setIsLoading(false)
        setIsTyping(true)
      }, 4000)

      return () => clearTimeout(timer)
    } else {
      setIsTyping(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && isTyping && currentIndex < fullName.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullName.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 120)
      return () => clearTimeout(timer)
    } else if (currentIndex >= fullName.length) {
      setIsTyping(false)
    }
  }, [currentIndex, fullName, isLoading, isTyping])

  const education: {
    degree: string
    institution: string
    period: string
    location: string
    gpa?: string
    note?: string
    courses?: string
    link: string
  }[] = [
    {
      degree: "Master's in Artificial Intelligence",
      institution: "University of Zurich (UZH)",
      period: "September 2026 – July 2028 (Expected)",
      location: "Zürich, Switzerland",
      note: "Minor in Data Science",
      link: "https://www.uzh.ch/en.html",
    },
    {
      degree: "Bachelor's in Computer Science and Engineering",
      institution: "Instituto Superior Técnico – University of Lisbon",
      period: "September 2023 – July 2026",
      location: "Lisbon, Portugal",
      gpa: "16 / 20",
      courses:
        "Artificial Intelligence (17/20), Machine Learning (17/20), Foundations of Programming (17/20), Algorithms and Data Structures (16/20)",
      link: "https://tecnico.ulisboa.pt/en/",
    },
    {
      degree: "High School",
      institution: "Salesianos de Lisboa",
      period: "September 2020 – June 2023",
      location: "Lisbon, Portugal",
      gpa: "17 / 20",
      note: "National Math Exam: 20 / 20",
      link: "https://www.salesianos.pt",
    },
  ]

  const experience = [
    {
      title: "Software Engineer Intern",
      company: "Innowave",
      period: "July 2025 – September 2025",
      location: "Lisbon, Portugal",
      description:
        "Developed an AI-driven integration platform bridging enterprise CRM and ERP systems, automating complex data flows and cross-platform synchronization. Engineered a full-stack Intelligent Document Processing (IDP) component in Python and Java to extract data from financial documents, delivering production-ready APIs that reduced manual data entry by over 50%.",
      link: "https://innowave.tech",
    },
    {
      title: "Electronics Team Member",
      company: "Instituto Superior Técnico – Rocket Experiment Division (AeroTec)",
      period: "March 2025 – March 2026",
      location: "Lisbon, Portugal",
      description:
        "Engineered onboard software for rocket telemetry and data acquisition, designing system architectures for real-time, low-latency sensor data processing and robust flight control logic. Developed embedded solutions in C targeting STM32 microcontrollers.",
      link: "https://aerotec.pt",
    },
    {
      title: "Spring Week Intern",
      company: "BNP Paribas",
      period: "April 2025",
      location: "Lisbon, Portugal",
      description:
        "Gained exposure to global markets, investment banking, and risk management through workshops, networking sessions and case studies with industry professionals.",
      link: "https://www.bnpparibas.pt/en/",
    },
    {
      title: "Digital Content Rights Management",
      company: "Sportinveste Multimédia",
      period: "January 2023 – April 2025",
      location: "Lisbon, Portugal",
      description:
        "Real-time monitoring of rights infringement related to sports broadcasts. Identified and reported unauthorized streams of live sports events.",
      link: "https://sportmultimedia.pt",
    },
  ]

  const volunteering = [
    {
      title: "Volunteer",
      organization: "Fundação Candeia",
      period: "September 2025 – August 2026",
      location: "Lisbon, Portugal",
      description:
        "Organized weekly activities for children in foster care homes and coordinated with fellow volunteers on educational and recreational programs. Led summer activities for children with special needs, adapting programs to their individual abilities.",
      link: "https://www.candeia.org",
    },
  ]

  const bgColor = isLightMode ? "#f5f5f5" : "#000000"
  const textColor = isLightMode ? "#1a1a1a" : "#ffffff"
  const borderColor = isLightMode ? "#1a1a1a" : "#ffffff"

  const LinkWithMessage = ({
    href,
    children,
    className = "",
  }: { href: string; children: React.ReactNode; className?: string }) => {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`hover:transition-colors duration-300 ${className}`}
        style={{ color: textColor }}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.color = secondaryColor
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.color = textColor
          }
        }}
      >
        {children}
      </a>
    )
  }

  if (isLoading) {
    return <LoadingScreen />
  }

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
      <ScrollToTop secondaryColor={secondaryColor} isLightMode={isLightMode} />

      <div className="pt-16">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 relative">
          <div className="text-center w-full max-w-4xl mx-auto">
            <div className="mb-12">
              <div className="relative inline-block">
                <h1
                  className="text-4xl sm:text-6xl md:text-8xl font-black mb-4 leading-none tracking-tight cursor-pointer"
                  onClick={resetTypingAnimation}
                >
                  {displayedText.split("").map((char, index) => (
                    <span key={index} className="relative inline-block">
                      <span className="relative" style={{ color: secondaryColor }}>
                        {char === " " ? "\u00A0" : char}
                      </span>
                    </span>
                  ))}
                  <span
                    className={`inline-block w-1 h-10 sm:h-14 md:h-20 ml-2 align-middle ${showCursor ? "cursor-blink" : ""}`}
                    style={{ backgroundColor: textColor }}
                  ></span>
                </h1>
                {/* Animated underline */}
                <div 
                  className="h-1 sm:h-2 w-full transition-all duration-500"
                  style={{ backgroundColor: secondaryColor }}
                />
              </div>
              
              <div className="mt-6">
                <div 
                  className="text-sm sm:text-lg md:text-xl font-bold uppercase tracking-widest inline-block px-4 py-2"
                  style={{ 
                    border: `2px solid ${secondaryColor}`,
                    color: secondaryColor
                  }}
                >
                  MSc Artificial Intelligence Student
                </div>
              </div>
            </div>

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div 
                className="flex items-center justify-center gap-3 p-4 transition-all duration-300 group"
                style={{ 
                  border: `2px solid ${borderColor}`,
                  borderLeftWidth: '4px',
                  borderLeftColor: secondaryColor
                }}
              >
                <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: secondaryColor }} />
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider opacity-60">Born</div>
                  <span className="text-sm sm:text-base font-bold">March 5, 2005</span>
                </div>
              </div>
              <div 
                className="flex items-center justify-center gap-3 p-4 transition-all duration-300 group"
                style={{ 
                  border: `2px solid ${borderColor}`,
                  borderLeftWidth: '4px',
                  borderLeftColor: secondaryColor
                }}
              >
                <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: secondaryColor }} />
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider opacity-60">Location</div>
                  <span className="text-sm sm:text-base font-bold">Zürich, Switzerland</span>
                </div>
              </div>
              <div 
                className="flex items-center justify-center gap-3 p-4 transition-all duration-300 group"
                style={{ 
                  border: `2px solid ${borderColor}`,
                  borderLeftWidth: '4px',
                  borderLeftColor: secondaryColor
                }}
              >
                <Phone className="w-5 h-5 flex-shrink-0" style={{ color: secondaryColor }} />
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider opacity-60">Phone</div>
                  <span className="text-sm sm:text-base font-bold block">(+41) 762142733</span>
                  <span className="text-sm sm:text-base font-bold block">(+351) 962888488</span>
                </div>
              </div>
            </div>
          </div>

          {!isMobile && (
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              <div
                className="text-base font-mono mb-3 uppercase tracking-wider font-bold"
                style={{ color: secondaryColor }}
              >
                Scroll to Explore
              </div>
              <ChevronDown className="w-8 h-8 animate-bounce-subtle" style={{ color: secondaryColor }} />
            </div>
          )}
        </section>

        {/* Education Section */}
        <section ref={educationRef} className="py-20 px-4 border-t" style={{ borderColor: borderColor }}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-2xl font-black"
                  style={{ backgroundColor: secondaryColor, color: isLightMode ? '#f5f5f5' : '#000000' }}
                >
                  01
                </div>
                <h2
                  className="text-3xl sm:text-5xl font-black uppercase tracking-wider"
                  style={{ color: secondaryColor }}
                >
                  Education
                </h2>
              </div>
              <div className="w-full h-1" style={{ backgroundColor: secondaryColor }}></div>
            </div>

            <div className="space-y-6">
              {education.map((edu, index) => (
                <div 
                  key={index} 
                  className="relative pl-6 transition-all duration-300 group"
                  style={{ 
                    borderLeft: `4px solid ${secondaryColor}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.backgroundColor = isLightMode ? `${secondaryColor}10` : `${secondaryColor}15`
                      e.currentTarget.style.paddingLeft = '2rem'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.paddingLeft = '1.5rem'
                    }
                  }}
                >
                  <div className="p-4">
                    <div className="text-xl sm:text-2xl font-black mb-2 uppercase" style={{ color: secondaryColor }}>
                      {edu.degree}
                    </div>
                    <LinkWithMessage href={edu.link} className="text-base sm:text-lg font-bold mb-3 block">
                      {edu.institution}
                    </LinkWithMessage>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span 
                        className="text-xs font-bold uppercase px-2 py-1"
                        style={{ backgroundColor: secondaryColor, color: isLightMode ? '#f5f5f5' : '#000000' }}
                      >
                        {edu.period}
                      </span>
                      <span className="text-sm opacity-70">{edu.location}</span>
                    </div>
                    <div 
                      className="border-t-2 pt-4 flex flex-wrap gap-4"
                      style={{ borderColor: `${secondaryColor}50` }}
                    >
                      {edu.gpa && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wider opacity-60">GPA</span>
                          <span className="font-black text-lg" style={{ color: secondaryColor }}>{edu.gpa}</span>
                        </div>
                      )}
                      {edu.note && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wider opacity-60">Note</span>
                          <span className="font-bold">{edu.note}</span>
                        </div>
                      )}
                      {edu.courses && (
                        <div className="flex items-baseline gap-2 w-full">
                          <span className="text-xs uppercase tracking-wider opacity-60 flex-shrink-0">Courses</span>
                          <span className="text-sm sm:text-base">{edu.courses}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section ref={experienceRef} className="py-20 px-4 border-t" style={{ borderColor: borderColor }}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-2xl font-black"
                  style={{ backgroundColor: secondaryColor, color: isLightMode ? '#f5f5f5' : '#000000' }}
                >
                  02
                </div>
                <h2
                  className="text-3xl sm:text-5xl font-black uppercase tracking-wider"
                  style={{ color: secondaryColor }}
                >
                  Experience
                </h2>
              </div>
              <div className="w-full h-1" style={{ backgroundColor: secondaryColor }}></div>
            </div>

            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div 
                  key={index} 
                  className="relative pl-6 transition-all duration-300 group"
                  style={{ 
                    borderLeft: `4px solid ${secondaryColor}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.backgroundColor = isLightMode ? `${secondaryColor}10` : `${secondaryColor}15`
                      e.currentTarget.style.paddingLeft = '2rem'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.paddingLeft = '1.5rem'
                    }
                  }}
                >
                  <div className="p-4">
                    <div className="text-xl sm:text-2xl font-black mb-2 uppercase" style={{ color: secondaryColor }}>
                      {exp.title}
                    </div>
                    <LinkWithMessage href={exp.link} className="text-base sm:text-lg font-bold mb-3 block">
                      {exp.company}
                    </LinkWithMessage>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span 
                        className="text-xs font-bold uppercase px-2 py-1"
                        style={{ backgroundColor: secondaryColor, color: isLightMode ? '#f5f5f5' : '#000000' }}
                      >
                        {exp.period}
                      </span>
                      <span className="text-sm opacity-70">{exp.location}</span>
                    </div>
                    <div 
                      className="border-t-2 pt-4"
                      style={{ borderColor: `${secondaryColor}50` }}
                    >
                      <div className="text-sm sm:text-base leading-relaxed">{exp.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Volunteering Section */}
        <section className="py-20 px-4 border-t" style={{ borderColor: borderColor }}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-2xl font-black"
                  style={{ backgroundColor: secondaryColor, color: isLightMode ? '#f5f5f5' : '#000000' }}
                >
                  03
                </div>
                <h2
                  className="text-3xl sm:text-5xl font-black uppercase tracking-wider"
                  style={{ color: secondaryColor }}
                >
                  Volunteering
                </h2>
              </div>
              <div className="w-full h-1" style={{ backgroundColor: secondaryColor }}></div>
            </div>

            <div className="space-y-6">
              {volunteering.map((vol, index) => (
                <div 
                  key={index} 
                  className="relative pl-6 transition-all duration-300 group"
                  style={{ 
                    borderLeft: `4px solid ${secondaryColor}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.backgroundColor = isLightMode ? `${secondaryColor}10` : `${secondaryColor}15`
                      e.currentTarget.style.paddingLeft = '2rem'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.paddingLeft = '1.5rem'
                    }
                  }}
                >
                  <div className="p-4">
                    <div className="text-xl sm:text-2xl font-black mb-2 uppercase" style={{ color: secondaryColor }}>
                      {vol.title}
                    </div>
                    <LinkWithMessage href={vol.link} className="text-base sm:text-lg font-bold mb-3 block">
                      {vol.organization}
                    </LinkWithMessage>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span 
                        className="text-xs font-bold uppercase px-2 py-1"
                        style={{ backgroundColor: secondaryColor, color: isLightMode ? '#f5f5f5' : '#000000' }}
                      >
                        {vol.period}
                      </span>
                      <span className="text-sm opacity-70">{vol.location}</span>
                    </div>
                    <div 
                      className="border-t-2 pt-4"
                      style={{ borderColor: `${secondaryColor}50` }}
                    >
                      <div className="text-sm sm:text-base leading-relaxed">{vol.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Skills Section */}
        <section ref={skillsRef} className="py-20 px-4 border-t" style={{ borderColor: borderColor }}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-2xl font-black"
                  style={{ backgroundColor: secondaryColor, color: isLightMode ? '#f5f5f5' : '#000000' }}
                >
                  04
                </div>
                <h2
                  className="text-3xl sm:text-5xl font-black uppercase tracking-wider"
                  style={{ color: secondaryColor }}
                >
                  Technical Skills
                </h2>
              </div>
              <div className="w-full h-1" style={{ backgroundColor: secondaryColor }}></div>
            </div>

            <div className="space-y-8">
              {[
                { title: 'Programming', skills: ['C++', 'Python', 'Java', 'SQL'] },
                { title: 'Frameworks & Libraries', skills: ['FastAPI', 'Flask', 'PyTorch', 'Ultralytics', 'CrewAI', 'OpenClaw'] },
                { title: 'DevOps & Tools', skills: ['Docker', 'Git', 'Linux', 'PostgreSQL'] },
                { title: 'Cloud', skills: ['Azure', 'Cloud GPU (RunPod)'] },
              ].map((category) => (
                <div 
                  key={category.title}
                  className="p-6"
                  style={{ 
                    borderLeft: `4px solid ${secondaryColor}`,
                    backgroundColor: isLightMode ? `${secondaryColor}08` : `${secondaryColor}10`
                  }}
                >
                  <div className="text-lg font-black mb-6 uppercase" style={{ color: secondaryColor }}>
                    {category.title}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {category.skills.map((skill) => (
                      <span 
                        key={skill}
                        className="px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all duration-300 cursor-default"
                        style={{ 
                          border: `2px solid ${secondaryColor}`,
                          color: secondaryColor
                        }}
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.backgroundColor = secondaryColor
                            e.currentTarget.style.color = isLightMode ? '#f5f5f5' : '#000000'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = secondaryColor
                          }
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              <div 
                className="p-6"
                style={{ 
                  borderLeft: `4px solid ${secondaryColor}`,
                  backgroundColor: isLightMode ? `${secondaryColor}08` : `${secondaryColor}10`
                }}
              >
                <div className="text-lg font-black mb-6 uppercase" style={{ color: secondaryColor }}>
                  Languages
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Portuguese', level: 'Native' },
                    { name: 'English', level: 'C1' }
                  ].map((lang) => (
                    <div 
                      key={lang.name}
                      className="flex items-center gap-2 px-4 py-2 transition-all duration-300"
                      style={{ 
                        border: `2px solid ${secondaryColor}`,
                      }}
                    >
                      <span className="font-bold uppercase" style={{ color: secondaryColor }}>{lang.name}</span>
                      <span 
                        className="text-xs font-bold px-2 py-0.5"
                        style={{ backgroundColor: secondaryColor, color: isLightMode ? '#f5f5f5' : '#000000' }}
                      >
                        {lang.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section ref={contactRef} className="py-20 px-4 border-t" style={{ borderColor: borderColor }}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-2xl font-black"
                  style={{ backgroundColor: secondaryColor, color: isLightMode ? '#f5f5f5' : '#000000' }}
                >
                  05
                </div>
                <h2
                  className="text-3xl sm:text-5xl font-black uppercase tracking-wider"
                  style={{ color: secondaryColor }}
                >
                  Contact
                </h2>
              </div>
              <div className="w-full h-1" style={{ backgroundColor: secondaryColor }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div>
                <div 
                  className="text-xl font-black mb-6 uppercase flex items-center gap-3"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-8 h-0.5" style={{ backgroundColor: secondaryColor }}></span>
                  Get In Touch
                </div>
                <div className="space-y-4">
                  <a
                    href="mailto:franciscopirescaldas@gmail.com"
                    className="flex items-center gap-4 p-4 transition-all duration-300 group"
                    style={{ 
                      border: `2px solid ${borderColor}`,
                      borderLeftWidth: '4px',
                      borderLeftColor: secondaryColor
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.backgroundColor = isLightMode ? `${secondaryColor}10` : `${secondaryColor}15`
                        e.currentTarget.style.borderColor = secondaryColor
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderColor = borderColor
                        e.currentTarget.style.borderLeftColor = secondaryColor
                      }
                    }}
                  >
                    <Mail className="w-6 h-6 flex-shrink-0" style={{ color: secondaryColor }} />
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Email</div>
                      <span className="text-sm font-bold break-all">franciscopirescaldas@gmail.com</span>
                    </div>
                  </a>
                  <div 
                    className="flex items-center gap-4 p-4"
                    style={{ 
                      border: `2px solid ${borderColor}`,
                      borderLeftWidth: '4px',
                      borderLeftColor: secondaryColor
                    }}
                  >
                    <Phone className="w-6 h-6 flex-shrink-0" style={{ color: secondaryColor }} />
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Phone</div>
                      <span className="text-sm font-bold block">(+41) 762142733</span>
                      <span className="text-sm font-bold block">(+351) 962888488</span>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-4 p-4"
                    style={{ 
                      border: `2px solid ${borderColor}`,
                      borderLeftWidth: '4px',
                      borderLeftColor: secondaryColor
                    }}
                  >
                    <MapPin className="w-6 h-6 flex-shrink-0" style={{ color: secondaryColor }} />
                    <div>
                      <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Location</div>
                      <span className="text-sm font-bold">Zürich, Switzerland</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <div 
                  className="text-xl font-black mb-6 uppercase flex items-center gap-3"
                  style={{ color: secondaryColor }}
                >
                  <span className="w-8 h-0.5" style={{ backgroundColor: secondaryColor }}></span>
                  Connect
                </div>
                <div className="space-y-4">
                  <a
                    href="https://linkedin.com/in/francisco-pires-caldas/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-6 transition-all duration-300 group"
                    style={{ 
                      border: `2px solid ${secondaryColor}`,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.backgroundColor = secondaryColor
                        const spans = e.currentTarget.querySelectorAll('span')
                        spans.forEach(span => span.style.color = isLightMode ? '#f5f5f5' : '#000000')
                        const svg = e.currentTarget.querySelector('svg')
                        if (svg) svg.style.color = isLightMode ? '#f5f5f5' : '#000000'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        const spans = e.currentTarget.querySelectorAll('span')
                        spans.forEach(span => span.style.color = secondaryColor)
                        const svg = e.currentTarget.querySelector('svg')
                        if (svg) svg.style.color = secondaryColor
                      }
                    }}
                  >
                    <Linkedin className="w-8 h-8 transition-colors" style={{ color: secondaryColor }} />
                    <div>
                      <span className="text-lg font-black uppercase block transition-colors" style={{ color: secondaryColor }}>LinkedIn</span>
                      <span className="text-xs opacity-70 transition-colors" style={{ color: secondaryColor }}>Connect professionally</span>
                    </div>
                  </a>
                  <a
                    href="https://github.com/Caldas00"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-6 transition-all duration-300 group"
                    style={{ 
                      border: `2px solid ${secondaryColor}`,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.backgroundColor = secondaryColor
                        const spans = e.currentTarget.querySelectorAll('span')
                        spans.forEach(span => span.style.color = isLightMode ? '#f5f5f5' : '#000000')
                        const svg = e.currentTarget.querySelector('svg')
                        if (svg) svg.style.color = isLightMode ? '#f5f5f5' : '#000000'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        const spans = e.currentTarget.querySelectorAll('span')
                        spans.forEach(span => span.style.color = secondaryColor)
                        const svg = e.currentTarget.querySelector('svg')
                        if (svg) svg.style.color = secondaryColor
                      }
                    }}
                  >
                    <Github className="w-8 h-8 transition-colors" style={{ color: secondaryColor }} />
                    <div>
                      <span className="text-lg font-black uppercase block transition-colors" style={{ color: secondaryColor }}>GitHub</span>
                      <span className="text-xs opacity-70 transition-colors" style={{ color: secondaryColor }}>View my code</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 border-t-2" style={{ borderColor: secondaryColor }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="text-2xl font-black" style={{ color: secondaryColor }}>FC.</div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-sm opacity-80 mb-1">&copy; 2025 Francisco Caldas. All rights reserved.</div>
              <div className="text-xs opacity-60">Daily reader | Tennis enthusiast | Future Software Engineer</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
