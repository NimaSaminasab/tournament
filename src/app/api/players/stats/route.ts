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

      // Calculate wins/draws/losses based on all games the player has participated in
      // We need to find all games where the player has scored goals or was part of a team
      const playerGameIds = new Set<number>()
      
      // Add games from goals
      player.goals.forEach(goal => {
        if (goal.game) {
          playerGameIds.add(goal.game.id)
        }
      })

      // For each game the player participated in, determine the result
      for (const gameId of playerGameIds) {
        const game = await prisma.game.findUnique({
          where: { id: gameId },
          include: {
            goals: true,
            homeTeam: true,
            awayTeam: true
          }
        })

        if (game && game.status === 'FINISHED') {
          // Find which team the player was on in this game
          let playerTeamId: number | null = null
          
          // Check if player was on home team (by looking at goals or team history)
          const homeTeamGoal = game.goals.find(g => g.playerId === player.id && g.teamId === game.homeTeamId)
          if (homeTeamGoal) {
            playerTeamId = game.homeTeamId
          } else {
            // Check if player was on away team
            const awayTeamGoal = game.goals.find(g => g.playerId === player.id && g.teamId === game.awayTeamId)
            if (awayTeamGoal) {
              playerTeamId = game.awayTeamId
            }
          }

          if (playerTeamId) {
            const homeGoals = game.goals.filter(g => g.teamId === game.homeTeamId && !g.ownGoal).length
            const awayGoals = game.goals.filter(g => g.teamId === game.awayTeamId && !g.ownGoal).length
            
            if (playerTeamId === game.homeTeamId) {
              // Player was on home team
              if (homeGoals > awayGoals) {
                wins++
              } else if (homeGoals === awayGoals) {
                draws++
              } else {
                losses++
              }
            } else {
              // Player was on away team
              if (awayGoals > homeGoals) {
                wins++
              } else if (awayGoals === homeGoals) {
                draws++
              } else {
                losses++
              }
            }
          }
        }
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
