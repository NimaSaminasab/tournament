import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const { id, teamId } = await params
    const tournamentId = parseInt(id)
    const teamIdNum = parseInt(teamId)
    const body = await request.json()
    const name: string | undefined = body.name
    const number: number | undefined = body.number
    const fromPlayerId: number | undefined = body.fromPlayerId
    
    if (isNaN(tournamentId) || isNaN(teamIdNum)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 })
    }

    if (!fromPlayerId) {
      if (!name || !name.trim()) {
        return NextResponse.json({ error: 'Player name is required' }, { status: 400 })
      }
      if (!number || isNaN(number) || number < 1 || number > 150) {
        return NextResponse.json({ error: 'Player number must be between 1 and 150' }, { status: 400 })
      }
    }

    // Check if team exists and belongs to tournament
    const team = await prisma.team.findFirst({
      where: { 
        id: teamIdNum,
        tournamentId: tournamentId
      },
      include: {
        _count: {
          select: {
            players: true
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    if (team._count.players >= 10) {
      return NextResponse.json({ error: 'Team already has maximum number of players (10)' }, { status: 400 })
    }

    // If creating a new player, check number conflicts within team
    if (!fromPlayerId) {
      const existingPlayer = await prisma.player.findFirst({
        where: { teamId: teamIdNum, number: number }
      })
      if (existingPlayer) {
        return NextResponse.json({ error: 'Player number already taken' }, { status: 400 })
      }
    }

    let player
    if (fromPlayerId) {
      // Attach existing unassigned player to this team and set (or keep) number
      const freePlayer = await prisma.player.findFirst({
        where: { id: fromPlayerId, teamId: null }
      })
      if (!freePlayer) {
        return NextResponse.json({ error: 'Unassigned player not found' }, { status: 404 })
      }
      // Use provided number if set, otherwise keep the player's number
      const newNumber = number ?? freePlayer.number
      // Ensure no conflict on the destination team with the resolved number
      const conflict = await prisma.player.findFirst({ where: { teamId: teamIdNum, number: newNumber } })
      if (conflict) {
        return NextResponse.json({ error: 'Player number already taken on this team' }, { status: 400 })
      }
      player = await prisma.player.update({
        where: { id: freePlayer.id },
        data: { teamId: teamIdNum, number: newNumber, tournamentId }
      })
    } else {
      player = await prisma.player.create({
        data: {
          name: name!.trim(),
          number: number!,
          tournamentId,
          teamId: teamIdNum
        }
      })
    }

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
  }
}
