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

// Simple down arrow component
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

export default function Portfolio() {
  const [isLoading, setIsLoading] = useState(true)
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [secondaryColor, setSecondaryColor] = useState("#7399C6")
  const [colorIndex, setColorIndex] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showCursor, setShowCursor] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const colors = ["#7399C6", "#FFB366", "#98D8A8"] // blue, pastel orange, pastel green
  const fullName = "Francisco Caldas."

  // Refs for section animations
  const educationRef = useRef<HTMLElement>(null)
  const experienceRef = useRef<HTMLElement>(null)
  const skillsRef = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  // Check if mobile
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

  const resetTypingAnimation = () => {
    setDisplayedText("")
    setCurrentIndex(0)
    setIsTyping(true)
    setShowCursor(true)

    // Fast cursor blink for 1 second before starting
    setTimeout(() => {
      setShowCursor(false)
      setCurrentIndex(0)
    }, 1000)
  }

  // Keyboard shortcuts
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

  // Section reveal animations
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
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsTyping(true)
    }, 4000)
    return () => clearTimeout(timer)
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

  const education = [
    {
      degree: "Bachelor's in Computer Science and Engineering",
      institution: "Instituto Superior Técnico – University of Lisbon",
      period: "September 2023 – Present",
      location: "Lisbon, Portugal",
      gpa: "16 / 20",
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
      period: "July 2025 – Present",
      location: "Lisbon, Portugal",
      description:
        "Working in a fast-paced Agile team to develop an automated financial management AI bot for internal use and client deployment. Building core features using Generative AI, .NET, Python, Java, HTML and JavaScript.",
      link: "https://innowave.tech",
    },
    {
      title: "Electronics Team Member",
      company: "Instituto Superior Técnico – Rocket Experiment Division (AeroTec)",
      period: "March 2025 - Present",
      location: "Lisbon, Portugal",
      description:
        "Member of the Software & Hardware team in this student-led rocketry project. Contributing to the development of onboard systems and participating in technical planning.",
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

  const skills = [
    "C++",
    "Python",
    "Java",
    "R",
    "SQL",
    ".NET",
    "Generative AI",
    "React",
    "JavaScript",
    "HTML",
    "Agile",
    "Financial Systems",
  ]

  const projects = [
    {
      title: "Financial Management AI Bot",
      stack: ["Python", ".NET", "Generative AI", "JavaScript"],
      description:
        "Automated financial management system using AI to streamline data handling and reduce manual workload for enterprise clients.",
    },
    {
      title: "Rocket Onboard Systems",
      stack: ["C++", "Python", "Hardware Integration"],
      description:
        "Development of onboard systems for student rocketry project, focusing on real-time data collection and system monitoring.",
    },
    {
      title: "Sports Content Monitoring System",
      stack: ["Python", "Real-time Processing", "SQL"],
      description:
        "Real-time monitoring system for detecting unauthorized sports broadcast streams with automated reporting capabilities.",
    },
  ]

  // Component for links with hover message
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
        className={`text-white hover:transition-colors duration-300 ${className}`}
        onMouseEnter={(e) => {
          if (!isMobile) {
            e.currentTarget.style.color = secondaryColor
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile) {
            e.currentTarget.style.color = "white"
          }
        }}
      >
        {children}
      </a>
    )
  }

  const HoverText = ({ children, className = "", ...props }: any) => (
    <div
      className={`${className} text-white transition-colors duration-300 cursor-default`}
      onMouseEnter={(e) => {
        if (!isMobile) {
          const allTextElements = e.currentTarget.querySelectorAll("*")
          e.currentTarget.style.color = secondaryColor
          allTextElements.forEach((el: any) => {
            el.style.color = secondaryColor
          })
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          const allTextElements = e.currentTarget.querySelectorAll("*")
          e.currentTarget.style.color = "white"
          allTextElements.forEach((el: any) => {
            el.style.color = "white"
          })
        }
      }}
      {...props}
    >
      {children}
    </div>
  )

  // Component for links with hover message
  /*const LinkWithMessage = ({
    href,
    children,
    className = "",
  }: { href: string; children: React.ReactNode; className?: string }) => {
    const [isHovering, setIsHovering] = useState(false)

    return (
      <div className="relative">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-white hover:transition-colors duration-300 ${className}`}
          onMouseEnter={(e) => {
            if (!isMobile) {
              e.currentTarget.style.color = secondaryColor
              setIsHovering(true)
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              e.currentTarget.style.color = "white"
              setIsHovering(false)
            }
          }}
        >
          {children}
        </a>
        {!isMobile && (
          <div className="absolute -bottom-6 left-0 text-xs font-mono text-white opacity-60 transition-all duration-300 whitespace-nowrap">
            {isHovering ? "this is a link" : ""}
          </div>
        )}
      </div>
    )
  }*/

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {!isMobile && <CursorTrail />}
      <Stickman secondaryColor={secondaryColor} onColorCycle={cycleColor} />
      {!isMobile && <HelpOverlay isVisible={showHelp} />}
      <ScrollToTop secondaryColor={secondaryColor} />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="text-center w-full max-w-4xl mx-auto">
          <div className="mb-8">
            <h1
              className="text-3xl sm:text-5xl md:text-7xl font-black mb-8 leading-none tracking-tight cursor-pointer"
              onClick={resetTypingAnimation}
            >
              {displayedText.split("").map((char, index) => (
                <span key={index} className="relative inline-block">
                  <span
                    className={`${char === " " ? "" : "absolute inset-0 opacity-100 transition-opacity duration-300"}`}
                    style={{
                      backgroundColor: secondaryColor,
                      animation: `highlight 0.3s ease-in-out ${index * 0.1}s forwards`,
                    }}
                  ></span>
                  <span className="relative z-10" style={{ color: secondaryColor }}>
                    {char}
                  </span>
                </span>
              ))}
              <span
                className={`inline-block w-1 h-8 sm:h-12 md:h-16 bg-white ml-2 ${showCursor ? "cursor-blink" : ""}`}
              ></span>
            </h1>
            <div className="border-t border-white pt-4">
              <div className="text-sm sm:text-lg md:text-xl font-bold uppercase tracking-wider text-white">
                Computer Science & Engineering Student
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 border border-white p-3">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm sm:text-base">Born March 5, 2005</span>
            </div>
            <div className="flex items-center justify-center gap-3 border border-white p-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm sm:text-base">Lisbon, Portugal</span>
            </div>
            <div className="flex items-center justify-center gap-3 border border-white p-3">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm sm:text-base">(+351) 962888488</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator - only on desktop */}
        {!isMobile && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <div className="text-sm font-mono text-white opacity-60 mb-2">scroll to explore</div>
            <ChevronDown className="w-6 h-6 text-white opacity-60 animate-bounce-subtle" />
          </div>
        )}
      </section>

      {/* Education Section */}
      <section ref={educationRef} className="py-16 px-4 border-t border-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2
              className="text-3xl sm:text-5xl font-black uppercase tracking-wider mb-4"
              style={{ color: secondaryColor }}
            >
              Education
            </h2>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="space-y-8">
            {education.map((edu, index) => (
              <div key={index} className="border border-white p-4">
                <div className="text-lg sm:text-xl font-black mb-2 uppercase" style={{ color: secondaryColor }}>
                  {edu.degree}
                </div>
                <LinkWithMessage href={edu.link} className="text-base sm:text-lg font-bold mb-2 block">
                  {edu.institution}
                </LinkWithMessage>
                <div className="text-sm opacity-80 mb-1">{edu.period}</div>
                <div className="text-sm opacity-80 mb-3">{edu.location}</div>
                <div className="border-t border-white pt-3">
                  <div className="font-black">GPA: {edu.gpa}</div>
                  {edu.note && <div className="font-medium mt-1 opacity-90">{edu.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section ref={experienceRef} className="py-16 px-4 border-t border-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2
              className="text-3xl sm:text-5xl font-black uppercase tracking-wider mb-4"
              style={{ color: secondaryColor }}
            >
              Experience
            </h2>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div key={index} className="border border-white p-4">
                <div className="text-lg sm:text-xl font-black mb-2 uppercase" style={{ color: secondaryColor }}>
                  {exp.title}
                </div>
                <LinkWithMessage href={exp.link} className="text-base sm:text-lg font-bold mb-2 block">
                  {exp.company}
                </LinkWithMessage>
                <div className="text-sm opacity-80 mb-1">{exp.period}</div>
                <div className="text-sm opacity-80 mb-3">{exp.location}</div>
                <div className="border-t border-white pt-3">
                  <div className="text-sm sm:text-base leading-relaxed">{exp.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Skills Section */}
      <section ref={skillsRef} className="py-16 px-4 border-t border-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2
              className="text-3xl sm:text-5xl font-black uppercase tracking-wider mb-4"
              style={{ color: secondaryColor }}
            >
              Technical Skills
            </h2>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
            {skills.map((skill, index) => (
              <div key={index} className="border border-white p-3 text-center">
                <div className="font-bold text-xs sm:text-sm uppercase">{skill}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="border border-white p-4 text-center">
              <div className="text-lg font-black mb-2 uppercase">Portuguese</div>
              <div className="text-sm opacity-80">Native</div>
            </div>
            <div className="border border-white p-4 text-center">
              <div className="text-lg font-black mb-2 uppercase">English</div>
              <div className="text-sm opacity-80">Level C1</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      {/*
      <section ref={projectsRef} className="py-16 px-4 border-t border-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2
              className="text-3xl sm:text-5xl font-black uppercase tracking-wider mb-4"
              style={{ color: secondaryColor }}
            >
              Projects
            </h2>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="space-y-8">
            {projects.map((project, index) => (
              <div key={index} className="border border-white p-4">
                <div className="text-lg sm:text-xl font-black mb-3 uppercase">{project.title}</div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {project.stack.map((tech, techIndex) => (
                    <div key={techIndex} className="border border-white p-2 text-center">
                      <div className="text-xs font-bold uppercase">{tech}</div>
                    </div>
                  ))}
                </div>
                <div className="text-sm sm:text-base leading-relaxed">{project.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>*/}

      {/* Contact Section */}
      <section ref={contactRef} className="py-16 px-4 border-t border-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2
              className="text-3xl sm:text-5xl font-black uppercase tracking-wider mb-4"
              style={{ color: secondaryColor }}
            >
              Contact
            </h2>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="text-2xl font-black mb-8 uppercase">Get In Touch</div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 border border-white p-4">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <LinkWithMessage href="mailto:franciscopirescaldas@gmail.com" className="text-sm break-all">
                    franciscopirescaldas@gmail.com
                  </LinkWithMessage>
                </div>
                <div className="flex items-center gap-4 border border-white p-4">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">(+351) 962888488</span>
                </div>
                <div className="flex items-center gap-4 border border-white p-4">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">Lisbon, Portugal</span>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <LinkWithMessage
                  href="https://linkedin.com/in/francisco-pires-caldas/"
                  className="border border-white p-3 hover:bg-white hover:text-black transition-colors block"
                >
                  <Linkedin className="w-6 h-6" />
                </LinkWithMessage>
                <LinkWithMessage
                  href="https://github.com"
                  className="border border-white p-3 hover:bg-white hover:text-black transition-colors block"
                >
                  <Github className="w-6 h-6" />
                </LinkWithMessage>
              </div>
            </div>

            <div>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold mb-2 uppercase">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full border border-white bg-black text-white p-3 focus:outline-none focus:bg-white focus:text-black transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold mb-2 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full border border-white bg-black text-white p-3 focus:outline-none focus:bg-white focus:text-black transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-bold mb-2 uppercase">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full border border-white bg-black text-white p-3 focus:outline-none focus:bg-white focus:text-black transition-colors resize-none"
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full border border-white bg-black text-white p-3 font-black uppercase hover:bg-white hover:text-black transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm opacity-80 mb-2">&copy; 2025 Francisco Caldas. All rights reserved.</div>
          <div className="text-sm opacity-60">Daily reader • Tennis enthusiast • Future Software Engineer</div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes highlight {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
