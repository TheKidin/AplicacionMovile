import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, CheckCircle2, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';

function DoctorScheduleConfig() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [days, setDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  });

  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');

  // Cargar horario existente del perfil del doctor
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        if (currentUser) {
          const profile = await authService.getProfile(currentUser.id);
          if (profile) {
            if (profile.schedule_start) setStartTime(profile.schedule_start);
            if (profile.schedule_end) setEndTime(profile.schedule_end);
            if (profile.schedule_days) {
              try {
                const savedDays = typeof profile.schedule_days === 'string' 
                  ? JSON.parse(profile.schedule_days) 
                  : profile.schedule_days;
                setDays(prev => ({ ...prev, ...savedDays }));
              } catch {
                // Usar valores por defecto si no se puede parsear
              }
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar horario:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, [currentUser]);

  const toggleDay = (day) => {
    setDays({ ...days, [day]: !days[day] });
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('No se encontró usuario autenticado.');
      return;
    }

    // Validar que la hora de fin sea mayor que la de inicio
    if (endTime <= startTime) {
      toast.error('La hora de fin debe ser mayor que la hora de inicio.');
      return;
    }

    setSaving(true);
    try {
      await authService.updateProfile(currentUser.id, {
        schedule_start: startTime,
        schedule_end: endTime,
        schedule_days: JSON.stringify(days)
      });
      toast.success('¡Horarios actualizados correctamente!');
      navigate(-1);
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      toast.error('Error al guardar los horarios. Verifica que los campos existan en la base de datos.');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loader size={32} className="spinner" color="var(--primary)" />
      </div>
    );
  }

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
            <input 
              type="time" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '14px', fontWeight: '600' }} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', marginBottom: '8px' }}>HASTA</label>
            <input 
              type="time" 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', fontSize: '14px', fontWeight: '600' }} 
            />
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '12px', fontStyle: 'italic' }}>
          Horario actual: {startTime} - {endTime}
        </p>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ width: '100%', opacity: saving ? 0.7 : 1 }}>
        {saving ? 'GUARDANDO...' : 'GUARDAR HORARIOS'}
      </button>
    </div>
  );
}

export default DoctorScheduleConfig;
