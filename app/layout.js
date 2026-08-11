import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'GenZi Playpen - QC Player Location Tracker',
  description: 'Parent Monitoring and Player Tracking Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Neon Dynamic Banner Header based on the image */}
        <header
          style={{
            background: 'linear-gradient(90deg, #ff007f 0%, #0099ff 35%, #7cd924 65%, #ff9900 100%)',
            padding: '25px 20px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 5px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          {/* Sub Badge: OFFICIAL TRACKING PORTAL */}
          <div
            style={{
              border: '2px solid #ff007f',
              borderRadius: '50px',
              padding: '4px 20px',
              backgroundColor: 'rgba(13, 15, 20, 0.8)',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '2px',
              color: '#ff007f',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 10px rgba(255, 0, 127, 0.3)'
            }}
          >
            ✨ OFFICIAL TRACKING PORTAL
          </div>

          <div
            style={{
              width: '100%',
              maxWidth: '1000px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}
          >
            {/* Logo Text: GenZi PLAYPEN */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                style={{ 
                  fontSize: '32px', 
                  fontWeight: '900', 
                  letterSpacing: '-1px',
                  color: '#ffffff',
                  textShadow: '3px 3px 0px #0d0f14, -1px -1px 0px #0d0f14, 1px -1px 0px #0d0f14, -1px 1px 0px #0d0f14'
                }}
              >
                <span style={{ color: '#ff007f' }}>GENZi</span>{' '}
                <span style={{ color: '#00f0ff' }}>PLAYPEN</span>
              </div>
              {/* Stick Figure Icon Mimic */}
              <span style={{ fontSize: '28px', color: '#00f0ff', textShadow: '2px 2px 0px #0d0f14' }}>🏃‍♂️</span>
            </div>

            {/* Navigation Buttons (White Font Visible on Dark Base) */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                href="/"
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '800',
                  fontSize: '14px',
                  padding: '10px 20px',
                  borderRadius: '50px',
                  backgroundColor: '#0d0f14',
                  border: '2px solid #00f0ff',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                🔍 Search Player
              </Link>
              <Link
                href="/register"
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '800',
                  fontSize: '14px',
                  padding: '10px 20px',
                  borderRadius: '50px',
                  backgroundColor: '#0d0f14',
                  border: '2px solid #ff007f',
                  boxShadow: '0 0 10px rgba(255, 0, 127, 0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                📝 Register
              </Link>
              <Link
                href="/branch"
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '800',
                  fontSize: '14px',
                  padding: '10px 20px',
                  borderRadius: '50px',
                  backgroundColor: '#0d0f14',
                  border: '2px solid #7cd924',
                  boxShadow: '0 0 10px rgba(124, 217, 36, 0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                🏢 Branch Check-In
              </Link>
            </div>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main style={{ maxWidth: '1000px', margin: '50px auto', padding: '0 20px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}