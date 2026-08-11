import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'GenZi PlayPen - Official Tracking Portal',
  description: 'Parent Monitoring and Player Tracking Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Clean Header with Soft Drop Shadow */}
        <header
          style={{
            backgroundColor: '#ffffff',
            padding: '20px 20px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 8px 25px rgba(0,0,0,0.05)'
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
              gap: '15px'
            }}
          >
            {/* 3D Logo Identity - Recolored to Blue with Red Z (Wrapped in a styled Link to prevent text override) */}
            <Link 
              href="/" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textDecoration: 'none'
              }}
            >
              <div style={{ fontSize: '34px', fontWeight: '900', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' }}>
                {/* Gen ay kulay Blue */}
                <span style={{ color: '#3b82f6', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>Gen</span>
                {/* Z ay kulay Red */}
                <span style={{ color: '#dc2626', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>Z</span>
                {/* i PlayPen ay kulay Blue */}
                <span style={{ color: '#3b82f6', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>i PlayPen</span>
                
                <span style={{ fontSize: '24px', marginLeft: '6px' }}>🏃‍♂️</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{ width: '20px', height: '4px', backgroundColor: '#3b82f6', borderRadius: '10px' }}></div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#13294b', fontStyle: 'italic' }}>
                  "the third place."
                </span>
                <div style={{ width: '20px', height: '4px', backgroundColor: '#dc2626', borderRadius: '10px' }}></div>
              </div>
            </Link>

            {/* Navigation Buttons (White Font Visible on Navy) */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                href="/"
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '800',
                  fontSize: '14px',
                  padding: '10px 20px',
                  borderRadius: '50px',
                  backgroundColor: '#00bfff',
                  boxShadow: '0px 4px 0px #13294b',
                  transition: 'all 0.1s ease',
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
                  backgroundColor: '#ff1493',
                  boxShadow: '0px 4px 0px #13294b',
                  transition: 'all 0.1s ease',
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
                  backgroundColor: '#7cd924',
                  boxShadow: '0px 4px 0px #13294b',
                  transition: 'all 0.1s ease',
                }}
              >
                🏢 Branch Check
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Interface Wrapper */}
        <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}