import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Home as HomeIcon, Map, Plus, Clock, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import SkeletonLoader from '../components/ui/SkeletonLoader';

function Home() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [userName, setUserName] = useState('...');
  const [avatar, setAvatar] = useState(null);
  const [loadingName, setLoadingName] = useState(true);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const user = await authService.getUser();
        if (user) {
          let nameFound = null;

          try {
            const profile = await authService.getProfile(user.id);
            if (profile && profile.first_name) {
              nameFound = profile.first_name.trim();
            }
          } catch {
            // Ignorar
          }

          if (!nameFound) {
            try {
              const patient = await patientService.getPatientByEmail(user.email);
              if (patient && patient.first_name) {
                nameFound = patient.first_name.trim();
              }
            } catch {
              // Ignorar
            }
          }

          if (nameFound) {
            setUserName(nameFound);
          } else {
            setUserName('Bienvenido(a)');
          }

          const localAvatar = authService.getAvatarLocal(user.id);
          if (localAvatar) {
            setAvatar(localAvatar);
          }

          // Now fetch appointments for this patient
          try {
            const patient = await patientService.getPatientByEmail(user.email);
            if (patient) {
              const appts = await appointmentService.getPatientAppointments(patient.id);
              setAppointments(appts || []);
            }
          } catch (err) {
            console.error("Error fetching appointments:", err);
          }

        }
      } catch (error) {
        console.error("Error al cargar nombre:", error);
      } finally {
        setLoadingName(false);
        setLoadingAppts(false);
      }
    };
    fetchName();
  }, []);

  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div onClick={() => navigate('/settings')} style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E0E7FF', overflow: 'hidden', cursor: 'pointer', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.5px' }}>CLINOVA</h2>
        </div>
        <Bell size={24} color="#1E293B" />
      </div>

      {/* Greeting */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1B2C66', lineHeight: '1.2' }}>
          Hola, <br/>
          <span style={{ color: 'var(--primary-light)' }}>
            {loadingName ? <Loader size={24} className="spinner" /> : userName}
          </span>
        </h1>
        <p style={{ fontSize: '14px', color: '#4B5563', marginTop: '8px' }}>Tu salud es nuestra prioridad hoy.</p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div className="card" onClick={() => navigate('/schedule')} style={{ flex: 1, padding: '24px 20px', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E6E6FA', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
            <Calendar size={24} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1B2C66', marginBottom: '8px' }}>AGENDA CITAS</h3>
          <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>Reserva tu próxima consulta médica.</p>
        </div>
        <div className="card" onClick={() => navigate('/clinics')} style={{ flex: 1, padding: '24px 20px', border: '2px solid transparent', backgroundClip: 'padding-box', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}>
          {/* subtle active border effect could be done here */}
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#DBEAFE', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
            <HomeIcon size={24} color="var(--primary-light)" />
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1B2C66', marginBottom: '8px' }}>CLÍNICAS</h3>
          <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>Encuentra sedes y especialistas.</p>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1B2C66' }}>MIS PRÓXIMAS CITAS</h3>
        <button style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: 'var(--primary-light)' }}>Ver todas</button>
      </div>

      {loadingAppts ? (
        <SkeletonLoader type="list-item" count={2} />
      ) : appointments.length === 0 ? (
        <div style={{ backgroundColor: '#F3F4F6', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
          <Calendar size={32} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>No tienes citas próximas programadas.</p>
        </div>
      ) : (
        appointments.slice(0, 2).map((appt, idx) => {
          // Parse date parts directly from ISO string to avoid timezone issues
          const dateParts = appt.date.split('-');
          const dayNum = parseInt(dateParts[2], 10);
          const monthIndex = parseInt(dateParts[1], 10) - 1;
          const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
          const monthStr = monthNames[monthIndex];
          
          let parsedNotes = {};
          try { 
            parsedNotes = JSON.parse(appt.notes || '{}'); 
          } catch(error) {
            console.error("Error parsing notes:", error);
          }
          
          // Formatear hora de 24h a 12h
          const timeParts = appt.time.split(':');
          let h = parseInt(timeParts[0]);
          const ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12;
          h = h ? h : 12;
          const displayTime = `${h}:${timeParts[1]} ${ampm}`;

          return (
            <div key={idx} className="card" style={{ marginBottom: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#E0E7FF', padding: '12px', borderRadius: '12px', textAlign: 'center', minWidth: '60px', maxHeight: '76px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66' }}>{dayNum}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#4F46E5', textTransform: 'uppercase' }}>{monthStr}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ backgroundColor: '#30E3C2', color: '#064E3B', fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px' }}>{{ SCHEDULED: 'PROGRAMADA', WAITING: 'EN ESPERA', IN_PROGRESS: 'EN CURSO', COMPLETED: 'COMPLETADA', CANCELLED: 'CANCELADA' }[appt.status] || appt.status}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4B5563', fontWeight: '500' }}>
                      <Clock size={12} /> {displayTime}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1B2C66', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{parsedNotes.specialty || 'Consulta Médica'}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#D1FAE5', overflow: 'hidden', flexShrink: 0 }}>
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Medic" alt="Doctor" style={{ width: '100%' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#4B5563', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{parsedNotes.doctorName || 'Dr. Asignado'}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', backgroundColor: '#F3F4F6', padding: '10px 12px', borderRadius: '8px' }}>
                <Map size={16} color="#6B7280" flexShrink={0} />
                <span style={{ fontSize: '11px', color: '#4B5563', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{parsedNotes.clinicContent || 'Clínica Principal'}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {parsedNotes.modality === 'telemedicina' ? (
                  <button onClick={() => navigate('/telemedicina', { state: { appointmentId: appt.id } })} className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '14px', backgroundColor: '#3B82F6' }}>
                    💻 UNIRSE A VIDEOLLAMADA
                  </button>
                ) : (
                  <>
                    <button onClick={() => navigate('/pre-checkin')} className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '14px' }}>PRE-REGISTRO</button>
                    <button onClick={() => navigate('/appointment-map', { state: { clinic: parsedNotes.clinicContent } })} style={{ backgroundColor: '#F3F4F6', border: 'none', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      <Map size={20} color="#1B2C66" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })
      )}

      <div style={{ border: '1px dashed #CBD5E1', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.5)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E2E8F0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Plus size={20} color="#64748B" />
        </div>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', marginBottom: '2px' }}>¿Necesitas otra cita?</h4>
          <p style={{ fontSize: '12px', color: '#64748B' }}>Contamos con más de 20 especialidades.</p>
        </div>
      </div>

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1A36A8 0%, #3577F1 100%)', borderRadius: '16px', padding: '24px', color: 'white', position: 'relative', overflow: 'hidden', marginBottom: '32px' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', width: '60%' }}>Telemedicina Disponible</h3>
          <p style={{ fontSize: '12px', color: '#E0E7FF', marginBottom: '16px', width: '60%', lineHeight: '1.4' }}>Atención médica desde la comodidad de tu hogar.</p>
          <button onClick={() => navigate('/telemedicina')} style={{ backgroundColor: '#30E3C2', color: '#064E3B', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
            ENTRAR AHORA
          </button>
        </div>
      </div>

    </div>
  );
}

export default Home;
