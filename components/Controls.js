import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, MessageSquare, Users, Phone, Settings } from 'lucide-react'

export default function Controls({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  onVideoToggle,
  onAudioToggle,
  onScreenShare,
  onLeave,
  onChat,
  participantCount
}) {
  const handleVideoToggle = () => {
    onVideoToggle(!isVideoEnabled)
  }

  const handleAudioToggle = () => {
    onAudioToggle(!isAudioEnabled)
  }

  const handleScreenShare = () => {
    onScreenShare(!isScreenSharing)
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass px-6 py-4 rounded-2xl border border-white/20">
        <div className="flex items-center space-x-4">
          {/* Audio Control */}
          <button
            onClick={handleAudioToggle}
            className={`btn-hover p-4 rounded-full transition-all duration-200 ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          {/* Video Control */}
          <button
            onClick={handleVideoToggle}
            className={`btn-hover p-4 rounded-full transition-all duration-200 ${
              isVideoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isVideoEnabled ? 'Stop camera' : 'Start camera'}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          {/* Screen Share Control */}
          <button
            onClick={handleScreenShare}
            className={`btn-hover p-4 rounded-full transition-all duration-200 ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          >
            {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-white/20"></div>

          {/* Chat Control */}
          <button
            onClick={onChat}
            className="btn-hover p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200"
            title="Toggle chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          {/* Participants */}
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 rounded-full">
            <Users className="w-5 h-5 text-white/70" />
            <span className="text-white font-medium">{participantCount}</span>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/20"></div>

          {/* Leave Call */}
          <button
            onClick={onLeave}
            className="btn-hover p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
            title="Leave meeting"
          >
            <Phone className="w-6 h-6 transform rotate-[135deg]" />
          </button>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="sm:hidden fixed bottom-20 left-4 right-4">
        <div className="glass p-4 rounded-xl border border-white/20">
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={handleAudioToggle}
              className={`p-3 rounded-lg transition-all duration-200 ${
                isAudioEnabled 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-5 h-5 mx-auto" /> : <MicOff className="w-5 h-5 mx-auto" />}
            </button>

            <button
              onClick={handleVideoToggle}
              className={`p-3 rounded-lg transition-all duration-200 ${
                isVideoEnabled 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              {isVideoEnabled ? <Video className="w-5 h-5 mx-auto" /> : <VideoOff className="w-5 h-5 mx-auto" />}
            </button>

            <button
              onClick={onChat}
              className="p-3 rounded-lg bg-gray-700 text-white transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5 mx-auto" />
            </button>

            <button
              onClick={onLeave}
              className="p-3 rounded-lg bg-red-500 text-white transition-all duration-200"
            >
              <Phone className="w-5 h-5 mx-auto transform rotate-[135deg]" />
            </button>
          </div>

          <div className="flex justify-center mt-3">
            <button
              onClick={handleScreenShare}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                isScreenSharing 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-white'
              }`}
            >
              {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              <span className="text-sm">{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
