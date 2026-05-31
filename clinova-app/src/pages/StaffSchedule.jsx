import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User, Phone, X, Stethoscope, FileText } from 'lucide-react';
import { appointmentService } from '../services/appointmentService';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function StaffSchedule() {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]); // ISO string YYYY-MM-DD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    doctor: '',
    time: '',
    type: ''
  });

  // Cargar citas reales de Supabase para la fecha seleccionada
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const data = await appointmentService.getAppointmentsByDate(selectedDate);
        const mapped = (data || []).map(appt => {
          // Formatear hora de DB (14:30:00) a display (02:30 PM)
          let formattedTime = appt.time;
          if (appt.time) {
            const [hour, minute] = appt.time.split(':');
            const h = parseInt(hour, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            formattedTime = `${h12.toString().padStart(2, '0')}:${minute} ${ampm}`;
          }

          let notes = {};
          try { notes = JSON.parse(appt.notes || '{}'); } catch { /* ignore */ }

          const doctorName = appt.doctor
            ? `Dr. ${appt.doctor.first_name} ${appt.doctor.last_name || ''}`.trim()
            : (notes.doctorName || 'Doctor');

          const patientName = appt.patient
            ? `${appt.patient.first_name} ${appt.patient.last_name || ''}`.trim()
            : 'Paciente';

          return {
            id: appt.id,
            time: formattedTime,
            name: patientName,
            phone: notes.phone || '',
            doctor: doctorName,
            type: notes.modality === 'telemedicina' ? 'Telemedicina' : (appt.status || 'Presencial'),
            status: appt.status
          };
        });
        setAppointments(mapped);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [selectedDate]);

  // Navegación de mes
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    // Seleccionar el primer día del nuevo mes
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const firstDay = new Date(newYear, newMonth, 1);
    setSelectedDate(firstDay.toISOString().split('T')[0]);
  };

  const handleNextMonth = () => {
    // Limitar a 12 meses en el futuro
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 12);
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    if (new Date(nextYear, nextMonth, 1) > maxDate) return;

    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
    // Seleccionar el primer día del nuevo mes
    const firstDay = new Date(nextYear, nextMonth, 1);
    setSelectedDate(firstDay.toISOString().split('T')[0]);
  };

  // Generar días del calendario mensual completo
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDayOfMonth.getDay(); // 0=Dom

    const days = [];
    // Espacios vacíos antes del primer día
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // Días del mes
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      days.push({
        date: d,
        fullDate: dateStr,
        isToday: dateStr === today.toISOString().split('T')[0]
      });
    }
    return days;
  }, [currentMonth, currentYear, today]);

  const handleAddAppointment = (e) => {
    e.preventDefault();

    // Formatear la hora nativa (ej. 14:30 a 02:30 PM)
    let formattedTime = formData.time;
    if (formData.time) {
      const [hour, minute] = formData.time.split(':');
      const h = parseInt(hour, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      formattedTime = `${h12.toString().padStart(2, '0')}:${minute} ${ampm}`;
    } else {
      formattedTime = '12:00 PM';
    }

    const newAppointment = {
      id: Date.now(),
      time: formattedTime,
      name: formData.name,
      phone: formData.phone,
      doctor: formData.doctor,
      type: formData.type
    };

    setAppointments(prev => [...prev, newAppointment]);
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', doctor: '', time: '', type: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'WAITING': return { bg: '#FEF3C7', text: '#D97706' };
      case 'IN_PROGRESS': return { bg: '#D1FAE5', text: '#059669' };
      case 'COMPLETED': return { bg: '#F3F4F6', text: '#4B5563' };
      default: return { bg: '#D1FAE5', text: '#059669' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'Programada';
      case 'WAITING': return 'En espera';
      case 'IN_PROGRESS': return 'En curso';
      case 'COMPLETED': return 'Completada';
      default: return status || 'Presencial';
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F9FC', position: 'relative' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1B2C66' }}>Agenda Clínica</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <CalendarIcon size={18} color="#4B5563" />
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{MONTH_NAMES[currentMonth]} {currentYear}</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <ChevronLeft size={20} color="#6B7280" style={{ cursor: 'pointer' }} onClick={handlePrevMonth} />
          <ChevronRight size={20} color="#111827" style={{ cursor: 'pointer' }} onClick={handleNextMonth} />
        </div>
      </div>

      {/* Mini Calendar Grid */}
      <div style={{ marginBottom: '16px' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {DAY_NAMES.map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', padding: '4px 0' }}>
              {day}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {calendarGrid.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const isSelected = day.fullDate === selectedDate;
            return (
              <div
                key={day.fullDate}
                onClick={() => setSelectedDate(day.fullDate)}
                style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isSelected ? '800' : '600',
                  backgroundColor: isSelected ? 'var(--primary)' : (day.isToday ? '#E0E7FF' : 'transparent'),
                  color: isSelected ? '#FFFFFF' : (day.isToday ? 'var(--primary)' : '#4B5563'),
                  boxShadow: isSelected ? '0 4px 12px rgba(26,54,168,0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {day.date}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '8px 0' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280' }}>
          {(() => {
            const d = new Date(selectedDate + 'T12:00:00');
            return `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]}`;
          })()}
        </p>
        <button
          onClick={() => {
            const todayStr = today.toISOString().split('T')[0];
            setSelectedDate(todayStr);
            setCurrentMonth(today.getMonth());
            setCurrentYear(today.getFullYear());
          }}
          style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
        >
          Ir a Hoy
        </button>
      </div>

      {/* Appointments List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1B2C66' }}>Citas del Día</h3>
        <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>{appointments.length} consultas</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '13px', color: '#6B7280' }}>Cargando citas...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : appointments.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>No hay citas programadas para este día.</p>
        ) : (
          appointments.map(appt => {
            const statusColor = getStatusColor(appt.status);
            return (
              <div key={appt.id} className="card" style={{ padding: '0', display: 'flex', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                <div style={{ backgroundColor: '#EEF2FF', padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '80px', borderRight: '1px dashed #C7D2FE' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>{appt.time.split(' ')[0]}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280' }}>{appt.time.split(' ')[1]}</span>
                </div>
                <div style={{ padding: '16px', flex: 1 }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>{appt.name}</h4>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={12} /> Para: <span style={{ fontWeight: '600', color: '#4B5563' }}>{appt.doctor}</span>
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: statusColor.text, backgroundColor: statusColor.bg, padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                      {getStatusLabel(appt.status)}
                    </span>
                    {appt.phone && (
                      <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                        <Phone size={12} /> {appt.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAB - Floating Action Button */}
      <button style={{
        position: 'absolute',
        bottom: '100px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '28px',
        backgroundColor: 'var(--primary)',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: 'none',
        boxShadow: '0 8px 24px rgba(26,54,168,0.4)',
        cursor: 'pointer',
        zIndex: 50,
        transition: 'transform 0.2s ease'
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onClick={() => setIsModalOpen(true)}
      >
        <Plus size={24} />
      </button>

      {/* Bottom Sheet Modal para Nueva Cita */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            maxWidth: '414px', margin: '0 auto'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxHeight: '85vh',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '4px', margin: '0 auto', position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '12px' }}></div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66' }}>Agendar Nueva Cita</h2>
              <div onClick={() => setIsModalOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                <X size={18} color="#4B5563" />
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleAddAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>PACIENTE</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" placeholder="Nombre completo" required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>TELÉFONO DE CONTACTO</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="tel" placeholder="555-0000" required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>MÉDICO ASIGNADO</label>
                <div style={{ position: 'relative' }}>
                  <Stethoscope size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none', appearance: 'none' }} value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value})}>
                    <option value="" disabled>Seleccionar médico</option>
                    <option value="Dr. Alejandro V.">Dr. Alejandro V.</option>
                    <option value="Dra. María L.">Dra. María L.</option>
                    <option value="Dr. Silva">Dr. Silva</option>
                    <option value="Dra. Ruiz">Dra. Ruiz</option>
                    <option value="Dr. Pérez">Dr. Pérez</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>HORA</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="time" required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none' }} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B5563', letterSpacing: '0.5px', marginBottom: '8px' }}>TIPO</label>
                  <div style={{ position: 'relative' }}>
                    <FileText size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <select required style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '14px', outline: 'none', appearance: 'none' }} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="" disabled>Tipo</option>
                      <option value="Primera Vez">Primera Vez</option>
                      <option value="Seguimiento">Seguimiento</option>
                      <option value="Estudios">Estudios</option>
                      <option value="Revisión">Revisión</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                GUARDAR CITA
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default StaffSchedule;
