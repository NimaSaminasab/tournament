import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: [{ createdAt: 'desc' }]
    })
    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name: string | undefined = body.name
    const numberRaw = body.number
    const number: number = typeof numberRaw === 'number' ? numberRaw : parseInt(numberRaw, 10)

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 })
    }
    if (!number || isNaN(number) || number < 1 || number > 150) {
      return NextResponse.json({ error: 'Player number must be between 1 and 150' }, { status: 400 })
    }

    // Enforce global uniqueness of player number across all players with no team
    const exists = await prisma.player.findFirst({ where: { number, teamId: null } })
    if (exists) {
      return NextResponse.json({ error: `Spillernummer ${number} finnes allerede.` }, { status: 400 })
    }

    const player = await prisma.player.create({
      data: {
        name: name.trim(),
        number,
        teamId: null,
        tournamentId: null
      }
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
  }
}
