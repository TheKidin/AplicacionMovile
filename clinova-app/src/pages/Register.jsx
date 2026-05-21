import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Mail, CheckSquare, Building2, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/home', { replace: true });
    }
  }, [currentUser, navigate]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (/\d/.test(name)) {
      setError('El nombre no puede contener números.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    if (email.toLowerCase().endsWith('@clinova.com')) {
      setError('Las cuentas @clinova.com son exclusivas del personal. Ve a "Trabajador".');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (accepted) {
      setLoading(true);
      try {
        await authService.register(email, password, {
          first_name: name,
          last_name: '',
          role: 'PATIENT'
        });
        
        // Crear el registro básico en la tabla 'patients' para que aparezca en el directorio
        await patientService.createPatient({
          email: email,
          first_name: name,
          last_name: '',
          phone: '',
          gender: null,
          date_of_birth: null,
          blood_type: 'Desconocido',
          allergies: 'Ninguna',
          clinical_history: {}
        });

        // La redirección ahora se maneja automáticamente por el useEffect al cambiar currentUser
      } catch (err) {
        setError(err.message || 'Error al crear la cuenta. Intenta con otro correo.');
      } finally {
        setLoading(false);
      }
    } else {
      setError("Debes aceptar los términos y condiciones para continuar.");
    }
  };

  return (
    <div style={{ padding: '0 24px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          CLINOVA
        </h1>
        <p style={{ fontSize: '14px', color: '#4B5563', textAlign: 'center' }}>
          Plataforma Clínica Integral
        </p>
      </div>

      <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '24px', mb: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
        
        {/* Role Selector (SIASE style) */}
        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          <div style={{ flex: 1, padding: '12px 0', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', cursor: 'default', fontWeight: '700', fontSize: '13px', color: 'var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            Paciente
          </div>
          <div onClick={() => navigate('/staff-register')} style={{ flex: 1, padding: '12px 0', textAlign: 'center', backgroundColor: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#6B7280', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} /> Trabajador
          </div>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>
              NOMBRE COMPLETO
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez" 
                style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>
              CORREO ELECTRÓNICO
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                placeholder="tucorreo@ejemplo.com" 
                style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>
              CONTRASEÑA
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
          </div>

          {error && (
            <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: '#F0FDF4', padding: '16px', borderRadius: '12px' }}>
            <input 
              type="checkbox" 
              id="terms" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }} 
              required
            />
            <label htmlFor="terms" style={{ fontSize: '12px', color: '#111827', cursor: 'pointer', lineHeight: '1.5' }}>
              <strong>Acepto los términos y condiciones.</strong> Autorizo explícitamente que los datos ingresados en mi historial clínico sean procesados y compartidos exclusivamente con profesionales e instituciones médicas de CLINOVA con el propósito de brindarme atención clínica.
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader size={18} className="spinner" style={{ marginRight: '8px' }} /> : null}
            {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
          </button>
        </form>

      </div>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <p style={{ fontSize: '14px', color: '#4B5563' }}>
          ¿Ya tienes cuenta? <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>Inicia sesión aquí</span>
        </p>
      </div>

    </div>
  );
}

export default Register;
