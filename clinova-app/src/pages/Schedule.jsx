import React, { useState, useEffect } from 'react';
import { ArrowLeft, Video, Building2, Stethoscope, HeartPulse, Baby, CheckCircle2, Clock, CalendarDays, UserSquare2, ChevronRight, Activity, Eye, TestTube, Users, Smile, AlertTriangle, MapPin, CreditCard, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { authService } from '../services/authService';
import { clinicService } from '../services/clinicService';

// --- SHARED UI COMPONENTS ---
const YesNoSelector = ({ value, onChange, label }) => (
  <div style={{ marginBottom: '24px' }}>
    {label && <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', marginBottom: '16px', textTransform: 'uppercase' }}>{label}</h3>}
    <div style={{ display: 'flex', gap: '16px' }}>
      <div onClick={() => onChange(true)}
        style={{ flex: 1, padding: '12px 0', border: value === true ? '2px solid var(--primary)' : '2px solid transparent', backgroundColor: value === true ? '#FFFFFF' : '#F3F4F6', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: value === true ? '0 4px 12px rgba(26,54,168,0.1)' : 'none' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: value === true ? 'var(--primary)' : '#4B5563' }}>Sí</span>
      </div>
      <div onClick={() => onChange(false)}
        style={{ flex: 1, padding: '12px 0', border: value === false ? '2px solid var(--primary)' : '2px solid transparent', backgroundColor: value === false ? '#FFFFFF' : '#F3F4F6', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: value === false ? '0 4px 12px rgba(26,54,168,0.1)' : 'none' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: value === false ? 'var(--primary)' : '#4B5563' }}>No</span>
      </div>
    </div>
  </div>
);

const TextInput = ({ label, placeholder, value, onChange, type = "text" }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#1B2C66', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</label>}
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '14px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '12px', outline: 'none', fontSize: '14px' }} 
    />
  </div>
);

const MultiSelector = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: '24px' }}>
    <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', marginBottom: '12px', textTransform: 'uppercase' }}>{label}</h3>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <div key={opt} onClick={() => onChange(opt)}
          style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: value === opt ? 'var(--primary)' : '#F3F4F6', color: value === opt ? 'white' : '#4B5563' }}>
          {opt}
        </div>
      ))}
    </div>
  </div>
);

const ChecklistSelector = ({ label, values, onChange, options }) => (
  <div style={{ marginBottom: '24px' }}>
    <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', marginBottom: '12px', textTransform: 'uppercase' }}>{label}</h3>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const isSelected = values.includes(opt);
        return (
          <div key={opt} onClick={() => onChange(isSelected ? values.filter(v => v !== opt) : [...values, opt])}
            style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', backgroundColor: isSelected ? 'var(--secondary)' : '#F3F4F6', color: isSelected ? '#064E3B' : '#4B5563' }}>
            {opt}
          </div>
        );
      })}
    </div>
  </div>
);


