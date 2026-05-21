import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import SkeletonLoader from '../components/ui/SkeletonLoader';

function TodayAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appts = await appointmentService.getTodayAppointments();
        setAppointments(appts || []);
      } catch (error) {
        console.error("Error fetching today appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'SCHEDULED': return { bg: '#E0E7FF', text: '#3730A3', label: 'Programada' };
      case 'WAITING': return { bg: '#FEF3C7', text: '#D97706', label: 'En Espera' };
      case 'IN_PROGRESS': return { bg: '#DCFCE7', text: '#166534', label: 'En Consulta' };
      case 'COMPLETED': return { bg: '#D1FAE5', text: '#065F46', label: 'Completada' };
      case 'CANCELLED': return { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelada' };
      default: return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', backgroundColor: '#F7F9FC' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Citas de Hoy</h1>
      </div>

      {/* Main Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#1E293B" />
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>Citas de Hoy</h2>
          </div>
          <button onClick={() => navigate('/reception/agenda')} style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: '700', color: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            Ver agenda <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <SkeletonLoader type="list-item" count={3} />
          ) : appointments.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 16px', margin: 0 }}>No hay citas programadas para hoy.</p>
          ) : (
            appointments.map((apt, index) => {
              let notes = {};
              try { 
                notes = JSON.parse(apt.notes || '{}'); 
              } catch(error){
                console.error(error);
              }
              const styleInfo = getStatusStyle(apt.status);
              return (
              <div key={apt.id} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: index < appointments.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                
                {/* Time Badge */}
                <div style={{ backgroundColor: '#0D9488', color: '#FFFFFF', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', marginRight: '16px', minWidth: '70px', textAlign: 'center' }}>
                  {apt.time.substring(0,5)}
                </div>

                {/* Patient Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>{apt.patient?.first_name} {apt.patient?.last_name}</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{notes.specialty || 'Consulta'} • {notes.doctorName || 'Médico'}</p>
                </div>

                {/* Status Badge */}
                <div style={{ backgroundColor: styleInfo.bg, color: styleInfo.text, padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                  {styleInfo.label}
                </div>

              </div>
            )})
          )}
        </div>
      </div>
    </div>
  );
}

export default TodayAppointments;
