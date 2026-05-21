import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, CheckCircle2, Navigation, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PreCheckin() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('locating'); // 'locating', 'success'

  useEffect(() => {
    // Simulate geofencing check
    const timer = setTimeout(() => {
      setStatus('success');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Smart Check-in</h1>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        
        {status === 'locating' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 32px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '4px solid #DBEAFE', borderRadius: '50%', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', backgroundColor: '#EFF6FF', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                <Navigation size={32} color="#2563EB" />
              </div>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', marginBottom: '8px' }}>Verificando tu ubicación...</h2>
            <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '250px', margin: '0 auto', lineHeight: '1.5' }}>
              Buscando la señal GPS de la clínica para procesar tu llegada automáticamente.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ width: '100px', height: '100px', backgroundColor: '#D1FAE5', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px' }}>
              <CheckCircle2 size={50} color="#059669" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1B2C66', marginBottom: '12px' }}>¡Bienvenido a la clínica!</h2>
            <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '32px', lineHeight: '1.5' }}>
              Hemos confirmado tu llegada exitosamente.
            </p>
            
            <div className="card" style={{ padding: '24px', textAlign: 'left', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <MapPin size={20} color="#3B82F6" />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#111827', margin: 0 }}>Torre Médica 1</h4>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Consultorio 402</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#F3F4F6', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#4B5563', marginBottom: '8px', textTransform: 'uppercase' }}>Instrucción:</h4>
                <p style={{ fontSize: '14px', color: '#111827', fontWeight: '600', margin: 0 }}>Por favor toma asiento en la sala de espera. Te llamaremos por las pantallas en breve.</p>
              </div>
            </div>

            <button onClick={() => navigate('/home')} className="btn-primary" style={{ width: '100%' }}>
              VOLVER AL INICIO
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default PreCheckin;
