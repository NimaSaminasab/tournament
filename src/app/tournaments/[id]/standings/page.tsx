import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface TeamStats {
  teamId: number
  teamName: string
  gamesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

interface TopScorer {
  playerId: number
  playerName: string
  playerNumber: number
  teamName: string
  goals: number
}

interface Tournament {
  id: number
  name: string
}

async function getTournament(tournamentId: number): Promise<Tournament | null> {
  return prisma.tournament.findUnique({
    where: { id: tournamentId }
  })
}

async function getStandings(tournamentId: number): Promise<TeamStats[]> {
  const teams = await prisma.team.findMany({
    where: { tournamentId },
    include: {
      homeGames: {
        where: {
          status: 'FINISHED'
        }
      },
      awayGames: {
        where: {
          status: 'FINISHED'
        }
      }
    }
  })

  const standings: TeamStats[] = teams.map(team => {
    let gamesPlayed = 0
    let wins = 0
    let draws = 0
    let losses = 0
    let goalsFor = 0
    let goalsAgainst = 0

    // Calculate stats for home games
    team.homeGames.forEach(game => {
      gamesPlayed++
      goalsFor += game.homeScore
      goalsAgainst += game.awayScore

      if (game.homeScore > game.awayScore) {
        wins++
      } else if (game.homeScore === game.awayScore) {
        draws++
      } else {
        losses++
      }
    })

    // Calculate stats for away games
    team.awayGames.forEach(game => {
      gamesPlayed++
      goalsFor += game.awayScore
      goalsAgainst += game.homeScore

      if (game.awayScore > game.homeScore) {
        wins++
      } else if (game.awayScore === game.homeScore) {
        draws++
      } else {
        losses++
      }
    })

    const points = wins * 3 + draws * 1

    return {
      teamId: team.id,
      teamName: team.name,
      gamesPlayed,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      points
    }
  })

  // Sort by points (descending), then by goal difference (descending), then by goals for (descending)
  return standings.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points
    }
    const aGoalDiff = a.goalsFor - a.goalsAgainst
    const bGoalDiff = b.goalsFor - b.goalsAgainst
    if (aGoalDiff !== bGoalDiff) {
      return bGoalDiff - aGoalDiff
    }
    return b.goalsFor - a.goalsFor
  })
}

async function getTopScorers(tournamentId: number): Promise<TopScorer[]> {
  const players = await prisma.player.findMany({
    where: {
      team: {
        tournamentId: tournamentId
      }
    },
    include: {
      team: true,
      goals: {
        where: {
          ownGoal: false, // Exclude own goals from top scorers
          game: {
            status: 'FINISHED'
          }
        }
      }
    }
  })

  const topScorers: TopScorer[] = players
    .map(player => ({
      playerId: player.id,
      playerName: player.name,
      playerNumber: player.number,
      teamName: player.team.name,
      goals: player.goals.length
    }))
    .filter(player => player.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    // Remove .slice(0, 3) to show all scorers

  return topScorers
}

export default async function TournamentStandingsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const tournamentId = parseInt(id)
  
  if (isNaN(tournamentId)) {
    notFound()
  }

  const tournament = await getTournament(tournamentId)
  if (!tournament) {
    notFound()
  }

  const standings = await getStandings(tournamentId)
  const topScorers = await getTopScorers(tournamentId)

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link
          href={`/tournaments/${tournamentId}`}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Tilbake til turnering
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Ligatabell - {tournament.name}
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Oversikt over alle lag og deres resultater
        </p>
      </div>

      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Lag
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      K
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      V
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      U
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      T
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      +
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      -
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      P
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {standings.map((team, index) => (
                    <tr key={team.teamId} className={index < 3 ? 'bg-yellow-50' : ''}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{team.teamName}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {team.gamesPlayed}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {team.wins}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {team.draws}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {team.losses}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {team.goalsFor}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {team.goalsAgainst}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {standings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">Ingen ferdige kamper ennå</div>
          <p className="text-sm text-gray-400">
            Kamper må være ferdige for å vises i tabellen
          </p>
        </div>
      )}

      {/* Top Scorers Section */}
      {topScorers.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Toppscorere</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Alle målskårerne</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {topScorers.map((scorer, index) => (
                <div key={scorer.playerId} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' :
                        'bg-blue-500'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{scorer.playerNumber} {scorer.playerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {scorer.teamName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {scorer.goals}
                    </div>
                    <div className="text-sm text-gray-500">
                      {scorer.goals === 1 ? 'mål' : 'mål'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
