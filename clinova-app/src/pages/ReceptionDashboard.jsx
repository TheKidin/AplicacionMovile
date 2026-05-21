import React, { useState } from 'react';
import { Search, UserCheck, Calendar, Bell, User, HeartPulse, CheckCircle2, Clock, AlertTriangle, Users, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { notificationService } from '../services/notificationService';
import SkeletonLoader from '../components/ui/SkeletonLoader';

function ReceptionDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const appts = await appointmentService.getTodayAppointments();
        setAppointments(appts || []);

        if (currentUser) {
          const notifs = await notificationService.getNotifications(currentUser.id);
          setNotifications(notifs || []);
        }
      } catch (error) {
        console.error("Error fetching today appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    let channel;
    if (currentUser) {
      channel = notificationService.subscribeToNotifications(currentUser.id, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
      });
    }

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [currentUser]);

  const handleNotificationClick = async (notification) => {
    setShowNotifications(false);
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const todayStats = {
    scheduled: appointments.filter(a => a.status === 'SCHEDULED').length,
    waiting: appointments.filter(a => a.status === 'WAITING').length,
    doctorsAvailable: 1,
    urgencias: 0,
    pacientes: appointments.length,
    consultas: appointments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'COMPLETED').length
  };

  const patientQueue = appointments.filter(a => a.status === 'SCHEDULED');
  const vitalsQueue = appointments.filter(a => {
    if (a.status !== 'WAITING') return false;
    let notes = {};
    try { notes = JSON.parse(a.notes || '{}'); } catch(error){
      console.error(error);
    }
    return !notes.vitalsTaken;
  });

  const handleCheckIn = async (id) => {
    try {
      await appointmentService.updateAppointmentStatus(id, 'WAITING');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'WAITING' } : a));
    } catch (error) {
      console.error("Error setting waiting status", error);
    }
  };

  const getAreaColor = (area) => {
    switch(area) {
      case 'Urgencias': return { bg: '#FEF2F2', text: '#991B1B' }; // Red
      case 'Consulta General': return { bg: '#EFF6FF', text: '#1E40AF' }; // Blue
      case 'Laboratorio': return { bg: '#EEF2FF', text: '#3730A3' }; // Indigo
      default: return { bg: '#F3F4F6', text: '#4B5563' }; // Gray
    }
  };



  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F9FC', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E0E7FF', overflow: 'hidden' }}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nurse" alt="avatar" style={{ width: '100%' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66' }}>{currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}` : 'Personal'}</h1>
            <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Recepción • Sede Principal</p>
          </div>
        </div>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Bell size={20} color="#1E293B" />
          </div>
          {notifications.filter(n => !n.read).length > 0 && (
            <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#EF4444', borderRadius: '50%', border: '2px solid #F7F9FC' }}></span>
          )}
          
          {showNotifications && (
            <>
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}></div>
              <div style={{ position: 'absolute', right: '0', top: '48px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '16px', zIndex: 100, minWidth: '240px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
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
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={20} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder="Buscar paciente o cita..." 
          style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: 'none', backgroundColor: '#FFFFFF', fontSize: '14px', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }} 
        />
      </div>

      {/* Resumen Operativo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        
        {/* Row 1: Citas y En Espera */}
        <div className="card" onClick={() => navigate('/reception/citas-hoy')} style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Calendar size={20} color="#3730A3" />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', display: 'block', lineHeight: '1' }}>{todayStats.scheduled}</span>
            <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>CITAS HOY</span>
          </div>
        </div>
        
        <div className="card" onClick={() => navigate('/reception/en-espera')} style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FEF3C7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Clock size={20} color="#D97706" />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', display: 'block', lineHeight: '1' }}>{todayStats.waiting}</span>
            <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>EN ESPERA</span>
          </div>
        </div>

        {/* Row 2: Médicos y Urgencias */}
        <div className="card" onClick={() => navigate('/reception/medicos')} style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#D1FAE5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <UserCheck size={20} color="#059669" />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', display: 'block', lineHeight: '1' }}>{todayStats.doctorsAvailable}</span>
            <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>MÉDICOS DISP.</span>
          </div>
        </div>
        
        <div className="card" onClick={() => navigate('/reception/urgencias')} style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FEE2E2', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <AlertTriangle size={20} color="#DC2626" />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', display: 'block', lineHeight: '1' }}>{todayStats.urgencias}</span>
            <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>URGENCIAS</span>
          </div>
        </div>

      </div>

      {/* Vitals Queue (High Priority) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HeartPulse size={18} /> PENDIENTE DE SIGNOS
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {loading ? (
          <SkeletonLoader type="list-item" count={1} />
        ) : vitalsQueue.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>No hay pacientes esperando signos vitales.</p>
        ) : (
          vitalsQueue.map(p => {
            let notes = {};
            try { 
              notes = JSON.parse(p.notes || '{}'); 
            } catch(error){
              console.error(error);
            }
            return (
            <div key={p.id} className="card" style={{ padding: '16px', borderLeft: '4px solid #F59E0B', boxShadow: '0 4px 12px rgba(245,158,11,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FEF3C7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <User size={20} color="#D97706" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>{p.patient?.first_name} {p.patient?.last_name}</h4>
                    <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Para: {notes.doctorName || 'Médico'}</p>
                  </div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>{p.time.substring(0,5)}</span>
              </div>
              <button onClick={() => navigate('/reception/vitals', { state: { appointmentId: p.id, patient: p.patient, patientId: p.patient_id } })} style={{ width: '100%', padding: '12px', fontSize: '13px', fontWeight: '800', backgroundColor: '#F59E0B', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                <HeartPulse size={16} /> TOMAR SIGNOS VITALES
              </button>
            </div>
          )})
        )}
      </div>

      {/* Consultas y Pacientes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="card" onClick={() => navigate('/reception/pacientes')} style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#DCFCE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Users size={20} color="#059669" />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', display: 'block', lineHeight: '1' }}>{todayStats.pacientes}</span>
            <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>PACIENTES</span>
          </div>
        </div>
        
        <div className="card" onClick={() => navigate('/reception/consultas')} style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#DCFCE7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Activity size={20} color="#059669" />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', display: 'block', lineHeight: '1' }}>{todayStats.consultas}</span>
            <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>CONSULTAS</span>
          </div>
        </div>
      </div>

      {/* Arrival Queue */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#1B2C66' }}>LLEGADAS PRÓXIMAS (Check-in)</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <SkeletonLoader type="list-item" count={2} />
        ) : patientQueue.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>No hay llegadas próximas registradas.</p>
        ) : (
          patientQueue.map(p => {
            let notes = {};
            try { 
              notes = JSON.parse(p.notes || '{}'); 
            } catch(error){
              console.error(error);
            }
            return (
            <div key={p.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  <User size={20} color="#6B7280" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{p.patient?.first_name} {p.patient?.last_name}</h4>
                  <p style={{ fontSize: '11px', color: '#6B7280' }}>con {notes.doctorName || 'Médico'}</p>
                  <span style={{ marginTop: '4px', fontSize: '9px', fontWeight: '800', padding: '4px 8px', borderRadius: '6px', backgroundColor: getAreaColor('Consulta General').bg, color: getAreaColor('Consulta General').text, letterSpacing: '0.5px' }}>
                    CONSULTA GENERAL
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>{p.time.substring(0,5)}</span>
                <button onClick={() => handleCheckIn(p.id)} style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '800', backgroundColor: '#DBEAFE', color: '#1D4ED8', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> CHECK-IN
                </button>
              </div>
            </div>
          )})
        )}
      </div>


    </div>
  );
}

export default ReceptionDashboard;
