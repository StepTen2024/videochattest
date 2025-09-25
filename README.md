# 🎥 ProMeet - Professional Video Conferencing

A modern, professional WebRTC video chat application built with Next.js. Create instant video meetings with crystal clear audio and video - no downloads, no sign-ups, no hassle.

![ProMeet Demo](https://via.placeholder.com/800x400/1f2937/ffffff?text=ProMeet+Video+Conferencing)

## ✨ Features

### 🚀 **Instant Connection**
- Create meetings in seconds with unique room URLs
- Join meetings with a single click - no registration required
- WebRTC peer-to-peer connections for optimal performance

### 🎯 **Professional Interface**
- Zoom-like dark theme with modern glassmorphism design
- Responsive layout that works on desktop and mobile
- Intuitive controls with visual feedback

### 🔧 **Advanced Functionality**
- **HD Video & Audio** - Crystal clear quality with noise cancellation
- **Screen Sharing** - Share your screen with participants
- **Real-time Chat** - Built-in messaging system
- **Connection Quality** - Live connection monitoring
- **Mobile Optimized** - Touch-friendly controls for mobile devices

### 🛡️ **Secure & Private**
- Peer-to-peer connections (no video data goes through servers)
- End-to-end encrypted communications
- No data storage - privacy by design

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **WebRTC**: Simple-peer for peer connections
- **Signaling**: Socket.io for real-time communication
- **Icons**: Lucide React
- **Deployment**: Optimized for Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/StepTen2024/videochattest.git
   cd videochattest
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 How to Use

### Creating a Meeting
1. Visit the homepage
2. Click **"Start Meeting"**
3. You'll be redirected to a unique room URL
4. Copy and share the URL with participants

### Joining a Meeting
1. Click the shared room URL
2. Allow camera/microphone permissions
3. Start talking immediately!

### During the Meeting
- **Mute/Unmute**: Toggle microphone
- **Camera On/Off**: Toggle video
- **Screen Share**: Share your screen
- **Chat**: Send messages to participants
- **Leave**: End the meeting

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy with default settings

3. **Your app is live!**
   - Get your production URL: `https://your-app.vercel.app`
   - Share with anyone, anywhere

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
/
├── components/           # React components
│   ├── VideoCall.js     # Main video call logic
│   ├── Controls.js      # Meeting controls
│   └── Chat.js          # Chat functionality
├── lib/                 # Utility libraries
│   └── webrtc.js        # WebRTC helper functions
├── pages/               # Next.js pages
│   ├── index.js         # Homepage
│   ├── room/[id].js     # Dynamic room pages
│   └── api/             # API routes
│       ├── socket.js    # Socket.io signaling server
│       └── rooms.js     # Room management
├── styles/              # Styling
│   └── globals.css      # Global styles with Tailwind
└── public/              # Static assets
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
# Optional: Custom Socket.io server
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Customization

#### Branding
- Update logo and colors in `styles/globals.css`
- Modify app name in `pages/_app.js`

#### Features
- Add recording functionality
- Implement user authentication
- Add meeting scheduling
- Integrate with calendar apps

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome 70+ | ✅ Full support |
| Firefox 65+ | ✅ Full support |
| Safari 12+ | ✅ Full support |
| Edge 79+ | ✅ Full support |
| Mobile Chrome | ✅ Full support |
| Mobile Safari | ✅ Full support |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- WebRTC implementation using [simple-peer](https://github.com/feross/simple-peer)
- Real-time communication via [Socket.io](https://socket.io/)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

Need help? 
- 📧 Email: support@promeet.app
- 💬 Discord: [Join our community](https://discord.gg/promeet)
- 🐛 Issues: [GitHub Issues](https://github.com/StepTen2024/videochattest/issues)

---

**Made with ❤️ for seamless video communication**
