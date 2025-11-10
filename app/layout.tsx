import type React from "react"
import type { Metadata } from "next"
import { PHProvider } from "./providers"
import { PostHogPageView } from "./posthog-pageview"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Francisco Caldas - Portfolio",
  description: "Computer Science & Engineering Student Portfolio",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <PHProvider>
        <body>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {children}
        </body>
      </PHProvider>
    </html>
  )
}
