import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all players with their goals and team information
    const players = await prisma.player.findMany({
      include: {
        goals: {
          include: {
            game: {
              include: {
                homeTeam: true,
                awayTeam: true
              }
            }
          }
        },
        team: {
          include: {
            homeGames: {
              include: {
                goals: true
              }
            },
            awayGames: {
              include: {
                goals: true
              }
            }
          }
        }
      }
    })

    // Calculate stats for each player
    const playerStats = players.map(player => {
      let wins = 0
      let draws = 0
      let losses = 0
      let goalsScored = 0
      let ownGoals = 0
      let tournamentsParticipated = 0

      // Count goals and own goals
      player.goals.forEach(goal => {
        if (goal.ownGoal) {
          ownGoals++
        } else {
          goalsScored++
        }
      })

      // Count unique tournaments the player has participated in
      const tournamentIds = new Set<number>()
      if (player.tournamentId) {
        tournamentIds.add(player.tournamentId)
      }
      // Also check tournaments from goals
      player.goals.forEach(goal => {
        if (goal.game?.tournamentId) {
          tournamentIds.add(goal.game.tournamentId)
        }
      })
      tournamentsParticipated = tournamentIds.size

      // Calculate wins/draws/losses for each team the player has been on
      if (player.team) {
        const team = player.team

        // Count home games
        team.homeGames.forEach(game => {
          if (game.status === 'FINISHED') {
            const homeGoals = game.goals.filter(g => g.teamId === team.id && !g.ownGoal).length
            const awayGoals = game.goals.filter(g => g.teamId !== team.id && !g.ownGoal).length
            
            if (homeGoals > awayGoals) {
              wins++
            } else if (homeGoals === awayGoals) {
              draws++
            } else {
              losses++
            }
          }
        })

        // Count away games
        team.awayGames.forEach(game => {
          if (game.status === 'FINISHED') {
            const homeGoals = game.goals.filter(g => g.teamId === game.homeTeamId && !g.ownGoal).length
            const awayGoals = game.goals.filter(g => g.teamId === team.id && !g.ownGoal).length
            
            if (awayGoals > homeGoals) {
              wins++
            } else if (awayGoals === homeGoals) {
              draws++
            } else {
              losses++
            }
          }
        })
      }

      return {
        id: player.id,
        name: player.name,
        number: player.number,
        teamName: player.team?.name || 'Ingen lag',
        wins,
        draws,
        losses,
        goalsScored,
        ownGoals,
        tournamentsParticipated
      }
    })

    return NextResponse.json(playerStats)
  } catch (error) {
    console.error('Error fetching player stats:', error)
    return NextResponse.json({ error: 'Failed to fetch player stats' }, { status: 500 })
  }
}
