import React, { useState } from 'react';
import { User, Lock, Mail, Building2, Stethoscope, Eye, EyeOff, ArrowLeft, UserCircle2, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function StaffRegister() {
  const navigate = useNavigate();
  const [role, setRole] = useState('doctor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [branch, setBranch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [area, setArea] = useState('');
  const [license, setLicense] = useState('');
  const [university, setUniversity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([]);

  React.useEffect(() => {
    const fetchClinics = async () => {
      try {
        const { clinicService } = await import('../services/clinicService');
        const data = await clinicService.getClinics();
        setClinics(data || []);
      } catch (err) {
        console.error("Error loading clinics", err);
      }
    };
    fetchClinics();
  }, []);

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

    if (!email.endsWith('@clinova.com')) {
      setError('Registro denegado: Debes usar un correo institucional (@clinova.com).');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres por seguridad.');
      return;
    }

    if (!branch) {
      setError('Debes seleccionar una unidad clínica (sede).');
      return;
    }

    if (role === 'doctor' && !specialty) {
      setError('Debes seleccionar tu especialidad médica.');
      return;
    }

    if (role === 'doctor' && !license.trim()) {
      setError('Debes ingresar tu cédula profesional.');
      return;
    }

    if (role === 'doctor' && !university.trim()) {
      setError('Debes ingresar tu universidad de egreso.');
      return;
    }

    if (role === 'reception' && area.trim().length === 0) {
      setError('Debes especificar tu área de trabajo.');
      return;
    }

    setLoading(true);
    try {
      // Find the selected clinic to get its ID
      const selectedClinic = clinics.find(c => c.name === branch);

      await authService.register(email, password, {
        first_name: name,
        last_name: role === 'doctor' ? specialty : area,
        role: role === 'doctor' ? 'DOCTOR' : 'NURSE',
        license_number: role === 'doctor' ? license : null,
        university: role === 'doctor' ? university : null,
        specialty: role === 'doctor' ? specialty : null,
        clinic_id: selectedClinic?.id || null
      });
      alert("Solicitud de acceso registrada exitosamente.");
      navigate('/staff-login');
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta institucional.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0 24px', minHeight: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F9FC' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '32px', marginBottom: '24px' }}>
        <ArrowLeft size={24} color="#1B2C66" onClick={() => navigate('/staff-login')} style={{ cursor: 'pointer' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66' }}>Registro Médico</h1>
        </div>
        <div style={{ width: '24px' }}></div> {/* Spacer */}
      </div>

      <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)', marginBottom: '32px' }}>
        
        {/* Role Selector (SIASE style) */}
        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          <div onClick={() => navigate('/register')} style={{ flex: 1, padding: '12px 0', textAlign: 'center', backgroundColor: 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#6B7280', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <UserCircle2 size={16} /> Paciente
          </div>
          <div style={{ flex: 1, padding: '12px 0', textAlign: 'center', backgroundColor: '#1B2C66', borderRadius: '8px', cursor: 'default', fontWeight: '700', fontSize: '13px', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
            <Building2 size={16} /> Trabajador
          </div>
        </div>

        {/* Staff Role Selector */}
        <div style={{ display: 'flex', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          <div onClick={() => setRole('doctor')} style={{ flex: 1, padding: '10px 0', textAlign: 'center', backgroundColor: role === 'doctor' ? '#F3F4F6' : 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', color: role === 'doctor' ? '#1B2C66' : '#6B7280' }}>
            Doctor(a)
          </div>
          <div onClick={() => setRole('reception')} style={{ flex: 1, padding: '10px 0', textAlign: 'center', backgroundColor: role === 'reception' ? '#F3F4F6' : 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', color: role === 'reception' ? '#1B2C66' : '#6B7280' }}>
            Enfermería / Recepción
          </div>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>NOMBRE COMPLETO</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Dr. Juan Pérez" style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>CORREO INSTITUCIONAL</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" placeholder="correo@clinova.com" style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>CONTRASEÑA</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" style={{ width: '100%', padding: '16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} value={password} onChange={e => setPassword(e.target.value)} />
              <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>UNIDAD CLÍNICA (SEDE)</label>
            <div style={{ position: 'relative' }}>
              <Building2 size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <select style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none', appearance: 'none' }} value={branch} onChange={e => setBranch(e.target.value)}>
                <option value="" disabled>Selecciona tu sede asignada</option>
                {clinics.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {role === 'doctor' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>ESPECIALIDAD MÉDICA</label>
                <div style={{ position: 'relative' }}>
                  <Stethoscope size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none', appearance: 'none' }} value={specialty} onChange={e => setSpecialty(e.target.value)}>
                    <option value="" disabled>Selecciona tu especialidad</option>
                    <option value="general">Medicina General</option>
                    <option value="pediatria">Pediatría</option>
                    <option value="cardiologia">Cardiología</option>
                    <option value="dermatologia">Dermatología</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>CÉDULA PROFESIONAL</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Ej. CP-1234567" style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} value={license} onChange={e => setLicense(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>UNIVERSIDAD DE EGRESO</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Ej. U.N.A.M." style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} value={university} onChange={e => setUniversity(e.target.value)} />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>ÁREA DE TRABAJO</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Ej. Recepción principal, Triaje..." style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} value={area} onChange={e => setArea(e.target.value)} />
              </div>
            </div>
          )}

          {error && (
            <div style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <div style={{ backgroundColor: '#EEF2FF', padding: '16px', borderRadius: '12px', marginTop: '8px' }}>
            <p style={{ fontSize: '11px', color: '#4F46E5', lineHeight: '1.5', fontWeight: '600' }}>
              Al enviar tu solicitud, el administrador validará tu identidad corporativa antes de darte acceso a los historiales clínicos.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', padding: '16px', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>
            {loading ? <Loader size={18} className="spinner" style={{ marginRight: '8px' }} /> : null}
            {loading ? 'ENVIANDO...' : 'ENVIAR SOLICITUD'}
          </button>
        </form>
      </div>

    </div>
  );
}

export default StaffRegister;
