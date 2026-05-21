import React, { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F9FC' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Recuperar Contraseña</h1>
      </div>

      <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
              <Mail size={32} color="#059669" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66', marginBottom: '8px' }}>Correo Enviado</h2>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada o spam.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '24px', lineHeight: '1.5' }}>
              Ingresa el correo electrónico asociado a tu cuenta y te enviaremos instrucciones para restablecer tu contraseña.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  CORREO ELECTRÓNICO
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="email" 
                    required
                    placeholder="tucorreo@ejemplo.com" 
                    style={{ width: '100%', padding: '16px 16px 16px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#F3F4F6', fontSize: '14px', outline: 'none' }} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                ENVIAR ENLACE
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
