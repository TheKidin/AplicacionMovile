import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

function AdminLogin() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Ingresa tus credenciales.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await authService.login(email, password);
      setCurrentUser(user);

      try {
        const profile = await authService.getProfile(user.id);
        if (profile.role === 'ADMIN') {
          navigate('/admin');
        } else if (profile.role === 'DOCTOR') {
          navigate('/doctor');
        } else if (profile.role === 'NURSE') {
          navigate('/reception');
        } else {
          setError('No tienes permisos de administrador.');
        }
      } catch {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgShape1}></div>
      <div style={styles.bgShape2}></div>
      <div style={styles.bgShape3}></div>

      <div style={styles.card}>
        {/* Left panel - Branding */}
        <div style={styles.brandPanel}>
          <div style={styles.brandContent}>
            <div style={styles.logoIcon}>
              <ShieldCheck size={40} color="#1B2C66" strokeWidth={2.5} />
            </div>
            <h1 style={styles.brandTitle}>CLINOVA</h1>
            <p style={styles.brandSubtitle}>Panel de Administración</p>
            <div style={styles.brandDivider}></div>
            <p style={styles.brandDescription}>
              Gestiona pacientes, personal médico y sedes clínicas desde un solo lugar.
            </p>
          </div>
          <p style={styles.brandFooter}>© 2026 Clinova. Todos los derechos reservados.</p>
        </div>

        {/* Right panel - Login Form */}
        <div style={styles.formPanel}>
          <div style={styles.formContent}>
            <h2 style={styles.formTitle}>Iniciar sesión</h2>
            <p style={styles.formSubtitle}>Ingresa tus credenciales de administrador</p>

            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Correo electrónico</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} color="#94A3B8" style={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="admin@clinova.com"
                    style={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Contraseña</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} color="#94A3B8" style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    style={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                  </div>
                </div>
              </div>

              {error && (
                <div style={styles.errorBox}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading && <Loader size={18} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />}
                {loading ? 'Verificando...' : 'Acceder al panel'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(30px, -40px) rotate(10deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-20px, 30px) rotate(-8deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, 20px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
    fontFamily: 'Inter, sans-serif',
  },
  bgShape1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(30,227,194,0.12) 0%, transparent 70%)',
    top: '-100px',
    right: '-100px',
    animation: 'float1 8s ease-in-out infinite',
  },
  bgShape2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,54,168,0.15) 0%, transparent 70%)',
    bottom: '-80px',
    left: '-80px',
    animation: 'float2 10s ease-in-out infinite',
  },
  bgShape3: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(30,227,194,0.08) 0%, transparent 70%)',
    top: '50%',
    left: '30%',
    animation: 'float3 6s ease-in-out infinite',
  },
  card: {
    display: 'flex',
    width: '100%',
    maxWidth: '900px',
    minHeight: '520px',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
    animation: 'fadeUp 0.6s ease-out',
    position: 'relative',
    zIndex: 1,
  },
  brandPanel: {
    flex: '0 0 380px',
    background: 'linear-gradient(160deg, #1A36A8 0%, #0D1F5C 60%, #0A1744 100%)',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  brandContent: {
    position: 'relative',
    zIndex: 1,
  },
  logoIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #30E3C2 0%, #26C6A6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    boxShadow: '0 8px 32px rgba(48,227,194,0.3)',
  },
  brandTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: '0 0 8px 0',
    letterSpacing: '2px',
  },
  brandSubtitle: {
    fontSize: '16px',
    color: '#30E3C2',
    fontWeight: '600',
    margin: '0 0 24px 0',
  },
  brandDivider: {
    width: '48px',
    height: '3px',
    backgroundColor: '#30E3C2',
    borderRadius: '2px',
    marginBottom: '24px',
  },
  brandDescription: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.6',
    margin: 0,
  },
  brandFooter: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
    position: 'relative',
    zIndex: 1,
  },
  formPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: '48px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    width: '100%',
    maxWidth: '360px',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0F172A',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#64748B',
    margin: '0 0 32px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
    letterSpacing: '0.3px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 48px 14px 48px',
    borderRadius: '12px',
    border: '2px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  eyeBtn: {
    position: 'absolute',
    right: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  errorBox: {
    color: '#DC2626',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #FECACA',
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #1A36A8 0%, #2563EB 100%)',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 16px rgba(26,54,168,0.3)',
    marginTop: '8px',
  },
};

export default AdminLogin;
