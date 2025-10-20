import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        _count: {
          select: {
            teams: true,
            games: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(tournaments)
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received request body:', body)
    
    const { name } = body
    
    if (!name || !name.trim()) {
      console.log('Validation failed: name is required')
      return NextResponse.json({ error: 'Tournament name is required' }, { status: 400 })
    }

    console.log('Creating tournament with name:', name.trim())
    
    const tournament = await prisma.tournament.create({
      data: {
        name: name.trim()
      }
    })

    console.log('Tournament created successfully:', tournament)
    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Error creating tournament:', error)
    return NextResponse.json({ 
      error: 'Failed to create tournament',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