function Schedule() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modality, setModality] = useState(null); 
  const [clinic, setClinic] = useState(null);
  const [specialty, setSpecialty] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [realClinics, setRealClinics] = useState([]);
  const [realDoctors, setRealDoctors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cData = await clinicService.getClinics();
        setRealClinics(cData || []);

        const dData = await authService.getUsersByRole('DOCTOR');
        setRealDoctors(dData || []);
      } catch (e) {
        console.error("Error fetching scheduling data:", e);
      }
    };
    fetchData();
  }, []);

  const [triage, setTriage] = useState({
    motivo: '',
    tieneSintomas: null, sintomasNombres: '', sintomasDesde: '', sintomasInicio: '', intensidad: 1,
    localizacion: '', irradia: '', empeora: '', mejora: '',
    acompanantes: [],
    alarma: [],
    evolucion: '',
    medicamentoPrevio: null, medicamentoNombre: '', otroMedico: null
  });

  const updateTriage = (key, value) => {
    setTriage(prev => ({ ...prev, [key]: value }));
  };

  const specialties = [
    { id: 'general', name: 'Med. General', icon: Stethoscope },
    { id: 'familiar', name: 'Med. Familiar', icon: Users },
    { id: 'pediatria', name: 'Pediatría', icon: Baby },
    { id: 'ginecologia', name: 'Ginecología', icon: UserSquare2 },
    { id: 'dermatologia', name: 'Dermatología', icon: Smile },
    { id: 'psicologia', name: 'Psicología', icon: Activity },
    { id: 'nutricion', name: 'Nutrición', icon: Activity },
    { id: 'traumatologia', name: 'Traumatología', icon: Activity },
    { id: 'odontologia', name: 'Odontología', icon: Smile },
    { id: 'oftalmologia', name: 'Oftalmología', icon: Eye },
    { id: 'laboratorio', name: 'Lab. Clínico', icon: TestTube }
  ];

  const displayedDoctors = realDoctors
    .filter(d => {
      const specSlug = d.specialty?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return specSlug === specialty;
    })
    .map(doc => ({
      id: doc.id,
      name: `Dr. ${doc.first_name} ${doc.last_name}`,
      specialty: doc.specialty || 'Médico General',
      cedula: doc.license_number || 'En trámite',
      clinic: 'CLINOVA Central',
      duration: '30 min',
      valoration: 5.0,
      avatar: 'Doctor',
      cost: '$40.00',
      profile: 'Especialista clínico.',
      tags: ['Disponible hoy']
    }));

  const generateCalendarDays = () => {
    const days = [];
    const date = new Date();
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 0; i < 3; i++) {
      days.push({
        label: i === 0 ? 'Hoy' : dayNames[date.getDay()],
        date: `${date.getDate()} ${monthNames[date.getMonth()]}`,
        fulldate: date.toISOString().split('T')[0]
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };
  const calendarDays = generateCalendarDays();

  const timeSlots = [
    { time: '09:00 AM', status: 'available' },
    { time: '09:30 AM', status: 'available' },
    { time: '10:00 AM', status: 'available' }, 
    { time: '11:00 AM', status: 'available' },
    { time: '11:30 AM', status: 'available' },
    { time: '02:00 PM', status: 'available' },
    { time: '03:15 PM', status: 'available' },
    { time: '04:00 PM', status: 'available' },
  ];

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleConfirm = async () => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para agendar una cita.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Obtener el paciente actual
      const patient = await patientService.getPatientByEmail(currentUser.email);
      if (!patient) {
        toast.error("Por favor completa tu historial clínico antes de agendar.");
        navigate('/questionnaire');
        return;
      }

      // 2. Formatear la fecha para postgres (Y-M-D)
      const dateObj = new Date(selectedDate.fulldate);
      const dateForDb = dateObj.toISOString().split('T')[0];

      // 3. Convertir la hora (Ej. 09:00 AM -> 09:00:00)
      const isPM = selectedTime.includes('PM');
      const timeParts = selectedTime.replace(' AM', '').replace(' PM', '').split(':');
      let hours = parseInt(timeParts[0]);
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      const timeForDb = `${hours.toString().padStart(2, '0')}:${timeParts[1]}:00`;

      // 4. Guardar en Supabase
      const appointmentDetails = {
        doctorName: doctor?.name || 'Doctor Asignado',
        specialty: doctor?.specialty || 'Medicina General',
        clinicContent: modality === 'telemedicina' ? 'Videoconsulta (Enlace Seguro)' : (doctor?.clinic || 'CLINOVA Central'),
        triage: triage,
        modality: modality
      };

      await appointmentService.createAppointment({
        patient_id: patient.id,
        date: dateForDb,
        time: timeForDb,
        notes: JSON.stringify(appointmentDetails)
      });

      toast.success('¡Cita agendada exitosamente!');
      navigate('/home'); 

    } catch (error) {
      console.error("Error al agendar:", error);
      toast.error("Hubo un error al agendar tu cita.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = (text, desc) => (
    <div style={{ marginBottom: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1B2C66', marginBottom: '8px', lineHeight: '1.2' }}>{text}</h1>
      {desc && <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.4' }}>{desc}</p>}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F7F9FC' }}>
      
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => step === 1 ? navigate('/home') : setStep(step - 1)}>
          <ArrowLeft size={24} color="#1B2C66" />
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1B2C66' }}>
            {step === 6 ? 'Confirmar Cita' : `Paso ${step} de 5`}
          </h2>
        </div>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        
        {/* STEP 1: MODALITY AND CLINIC */}
        {step === 1 && (
          <div>
            {title('Buscas atención médica', 'Selecciona el formato en el que deseas ser atendido.')}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <div onClick={() => { setModality('telemedicina'); setClinic(null); }}
                style={{ flex: 1, border: modality === 'telemedicina' ? '2px solid var(--primary)' : '2px solid transparent', backgroundColor: modality === 'telemedicina' ? '#FFFFFF' : '#F3F4F6', borderRadius: '20px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: modality === 'telemedicina' ? '#E0E7FF' : '#E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
                  <Video size={24} color={modality === 'telemedicina' ? 'var(--primary)' : '#6B7280'} />
                </div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: modality === 'telemedicina' ? 'var(--primary)' : '#4B5563' }}>Telemedicina</span>
              </div>
              
              <div onClick={() => setModality('presencial')}
                style={{ flex: 1, border: modality === 'presencial' ? '2px solid var(--primary)' : '2px solid transparent', backgroundColor: modality === 'presencial' ? '#FFFFFF' : '#F3F4F6', borderRadius: '20px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: modality === 'presencial' ? '#E0E7FF' : '#E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
                  <Building2 size={24} color={modality === 'presencial' ? 'var(--primary)' : '#6B7280'} />
                </div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: modality === 'presencial' ? 'var(--primary)' : '#4B5563' }}>Presencial</span>
              </div>
            </div>

            {modality === 'presencial' && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', marginBottom: '16px', letterSpacing: '0.5px' }}>CLÍNICAS DISPONIBLES</h3>
                {realClinics.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>No hay clínicas registradas.</p>
                ) : realClinics.map(c => (
                  <div key={c.id} onClick={() => setClinic(c.id)} className="card" style={{ border: clinic === c.id ? '2px solid var(--primary)' : '2px solid transparent', padding: '16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{c.name}</h4>
                      <p style={{ fontSize: '12px', color: '#6B7280' }}>{c.address}</p>
                    </div>
                    <div>{clinic === c.id ? <CheckCircle2 size={20} color="var(--primary)" /> : <div style={{width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #D1D5DB'}} />}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SPECIALTY */}
        {step === 2 && (
          <div>
            {title('¿Qué especialidad buscas?', 'Filtrar médicos por su área clínica.')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '12px' }}>
              {specialties.map(spec => (
                <div key={spec.id} onClick={() => setSpecialty(spec.id)} className="card" 
                  style={{ border: specialty === spec.id ? '2px solid var(--primary)' : '2px solid transparent', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: specialty === spec.id ? '#1A36A810' : '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px' }}>
                    <spec.icon size={20} color={specialty === spec.id ? 'var(--primary)' : '#6B7280'} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: specialty === spec.id ? 'var(--primary)' : '#4B5563' }}>{spec.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: DOCTORS */}
        {step === 3 && (
          <div>
            {title('Médicos disponibles', 'Basados en tus preferencias y disponibilidad.')}
            <div>
              {displayedDoctors.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', padding: '32px 16px' }}>No hay médicos registrados para esta especialidad.</p>
              ) : (
              displayedDoctors.map(doc => (
                <div key={doc.id} onClick={() => setDoctor(doc)} className="card" style={{ border: doctor?.id === doc.id ? '2px solid var(--primary)' : '2px solid transparent', padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer', overflow: 'hidden' }}>
                  
                  {/* Foto, Nombre, Titulo, Valoracion */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#E0E7FF', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.avatar}`} alt="doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1B2C66', marginBottom: '2px', lineHeight: '1.2' }}>{doc.name}</h4>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '10px', flexShrink: 0 }}>★ {doc.valoration}</span>
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary-light)', margin: '0 0 2px' }}>{doc.specialty}</p>
                      <p style={{ fontSize: '11px', color: '#6B7280' }}>Cédula: {doc.cedula}</p>
                    </div>
                  </div>

                  {/* Dynamic Tags */}
                  {doc.tags && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {doc.tags.map(tag => (
                        <span key={tag} style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: '8px', letterSpacing: '0.5px' }}>{tag.toUpperCase()}</span>
                      ))}
                    </div>
                  )}

                  {/* Info Blocks */}
                  <div style={{ backgroundColor: '#F3F4F6', borderRadius: '12px', padding: '12px', fontSize: '12px', color: '#4B5563', fontStyle: 'italic', lineHeight: '1.5' }}>
                    "{doc.profile}"
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>Clínica</p>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{doc.clinic}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>Duración prom.</p>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} color="#6B7280" /> {doc.duration}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' }}>Costo</p>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>{doc.cost}</p>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        )}

        {/* STEP 4: DATE AND TIME */}
        {step === 4 && (
          <div>
            {title('Seleccionar Horario', 'Las disponibilidades son mostradas en tiempo real.')}
            
            <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#1B2C66', marginBottom: '16px', letterSpacing: '0.5px' }}>DÍAS DISPONIBLES</h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
              {calendarDays.map(day => (
                <div key={day.date} onClick={() => {setSelectedDate(day); setSelectedTime(null);}} 
                  style={{ minWidth: '80px', flexShrink: 0, border: selectedDate?.date === day.date ? '2px solid var(--primary)' : '1px solid #E5E7EB', backgroundColor: selectedDate?.date === day.date ? 'var(--primary)' : '#FFFFFF', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selectedDate?.date === day.date ? '0 4px 12px rgba(26,54,168,0.2)' : 'none' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: selectedDate?.date === day.date ? '#E0E7FF' : '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>{day.label}</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: selectedDate?.date === day.date ? '#FFFFFF' : '#111827' }}>{day.date.split(' ')[0]}</span>
                </div>
              ))}
            </div>

            {selectedDate && (
              <div style={{ animation: 'fadeIn 0.3s' }}>
                <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#1B2C66', marginBottom: '16px', letterSpacing: '0.5px' }}>HORARIOS ({selectedDate.date})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {timeSlots.map(slot => {
                    const isOccupied = slot.status === 'occupied';
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button key={slot.time} onClick={() => !isOccupied && setSelectedTime(slot.time)} disabled={isOccupied}
                        style={{ padding: '12px 6px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: isOccupied ? 'not-allowed' : 'pointer',
                          backgroundColor: isOccupied ? '#F3F4F6' : (isSelected ? 'var(--primary)' : '#FFFFFF'),
                          color: isOccupied ? '#9CA3AF' : (isSelected ? '#FFFFFF' : '#1B2C66'),
                          border: isSelected ? '2px solid var(--primary)' : (isOccupied ? '2px solid #F3F4F6' : '2px solid #E5E7EB'),
                          transition: 'all 0.2s', opacity: isOccupied ? 0.6 : 1
                        }}>
                        {slot.time}
                        {isOccupied && <span style={{display:'block', fontSize: '10px', marginTop: '2px', fontWeight: '600'}}>Ocupado</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: PRE-CONSULTA (TRIAGE) */}
        {step === 5 && (
          <div>
            {title('Motivo de Consulta', 'Responda estas breves preguntas clínicas para un pronto diagnóstico.')}
            
            <div className="card" style={{ padding: '24px 20px', border: 'none' }}>
              <TextInput label="1. ¿Cuál es el motivo de su consulta?" value={triage.motivo} onChange={v => updateTriage('motivo', v)} placeholder="Describa brevemente qué le sucede" />
              
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', marginBottom: '16px', textTransform: 'uppercase' }}>2. Síntomas Actuales</h3>
                <YesNoSelector label="¿Presenta algún síntoma actualmente?" value={triage.tieneSintomas} onChange={v => updateTriage('tieneSintomas', v)} />
                {triage.tieneSintomas && (
                  <>
                    <TextInput label="¿Cuáles?" value={triage.sintomasNombres} onChange={v => updateTriage('sintomasNombres', v)} placeholder="Ej: Dolor, fiebre, tos, etc." />
                    <TextInput label="¿Desde cuándo presenta estos síntomas?" value={triage.sintomasDesde} onChange={v => updateTriage('sintomasDesde', v)} placeholder="Ej: Hace 2 días" />
                    <MultiSelector label="¿Cómo iniciaron los síntomas?" value={triage.sintomasInicio} onChange={v => updateTriage('sintomasInicio', v)} options={['Súbito', 'Gradual']} />
                    
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#1B2C66', letterSpacing: '1px', marginBottom: '8px' }}>¿A QUÉ INTENSIDAD? (Escala 1 al 10): {triage.intensidad}</label>
                      <input type="range" min="1" max="10" value={triage.intensidad} onChange={e => updateTriage('intensidad', e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                        <span>1 (Leve)</span><span>10 (Severo)</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', marginBottom: '16px', textTransform: 'uppercase', marginTop: '32px' }}>3. Características</h3>
                    <TextInput label="¿Dónde se localiza el síntoma?" value={triage.localizacion} onChange={v => updateTriage('localizacion', v)} placeholder="Zona específica del cuerpo" />
                    <TextInput label="¿El síntoma se irradia o se mueve a otra zona?" value={triage.irradia} onChange={v => updateTriage('irradia', v)} placeholder="Escriba aquí..." />
                    <TextInput label="¿Qué lo empeora?" value={triage.empeora} onChange={v => updateTriage('empeora', v)} placeholder="Ej: Al toser, al comer..." />
                    <TextInput label="¿Qué lo mejora?" value={triage.mejora} onChange={v => updateTriage('mejora', v)} placeholder="Ej: Al descansar..." />

                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', marginBottom: '16px', textTransform: 'uppercase', marginTop: '32px' }}>4. Síntomas Acompañantes</h3>
                    <ChecklistSelector label="¿Presenta adicionalmente alguno de estos?" values={triage.acompanantes} onChange={v => updateTriage('acompanantes', v)} options={['Fiebre', 'Náuseas / Vómito', 'Mareo', 'Dificultad para respirar', 'Dolor de cabeza']} />

                    <div style={{ padding: '16px', backgroundColor: '#FEF2F2', borderRadius: '16px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <AlertTriangle size={20} color="#DC2626" />
                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#991B1B', textTransform: 'uppercase' }}>5. Signos de Alarma</h3>
                      </div>
                      <ChecklistSelector label="¿Tiene algún signo grave actual?" values={triage.alarma} onChange={v => updateTriage('alarma', v)} options={['Dolor intenso en pecho', 'Pérdida del conocimiento', 'Sangrado abundante', 'Convulsiones']} />
                    </div>

                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', marginBottom: '16px', textTransform: 'uppercase', marginTop: '32px' }}>6. Evolución</h3>
                    <MultiSelector label="¿Cómo han evolucionado?" value={triage.evolucion} onChange={v => updateTriage('evolucion', v)} options={['Ha empeorado', 'Sigue igual', 'Ha mejorado']} />
                  </>
                )}

                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', marginBottom: '16px', textTransform: 'uppercase', marginTop: '32px' }}>7. Acciones Previas</h3>
                <YesNoSelector label="¿Ha tomado algún medicamento para este problema?" value={triage.medicamentoPrevio} onChange={v => updateTriage('medicamentoPrevio', v)} />
                {triage.medicamentoPrevio && (
                  <TextInput label="¿Cuál(es) medicamentos?" value={triage.medicamentoNombre} onChange={v => updateTriage('medicamentoNombre', v)} />
                )}
                <YesNoSelector label="¿Ha consultado a otro médico por esto?" value={triage.otroMedico} onChange={v => updateTriage('otroMedico', v)} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: SUMMARY & CONFIRM */}
        {step === 6 && (
          <div>
            <div style={{ backgroundColor: '#E0E7FF', padding: '24px', borderRadius: '24px', textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(26,54,168,0.1)' }}>
                <CalendarDays size={40} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', marginBottom: '8px' }}>{selectedDate?.date}</h2>
              <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>{selectedTime}</p>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#064E3B', backgroundColor: '#30E3C2', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>
                {modality === 'telemedicina' ? 'Videoconsulta' : 'Cita Presencial'}
              </span>
            </div>

            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#9CA3AF', letterSpacing: '1px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>DETALLES DEL SERVICIO</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <UserSquare2 size={24} color="#6B7280" />
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>Doctor a ver</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{doctor?.name}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Stethoscope size={24} color="#6B7280" />
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>Especialidad</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', textTransform: 'capitalize' }}>{doctor?.specialty}</p>
                </div>
              </div>

              {modality === 'presencial' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginTop: '8px' }}>
                    <MapPin size={24} color="#6B7280" />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>Clínica</p>
                        <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>a 2.5 km de ti</p>
                      </div>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{doctor?.clinic}</p>
                      <div style={{ width: '100%', height: '100px', backgroundColor: '#E5E7EB', borderRadius: '12px', background: 'url("https://api.dicebear.com/7.x/identicon/svg?seed=Map")', overflow: 'hidden', position: 'relative', border: '1px solid #D1D5DB' }}>
                        <div style={{position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)'}}></div>
                        <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display:'flex', flexDirection:'column', alignItems:'center'}}>
                           <MapPin size={28} color="#DC2626" fill="white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#9CA3AF', letterSpacing: '1px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginTop: '8px' }}>PAGO Y SEGUROS</h3>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <CreditCard size={24} color="#6B7280" flexShrink={0} />
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>Métodos de pago aceptados</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize:'10px', fontWeight:'700', backgroundColor: '#F3F4F6', padding:'4px 8px', borderRadius:'6px', color:'#4B5563' }}>Tarjetas Crédito/Débito</span>
                    <span style={{ fontSize:'10px', fontWeight:'700', backgroundColor: '#F3F4F6', padding:'4px 8px', borderRadius:'6px', color:'#4B5563' }}>Efectivo</span>
                    <span style={{ fontSize:'10px', fontWeight:'700', backgroundColor: '#F3F4F6', padding:'4px 8px', borderRadius:'6px', color:'#4B5563' }}>Transferencia</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <ShieldCheck size={24} color="#6B7280" flexShrink={0} />
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>Seguros Médicos Asociados</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize:'10px', fontWeight:'700', color:'#064E3B', backgroundColor: '#D1FAE5', padding:'4px 8px', borderRadius:'6px' }}>Seguro AXA</span>
                    <span style={{ fontSize:'10px', fontWeight:'700', color:'#1E3A8A', backgroundColor: '#DBEAFE', padding:'4px 8px', borderRadius:'6px' }}>GNP</span>
                    <span style={{ fontSize:'10px', fontWeight:'700', color:'#7C2D12', backgroundColor: '#FFEDD5', padding:'4px 8px', borderRadius:'6px' }}>MetLife</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Footer / Nav Actions */}
      <div style={{ padding: '20px 24px', backgroundColor: 'white', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center' }}>
        {step < 6 ? (
          <button 
            onClick={handleNext} 
            disabled={(step===1 && (!modality || (modality==='presencial' && !clinic))) || (step===2 && !specialty) || (step===3 && !doctor) || (step===4 && !selectedTime) || (step===5 && !triage.motivo)}
            className="btn-primary" 
            style={{ width: '100%', opacity: ((step===1 && (!modality || (modality==='presencial' && !clinic))) || (step===2 && !specialty) || (step===3 && !doctor) || (step===4 && !selectedTime) || (step===5 && !triage.motivo)) ? 0.5 : 1 }}>
            Siguiente Paso <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={handleConfirm} disabled={isSubmitting} className="btn-primary" style={{ width: '100%', backgroundColor: '#30E3C2', background: '#30E3C2', color: '#064E3B', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'AGENDANDO...' : 'CONFIRMAR CITA'} <CheckCircle2 size={18} />
          </button>
        )}
      </div>

    </div>
  );
}

export default Schedule;
