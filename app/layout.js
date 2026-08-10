import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'QC Player Location Tracker',
  description: 'Parent Monitoring and Player Tracking Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Glassmorphism Navigation Bar */}
        <header style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '15px 20px', 
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <nav style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#ffffff', fontWeight: '800', fontSize: '20px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              📍 QC Tracker Portal ✨
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link 
                href="/" 
                style={{ 
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  fontWeight: '700', 
                  padding: '8px 16px', 
                  borderRadius: '50px', 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                🔍 Search Player
              </Link>
              <Link 
                href="/register" 
                style={{ 
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  fontWeight: '700', 
                  padding: '8px 16px', 
                  borderRadius: '50px', 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                📝 Register
              </Link>
              <Link 
                href="/branch" 
                style={{ 
                  color: '#ffffff', 
                  textDecoration: 'none', 
                  fontWeight: '700', 
                  padding: '8px 16px', 
                  borderRadius: '50px', 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                🏢 Branch Check-In
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Content Areas */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}