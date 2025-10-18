import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Delete all goals first (due to foreign key constraints)
    await prisma.goal.deleteMany({})
    
    // Delete all games
    await prisma.game.deleteMany({})

    return NextResponse.json({ 
      success: true, 
      message: 'All games and goals have been deleted' 
    })
  } catch (error) {
    console.error('Error clearing games:', error)
    return NextResponse.json({ 
      error: 'Failed to clear games' 
    }, { status: 500 })
  }
}
