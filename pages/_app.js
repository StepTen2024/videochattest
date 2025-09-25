import '@/styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>ProMeet - Professional Video Conferencing</title>
        <meta name="description" content="Professional WebRTC video chat application - Connect instantly with crystal clear video and audio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎥</text></svg>" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="ProMeet - Professional Video Conferencing" />
        <meta property="og:description" content="Connect instantly with crystal clear video and audio" />
        <meta property="og:site_name" content="ProMeet" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ProMeet - Professional Video Conferencing" />
        <meta name="twitter:description" content="Connect instantly with crystal clear video and audio" />
        
        {/* PWA */}
        <meta name="theme-color" content="#1f2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
