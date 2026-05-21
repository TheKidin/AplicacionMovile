import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Building2, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    if (currentUser) {
      authService.getProfile(currentUser.id).then(profile => {
        if (profile?.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (profile?.role === 'DOCTOR') {
          navigate('/doctor', { replace: true });
        } else if (profile?.role === 'NURSE') {
          navigate('/reception', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      }).catch(async () => {
        await authService.logout();
      });
    }
  }, [currentUser, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);
      // La redirección ahora se maneja automáticamente por el useEffect al cambiar currentUser
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setLoading(false);
    } 
  };

  return (
    <div style={{ padding: '0 24px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          CLINOVA
        </h1>
        <p style={{ fontSize: '14px', color: '#4B5563' }}>
          Plataforma Clínica Integral
        </p>
      </div>

      <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: '24px', flex: 1, boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
        
        {/* Role Selector (SIASE style) */}
        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '12px', padding: '4px', marginBottom: '32px' }}>
          <div style={{ flex: 1, padding: '12px 0', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', cursor: 'default', fontWeight: '700', fontSize: '13px', color: 'var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            Paciente
          </div>
          <div onClick={() => navigate('/staff-login')} style={{ flex: 1, padding: '12px 0', textAlign: 'center', backgroundColor: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#6B7280', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} /> Trabajador
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>
              CORREO ELECTRÓNICO
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                placeholder="tu@correo.com" 
                style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#4B5563', letterSpacing: '0.5px' }}>
                CONTRASEÑA
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} style={{ fontSize: '12px', color: 'var(--primary-light)', textDecoration: 'none', fontWeight: '600' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input type="checkbox" id="stay-logged" style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }} />
            <label htmlFor="stay-logged" style={{ fontSize: '14px', color: '#111827', cursor: 'pointer' }}>
              Mantener sesión iniciada
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader size={18} className="spinner" style={{ marginRight: '8px' }} /> : null}
            {loading ? 'ACCEDIENDO...' : 'ACCEDER'} {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '32px', borderTop: '1px solid #E5E7EB', paddingTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
            Acceso seguro con biometría en dispositivos móviles.
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <p style={{ fontSize: '14px', color: '#4B5563' }}>
          ¿No tienes cuenta? <span onClick={() => navigate('/register')} style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>Regístrate aquí</span>
        </p>
      </div>

    </div>
  );
}

export default Login;
