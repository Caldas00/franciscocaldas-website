"use client"

interface HelpOverlayProps {
  isVisible: boolean
}

export default function HelpOverlay({ isVisible }: HelpOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 left-8 z-50 bg-black border border-white p-4 font-mono text-white text-sm">
      <div className="space-y-2">
        <div className="font-bold uppercase tracking-wide mb-3">Keyboard Shortcuts</div>
        <div className="flex justify-between gap-8">
          <span className="opacity-80">Press C</span>
          <span>Change color</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="opacity-80">Press ?</span>
          <span>Toggle help</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="opacity-80">Click name</span>
          <span>Replay typing</span>
        </div>
      </div>
    </div>
  )
}
