// API route for room management
export default function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      // Get room information
      const { roomId } = req.query
      
      if (!roomId) {
        return res.status(400).json({ error: 'Room ID is required' })
      }

      // In a real app, you'd fetch from a database
      // For now, we'll return basic room info
      res.status(200).json({
        roomId,
        status: 'active',
        created: new Date().toISOString(),
        maxParticipants: 10
      })
      break

    case 'POST':
      // Create a new room
      const { v4: uuidv4 } = require('uuid')
      const newRoomId = uuidv4().replace(/-/g, '').substring(0, 12)
      
      res.status(201).json({
        roomId: newRoomId,
        status: 'created',
        created: new Date().toISOString(),
        maxParticipants: 10,
        url: `${req.headers.origin || 'http://localhost:3000'}/room/${newRoomId}`
      })
      break

    case 'DELETE':
      // Delete/close a room
      const { roomId: deleteRoomId } = req.query
      
      if (!deleteRoomId) {
        return res.status(400).json({ error: 'Room ID is required' })
      }

      // In a real app, you'd remove from database and notify participants
      res.status(200).json({
        roomId: deleteRoomId,
        status: 'deleted',
        message: 'Room closed successfully'
      })
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
