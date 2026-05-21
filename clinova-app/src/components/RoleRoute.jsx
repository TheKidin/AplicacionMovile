import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function RoleRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [roleCheck, setRoleCheck] = useState({ loading: true, allowed: false, role: null });

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStaffRoute = location.pathname.startsWith('/doctor') || location.pathname.startsWith('/reception') || location.pathname.startsWith('/staff');

  useEffect(() => {
    if (!currentUser) return;

    authService.getProfile(currentUser.id)
      .then(profile => {
        const role = profile?.role;
        let allowed = false;

        if (isAdminRoute && role === 'ADMIN') allowed = true;
        else if (isStaffRoute && (role === 'DOCTOR' || role === 'NURSE')) allowed = true;
        else if (!isAdminRoute && !isStaffRoute && role === 'PATIENT') allowed = true;
        // Admin can access everything
        else if (role === 'ADMIN') allowed = true;

        setRoleCheck({ loading: false, allowed, role });
      })
      .catch(() => {
        // If profile fetch fails, just check if logged in
        setRoleCheck({ loading: false, allowed: !!currentUser, role: null });
      });
  }, [currentUser, location.pathname, isAdminRoute, isStaffRoute]);

  if (!currentUser) {
    const loginPath = isAdminRoute ? '/admin-login' : isStaffRoute ? '/staff-login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (roleCheck.loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', backgroundColor: '#1B2C66', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{
          width: '40px', height: '40px', border: '4px solid rgba(48,227,194,0.3)',
          borderTop: '4px solid #30E3C2', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#30E3C2', fontSize: '14px', fontWeight: '600' }}>Verificando acceso...</p>
      </div>
    );
  }

  if (!roleCheck.allowed) {
    const loginPath = isAdminRoute ? '/admin-login' : isStaffRoute ? '/staff-login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return children;
}
