import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Francisco Caldas - Portfolio",
  description:
    "Computer Science & Engineering Student specializing in AI, software development, and financial technology solutions.",
  keywords: "Francisco Caldas, Computer Science, Software Engineer, AI, Portugal, Lisbon, Portfolio",
  authors: [{ name: "Francisco Caldas" }],
  openGraph: {
    title: "Francisco Caldas - Portfolio",
    description:
      "Computer Science & Engineering Student specializing in AI, software development, and financial technology solutions.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Francisco Caldas - Portfolio",
    description:
      "Computer Science & Engineering Student specializing in AI, software development, and financial technology solutions.",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  )
}
