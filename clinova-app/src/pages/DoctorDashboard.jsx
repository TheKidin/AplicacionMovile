import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { toast } from 'react-hot-toast';

function DoctorDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [status, setStatus] = useState('disponible');
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('Dr. Cargando...');
  const [doctorSpecialty, setDoctorSpecialty] = useState('Especialidad');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!currentUser) return;
        
        setAvatar(authService.getAvatarLocal(currentUser.id));

        try {
          const profile = await authService.getProfile(currentUser.id);
          if (profile) {
            setDoctorName(`Dr. ${profile.first_name} ${profile.last_name || ''}`.trim());
            setDoctorSpecialty(profile.specialty || 'Medicina General');
            // Cargar estado de disponibilidad guardado en la BD
            if (profile.availability_status) {
              setStatus(profile.availability_status);
            }
          }
        } catch (e) {
          console.error("Error loading profile", e);
          setDoctorName("Doctor");
        }

        // As we bypassed doctorId filter for the demo, we just pass the ID anyway
        const queue = await appointmentService.getDoctorQueue(currentUser.id);
        
        // Pre-calculate age to avoid impure functions in render
        const processedQueue = (queue || []).map(patient => {
          let age = 'N/A';
          if (patient.patient?.date_of_birth) {
            const diffMs = new Date().getTime() - new Date(patient.patient.date_of_birth).getTime();
            const ageDt = new Date(diffMs);
            age = Math.abs(ageDt.getUTCFullYear() - 1970);
          }
          return { ...patient, calculatedAge: age };
        });
        
        setWaitingPatients(processedQueue);

        const allToday = await appointmentService.getTodayAppointments();
        const upcoming = (allToday || []).filter(a => a.status === 'SCHEDULED');
        setUpcomingAppointments(upcoming);

        // Fetch initial notifications
        const notifs = await notificationService.getNotifications(currentUser.id);
        setNotifications(notifs || []);

      } catch (error) {
        console.error("Error loading doctor dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    // Subscribe to real-time notifications
    let channel;
    if (currentUser) {
      channel = notificationService.subscribeToNotifications(currentUser.id, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        // Optional: Play a sound or trigger browser notification here
      });
    }

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [currentUser]);

  const handleNotificationClick = async (notification) => {
    setShowNotifications(false);
    
    // Mark as read in DB
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      // Update local state
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    if (!currentUser) return;
    try {
      await authService.updateDoctorAvailability(currentUser.id, newStatus);
      const labels = { disponible: '🟢 Disponible', descanso: '🟡 En descanso', ausente: '🔴 Ausente' };
      toast.success(`Estado actualizado: ${labels[newStatus]}`);
    } catch (error) {
      console.error('Error actualizando disponibilidad:', error);
      toast.error('No se pudo actualizar el estado.');
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F9FC' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E0E7FF', overflow: 'hidden' }}>
            <img src={avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Doctor"} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66' }}>{doctorName}</h1>
            <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>{doctorSpecialty}</p>
          </div>
        </div>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
          <Bell size={24} color="#1E293B" />
          {notifications.filter(n => !n.read).length > 0 && (
            <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#EF4444', borderRadius: '50%', border: '2px solid #F7F9FC' }}></span>
          )}
          
          {showNotifications && (
            <>
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}></div>
              <div style={{ position: 'absolute', right: '0', top: '36px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '16px', zIndex: 100, minWidth: '240px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', margin: '0 0 12px 0' }}>Notificaciones</h3>
                
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px 0', textAlign: 'center' }}>No tienes notificaciones nuevas.</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={(e) => { e.stopPropagation(); handleNotificationClick(n); }}
                      style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', opacity: n.read ? 0.6 : 1 }}
                    >
                      <p style={{ margin: 0, fontSize: '13px', color: '#1E293B', fontWeight: '800' }}>{n.title}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#475569', marginTop: '2px' }}>{n.message}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: '#94A3B8', marginTop: '6px' }}>{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  ))
                )}
                
                <button style={{ width: '100%', padding: '8px', background: 'none', border: 'none', fontSize: '12px', fontWeight: '700', color: '#3B82F6', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}>
                  Cerrar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Selector */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', marginBottom: '8px', letterSpacing: '0.5px' }}>MI DISPONIBILIDAD</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleStatusChange('disponible')}
            style={{ flex: 1, padding: '10px 0', borderRadius: '12px', fontSize: '12px', fontWeight: '800', border: status === 'disponible' ? '2px solid #10B981' : '2px solid transparent', cursor: 'pointer', backgroundColor: status === 'disponible' ? '#DCFCE7' : '#FFFFFF', color: status === 'disponible' ? '#065F46' : '#6B7280', transition: 'all 0.2s' }}
          >
            🟢 Disponible
          </button>
          <button 
            onClick={() => handleStatusChange('descanso')}
            style={{ flex: 1, padding: '10px 0', borderRadius: '12px', fontSize: '12px', fontWeight: '800', border: status === 'descanso' ? '2px solid #F59E0B' : '2px solid transparent', cursor: 'pointer', backgroundColor: status === 'descanso' ? '#FEF3C7' : '#FFFFFF', color: status === 'descanso' ? '#92400E' : '#6B7280', transition: 'all 0.2s' }}
          >
            🟡 Descanso
          </button>
          <button 
            onClick={() => handleStatusChange('ausente')}
            style={{ flex: 1, padding: '10px 0', borderRadius: '12px', fontSize: '12px', fontWeight: '800', border: status === 'ausente' ? '2px solid #EF4444' : '2px solid transparent', cursor: 'pointer', backgroundColor: status === 'ausente' ? '#FEE2E2' : '#FFFFFF', color: status === 'ausente' ? '#991B1B' : '#6B7280', transition: 'all 0.2s' }}
          >
            🔴 Ausente
          </button>
        </div>
      </div>

      {/* Stats / Overview */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <div className="card" onClick={() => navigate('/reception/citas-hoy')} style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '4px solid var(--primary)', cursor: 'pointer' }}>
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#1B2C66' }}>{upcomingAppointments.length + waitingPatients.length}</span>
          <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '700', marginTop: '4px' }}>CITAS HOY</span>
        </div>
        <div className="card" onClick={() => navigate('/reception/en-espera')} style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: '4px solid #F59E0B', cursor: 'pointer' }}>
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#1B2C66' }}>{waitingPatients.length}</span>
          <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '700', marginTop: '4px' }}>EN ESPERA</span>
        </div>
      </div>

      {/* Waiting Room */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1B2C66' }}>SALA DE ESPERA</h2>
      </div>

      {loading ? (
        <SkeletonLoader type="list-item" count={2} />
      ) : waitingPatients.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 16px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>No hay pacientes en la sala de espera.</p>
      ) : (
        waitingPatients.map(patient => {
          let notes = {};
          try { 
            notes = JSON.parse(patient.notes || '{}'); 
          } catch(error){
            console.error(error);
          }
          
          const isUrgent = notes.triage?.alarma?.length > 0;

          return (
          <div key={patient.id} className="card" style={{ padding: '16px', marginBottom: '16px', borderLeft: isUrgent ? '6px solid #EF4444' : '6px solid #30E3C2', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1B2C66', marginBottom: '2px' }}>{patient.patient?.first_name} {patient.patient?.last_name}</h3>
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>{patient.calculatedAge} años • {notes.triage?.motivo || 'Consulta Médica'}</p>
              </div>
              <span style={{ backgroundColor: isUrgent ? '#FEF2F2' : '#F0FDF4', color: isUrgent ? '#991B1B' : '#166534', fontSize: '11px', fontWeight: '800', padding: '6px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {patient.time.substring(0,5)}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => navigate(`/doctor/triage`, { state: { appointmentId: patient.id } })} style={{ flex: 1, padding: '12px', backgroundColor: '#F3F4F6', color: '#4B5563', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <FileText size={16} /> Triage
              </button>
              
              {notes.modality === 'telemedicina' ? (
                <button onClick={() => navigate(`/telemedicina`, { state: { appointmentId: patient.id } })} className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer', backgroundColor: '#3B82F6' }}>
                  Videollamada <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={() => navigate(`/doctor/consultation`, { state: { appointmentId: patient.id } })} className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  Iniciar <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        )})
      )}

      {/* Upcoming */}
      <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1B2C66', marginTop: '16px', marginBottom: '16px' }}>PRÓXIMAS CITAS</h2>
      
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <SkeletonLoader type="list-item" count={1} />
        ) : upcomingAppointments.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 16px', margin: 0 }}>No tienes próximas citas registradas.</p>
        ) : (
          upcomingAppointments.map((appt, idx) => {
            let notes = {};
            try { 
              notes = JSON.parse(appt.notes || '{}'); 
            } catch(error){
              console.error(error);
            }
            return (
            <div key={appt.id} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx !== upcomingAppointments.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Calendar size={20} color="#6B7280" />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{appt.patient?.first_name} {appt.patient?.last_name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>{notes.specialty || 'Consulta'}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{appt.time.substring(0,5)}</span>
              </div>
            </div>
          )})
        )}
      </div>

    </div>
  );
}

export default DoctorDashboard;
