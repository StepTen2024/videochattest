import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import VideoCall from '../../components/VideoCall'
import Controls from '../../components/Controls'
import Chat from '../../components/Chat'
import { Copy, Users, MessageSquare, Settings, Phone } from 'lucide-react'

export default function Room() {
  const router = useRouter()
  const { id: roomId } = router.query
  const [isHost, setIsHost] = useState(false)
  const [participants, setParticipants] = useState([])
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionQuality, setConnectionQuality] = useState('excellent')
  const [currentTime, setCurrentTime] = useState('')
  const [notification, setNotification] = useState(null)
  
  // Video/Audio states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()

  useEffect(() => {
    if (!roomId) return

    // Update time every second
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [roomId])

  const copyRoomLink = async () => {
    const roomLink = `${window.location.origin}/room/${roomId}`
    
    try {
      await navigator.clipboard.writeText(roomLink)
      showNotification('Room link copied to clipboard!', 'success')
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = roomLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showNotification('Room link copied to clipboard!', 'success')
    }
  }

  const shareRoom = async () => {
    const roomLink = `${window.location.origin}/room/${roomId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my ProMeet video call',
          text: 'Click this link to join our video conference',
          url: roomLink,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyRoomLink()
        }
      }
    } else {
      copyRoomLink()
    }
  }

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const leaveRoom = () => {
    if (confirm('Are you sure you want to leave this meeting?')) {
      // Clean up WebRTC connections
      // This would be handled by the VideoCall component
      router.push('/')
    }
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading room...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>ProMeet - Room {roomId}</title>
        <meta name="description" content={`Join the video conference in room ${roomId}`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative">
        {/* Header */}
        <header className="glass border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">🎥</div>
                <div>
                  <h1 className="text-lg font-semibold text-white">ProMeet</h1>
                  <p className="text-sm text-white/60">Room: {roomId}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    connectionQuality === 'excellent' ? 'bg-green-400' :
                    connectionQuality === 'good' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm text-white/70 capitalize">{connectionQuality}</span>
                </div>
                
                <button
                  onClick={shareRoom}
                  className="btn-hover glass px-4 py-2 rounded-lg text-white border border-white/20 hover:border-white/40 flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
                
                <div className="text-white/70 font-medium">
                  {currentTime}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Video Call Component */}
            <VideoCall
              roomId={roomId}
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              isScreenSharing={isScreenSharing}
              onParticipantsChange={setParticipants}
              onConnectionChange={setIsConnected}
              onQualityChange={setConnectionQuality}
              onNotification={showNotification}
            />
            
            {/* Meeting Info Bar */}
            <div className="flex justify-between items-center mb-6 p-4 glass rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-white/70" />
                  <span className="text-white font-medium">
                    {participants.length} participant{participants.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {isConnected && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Connected</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleChat}
                  className={`btn-hover p-2 rounded-lg transition-colors ${
                    isChatOpen 
                      ? 'bg-blue-500 text-white' 
                      : 'glass text-white/70 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Controls */}
        <Controls
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          isScreenSharing={isScreenSharing}
          onVideoToggle={setIsVideoEnabled}
          onAudioToggle={setIsAudioEnabled}
          onScreenShare={setIsScreenSharing}
          onLeave={leaveRoom}
          onChat={toggleChat}
          participantCount={participants.length}
        />

        {/* Chat Sidebar */}
        <Chat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          roomId={roomId}
          participants={participants}
        />

        {/* Notification */}
        {notification && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' :
            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
          } text-white font-medium`}>
            {notification.message}
          </div>
        )}

        {/* Connection Quality Indicator */}
        <div className="fixed top-20 right-4 glass px-3 py-2 rounded-lg z-40">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-1 rounded-full ${
                    connectionQuality === 'excellent' ? 'bg-green-400' :
                    connectionQuality === 'good' && bar <= 3 ? 'bg-yellow-400' :
                    connectionQuality === 'poor' && bar <= 2 ? 'bg-red-400' :
                    'bg-white/20'
                  }`}
                  style={{ height: `${bar * 4 + 8}px` }}
                />
              ))}
            </div>
            <span className="text-xs text-white/70 capitalize">{connectionQuality}</span>
          </div>
        </div>
      </div>
    </>
  )
}
