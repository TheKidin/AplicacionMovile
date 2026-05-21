import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';

function UrgencyPatients() {
  const navigate = useNavigate();
  const [urgencias, setUrgencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrgencies = async () => {
      try {
        const data = await appointmentService.getTodayAppointments();
        // Lógica temporal para identificar urgencias: Pacientes esperando. 
        // Idealmente, esto se filtraría por un campo `triage_level` o una nota específica.
        const waitingPatients = data.filter(a => a.status === 'WAITING');
        
        const mapped = waitingPatients.map(a => ({
          id: a.id,
          name: `${a.patient?.first_name || ''} ${a.patient?.last_name || ''}`,
          triage: 'ROJO (Prioridad Alta)', // Valor simulado, cambiar por el nivel real
          color: '#DC2626'
        }));
        
        setUrgencias(mapped);
      } catch (error) {
        console.error("Error fetching urgencies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUrgencies();
  }, []);

  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', backgroundColor: '#F7F9FC' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Urgencias</h1>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
          <AlertTriangle size={20} color="#DC2626" />
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>Pacientes Críticos (En Espera)</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Loader className="spinner" size={24} color="#DC2626" />
            </div>
          ) : urgencias.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 16px', margin: 0 }}>No hay pacientes en el área de urgencias.</p>
          ) : (
            urgencias.map((u, index) => (
              <div key={u.id || index} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: index < urgencias.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                
                <div style={{ width: '4px', height: '40px', backgroundColor: u.color, borderRadius: '4px', marginRight: '16px' }}></div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>{u.name}</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Triage: <span style={{ color: u.color, fontWeight: '700' }}>{u.triage}</span></p>
                </div>

                <button style={{ backgroundColor: '#FEF2F2', color: '#991B1B', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                  Ver Ficha
                </button>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UrgencyPatients;
