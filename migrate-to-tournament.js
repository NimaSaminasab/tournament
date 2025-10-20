const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateToTournament() {
  try {
    console.log('Starting migration to tournament system...');
    
    // Create the "19.10.2025" tournament
    const tournament = await prisma.tournament.create({
      data: {
        name: '19.10.2025'
      }
    });
    
    console.log('Created tournament:', tournament.name);
    
    // Get all existing teams
    const existingTeams = await prisma.team.findMany({
      include: {
        players: true
      }
    });
    
    console.log('Found', existingTeams.length, 'existing teams');
    
    // Update teams to belong to the tournament
    for (const team of existingTeams) {
      await prisma.team.update({
        where: { id: team.id },
        data: { tournamentId: tournament.id }
      });
      console.log('Updated team:', team.name);
    }
    
    // Get all existing games
    const existingGames = await prisma.game.findMany();
    
    console.log('Found', existingGames.length, 'existing games');
    
    // Update games to belong to the tournament
    for (const game of existingGames) {
      await prisma.game.update({
        where: { id: game.id },
        data: { tournamentId: tournament.id }
      });
      console.log('Updated game:', game.id);
    }
    
    console.log('Migration completed successfully!');
    console.log('Tournament "19.10.2025" created with all existing data');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToTournament();
