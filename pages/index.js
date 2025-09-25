import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { v4 as uuidv4 } from 'uuid'
import { Video, Users, Shield, Zap, Globe, Smartphone } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
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
  }, [])

  const createMeeting = async () => {
    setIsCreating(true)
    
    try {
      // Generate unique room ID
      const roomId = uuidv4().replace(/-/g, '').substring(0, 12)
      
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to room
      router.push(`/room/${roomId}`)
    } catch (error) {
      console.error('Error creating meeting:', error)
      setIsCreating(false)
    }
  }

  const joinMeeting = () => {
    const roomId = prompt('Enter Meeting ID:')
    if (roomId && roomId.trim()) {
      router.push(`/room/${roomId.trim()}`)
    }
  }

  return (
    <>
      <Head>
        <title>ProMeet - Start Your Meeting</title>
        <meta name="description" content="Create or join a professional video conference in seconds" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <header className="glass border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🎥</div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ProMeet
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-white/70 font-medium">
                  {currentTime}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Professional Video
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Conferencing
                </span>
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Connect instantly with crystal clear video and audio. 
                No downloads, no sign-ups, no hassle.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={createMeeting}
                disabled={isCreating}
                className="btn-hover w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 min-w-[200px]"
              >
                {isCreating ? (
                  <>
                    <div className="spinner w-5 h-5"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-6 h-6" />
                    <span>Start Meeting</span>
                  </>
                )}
              </button>

              <button
                onClick={joinMeeting}
                className="btn-hover w-full sm:w-auto glass text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:border-white/40 flex items-center justify-center space-x-3 min-w-[200px]"
              >
                <Users className="w-6 h-6" />
                <span>Join Meeting</span>
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Instant Connection</h3>
                <p className="text-white/70">
                  Join meetings in seconds with no downloads or installations required.
                </p>
              </div>

              <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Secure & Private</h3>
                <p className="text-white/70">
                  End-to-end encrypted connections ensure your conversations stay private.
                </p>
              </div>

              <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Works Everywhere</h3>
                <p className="text-white/70">
                  Compatible with all modern browsers on desktop and mobile devices.
                </p>
              </div>

              <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">HD Video & Audio</h3>
                <p className="text-white/70">
                  Crystal clear video quality with noise-cancelling audio technology.
                </p>
              </div>

              <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Multiple Participants</h3>
                <p className="text-white/70">
                  Support for multiple participants with intelligent video switching.
                </p>
              </div>

              <div className="glass p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-200">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Mobile Optimized</h3>
                <p className="text-white/70">
                  Fully responsive design that works perfectly on all screen sizes.
                </p>
              </div>
            </div>

            {/* How it Works */}
            <div className="mt-20 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-12">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    1
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Start Meeting</h4>
                  <p className="text-white/70">Click "Start Meeting" to create a new room</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    2
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Share Link</h4>
                  <p className="text-white/70">Copy and share the room URL with participants</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    3
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Connect</h4>
                  <p className="text-white/70">Everyone joins instantly and starts talking</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-white/60">
              <p>&copy; 2024 ProMeet. Built with ❤️ using Next.js and WebRTC.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
