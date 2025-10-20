'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function Stopwatch() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const [targetSeconds, setTargetSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('stopwatchTargetSeconds')
      return saved ? parseInt(saved, 10) : 0
    } catch { return 0 }
  })

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running])

  // Observe target changes from Setup
  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.seconds !== undefined) {
        setTargetSeconds(e.detail.seconds)
      }
    }
    window.addEventListener('stopwatchTargetChange' as any, handler)
    return () => window.removeEventListener('stopwatchTargetChange' as any, handler)
  }, [])

  // Stop at target time and auto-finish game if on game page
  useEffect(() => {
    if (!running) return
    if (!targetSeconds || targetSeconds <= 0) return
    if (seconds === targetSeconds) {
      // Stop timer
      setRunning(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      // Auto-finish game if we're on a game page
      const gamePageMatch = pathname.match(/^\/tournaments\/(\d+)\/games\/(\d+)$/)
      if (gamePageMatch) {
        const tournamentId = gamePageMatch[1]
        const gameId = gamePageMatch[2]
        
        // Call finish game API
        fetch(`/api/tournaments/${tournamentId}/games/${gameId}/finish`, {
          method: 'POST',
        })
        .then(response => {
          if (response.ok) {
            // Reload the page to show updated game status
            window.location.reload()
          }
        })
        .catch(error => {
          console.error('Error auto-finishing game:', error)
        })
      }
    }
  }, [seconds, targetSeconds, running, pathname])

  const handleToggle = () => {
    setRunning((r) => !r)
  }
  const handleReset = () => setSeconds(0)

  return (
    <div className="flex items-center space-x-2">
      <span className="font-mono text-base px-3 py-1.5 bg-gray-100 rounded select-none">
        {formatTime(seconds)}
      </span>
      {running ? (
        <button
          type="button"
          onClick={handleToggle}
          className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
          aria-label="Pause klokke"
        >
          Pause
        </button>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700"
          aria-label="Start klokke"
        >
          Start
        </button>
      )}
      <button
        type="button"
        onClick={handleReset}
        className="px-3 py-1.5 text-xs rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
        aria-label="Nullstill klokke"
      >
        Reset
      </button>
    </div>
  )
}


