'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tournament {
  id: number
  name: string
  isFinished: boolean
  createdAt: string
  _count: {
    teams: number
    games: number
  }
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments')
      if (response.ok) {
        const data = await response.json()
        setTournaments(data)
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTournament = async (tournamentId: number, tournamentName: string) => {
    if (!confirm(`Er du sikker på at du vil slette turneringen "${tournamentName}"? Dette vil også slette alle lag, spillere og kamper.`)) {
      return
    }

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove tournament from list
        setTournaments(tournaments.filter(t => t.id !== tournamentId))
      } else {
        const errorData = await response.json()
        alert(`Feil ved sletting av turnering: ${errorData.error || 'Ukjent feil'}`)
      }
    } catch (error) {
      console.error('Error deleting tournament:', error)
      alert('Feil ved sletting av turnering')
    }
  }

  const handleFinishTournament = async (tournamentId: number, tournamentName: string) => {
    if (!confirm(`Er du sikker på at du vil avslutte turneringen "${tournamentName}"? Dette vil låse turneringen for videre redigering.`)) {
      return
    }

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFinished: true }),
      })

      if (response.ok) {
        // Update tournament in list
        setTournaments(tournaments.map(t => 
          t.id === tournamentId ? { ...t, isFinished: true } : t
        ))
      } else {
        const errorData = await response.json()
        alert(`Feil ved avslutning av turnering: ${errorData.error || 'Ukjent feil'}`)
      }
    } catch (error) {
      console.error('Error finishing tournament:', error)
      alert('Feil ved avslutning av turnering')
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
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Turneringer</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administrer og opprett nye turneringer
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/tournaments/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Opprett ny turnering
          </Link>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Turnering
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Lag
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Kamper
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Opprettet
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Handlinger</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tournaments.map((tournament) => (
                    <tr key={tournament.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{tournament.name}</div>
                          {tournament.isFinished && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Avsluttet
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tournament._count.teams} lag
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {tournament._count.games} kamper
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tournament.createdAt).toLocaleDateString('no-NO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/tournaments/${tournament.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Administrer
                          </Link>
                          {!tournament.isFinished && (
                            <button
                              onClick={() => handleFinishTournament(tournament.id, tournament.name)}
                              className="text-orange-600 hover:text-orange-900"
                            >
                              Avslutt
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTournament(tournament.id, tournament.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Slett
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">Ingen turneringer opprettet ennå</div>
          <Link
            href="/tournaments/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Opprett din første turnering
          </Link>
        </div>
      )}
    </div>
  )
}
