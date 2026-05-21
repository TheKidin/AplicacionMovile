import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline  = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',       // above bottom nav
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#1E293B',
      color: '#F8FAFC',
      padding: '10px 20px',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      fontWeight: '600',
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      zIndex: 9999,
      animation: 'slideUp 0.3s ease-out',
      whiteSpace: 'nowrap',
    }}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <WifiOff size={16} color="#EF4444" />
      Sin conexión a internet
    </div>
  );
}
