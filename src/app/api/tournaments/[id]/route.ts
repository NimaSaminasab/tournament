import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tournamentId = parseInt(id)
    
    if (isNaN(tournamentId)) {
      return NextResponse.json({ error: 'Invalid tournament ID' }, { status: 400 })
    }

    const { isFinished } = await request.json()

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Update tournament status
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { isFinished }
    })

    // If tournament is being finished, unassign all players from teams
    if (isFinished) {
      await prisma.player.updateMany({
        where: {
          tournamentId: tournamentId,
          teamId: { not: null }
        },
        data: {
          teamId: null,
          tournamentId: null // Remove from tournament context
        }
      })
      
      // Note: Player statistics will be automatically updated when the stats API is called
      // because it now calculates stats based on historical game participation rather than current team membership
    }

    return NextResponse.json(updatedTournament)
  } catch (error) {
    console.error('Error updating tournament:', error)
    return NextResponse.json({ error: 'Failed to update tournament' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tournamentId = parseInt(id)
    
    if (isNaN(tournamentId)) {
      return NextResponse.json({ error: 'Invalid tournament ID' }, { status: 400 })
    }

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Delete tournament (cascade will handle teams, players, games, and goals)
    await prisma.tournament.delete({
      where: { id: tournamentId }
    })

    return NextResponse.json({ message: 'Tournament deleted successfully' })
  } catch (error) {
    console.error('Error deleting tournament:', error)
    return NextResponse.json({ error: 'Failed to delete tournament' }, { status: 500 })
  }
}
