import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Building2, UserCircle2, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

function StaffLogin() {
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

    if (!email.endsWith('@clinova.com')) {
      setError('Acceso denegado: Usa tu correo institucional (@clinova.com).');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await authService.login(email, password);
      
      try {
        const profile = await authService.getProfile(user.id);
        if (profile.role === 'NURSE') {
          navigate('/reception');
        } else if (profile.role === 'DOCTOR') {
          navigate('/doctor');
        } else if (profile.role === 'ADMIN') {
          navigate('/admin');
        } else {
          // Fallback por si es paciente y se logueó por aquí por error
          navigate('/home');
        }
      } catch {
        // Fallback si no tiene perfil
        navigate('/doctor');
      }

    } catch (err) {
      setError(err.message || 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0 24px', flex: 1, minHeight: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#1B2C66' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          CLINOVA <span style={{ color: '#30E3C2' }}>STAFF</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center' }}>
          Plataforma Clínica Integral
        </p>
      </div>

      <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '24px', mb: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        
        {/* Role Selector (SIASE style) */}
        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '12px', padding: '4px', marginBottom: '32px' }}>
          <div onClick={() => navigate('/login')} style={{ flex: 1, padding: '12px 0', textAlign: 'center', backgroundColor: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#6B7280', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <UserCircle2 size={16} /> Paciente
          </div>
          <div style={{ flex: 1, padding: '12px 0', textAlign: 'center', backgroundColor: '#1B2C66', borderRadius: '8px', cursor: 'default', fontWeight: '700', fontSize: '13px', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} /> Trabajador
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1B2C66', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
              Correo Corporativo
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                placeholder="doctor@clinova.com" 
                style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1B2C66', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
              Contraseña
            </label>
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
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <span onClick={() => navigate('/forgot-password')} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>¿Olvidaste tu contraseña?</span>
            </div>
          </div>

          {error && (
            <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '16px', width: '100%', padding: '16px', fontSize: '15px', opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader size={18} className="spinner" style={{ marginRight: '8px' }} /> : null}
            {loading ? 'VERIFICANDO...' : 'ACCEDER AL SISTEMA'}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
          ¿Eres nuevo en el equipo? <br/>
          <span onClick={() => navigate('/staff-register')} style={{ color: '#30E3C2', fontWeight: '700', cursor: 'pointer', display: 'inline-block', marginTop: '8px' }}>Solicitar acceso al administrador</span>
        </p>
      </div>

    </div>
  );
}

export default StaffLogin;
