import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; gameId: string }> }
) {
  try {
    const { id, gameId } = await params
    const tournamentId = parseInt(id)
    const gameIdNum = parseInt(gameId)
    
    if (isNaN(tournamentId) || isNaN(gameIdNum)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 })
    }

    // Check if game exists and belongs to tournament
    const game = await prisma.game.findFirst({
      where: {
        id: gameIdNum,
        tournamentId: tournamentId
      }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    if (game.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Game is not in progress' }, { status: 400 })
    }

    // Check if this is the first finished game of the tournament
    const finishedGamesCount = await prisma.game.count({
      where: {
        tournamentId: tournamentId,
        status: 'FINISHED'
      }
    })

    // Update game status to FINISHED
    const updatedGame = await prisma.game.update({
      where: { id: gameIdNum },
      data: { status: 'FINISHED' },
      include: {
        homeTeam: {
          include: {
            players: true
          }
        },
        awayTeam: {
          include: {
            players: true
          }
        }
      }
    })

    // If this is the first finished game, update tournament participation for all team members
    if (finishedGamesCount === 0) {
      console.log('First game finished! Updating tournament participation for all team members...')
      
      // Get all teams in this tournament
      const tournamentTeams = await prisma.team.findMany({
        where: { tournamentId: tournamentId },
        include: {
          players: true
        }
      })

      // Update tournament participation for all players on teams
      for (const team of tournamentTeams) {
        for (const player of team.players) {
          // Store team composition for historical tracking (if not already stored)
          await prisma.teamComposition.upsert({
            where: {
              tournamentId_teamId_playerId: {
                tournamentId: tournamentId,
                teamId: team.id,
                playerId: player.id
              }
            },
            update: {},
            create: {
              tournamentId: tournamentId,
              teamId: team.id,
              playerId: player.id
            }
          })
        }
      }
      
      console.log(`Updated tournament participation for ${tournamentTeams.reduce((total, team) => total + team.players.length, 0)} players`)
    }

    return NextResponse.json(updatedGame)
  } catch (error) {
    console.error('Error finishing game:', error)
    return NextResponse.json({ error: 'Failed to finish game' }, { status: 500 })
  }
}
