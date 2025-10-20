import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const { id, teamId } = await params
    const tournamentId = parseInt(id)
    const teamIdNum = parseInt(teamId)
    
    if (isNaN(tournamentId) || isNaN(teamIdNum)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 })
    }

    const team = await prisma.team.findFirst({
      where: { 
        id: teamIdNum,
        tournamentId: tournamentId
      },
      include: {
        players: {
          orderBy: {
            number: 'asc'
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}
