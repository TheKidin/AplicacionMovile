import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import SkeletonLoader from '../components/ui/SkeletonLoader';

function WaitingPatients() {
  const navigate = useNavigate();
  const [patientQueue, setPatientQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appts = await appointmentService.getTodayAppointments();
        const waiting = (appts || []).filter(a => a.status === 'WAITING');
        setPatientQueue(waiting);
      } catch (error) {
        console.error("Error fetching today appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const getAreaColor = (area) => {
    switch(area) {
      case 'Urgencias': return { bg: '#FEF2F2', text: '#991B1B' };
      case 'Consulta General': return { bg: '#EFF6FF', text: '#1E40AF' };
      case 'Laboratorio': return { bg: '#EEF2FF', text: '#3730A3' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', backgroundColor: '#F7F9FC' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Pacientes en Espera</h1>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
          <Clock size={20} color="#1E293B" />
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>Lista de Espera</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <SkeletonLoader type="list-item" count={3} />
          ) : patientQueue.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 16px', margin: 0 }}>No hay pacientes en la lista de espera.</p>
          ) : (
            patientQueue.map((p, index) => {
              let notes = {};
              try { 
                notes = JSON.parse(p.notes || '{}'); 
              } catch(error){
                console.error(error);
              }
              return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: index < patientQueue.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '16px', fontSize: '12px', fontWeight: '800', color: '#6B7280' }}>
                  {index + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>{p.patient?.first_name} {p.patient?.last_name}</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Llegó a las {p.time.substring(0,5)} • con {notes.doctorName || 'Médico'}</p>
                </div>

                <div style={{ backgroundColor: getAreaColor('Consulta General').bg, color: getAreaColor('Consulta General').text, padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                  CONSULTA GENERAL
                </div>

              </div>
            )})
          )}
        </div>
      </div>
    </div>
  );
}

export default WaitingPatients;
