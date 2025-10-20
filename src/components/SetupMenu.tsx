'use client'

import { useEffect, useRef, useState } from 'react'

export default function SetupMenu() {
  const [open, setOpen] = useState(false)
  const [minutes, setMinutes] = useState<string>('0')
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Load existing value
    try {
      const saved = localStorage.getItem('stopwatchTargetSeconds')
      if (saved) {
        const m = Math.floor(parseInt(saved, 10) / 60)
        setMinutes(String(m))
      }
    } catch {}

    const onClick = (e: MouseEvent) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [open])

  const saveTarget = (mins: number) => {
    const secs = Math.max(0, Math.floor(mins * 60))
    try {
      localStorage.setItem('stopwatchTargetSeconds', String(secs))
    } catch {}
    // Notify listeners in the same tab
    try {
      window.dispatchEvent(new CustomEvent('stopwatchTargetChange', { detail: { seconds: secs } }))
    } catch {}
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="px-3 py-1.5 text-sm rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
      >
        Innstillinger
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-4 z-50">
          <div className="mb-2 text-sm font-medium text-gray-900">Skriv spilletid (minutter)</div>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="For eksempel 15"
            value={minutes}
            onChange={(e) => {
              // allow empty during typing
              setMinutes(e.target.value)
              const m = parseInt(e.target.value, 10)
              if (!isNaN(m)) {
                saveTarget(m)
              } else if (e.target.value === '') {
                saveTarget(0) // treat empty as no limit
              }
            }}
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2"
          />
          <p className="mt-2 text-xs text-gray-500">0 eller tomt betyr uendelig.</p>
        </div>
      )}
    </div>
  )
}


