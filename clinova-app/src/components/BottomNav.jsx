import React from 'react';
import { Home, FolderOpen, Activity, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'HOME' },
    { path: '/records', icon: FolderOpen, label: 'RECORDS' },
    { path: '/vitals', icon: Activity, label: 'VITALS' },
    { path: '/settings', icon: Settings, label: 'SETTINGS' }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '16px 8px 24px',
      borderTopLeftRadius: '24px',
      borderTopRightRadius: '24px',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.02)',
      zIndex: 10
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);
        
        return (
          <div 
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            <div style={{
              backgroundColor: isActive ? '#E6E9F5' : 'transparent',
              padding: '8px 16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px',
              transition: 'all 0.2s ease'
            }}>
              <Icon size={20} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
            </div>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: isActive ? '700' : '500',
              letterSpacing: '0.5px'
            }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default BottomNav;
