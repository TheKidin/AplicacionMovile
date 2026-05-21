import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User, Phone, X, Stethoscope, FileText } from 'lucide-react';

function StaffSchedule() {
  const [selectedDay, setSelectedDay] = useState(15);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados Reactivos para las Citas
  const [appointments, setAppointments] = useState([]);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    doctor: '',
    time: '',
    type: ''
  });

  const weekDays = [
    { day: 'Lun', date: 13 },
    { day: 'Mar', date: 14 },
    { day: 'Mié', date: 15 },
    { day: 'Jue', date: 16 },
    { day: 'Vie', date: 17 },
    { day: 'Sáb', date: 18 },
  ];

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
      id: Date.now(), // ID único
      time: formattedTime,
      name: formData.name,
      phone: formData.phone,
      doctor: formData.doctor,
      type: formData.type
    };

    // Añadir a la lista actual y cerrar el modal
    setAppointments([...appointments, newAppointment]);
    setIsModalOpen(false);
    
    // Limpiar el formulario
    setFormData({ name: '', phone: '', doctor: '', time: '', type: '' });
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
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Septiembre 2026</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <ChevronLeft size={20} color="#6B7280" style={{ cursor: 'pointer' }} />
          <ChevronRight size={20} color="#111827" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Week Calendar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        {weekDays.map((item, idx) => {
          const isSelected = item.date === selectedDay;
          return (
            <div 
              key={idx} 
              onClick={() => setSelectedDay(item.date)}
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', borderRadius: '16px', 
                backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#4B5563',
                boxShadow: isSelected ? '0 8px 16px rgba(26,54,168,0.2)' : '0 2px 8px rgba(0,0,0,0.02)',
                cursor: 'pointer', minWidth: '48px', transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: '600', marginBottom: '8px', color: isSelected ? '#E0E7FF' : '#9CA3AF' }}>{item.day}</span>
              <span style={{ fontSize: '16px', fontWeight: '800' }}>{item.date}</span>
            </div>
          );
        })}
      </div>

      {/* Appointments List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1B2C66' }}>Citas del Día</h3>
        <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>{appointments.length} consultas</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>
        {appointments.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>No hay citas programadas para este día.</p>
        ) : (
          appointments.map(appt => (
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
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#059669', backgroundColor: '#D1FAE5', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>{appt.type}</span>
                  <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                    <Phone size={12} /> {appt.phone}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB - Floating Action Button */}
      <button style={{
        position: 'absolute',
        bottom: '100px', // Right above the bottom nav
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
