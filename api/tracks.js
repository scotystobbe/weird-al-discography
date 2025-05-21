const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  console.log('API /api/tracks called with method:', req.method);
  if (req.method === 'GET') {
    try {
      const tracks = await prisma.track.findMany({
        include: { album: true },
        orderBy: { id: 'asc' }
      });
      res.status(200).json(tracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      res.status(500).json({ error: 'Failed to fetch tracks' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}; 