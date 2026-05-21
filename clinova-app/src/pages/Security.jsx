import React, { useState } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Security() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    alert('Contraseña actualizada correctamente.');
    navigate(-1);
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Seguridad</h1>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
          <ShieldCheck size={40} color="#1D4ED8" />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>Cambiar Contraseña</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, padding: '0 16px', lineHeight: '1.5' }}>Tu contraseña debe tener al menos 6 caracteres e incluir una combinación de números y letras.</p>
      </div>

      <form onSubmit={handleSave} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' }}>Contraseña Actual</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type={showPassword ? "text" : "password"} placeholder="••••••••" required style={{ width: '100%', padding: '16px 44px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', fontSize: '14px', outline: 'none' }} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' }}>Nueva Contraseña</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type={showPassword ? "text" : "password"} placeholder="••••••••" required style={{ width: '100%', padding: '16px 44px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', fontSize: '14px', outline: 'none' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' }}>Confirmar Nueva Contraseña</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type={showPassword ? "text" : "password"} placeholder="••••••••" required style={{ width: '100%', padding: '16px 44px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', fontSize: '14px', outline: 'none' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>
          ACTUALIZAR CONTRASEÑA
        </button>
      </form>
    </div>
  );
}

export default Security;
