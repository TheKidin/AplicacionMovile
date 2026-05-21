import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';

function ConsultationsMonitor() {
  const navigate = useNavigate();
  const [activeConsults, setActiveConsults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const data = await appointmentService.getTodayAppointments();
        const inProgress = data.filter(a => a.status === 'IN_PROGRESS' || a.status === 'WAITING');
        
        const mapped = inProgress.map(c => ({
          id: c.id,
          room: `Sala ${c.doctor?.first_name ? c.doctor.first_name.charAt(0) : 'X'}`,
          doctor: `${c.doctor?.first_name || ''} ${c.doctor?.last_name || ''}`,
          patient: `${c.patient?.first_name || ''} ${c.patient?.last_name || ''}`,
          status: c.status,
          color: c.status === 'IN_PROGRESS' ? '#10B981' : '#F59E0B'
        }));
        
        setActiveConsults(mapped);
      } catch (error) {
        console.error("Error fetching active consultations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, []);

  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', backgroundColor: '#F7F9FC' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Monitor de Consultas</h1>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
          <Activity size={20} color="#1E293B" />
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>Consultorios Activos</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Loader className="spinner" size={24} color="#1D4ED8" />
            </div>
          ) : activeConsults.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 16px', margin: 0 }}>No hay consultas activas en este momento.</p>
          ) : (
            activeConsults.map((c, index) => (
              <div key={c.id || index} style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: index < activeConsults.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                
                <div style={{ width: '48px', height: '48px', backgroundColor: '#F3F4F6', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '16px', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#6B7280' }}>CONS</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#1D4ED8' }}>{c.room.split(' ')[1] || '1'}</span>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>{c.doctor}</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Paciente: {c.patient}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }}></div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: c.color }}>{c.status.toUpperCase()}</span>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ConsultationsMonitor;
