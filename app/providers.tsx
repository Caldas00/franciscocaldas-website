"use client"

import type React from "react"

import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { useEffect } from "react"

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
      const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"

      if (!posthogKey) {
        console.warn("[PostHog] Missing NEXT_PUBLIC_POSTHOG_KEY environment variable")
        return
      }

      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: false,
        capture_pageleave: true,
      })
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
