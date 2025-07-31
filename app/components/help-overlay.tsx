"use client"

interface HelpOverlayProps {
  isVisible: boolean
}

export default function HelpOverlay({ isVisible }: HelpOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 left-8 z-50 bg-black border border-white p-4 font-mono text-sm text-white animate-in fade-in duration-300">
      <div className="mb-2 font-bold uppercase tracking-wide">Keyboard Shortcuts:</div>
      <div className="space-y-1 opacity-80">
        <div>
          Press <span className="font-bold">C</span> to change color
        </div>
        <div>
          Press <span className="font-bold">?</span> to toggle this help
        </div>
      </div>
    </div>
  )
}
