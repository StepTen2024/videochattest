import { Server } from 'socket.io'

const rooms = new Map()

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...')
    
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Join room
      socket.on('join-room', (roomId) => {
        console.log(`User ${socket.id} joining room ${roomId}`)
        
        socket.join(roomId)
        socket.roomId = roomId

        // Initialize room if it doesn't exist
        if (!rooms.has(roomId)) {
          rooms.set(roomId, {
            participants: [],
            messages: []
          })
        }

        const room = rooms.get(roomId)
        const isInitiator = room.participants.length === 0

        // Add participant to room
        const participant = {
          id: socket.id,
          name: `User ${room.participants.length + 1}`,
          isInitiator
        }
        room.participants.push(participant)

        // Notify user they joined
        socket.emit('room-joined', {
          isInitiator,
          participants: room.participants,
          roomId
        })

        // Notify others in room
        socket.to(roomId).emit('user-joined', {
          user: participant,
          participants: room.participants,
          isInitiator
        })

        console.log(`Room ${roomId} now has ${room.participants.length} participants`)
      })

      // Handle WebRTC signaling
      socket.on('offer', (data) => {
        console.log(`Offer from ${socket.id} in room ${data.roomId}`)
        socket.to(data.roomId).emit('offer', {
          offer: data.offer,
          from: socket.id
        })
      })

      socket.on('answer', (data) => {
        console.log(`Answer from ${socket.id} in room ${data.roomId}`)
        socket.to(data.roomId).emit('answer', {
          answer: data.answer,
          from: socket.id
        })
      })

      socket.on('ice-candidate', (data) => {
        socket.to(data.roomId).emit('ice-candidate', {
          candidate: data.candidate,
          from: socket.id
        })
      })

      // Chat functionality
      socket.on('join-chat', (roomId) => {
        socket.join(`chat-${roomId}`)
        
        // Send recent messages to new joiner
        const room = rooms.get(roomId)
        if (room && room.messages.length > 0) {
          const recentMessages = room.messages.slice(-20) // Last 20 messages
          socket.emit('chat-history', recentMessages)
        }
      })

      socket.on('chat-message', (data) => {
        const { roomId, content, sender } = data
        
        const message = {
          id: Date.now() + Math.random(),
          content,
          sender,
          timestamp: new Date(),
          socketId: socket.id
        }

        // Store message in room
        const room = rooms.get(roomId)
        if (room) {
          room.messages.push(message)
          // Keep only last 100 messages per room
          if (room.messages.length > 100) {
            room.messages = room.messages.slice(-100)
          }
        }

        // Broadcast to all users in chat room except sender
        socket.to(`chat-${roomId}`).emit('chat-message', message)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
        
        if (socket.roomId) {
          const room = rooms.get(socket.roomId)
          if (room) {
            // Remove participant from room
            const participantIndex = room.participants.findIndex(p => p.id === socket.id)
            if (participantIndex > -1) {
              const participant = room.participants[participantIndex]
              room.participants.splice(participantIndex, 1)

              // Notify others in room
              socket.to(socket.roomId).emit('user-left', {
                user: participant,
                participants: room.participants
              })

              console.log(`User ${socket.id} left room ${socket.roomId}`)

              // Clean up empty rooms
              if (room.participants.length === 0) {
                rooms.delete(socket.roomId)
                console.log(`Room ${socket.roomId} deleted (empty)`)
              }
            }
          }
        }
      })

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error)
        socket.emit('connection-error', { message: 'Connection error occurred' })
      })
    })

    res.socket.server.io = io
  } else {
    console.log('Socket.IO server already running')
  }

  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}
