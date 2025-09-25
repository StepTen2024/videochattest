// WebRTC utility functions and configurations

export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' }
]

export const MEDIA_CONSTRAINTS = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'user'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000
  }
}

export const SCREEN_SHARE_CONSTRAINTS = {
  video: {
    width: { ideal: 1920, max: 3840 },
    height: { ideal: 1080, max: 2160 },
    frameRate: { ideal: 30, max: 60 }
  },
  audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false
  }
}

export class WebRTCManager {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.isInitiator = false
    this.onRemoteStream = null
    this.onConnectionStateChange = null
    this.onDataChannel = null
  }

  async initialize(isInitiator = false) {
    this.isInitiator = isInitiator
    
    try {
      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
        iceCandidatePoolSize: 10
      })

      // Set up event listeners
      this.setupPeerConnectionEvents()

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS)
      
      // Add tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream)
      })

      return this.localStream
    } catch (error) {
      console.error('Error initializing WebRTC:', error)
      throw error
    }
  }

  setupPeerConnectionEvents() {
    if (!this.peerConnection) return

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track')
      const [remoteStream] = event.streams
      this.remoteStream = remoteStream
      
      if (this.onRemoteStream) {
        this.onRemoteStream(remoteStream)
      }
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState)
      
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(this.peerConnection.connectionState)
      }
    }

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState)
    }

    // Handle data channel
    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel
      
      if (this.onDataChannel) {
        this.onDataChannel(channel)
      }
    }
  }

  async createOffer() {
    if (!this.peerConnection) throw new Error('Peer connection not initialized')

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      
      await this.peerConnection.setLocalDescription(offer)
      return offer
    } catch (error) {
      console.error('Error creating offer:', error)
      throw error
    }
  }

  async createAnswer(offer) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized')

    try {
      await this.peerConnection.setRemoteDescription(offer)
      
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      
      return answer
    } catch (error) {
      console.error('Error creating answer:', error)
      throw error
    }
  }

  async handleAnswer(answer) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized')

    try {
      await this.peerConnection.setRemoteDescription(answer)
    } catch (error) {
      console.error('Error handling answer:', error)
      throw error
    }
  }

  async addIceCandidate(candidate) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized')

    try {
      await this.peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
      throw error
    }
  }

  async startScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia(SCREEN_SHARE_CONSTRAINTS)
      
      // Replace video track
      const videoTrack = screenStream.getVideoTracks()[0]
      const sender = this.peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      )
      
      if (sender) {
        await sender.replaceTrack(videoTrack)
      }

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare()
      }

      return screenStream
    } catch (error) {
      console.error('Error starting screen share:', error)
      throw error
    }
  }

  async stopScreenShare() {
    try {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0]
        const sender = this.peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        )
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack)
        }
      }
    } catch (error) {
      console.error('Error stopping screen share:', error)
      throw error
    }
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled
      })
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled
      })
    }
  }

  async getConnectionStats() {
    if (!this.peerConnection) return null

    try {
      const stats = await this.peerConnection.getStats()
      const result = {
        audio: { inbound: null, outbound: null },
        video: { inbound: null, outbound: null },
        connection: null
      }

      stats.forEach(report => {
        if (report.type === 'inbound-rtp') {
          if (report.mediaType === 'audio') {
            result.audio.inbound = report
          } else if (report.mediaType === 'video') {
            result.video.inbound = report
          }
        } else if (report.type === 'outbound-rtp') {
          if (report.mediaType === 'audio') {
            result.audio.outbound = report
          } else if (report.mediaType === 'video') {
            result.video.outbound = report
          }
        } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
          result.connection = report
        }
      })

      return result
    } catch (error) {
      console.error('Error getting connection stats:', error)
      return null
    }
  }

  calculateConnectionQuality(stats) {
    if (!stats || !stats.video.inbound) return 'unknown'

    const videoStats = stats.video.inbound
    const packetsLost = videoStats.packetsLost || 0
    const packetsReceived = videoStats.packetsReceived || 0
    
    if (packetsReceived === 0) return 'poor'

    const lossRate = packetsLost / (packetsLost + packetsReceived)
    
    if (lossRate > 0.05) return 'poor'
    if (lossRate > 0.02) return 'good'
    return 'excellent'
  }

  cleanup() {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Reset properties
    this.remoteStream = null
    this.isInitiator = false
    this.onRemoteStream = null
    this.onConnectionStateChange = null
    this.onDataChannel = null
  }
}

// Utility functions
export const checkWebRTCSupport = () => {
  const hasWebRTC = !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.RTCPeerConnection
  )

  const hasScreenShare = !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getDisplayMedia
  )

  return {
    webrtc: hasWebRTC,
    screenShare: hasScreenShare,
    supported: hasWebRTC
  }
}

export const getDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    
    return {
      cameras: devices.filter(device => device.kind === 'videoinput'),
      microphones: devices.filter(device => device.kind === 'audioinput'),
      speakers: devices.filter(device => device.kind === 'audiooutput')
    }
  } catch (error) {
    console.error('Error getting devices:', error)
    return { cameras: [], microphones: [], speakers: [] }
  }
}

export const testMediaAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    
    // Stop the test stream immediately
    stream.getTracks().forEach(track => track.stop())
    
    return { video: true, audio: true }
  } catch (error) {
    console.error('Media access test failed:', error)
    
    // Test individual permissions
    const result = { video: false, audio: false }
    
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoStream.getTracks().forEach(track => track.stop())
      result.video = true
    } catch (e) {
      console.error('Video access failed:', e)
    }
    
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStream.getTracks().forEach(track => track.stop())
      result.audio = true
    } catch (e) {
      console.error('Audio access failed:', e)
    }
    
    return result
  }
}
