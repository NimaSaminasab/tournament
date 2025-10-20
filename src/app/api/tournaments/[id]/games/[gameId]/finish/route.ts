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

    // Update game status to FINISHED
    const updatedGame = await prisma.game.update({
      where: { id: gameIdNum },
      data: { status: 'FINISHED' },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    })

    return NextResponse.json(updatedGame)
  } catch (error) {
    console.error('Error finishing game:', error)
    return NextResponse.json({ error: 'Failed to finish game' }, { status: 500 })
  }
}
