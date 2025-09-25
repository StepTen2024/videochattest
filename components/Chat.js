import { useState, useEffect, useRef } from 'react'
import { Send, X, User } from 'lucide-react'
import { io } from 'socket.io-client'

export default function Chat({ isOpen, onClose, roomId, participants }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [userName, setUserName] = useState('Anonymous')
  const messagesEndRef = useRef()

  useEffect(() => {
    if (isOpen && roomId) {
      // Initialize socket connection for chat
      const chatSocket = io(process.env.NODE_ENV === 'production' ? 
        window.location.origin : 'http://localhost:3000')
      
      setSocket(chatSocket)

      // Join chat room
      chatSocket.emit('join-chat', roomId)

      // Listen for chat messages
      chatSocket.on('chat-message', (message) => {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          ...message,
          timestamp: new Date()
        }])
      })

      // Listen for system messages
      chatSocket.on('system-message', (message) => {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          type: 'system',
          content: message.content,
          timestamp: new Date()
        }])
      })

      return () => {
        chatSocket.disconnect()
      }
    }
  }, [isOpen, roomId])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Add welcome message when chat opens
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'system',
        content: 'Welcome to the chat! Messages are only visible to current participants.',
        timestamp: new Date()
      }])
    }
  }, [isOpen])

  const sendMessage = (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !socket) return

    const message = {
      roomId,
      content: newMessage.trim(),
      sender: userName,
      timestamp: new Date()
    }

    // Send message via socket
    socket.emit('chat-message', message)
    
    // Add to local messages immediately
    setMessages(prev => [...prev, {
      id: Date.now(),
      ...message,
      isOwn: true
    }])

    setNewMessage('')
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-0 right-0 w-full sm:w-96 h-full bg-gray-900/95 backdrop-blur-sm border-l border-white/10 z-50 flex flex-col chat-enter">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Chat</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Participants List */}
      <div className="p-4 border-b border-white/10">
        <h4 className="text-sm font-medium text-white/70 mb-2">
          Participants ({participants.length})
        </h4>
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-white">{participant.name || `User ${index + 1}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id}>
            {message.type === 'system' ? (
              <div className="text-center">
                <div className="inline-block bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 px-3 py-1 rounded-full text-xs">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${
                  message.isOwn 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white'
                } rounded-lg p-3`}>
                  {!message.isOwn && (
                    <div className="text-xs text-white/70 mb-1 font-medium">
                      {message.sender}
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.isOwn ? 'text-blue-100' : 'text-white/50'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs text-white/50 mt-2">
          Press Enter to send • {newMessage.length}/500 characters
        </div>
      </form>
    </div>
  )
}
