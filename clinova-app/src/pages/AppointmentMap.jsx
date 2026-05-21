import React from 'react';
import { ArrowLeft, MapPin, ExternalLink, Navigation } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function AppointmentMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const clinicAddress = location.state?.clinic || 'Torre Médica 1, Consultorio 402';

  const handleOpenMaps = () => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(clinicAddress + ', CLINOVA')}`, '_blank');
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Ubicación de Cita</h1>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, maxHeight: '600px', marginBottom: '24px' }}>
        
        {/* Placeholder Map Area */}
        <div style={{ backgroundColor: '#E2E8F0', flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
          {/* Simulated Map UI */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#EF4444', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', boxShadow: '0 4px 12px rgba(239,68,68,0.3)', marginBottom: '8px' }}>
              Tu Cita
            </div>
            <MapPin size={40} color="#EF4444" fill="#EF4444" />
          </div>
          
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: 'white', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Navigation size={20} color="#3B82F6" />
          </div>
        </div>

        {/* Info Area */}
        <div style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66', marginBottom: '8px' }}>CLINOVA</h2>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
            <MapPin size={20} color="#6B7280" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.5', margin: 0 }}>
              {clinicAddress}
            </p>
          </div>

          <button onClick={handleOpenMaps} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <ExternalLink size={20} />
            ABRIR EN GOOGLE MAPS
          </button>
        </div>
      </div>

    </div>
  );
}

export default AppointmentMap;
