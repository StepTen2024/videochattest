import { useState, useEffect, useRef } from 'react'
import Peer from 'simple-peer'
import { io } from 'socket.io-client'

export default function VideoCall({
  roomId,
  localVideoRef,
  remoteVideoRef,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  onParticipantsChange,
  onConnectionChange,
  onQualityChange,
  onNotification
}) {
  const [socket, setSocket] = useState(null)
  const [peer, setPeer] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isInitiator, setIsInitiator] = useState(false)
  const [participants, setParticipants] = useState([])
  const [connectionState, setConnectionState] = useState('disconnected')

  const localVideoElement = useRef()
  const remoteVideoElement = useRef()

  useEffect(() => {
    if (!roomId) return

    initializeConnection()
    
    return () => {
      cleanup()
    }
  }, [roomId])

  useEffect(() => {
    // Update video/audio tracks when states change
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoEnabled
      })
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isAudioEnabled
      })
    }
  }, [isVideoEnabled, isAudioEnabled, localStream])

  useEffect(() => {
    // Handle screen sharing
    if (isScreenSharing) {
      startScreenShare()
    } else {
      stopScreenShare()
    }
  }, [isScreenSharing])

  const initializeConnection = async () => {
    try {
      // Initialize socket connection
      const newSocket = io(process.env.NODE_ENV === 'production' ? 
        window.location.origin : 'http://localhost:3000', {
        transports: ['websocket', 'polling']
      })

      setSocket(newSocket)

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      setLocalStream(stream)
      if (localVideoElement.current) {
        localVideoElement.current.srcObject = stream
      }

      // Join room
      newSocket.emit('join-room', roomId)

      // Socket event handlers
      newSocket.on('room-joined', (data) => {
        setIsInitiator(data.isInitiator)
        setParticipants(data.participants)
        onParticipantsChange(data.participants)
        setConnectionState('connected')
        onConnectionChange(true)
        onNotification('Connected to room', 'success')
      })

      newSocket.on('user-joined', (data) => {
        setParticipants(data.participants)
        onParticipantsChange(data.participants)
        onNotification(`${data.user.name || 'Someone'} joined the meeting`, 'info')
        
        if (data.isInitiator) {
          // Create peer as initiator
          createPeer(stream, true)
        }
      })

      newSocket.on('user-left', (data) => {
        setParticipants(data.participants)
        onParticipantsChange(data.participants)
        onNotification(`${data.user.name || 'Someone'} left the meeting`, 'info')
        
        // Clean up peer connection
        if (peer) {
          peer.destroy()
          setPeer(null)
        }
        setRemoteStream(null)
        if (remoteVideoElement.current) {
          remoteVideoElement.current.srcObject = null
        }
      })

      newSocket.on('offer', (data) => {
        // Receive offer and create answer
        createPeer(stream, false, data.offer)
      })

      newSocket.on('answer', (data) => {
        if (peer) {
          peer.signal(data.answer)
        }
      })

      newSocket.on('ice-candidate', (data) => {
        if (peer) {
          peer.signal(data.candidate)
        }
      })

      newSocket.on('connection-error', (error) => {
        onNotification('Connection error: ' + error.message, 'error')
        setConnectionState('error')
        onConnectionChange(false)
      })

    } catch (error) {
      console.error('Error initializing connection:', error)
      onNotification('Failed to access camera/microphone', 'error')
      setConnectionState('error')
      onConnectionChange(false)
    }
  }

  const createPeer = (stream, isInitiator, incomingSignal = null) => {
    const newPeer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    })

    newPeer.on('signal', (signal) => {
      if (socket) {
        if (signal.type === 'offer') {
          socket.emit('offer', { roomId, offer: signal })
        } else if (signal.type === 'answer') {
          socket.emit('answer', { roomId, answer: signal })
        } else {
          socket.emit('ice-candidate', { roomId, candidate: signal })
        }
      }
    })

    newPeer.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream)
      if (remoteVideoElement.current) {
        remoteVideoElement.current.srcObject = remoteStream
      }
      onNotification('Video call connected!', 'success')
    })

    newPeer.on('connect', () => {
      setConnectionState('connected')
      onConnectionChange(true)
      monitorConnectionQuality(newPeer)
    })

    newPeer.on('error', (error) => {
      console.error('Peer error:', error)
      onNotification('Connection failed', 'error')
      setConnectionState('error')
      onConnectionChange(false)
    })

    newPeer.on('close', () => {
      setConnectionState('disconnected')
      onConnectionChange(false)
      setRemoteStream(null)
      if (remoteVideoElement.current) {
        remoteVideoElement.current.srcObject = null
      }
    })

    if (incomingSignal) {
      newPeer.signal(incomingSignal)
    }

    setPeer(newPeer)
  }

  const monitorConnectionQuality = (peerConnection) => {
    const interval = setInterval(async () => {
      if (!peerConnection || peerConnection.destroyed) {
        clearInterval(interval)
        return
      }

      try {
        const stats = await peerConnection._pc.getStats()
        let quality = 'excellent'
        
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            const packetsLost = report.packetsLost || 0
            const packetsReceived = report.packetsReceived || 0
            
            if (packetsReceived > 0) {
              const lossRate = packetsLost / (packetsLost + packetsReceived)
              
              if (lossRate > 0.05) {
                quality = 'poor'
              } else if (lossRate > 0.02) {
                quality = 'good'
              }
            }
          }
        })
        
        onQualityChange(quality)
      } catch (error) {
        console.error('Error monitoring connection quality:', error)
      }
    }, 5000)
  }

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      // Replace video track in peer connection
      if (peer && localStream) {
        const videoTrack = screenStream.getVideoTracks()[0]
        const sender = peer._pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        )
        
        if (sender) {
          await sender.replaceTrack(videoTrack)
        }
        
        // Update local video element
        if (localVideoElement.current) {
          localVideoElement.current.srcObject = screenStream
        }

        // Handle screen share end
        videoTrack.onended = () => {
          stopScreenShare()
        }
      }

      onNotification('Screen sharing started', 'success')
    } catch (error) {
      console.error('Error starting screen share:', error)
      onNotification('Failed to start screen sharing', 'error')
    }
  }

  const stopScreenShare = async () => {
    try {
      if (peer && localStream) {
        const videoTrack = localStream.getVideoTracks()[0]
        const sender = peer._pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        )
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack)
        }
        
        // Restore local video element
        if (localVideoElement.current) {
          localVideoElement.current.srcObject = localStream
        }
      }
    } catch (error) {
      console.error('Error stopping screen share:', error)
    }
  }

  const cleanup = () => {
    if (socket) {
      socket.disconnect()
    }
    
    if (peer) {
      peer.destroy()
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    
    setSocket(null)
    setPeer(null)
    setLocalStream(null)
    setRemoteStream(null)
    setConnectionState('disconnected')
    onConnectionChange(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Local Video */}
      <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
        <video
          ref={localVideoElement}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-sm font-medium">You</span>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          {!isVideoEnabled && (
            <div className="bg-red-500 p-2 rounded-full">
              <span className="text-white text-xs">📹</span>
            </div>
          )}
          {!isAudioEnabled && (
            <div className="bg-red-500 p-2 rounded-full">
              <span className="text-white text-xs">🎤</span>
            </div>
          )}
        </div>
      </div>

      {/* Remote Video */}
      <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
        {remoteStream ? (
          <>
            <video
              ref={remoteVideoElement}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">Remote</span>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-3xl">👤</span>
            </div>
            <p className="text-white/70">Waiting for participant...</p>
            <p className="text-white/50 text-sm mt-2">Share the room link to invite someone</p>
          </div>
        )}
      </div>
    </div>
  )
}
