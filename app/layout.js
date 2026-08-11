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
        {/* Playful Theme Navigation Bar */}
        <header
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '4px solid #7cd924', // Green border inspired by the logo frame
            padding: '15px 20px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <nav
            style={{
              maxWidth: '1000px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            {/* Logo Text Brand Block */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                <span style={{ color: '#0099ff' }}>G</span>
                <span style={{ color: '#7cd924' }}>E</span>
                <span style={{ color: '#ff9900' }}>N</span>
                <span style={{ color: '#ff007f' }}>Z</span>
                <span style={{ color: '#0099ff' }}>i</span>
                <span style={{ color: '#1a1a1a', marginLeft: '5px' }}>PLAYPEN</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#0099ff', marginTop: '-3px', fontStyle: 'italic' }}>
                "the third place."
              </span>
            </div>

            {/* Navigation Links */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                href="/"
                style={{
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  fontWeight: '800',
                  fontSize: '14px',
                  padding: '8px 16px',
                  borderRadius: '50px',
                  backgroundColor: '#f0f4f8',
                  transition: 'all 0.2s ease',
                }}
              >
                🔍 Search Player
              </Link>
              <Link
                href="/register"
                style={{
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  fontWeight: '800',
                  fontSize: '14px',
                  padding: '8px 16px',
                  borderRadius: '50px',
                  backgroundColor: '#f0f4f8',
                  transition: 'all 0.2s ease',
                }}
              >
                📝 Register
              </Link>
              <Link
                href="/branch"
                style={{
                  color: '#1a1a1a',
                  textDecoration: 'none',
                  fontWeight: '800',
                  fontSize: '14px',
                  padding: '8px 16px',
                  borderRadius: '50px',
                  backgroundColor: '#f0f4f8',
                  transition: 'all 0.2s ease',
                }}
              >
                🏢 Branch Check-In
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}