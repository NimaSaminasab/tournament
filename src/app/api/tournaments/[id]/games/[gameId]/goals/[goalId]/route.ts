import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; gameId: string; goalId: string }> }
) {
  try {
    const { id, gameId, goalId } = await params
    const tournamentId = parseInt(id)
    const gameIdNum = parseInt(gameId)
    const goalIdNum = parseInt(goalId)
    
    if (isNaN(tournamentId) || isNaN(gameIdNum) || isNaN(goalIdNum)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 })
    }

    // Get the goal to find which team it belongs to
    const goal = await prisma.goal.findUnique({
      where: { id: goalIdNum },
      include: {
        game: true
      }
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check if the game belongs to the tournament
    if (goal.game.tournamentId !== tournamentId) {
      return NextResponse.json({ error: 'Game not found in tournament' }, { status: 404 })
    }

    // Get the game to update scores
    const game = await prisma.game.findUnique({
      where: { id: gameIdNum }
    })

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Delete the goal
    await prisma.goal.delete({
      where: { id: goalIdNum }
    })

    // Update game score
    const isHomeTeamGoal = goal.teamId === game.homeTeamId
    const updatedGame = await prisma.game.update({
      where: { id: gameIdNum },
      data: {
        homeScore: isHomeTeamGoal ? Math.max(0, game.homeScore - 1) : game.homeScore,
        awayScore: isHomeTeamGoal ? game.awayScore : Math.max(0, game.awayScore - 1)
      }
    })

    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
