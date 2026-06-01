import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserCircle, History, Pill, AlertTriangle, Dumbbell, Syringe, Activity, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import SkeletonLoader from '../components/ui/SkeletonLoader';

function Records() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [pastConsultations, setPastConsultations] = useState([]);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setAvatar(authService.getAvatarLocal(currentUser.id));
    }
    const loadData = async () => {
      if (authLoading) return;
      
      try {
        if (currentUser) {
          const patient = await patientService.getPatientByEmail(currentUser.email);
          if (patient) {
            setPatientData(patient);
            
            // Fetch past consultations
            try {
              const appts = await appointmentService.getPatientAppointments(patient.id);
              const completed = appts.filter(a => a.status === 'COMPLETED');
              setPastConsultations(completed);
            } catch (error) {
              console.error("Error fetching past consultations:", error);
            }
          }
        }
      } catch (err) {
        console.error("Error cargando historial:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser, authLoading]);

  const hasData = patientData !== null && patientData.gender != null;

  const sections = [
    { id: 1, title: 'Datos Generales', desc: 'Identificación, contacto y biometría básica.', icon: UserCircle, progress: hasData ? 100 : 0, color: '#30E3C2', bg: '#E0E7FF' },
    { id: 2, title: 'Signos Vitales', desc: 'Monitoreo de presión, ritmo cardíaco, peso y SpO2.', icon: Activity, progress: hasData ? 100 : 0, status: hasData ? null : 'Pendiente', color: '#F43F5E', bg: '#FFE4E6', route: '/vitals' },
    { id: 3, title: 'Antecedentes', desc: 'Historial familiar y patologías previas.', icon: History, progress: hasData ? 100 : 0, color: '#4A90E2', bg: '#DBEAFE' },
    { id: 4, title: 'Medicación', desc: 'Tratamientos actuales y dosis prescritas.', icon: Pill, progress: hasData ? 100 : 0, status: hasData ? null : 'Pendiente', color: '#EF4444', bg: '#FEE2E2', route: '/recetas' },
    { id: 5, title: 'Alergias', desc: 'Reacciones adversas y contraindicaciones.', icon: AlertTriangle, progress: hasData ? 100 : 0, color: '#30E3C2', bg: '#A7F3D0' },
    { id: 6, title: 'Estilo de Vida', desc: 'Hábitos, actividad física y nutrición.', icon: Dumbbell, progress: hasData ? 100 : 0, status: hasData ? null : 'Pendiente', color: '#6366F1', bg: '#E0E7FF' },
    { id: 7, title: 'Vacunación', desc: 'Esquema de vacunas y refuerzos.', icon: Syringe, progress: hasData ? 100 : 0, status: hasData ? null : 'Pendiente', color: '#30E3C2', bg: '#DBEAFE' },
  ];

  const completedSections = sections.filter(s => s.progress === 100).length;
  const overallProgress = Math.round((completedSections / sections.length) * 100);

  if (loading || authLoading) {
    return (
      <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#F7F9FC' }}>
        <SkeletonLoader type="card" count={1} style={{ height: '200px', marginBottom: '24px' }} />
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  return (
    <div style={{ padding: '0px 24px 32px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <ArrowLeft size={24} color="#1B2C66" />
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1B2C66' }}>Historial Clínico</h2>
        </div>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${patientData?.first_name || 'Felix'}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Main Stats Card */}
      <div style={{ backgroundColor: 'var(--primary)', borderRadius: '24px', padding: '24px', color: 'white', marginBottom: '24px', boxShadow: '0 10px 25px rgba(26,54,168,0.2)' }}>
        <span style={{ backgroundColor: '#30E3C2', color: '#064E3B', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>ESTADO GENERAL</span>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '16px 0 8px' }}>{overallProgress}% Completo</h1>
        <p style={{ fontSize: '14px', color: '#DBEAFE', lineHeight: '1.4' }}>
          {hasData 
            ? 'Tu historial clínico base está completo. Mantén tus signos vitales y medicación actualizados.' 
            : 'Aún no has completado tu cuestionario inicial. Por favor llénalo para una evaluación precisa.'}
        </p>
      </div>

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {sections.map(sec => (
          <div key={sec.title} className="card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => navigate(sec.route || '/questionnaire')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: sec.bg, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <sec.icon size={24} color={sec.color} />
              </div>
              <span style={{ 
                backgroundColor: sec.progress === 100 ? '#DBEAFE' : sec.status === 'Pendiente' ? '#FEE2E2' : '#E0E7FF', 
                color: sec.progress === 100 ? '#1E40AF' : sec.status === 'Pendiente' ? '#B91C1C' : '#4F46E5', 
                padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '700' 
              }}>
                {sec.progress === 100 ? 'Completado' : sec.status || `${sec.progress}%`}
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1B2C66', marginBottom: '4px' }}>{sec.title}</h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>{sec.desc}</p>
            
            {/* Progress bar */}
            <div style={{ height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${sec.progress}%`, backgroundColor: sec.color, borderRadius: '2px' }}></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '24px', backgroundColor: 'white', borderTop: '1px solid #E5E7EB', margin: '0 -24px 24px' }}>
        <button 
          onClick={() => navigate('/questionnaire')} 
          style={{ 
            width: '100%', padding: '16px', fontSize: '14px', fontWeight: '800', 
            backgroundColor: hasData ? '#F3F4F6' : 'var(--primary)', 
            color: hasData ? '#4B5563' : '#FFFFFF', 
            border: 'none', borderRadius: '16px', cursor: 'pointer' 
          }}
        >
          {hasData ? 'EDITAR HISTORIAL CLÍNICO BASE' : 'LLENAR HISTORIAL AHORA'}
        </button>
      </div>

      {/* Consultas Pasadas */}
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66', marginBottom: '16px' }}>Consultas Anteriores</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {pastConsultations.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>Aún no tienes consultas completadas.</p>
        ) : (
          pastConsultations.map(appt => {
            let notes = {};
            try { 
              notes = JSON.parse(appt.notes || '{}'); 
            } catch(e) {
              console.error("Error parsing notes:", e);
            }
            const diag = notes.consultation?.diagnosis || 'Consulta General';
            const med = notes.prescription?.medication || 'Sin medicamento';
            const indic = notes.prescription?.instructions || '';

            return (
              <div key={appt.id} className="card" style={{ padding: '20px', borderLeft: '4px solid #30E3C2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66' }}>{appt.date} • {appt.time.substring(0,5)}</h3>
                  <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#E0E7FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '8px' }}>COMPLETADA</span>
                </div>
                <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '8px' }}><UserCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>{appt.doctor?.first_name} {appt.doctor?.last_name}</p>
                <div style={{ backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px' }}>DIAGNÓSTICO</p>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{diag}</p>
                </div>
                <div style={{ backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px' }}>RECETA MÉDICA</p>
                  {Array.isArray(notes.prescription) && notes.prescription.length > 0 ? (
                    notes.prescription.map(p => (
                      <div key={p.id || p.med} style={{ marginBottom: '8px', borderBottom: '1px solid #FCA5A5', paddingBottom: '4px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#991B1B', marginBottom: '2px' }}>{p.med}</p>
                        <p style={{ fontSize: '12px', color: '#B91C1C' }}>{p.dosis} - Cada {p.frecuencia} por {p.dias}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#991B1B', marginBottom: '4px' }}>{med}</p>
                      {indic && <p style={{ fontSize: '12px', color: '#B91C1C' }}>{indic}</p>}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default Records;
