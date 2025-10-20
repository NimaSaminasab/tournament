import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    const game = await prisma.game.findFirst({
      where: {
        id: gameIdNum,
        tournamentId: tournamentId
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        goals: {
          include: {
            player: true
          }
        }
      }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    return NextResponse.json(game)
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 })
  }
}

export async function DELETE(
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

    // Ensure the game belongs to the tournament
    const game = await prisma.game.findFirst({ where: { id: gameIdNum, tournamentId } })
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Cascade deletes of goals are handled by Prisma schema if configured; otherwise, delete explicitly
    await prisma.goal.deleteMany({ where: { gameId: gameIdNum } })
    await prisma.game.delete({ where: { id: gameIdNum } })

    return NextResponse.json({ message: 'Game deleted' })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 })
  }
}
