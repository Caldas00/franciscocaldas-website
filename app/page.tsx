"use client"

import { useState, useEffect, useRef } from "react"
import { Mail, Github, Linkedin, MapPin, Phone, Calendar } from "lucide-react"
import LoadingScreen from "./components/loading-screen"
import CursorTrail from "./components/cursor-trail"
import Stickman from "./components/stickman"
import HelpOverlay from "./components/help-overlay"
import ScrollToTop from "./components/scroll-to-top"

export default function Portfolio() {
  const [isLoading, setIsLoading] = useState(true)
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [secondaryColor, setSecondaryColor] = useState("#7399C6")
  const [colorIndex, setColorIndex] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showCursor, setShowCursor] = useState(false)

  const colors = ["#7399C6", "#FFB366", "#98D8A8"] // blue, pastel orange, pastel green
  const fullName = "Francisco Caldas."

  // Refs for section animations
  const educationRef = useRef<HTMLElement>(null)
  const experienceRef = useRef<HTMLElement>(null)
  const skillsRef = useRef<HTMLElement>(null)
  const projectsRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)

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
    },
    {
      degree: "High School",
      institution: "Salesianos de Lisboa",
      period: "September 2020 – June 2023",
      location: "Lisbon, Portugal",
      gpa: "17 / 20",
      note: "National Math Exam: 20 / 20",
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
    },
    {
      title: "Electronics Team Member",
      company: "Instituto Superior Técnico – Rocket Experiment Division (AeroTec)",
      period: "March 2025 - Present",
      location: "Lisbon, Portugal",
      description:
        "Member of the Software & Hardware team in this student-led rocketry project. Contributing to the development of onboard systems and participating in technical planning.",
    },
    {
      title: "Spring Week Intern",
      company: "BNP Paribas",
      period: "April 2025",
      location: "Lisbon, Portugal",
      description:
        "Gained exposure to global markets, investment banking, and risk management through workshops, networking sessions and case studies with industry professionals.",
    },
    {
      title: "Digital Content Rights Management",
      company: "Sportinveste Multimédia",
      period: "January 2023 – April 2025",
      location: "Lisbon, Portugal",
      description:
        "Real-time monitoring of rights infringement related to sports broadcasts. Identified and reported unauthorized streams of live sports events.",
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

  const HoverText = ({ children, className = "", ...props }: any) => (
    <div
      className={`${className} text-white transition-colors duration-300 cursor-default`}
      onMouseEnter={(e) => {
        const allTextElements = e.currentTarget.querySelectorAll("*")
        e.currentTarget.style.color = secondaryColor
        allTextElements.forEach((el: any) => {
          el.style.color = secondaryColor
        })
      }}
      onMouseLeave={(e) => {
        const allTextElements = e.currentTarget.querySelectorAll("*")
        e.currentTarget.style.color = "white"
        allTextElements.forEach((el: any) => {
          el.style.color = "white"
        })
      }}
      {...props}
    >
      {children}
    </div>
  )

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <CursorTrail />
      <Stickman secondaryColor={secondaryColor} onColorCycle={cycleColor} />
      <HelpOverlay isVisible={showHelp} />
      <ScrollToTop secondaryColor={secondaryColor} />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 md:px-8">
        <div className="text-center max-w-5xl mx-auto">
          <div className="mb-8 md:mb-16">
            <h1
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 md:mb-12 leading-none tracking-tight cursor-pointer"
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
                className={`inline-block w-1 h-12 sm:h-16 md:h-20 lg:h-24 bg-white ml-2 ${showCursor ? "cursor-blink" : ""}`}
              ></span>
            </h1>
            <div className="border-t border-white pt-6 md:pt-8">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-wider text-white transition-colors duration-300 cursor-default">
                Computer Science & Engineering Student
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-base md:text-lg font-medium">
            <div className="flex items-center justify-center gap-3 border border-white p-3 md:p-4">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              <HoverText>Born March 5, 2005</HoverText>
            </div>
            <div className="flex items-center justify-center gap-3 border border-white p-3 md:p-4">
              <MapPin className="w-4 h-4 md:w-5 md:h-5" />
              <HoverText>Lisbon, Portugal</HoverText>
            </div>
            <div className="flex items-center justify-center gap-3 border border-white p-3 md:p-4">
              <Phone className="w-4 h-4 md:w-5 md:h-5" />
              <HoverText>(+351) 962888488</HoverText>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section ref={educationRef} className="py-24 px-8 border-t border-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-6xl font-black uppercase tracking-wider mb-4" style={{ color: secondaryColor }}>
              Education
            </h2>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {education.map((edu, index) => (
              <div key={index} className="border border-white p-8">
                <div className="mb-6">
                  <HoverText className="text-2xl font-black mb-3 uppercase tracking-wide">{edu.degree}</HoverText>
                  <HoverText className="text-xl font-bold mb-2">{edu.institution}</HoverText>
                  <HoverText className="text-lg mb-2 opacity-80">{edu.period}</HoverText>
                  <HoverText className="text-lg mb-4 opacity-80">{edu.location}</HoverText>
                  <div className="border-t border-white pt-4">
                    <HoverText className="font-black text-lg">GPA: {edu.gpa}</HoverText>
                    {edu.note && <HoverText className="font-medium mt-2 opacity-90">{edu.note}</HoverText>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section ref={experienceRef} className="py-24 px-8 border-t border-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-6xl font-black uppercase tracking-wider mb-4" style={{ color: secondaryColor }}>
              Experience
            </h2>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="space-y-16">
            {experience.map((exp, index) => (
              <div key={index} className="border border-white p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <HoverText className="text-2xl font-black mb-3 uppercase tracking-wide">{exp.title}</HoverText>
                    <HoverText className="text-xl font-bold mb-2">{exp.company}</HoverText>
                    <HoverText className="text-lg opacity-80 mb-1">{exp.period}</HoverText>
                    <HoverText className="text-lg opacity-80">{exp.location}</HoverText>
                  </div>
                  <div className="md:col-span-2 border-l-0 md:border-l border-white md:pl-8">
                    <HoverText className="text-lg leading-relaxed font-medium">{exp.description}</HoverText>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Skills Section */}
      <section ref={skillsRef} className="py-24 px-8 border-t border-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-6xl font-black uppercase tracking-wider mb-4" style={{ color: secondaryColor }}>
              Technical Skills
            </h2>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {skills.map((skill, index) => (
              <div key={index} className="border border-white p-4 text-center">
                <HoverText className="font-bold text-lg uppercase tracking-wide">{skill}</HoverText>
              </div>
            ))}
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="border border-white p-8 text-center">
              <HoverText className="text-2xl font-black mb-4 uppercase tracking-wide">Portuguese</HoverText>
              <HoverText className="text-lg font-medium opacity-80">Native</HoverText>
            </div>
            <div className="border border-white p-8 text-center">
              <HoverText className="text-2xl font-black mb-4 uppercase tracking-wide">English</HoverText>
              <HoverText className="text-lg font-medium opacity-80">Level C1</HoverText>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section ref={projectsRef} className="py-24 px-8 border-t border-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-6xl font-black uppercase tracking-wider mb-4" style={{ color: secondaryColor }}>
              Projects
            </h2>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div key={index} className="border border-white p-8">
                <div className="mb-6">
                  <HoverText className="text-2xl font-black mb-4 uppercase tracking-wide">{project.title}</HoverText>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {project.stack.map((tech, techIndex) => (
                      <div key={techIndex} className="border border-white p-2 text-center">
                        <HoverText className="text-sm font-bold uppercase tracking-wide">{tech}</HoverText>
                      </div>
                    ))}
                  </div>
                </div>
                <HoverText className="text-lg leading-relaxed font-medium">{project.description}</HoverText>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="py-24 px-8 border-t border-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <h2 className="text-6xl font-black uppercase tracking-wider mb-4" style={{ color: secondaryColor }}>
              Contact
            </h2>
            <div className="w-full h-px bg-white"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <HoverText className="text-3xl font-black mb-12 uppercase tracking-wide">Get In Touch</HoverText>
              <div className="space-y-8">
                <div className="flex items-center gap-6 border border-white p-6">
                  <Mail className="w-6 h-6" />
                  <a
                    href="mailto:franciscopirescaldas@gmail.com"
                    className="text-lg font-medium text-white hover:transition-colors duration-300"
                    onMouseEnter={(e) => (e.currentTarget.style.color = secondaryColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                  >
                    franciscopirescaldas@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-6 border border-white p-6">
                  <Phone className="w-6 h-6" />
                  <HoverText className="text-lg font-medium">(+351) 962888488</HoverText>
                </div>
                <div className="flex items-center gap-6 border border-white p-6">
                  <MapPin className="w-6 h-6" />
                  <HoverText className="text-lg font-medium">Lisbon, Portugal</HoverText>
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <a
                  href="https://linkedin.com/in/francisco-pires-caldas/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white p-4 hover:bg-white hover:text-black transition-colors"
                >
                  <Linkedin className="w-8 h-8" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white p-4 hover:bg-white hover:text-black transition-colors"
                >
                  <Github className="w-8 h-8" />
                </a>
              </div>
            </div>

            <div>
              <form className="space-y-8">
                <div>
                  <label htmlFor="name" className="block text-lg font-bold mb-4 uppercase tracking-wide text-white">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full border border-white bg-black text-white p-4 focus:outline-none focus:bg-white focus:text-black transition-colors font-medium"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-lg font-bold mb-4 uppercase tracking-wide text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full border border-white bg-black text-white p-4 focus:outline-none focus:bg-white focus:text-black transition-colors font-medium"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-lg font-bold mb-4 uppercase tracking-wide text-white">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full border border-white bg-black text-white p-4 focus:outline-none focus:bg-white focus:text-black transition-colors resize-none font-medium"
                    placeholder="Your message..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full border border-white bg-black text-white p-4 font-black text-lg uppercase tracking-wide hover:bg-white hover:text-black transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-white">
        <div className="max-w-6xl mx-auto text-center">
          <HoverText className="text-lg font-medium opacity-80 mb-2">
            &copy; 2025 Francisco Caldas. All rights reserved.
          </HoverText>
          <HoverText className="text-lg font-medium opacity-60">
            Daily reader • Tennis enthusiast • Future Software Engineer
          </HoverText>
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
      `}</style>
    </div>
  )
}
