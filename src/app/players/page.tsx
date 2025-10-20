'use client'

import { useEffect, useState } from 'react'

interface PlayerStats {
  id: number
  name: string
  number: number
  teamName: string
  wins: number
  draws: number
  losses: number
  goalsScored: number
  ownGoals: number
  tournamentsParticipated: number
}

export default function PlayersHomePage() {
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [players, setPlayers] = useState<{ id: number; name: string; number: number }[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load basic players list
        const playersRes = await fetch('/api/players')
        if (playersRes.ok) {
          const playersData = await playersRes.json()
          setPlayers(playersData)
        }

        // Load player statistics
        const statsRes = await fetch('/api/players/stats')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setPlayerStats(statsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleDeletePlayer = async (playerId: number) => {
    if (!confirm('Er du sikker på at du vil slette denne spilleren permanent?')) {
      return
    }
    try {
      const res = await fetch(`/api/players/${playerId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Feil ved sletting av spiller')
        return
      }
      setPlayers((prev) => prev.filter((p) => p.id !== playerId))
      setPlayerStats((prev) => prev.filter((p) => p.id !== playerId))
    } catch (e: any) {
      alert(e?.message || 'Ukjent feil')
    }
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !number) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, number: parseInt(number, 10) })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(`Feil ved legg til spiller: ${err.error || res.status}`)
      } else {
        setName('')
        setNumber('')
        // refresh both lists
        try {
          const [playersRes, statsRes] = await Promise.all([
            fetch('/api/players'),
            fetch('/api/players/stats')
          ])
          if (playersRes.ok) setPlayers(await playersRes.json())
          if (statsRes.ok) setPlayerStats(await statsRes.json())
        } catch {}
      }
    } catch (e: any) {
      alert(e?.message || 'Ukjent feil')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">Laster...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Administrer Spillere</h1>
      
      {/* Add Player Form */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Legg til ny spiller</h2>
        <form onSubmit={handleAddPlayer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spillernavn</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2"
                placeholder="Navn"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spillernummer</label>
              <input
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm px-3 py-2"
                placeholder="Nummer (1-150)"
                min={1}
                max={150}
                required
              />
            </div>
          </div>
          <div className="text-right">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Legger til...' : 'Legg til spiller'}
            </button>
          </div>
        </form>
      </div>

      {/* Player Statistics Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Spillerstatistikk</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spiller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lag
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turneringer
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vunnet
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uavgjort
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tapt
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mål
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Selvmål
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {playerStats.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Ingen spillere registrert
                  </td>
                </tr>
              ) : (
                playerStats
                  .slice()
                  .sort((a, b) => a.number - b.number || a.name.localeCompare(b.name))
                  .map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                            #{player.number}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {player.teamName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {player.tournamentsParticipated}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {player.wins}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {player.draws}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {player.losses}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {player.goalsScored}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {player.ownGoals}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Slett
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


