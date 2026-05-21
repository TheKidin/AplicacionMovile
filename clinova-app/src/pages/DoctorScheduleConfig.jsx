import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function DoctorScheduleConfig() {
  const navigate = useNavigate();
  const [days, setDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  });

  const toggleDay = (day) => {
    setDays({ ...days, [day]: !days[day] });
  };

  const handleSave = () => {
    alert('Horarios actualizados correctamente.');
    navigate(-1);
  };

  const dayNames = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Horarios de Consulta</h1>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
          <Clock size={40} color="#D97706" />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>Configura tu Disponibilidad</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, padding: '0 16px', lineHeight: '1.5' }}>Selecciona los días y el rango de horas en los que estarás disponible para citas.</p>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="#4B5563" /> Días de Trabajo
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {dayNames.map((d) => (
            <div key={d.key} onClick={() => toggleDay(d.key)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: days[d.key] ? '#EEF2FF' : '#F3F4F6', borderRadius: '12px', cursor: 'pointer', border: days[d.key] ? '1px solid #C7D2FE' : '1px solid transparent' }}>
              <span style={{ fontSize: '14px', fontWeight: days[d.key] ? '700' : '500', color: days[d.key] ? '#1D4ED8' : '#4B5563' }}>{d.label}</span>
              {days[d.key] && <CheckCircle2 size={18} color="#1D4ED8" />}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#4B5563" /> Rango de Horario Base
        </h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', marginBottom: '8px' }}>DESDE</label>
            <input type="time" defaultValue="08:00" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '14px', fontWeight: '600' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', marginBottom: '8px' }}>HASTA</label>
            <input type="time" defaultValue="16:00" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '14px', fontWeight: '600' }} />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary" style={{ width: '100%' }}>
        GUARDAR HORARIOS
      </button>
    </div>
  );
}

export default DoctorScheduleConfig;
