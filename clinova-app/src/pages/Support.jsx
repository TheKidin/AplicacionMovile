import React from 'react';
import { ArrowLeft, MessageCircle, PhoneCall, Mail, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Support() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Ayuda y Soporte</h1>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
          <HelpCircle size={40} color="#1D4ED8" />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>¿En qué podemos ayudarte?</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, padding: '0 16px', lineHeight: '1.5' }}>Nuestro equipo de soporte médico y técnico está disponible 24/7 para asistirte.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" onClick={() => alert('Abriendo chat en vivo...')} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#DCFCE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <MessageCircle size={24} color="#059669" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>Chat en vivo</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Habla con un asesor ahora</p>
          </div>
        </div>

        <div className="card" onClick={() => alert('Llamando a soporte técnico...')} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEF3C7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <PhoneCall size={24} color="#D97706" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>Línea de Soporte</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>800-CLINOVA</p>
          </div>
        </div>

        <div className="card" onClick={() => alert('Abriendo cliente de correo...')} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EEF2FF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Mail size={24} color="#4F46E5" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>Correo Electrónico</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>soporte@clinova.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
