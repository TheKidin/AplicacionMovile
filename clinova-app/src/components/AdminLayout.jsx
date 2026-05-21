import React, { useState, useEffect, useRef } from 'react';
import { Menu, LayoutDashboard, Users, UserCog, Calendar, Building2, Settings, Bell, Search, LogOut, CreditCard, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentUser, setCurrentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // Load pending staff count as notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const pending = await authService.getPendingStaff();
        setPendingCount((pending || []).length);
        const notifs = (pending || []).map(p => ({
          id: p.id,
          title: 'Nueva solicitud de registro',
          message: `${p.first_name} (${p.role === 'DOCTOR' ? 'Doctor' : 'Enfermería'}) solicita acceso al sistema`,
          time: p.created_at ? new Date(p.created_at).toLocaleDateString('es-MX') : 'Reciente',
          read: false,
        }));
        setNotifications(notifs);
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };
    loadNotifications();
  }, []);

  // Global search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const profiles = await authService.getAllProfiles();
        const results = (profiles || []).filter(p =>
          p.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 6);
        setSearchResults(results);
        setShowSearch(true);
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    navigate('/admin-login', { replace: true });
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/patients', icon: Users, label: 'Pacientes' },
    { path: '/admin/staff', icon: UserCog, label: 'Personal Médico' },
    { path: '/admin/clinics', icon: Building2, label: 'Sedes' },
    { path: '/admin/billing', icon: CreditCard, label: 'Facturación' },
    { path: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  const navigateToResult = (profile) => {
    setShowSearch(false);
    setSearchQuery('');
    if (profile.role === 'DOCTOR' || profile.role === 'NURSE') {
      navigate('/admin/staff/profile', { state: { employee: profile } });
    } else if (profile.role === 'PATIENT') {
      navigate('/admin/patients');
    } else {
      navigate('/admin/staff');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F1F5F9', width: '100vw', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{ 
        width: isSidebarOpen ? '260px' : '0px', 
        backgroundColor: '#1B2C66', 
        color: 'white', 
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 50
      }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '260px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#30E3C2', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', color: '#1B2C66', fontSize: '20px' }}>
            C
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1px', margin: 0 }}>CLINOVA</h2>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '260px' }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isActive ? '#30E3C2' : '#94A3B8',
                  transition: 'all 0.2s',
                  borderLeft: isActive ? '4px solid #30E3C2' : '4px solid transparent'
                }}
              >
                <item.icon size={20} />
                <span style={{ fontSize: '15px', fontWeight: isActive ? '700' : '500' }}>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', minWidth: '260px' }}>
          <div 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#EF4444', cursor: 'pointer', padding: '12px', borderRadius: '8px', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={20} />
            <span style={{ fontSize: '15px', fontWeight: '600' }}>Cerrar Sesión</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Topbar */}
        <header style={{ height: '72px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 40, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', backgroundColor: '#F1F5F9', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E2E8F0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
            >
              <Menu size={24} />
            </button>
            
            {/* Global Search */}
            <div style={{ position: 'relative', width: '300px' }} className="admin-search-bar" ref={searchRef}>
              <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Buscar pacientes, médicos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearch(true)}
                style={{ width: '100%', padding: '10px 16px 10px 44px', borderRadius: '24px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', outline: 'none', fontSize: '14px' }}
              />
              {/* Search Results Dropdown */}
              {showSearch && searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '48px', left: 0, right: 0, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #E2E8F0', overflow: 'hidden', zIndex: 100 }}>
                  {searchResults.map(r => (
                    <div key={r.id} onClick={() => navigateToResult(r)} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.first_name}`} alt="" style={{ width: '100%' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{r.first_name} {r.last_name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>{r.role} • {r.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowNotifications(!showNotifications)} style={{ cursor: 'pointer', position: 'relative' }}>
                <Bell size={24} color="#64748B" />
                {pendingCount > 0 && (
                  <div style={{ position: 'absolute', top: '-4px', right: '-4px', minWidth: '18px', height: '18px', backgroundColor: '#EF4444', borderRadius: '9px', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: 'white', padding: '0 4px' }}>
                    {pendingCount}
                  </div>
                )}
              </div>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={() => setShowNotifications(false)}></div>
                  <div style={{ position: 'absolute', right: 0, top: '40px', width: '360px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #E2E8F0', zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>Notificaciones</h4>
                      <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}><X size={18} /></button>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                          Sin notificaciones pendientes
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => { setShowNotifications(false); navigate('/admin/staff'); }} style={{ padding: '14px 20px', borderBottom: '1px solid #F8FAFC', cursor: 'pointer', backgroundColor: n.read ? 'white' : '#FFFBEB', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = n.read ? 'white' : '#FFFBEB'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>{n.title}</p>
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{n.time}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div style={{ padding: '12px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                        <button onClick={() => { setShowNotifications(false); navigate('/admin/staff'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', fontSize: '13px', fontWeight: '700' }}>Ver todas las solicitudes</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', paddingLeft: '24px', borderLeft: '1px solid #E2E8F0' }}>
              <div style={{ textAlign: 'right' }} className="admin-profile-text">
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', margin: 0 }}>Super Admin</p>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{currentUser?.email || 'admin@clinova.com'}</p>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {children}
        </main>
      </div>

      {/* Media Queries inline for simplicity without breaking the main CSS too much */}
      <style>{`
        @media (max-width: 768px) {
          .admin-search-bar { display: none !important; }
          .admin-profile-text { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;
