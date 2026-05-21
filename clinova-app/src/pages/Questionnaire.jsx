import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';

// Reusable UI Comp for Yes/No
const YesNoSelector = ({ value, onChange, label }) => (
  <div style={{ marginBottom: '24px' }}>
    {label && <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>{label}</h3>}
    <div style={{ display: 'flex', gap: '16px' }}>
      <div 
        onClick={() => onChange(true)}
        style={{ flex: 1, border: value === true ? '2px solid var(--primary)' : '2px solid transparent', backgroundColor: value === true ? '#FFFFFF' : '#F3F4F6',
          borderRadius: '20px', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: value === true ? '0 4px 12px rgba(26,54,168,0.1)' : 'none'
        }}
      >
        <CheckCircle2 size={24} color={value === true ? 'var(--primary)' : '#6B7280'} style={{ marginBottom: '8px' }} />
        <span style={{ fontSize: '14px', fontWeight: '700', color: value === true ? 'var(--primary)' : '#4B5563' }}>Sí</span>
      </div>
      <div 
        onClick={() => onChange(false)}
        style={{ flex: 1, border: value === false ? '2px solid var(--primary)' : '2px solid transparent', backgroundColor: value === false ? '#FFFFFF' : '#F3F4F6',
          borderRadius: '20px', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: value === false ? '0 4px 12px rgba(26,54,168,0.1)' : 'none'
        }}
      >
        <XCircle size={24} color={value === false ? 'var(--primary)' : '#6B7280'} style={{ marginBottom: '8px' }} />
        <span style={{ fontSize: '14px', fontWeight: '700', color: value === false ? 'var(--primary)' : '#4B5563' }}>No</span>
      </div>
    </div>
  </div>
);

// Reusable Input
const TextInput = ({ label, placeholder, value, onChange, type = "text" }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#1B2C66', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</label>
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '14px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '12px', outline: 'none', fontSize: '14px' }} 
    />
  </div>
);

// Reusable Select Input
const SelectInput = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#1B2C66', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '14px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '12px', outline: 'none', fontSize: '14px', paddingRight: '40px' }} 
    >
      <option value="" disabled>Seleccione una opción</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

// Reusable Multichoice
const MultiSelector = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: '24px' }}>
    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px', lineHeight: '1.3' }}>{label}</h3>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <div key={opt} onClick={() => onChange(opt)}
          style={{ padding: '12px 16px', borderRadius: '24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
            backgroundColor: value === opt ? 'var(--primary)' : '#F3F4F6',
            color: value === opt ? 'white' : '#4B5563'
          }}>
          {opt}
        </div>
      ))}
    </div>
  </div>
);

function Questionnaire() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 10;
  
  const [formData, setFormData] = useState({
    nombre: '', edad: '', sexo: '', fechaNacimiento: '', tipoSangre: 'Desconocido', peso: '', estatura: '', telefono: '', 
    emergenciaNombre: '', emergenciaTelefono: '', emergenciaParentesco: '',
    enfCronica: null, enfCronicaNombres: '', enfCronicaDesde: '', tratamientoActual: null, tratamientoNombre: '',
    tomaMedicamento: null, medicamentosNombres: '', dosis: '', frecuencia: '',
    tieneAlergia: null, alergiaNombres: '', alergiaReaccion: '',
    tieneDiscapacidad: null, discapacidadNombre: '', requiereAsistencia: null, discapacidadAsistencia: '',
    cirugia: null, cirugiaNombre: '', cirugiaAno: '',
    enfFamiliar: null, enfFamiliarNombre: '',
    fuma: '', alcohol: '', actFisica: '', alimentacion: '',
    sintomaActual: null, sintomaNombre: '', sintomaDesde: '', dolor: 1,
    embarazada: null, fechaMenstruacion: '', anticonceptivos: null
  });

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const sections = [
    { title: 'Datos generales', desc: 'Identificación básica del paciente.' },
    { title: 'Antecedentes Personales', desc: 'Complete esta información para que su médico tenga un contexto claro de su salud general.' },
    { title: 'Medicación actual', desc: 'Indique qué medicamentos consume actualmente.' },
    { title: 'Alergias', desc: 'Indique si presenta alguna reacción adversa a medicamentos o alimentos.' },
    { title: 'Discapacidades', desc: 'Mencione cualquier condición especial o discapacidad.' },
    { title: 'Antecedentes Quirúrgicos', desc: 'Historial de cirugías previas.' },
    { title: 'Antecedentes Familiares', desc: 'Enfermedades importantes en su familia directa.' },
    { title: 'Hábitos y Estilo de Vida', desc: 'Alimentación, actividad física y consumo de sustancias.' },
    { title: 'Salud Actual', desc: 'Triage rápido de síntomas recientes.' },
    { title: 'Salud Femenina', desc: 'Información especial (mujeres).' }
  ];

  const currentSection = sections[step - 1];
  const progressPercent = Math.round((step / totalSteps) * 100);

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Guardar datos
      try {
        const user = await authService.getUser();
        if (!user) throw new Error("No estás logueado.");

        const [firstName, ...lastNames] = formData.nombre.split(' ');
        const lastName = lastNames.join(' ') || 'N/A';
        
        await patientService.createPatient({
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: formData.fechaNacimiento || null,
          gender: formData.sexo || null,
          phone: formData.telefono || null,
          blood_type: formData.tipoSangre || null,
          allergies: formData.tieneAlergia ? `${formData.alergiaNombres} (Reacción: ${formData.alergiaReaccion})` : 'Ninguna',
          clinical_history: formData
        });
        
        toast.success('Historial guardado correctamente.');
        navigate('/records');
      } catch (err) {
        console.error("Error detallado:", err);
        toast.error(`Hubo un error al guardar tu historial: ${err.message || JSON.stringify(err)}`);
      }
    }
  };

  const handleSkip = () => {
    if (step < totalSteps) setStep(step + 1);
    else navigate('/records');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F7F9FC' }}>
      
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => navigate('/records')}>
          <ArrowLeft size={24} color="#1B2C66" />
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1B2C66' }}>Historial Clínico</h2>
        </div>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" style={{ width: '100%' }} />
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#1B2C66', letterSpacing: '0.5px' }}>PASO {step} DE {totalSteps}</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66' }}>{progressPercent}%</span>
        </div>
        <div style={{ height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: 'var(--primary-light)', borderRadius: '2px', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Form Content */}
      <div style={{ padding: '32px 24px', flex: 1, overflowY: 'auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1B2C66', marginBottom: '12px', lineHeight: '1.2' }}>{currentSection.title}</h1>
        <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '32px', lineHeight: '1.5' }}>{currentSection.desc}</p>

        <div className="card" style={{ padding: '24px 20px', border: 'none' }}>
        
          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TextInput label="Nombre completo" value={formData.nombre} onChange={v => updateForm('nombre', v)} placeholder="Escribe tu nombre" />
              <TextInput label="Edad" value={formData.edad} onChange={v => updateForm('edad', v)} placeholder="Años" type="number" />
              <MultiSelector label="Sexo" value={formData.sexo} onChange={v => updateForm('sexo', v)} options={['Masculino', 'Femenino', 'Otro']} />
              <TextInput label="Fecha de Nacimiento" value={formData.fechaNacimiento} onChange={v => updateForm('fechaNacimiento', v)} type="date" />
              <SelectInput label="Tipo de sangre" value={formData.tipoSangre} onChange={v => updateForm('tipoSangre', v)} options={['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Desconocido']} />
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <TextInput label="Peso" value={formData.peso} onChange={v => updateForm('peso', v)} placeholder="Ej: 70kg" />
                </div>
                <div style={{ flex: 1 }}>
                  <TextInput label="Estatura" value={formData.estatura} onChange={v => updateForm('estatura', v)} placeholder="Ej: 1.75m" />
                </div>
              </div>

              <TextInput label="Teléfono personal" value={formData.telefono} onChange={v => updateForm('telefono', v)} placeholder="Tu número principal" type="tel" />
              
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', margin: '16px 0 12px', textTransform: 'uppercase' }}>Contacto de Emergencia</h3>
              <TextInput label="Nombre del contacto" value={formData.emergenciaNombre} onChange={v => updateForm('emergenciaNombre', v)} placeholder="Nombre del familiar o amigo" />
              <TextInput label="Número de teléfono" value={formData.emergenciaTelefono} onChange={v => updateForm('emergenciaTelefono', v)} placeholder="Celular" type="tel" />
              <SelectInput label="Parentesco" value={formData.emergenciaParentesco} onChange={v => updateForm('emergenciaParentesco', v)} options={['Padre/Madre', 'Pareja/Cónyuge', 'Hijo/a', 'Hermano/a', 'Amigo/a', 'Otro']} />
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <YesNoSelector label="¿Tiene alguna enfermedad crónica?" value={formData.enfCronica} onChange={v => updateForm('enfCronica', v)} />
              {formData.enfCronica && (
                <>
                  <TextInput label="¿Cuál(es) enfermedad(es)?" value={formData.enfCronicaNombres} onChange={v => updateForm('enfCronicaNombres', v)} placeholder="Ej: Diabetes, Hipertensión..." />
                  <TextInput label="¿Desde cuándo padece esta(s) enfermedad(es)?" value={formData.enfCronicaDesde} onChange={v => updateForm('enfCronicaDesde', v)} placeholder="Año o tiempo estimado" />
                  <YesNoSelector label="¿Actualmente recibe tratamiento?" value={formData.tratamientoActual} onChange={v => updateForm('tratamientoActual', v)} />
                  {formData.tratamientoActual && (
                    <TextInput label="¿Qué tratamiento utiliza?" value={formData.tratamientoNombre} onChange={v => updateForm('tratamientoNombre', v)} placeholder="Describa el tratamiento y uso" />
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <YesNoSelector label="¿Toma algún medicamento actualmente?" value={formData.tomaMedicamento} onChange={v => updateForm('tomaMedicamento', v)} />
              {formData.tomaMedicamento && (
                <>
                  <TextInput label="¿Cuál(es)?" value={formData.medicamentosNombres} onChange={v => updateForm('medicamentosNombres', v)} placeholder="Nombre del medicamento" />
                  <TextInput label="Dosis (opcional)" value={formData.dosis} onChange={v => updateForm('dosis', v)} placeholder="Ej: 500mg" />
                  <TextInput label="Frecuencia de uso" value={formData.frecuencia} onChange={v => updateForm('frecuencia', v)} placeholder="Ej: Cada 8 horas" />
                </>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <YesNoSelector label="¿Tiene alguna alergia?" value={formData.tieneAlergia} onChange={v => updateForm('tieneAlergia', v)} />
              {formData.tieneAlergia && (
                <>
                  <TextInput label="¿A qué es alérgico?" value={formData.alergiaNombres} onChange={v => updateForm('alergiaNombres', v)} placeholder="(medicamentos, alimentos, ambiente)" />
                  <TextInput label="¿Qué reacción presenta?" value={formData.alergiaReaccion} onChange={v => updateForm('alergiaReaccion', v)} placeholder="Ej: Erupción cutánea, dificultad respiratoria" />
                </>
              )}
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div>
              <YesNoSelector label="¿Tiene alguna discapacidad o condición especial?" value={formData.tieneDiscapacidad} onChange={v => updateForm('tieneDiscapacidad', v)} />
              {formData.tieneDiscapacidad && (
                <>
                  <TextInput label="¿Cuál?" value={formData.discapacidadNombre} onChange={v => updateForm('discapacidadNombre', v)} placeholder="Describa su condición" />
                  <YesNoSelector label="¿Requiere asistencia especial?" value={formData.requiereAsistencia} onChange={v => updateForm('requiereAsistencia', v)} />
                  {formData.requiereAsistencia && (
                    <TextInput label="¿Qué asistencia especial necesita?" value={formData.discapacidadAsistencia} onChange={v => updateForm('discapacidadAsistencia', v)} placeholder="Ej: Silla de ruedas, intérprete de señas, etc." />
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <div>
              <YesNoSelector label="¿Ha sido sometido(a) a alguna cirugía?" value={formData.cirugia} onChange={v => updateForm('cirugia', v)} />
              {formData.cirugia && (
                <>
                  <TextInput label="¿Cuál(es)?" value={formData.cirugiaNombre} onChange={v => updateForm('cirugiaNombre', v)} placeholder="Nombre de la operación" />
                  <TextInput label="¿En qué año?" value={formData.cirugiaAno} onChange={v => updateForm('cirugiaAno', v)} placeholder="Ej: 2015" />
                </>
              )}
            </div>
          )}

          {/* STEP 7 */}
          {step === 7 && (
            <div>
              <YesNoSelector label="¿Algún familiar directo tiene enfermedades importantes?" value={formData.enfFamiliar} onChange={v => updateForm('enfFamiliar', v)} />
              {formData.enfFamiliar && (
                <TextInput label="¿Cuál(es)?" value={formData.enfFamiliarNombre} onChange={v => updateForm('enfFamiliarNombre', v)} placeholder="Ej: diabetes, hipertensión, cáncer, cardíacas" />
              )}
            </div>
          )}

          {/* STEP 8 */}
          {step === 8 && (
            <div>
              <MultiSelector label="¿Fuma?" value={formData.fuma} onChange={v => updateForm('fuma', v)} options={['Sí', 'No', 'Ocasional']} />
              <MultiSelector label="¿Consume alcohol?" value={formData.alcohol} onChange={v => updateForm('alcohol', v)} options={['Sí', 'No', 'Ocasional']} />
              <MultiSelector label="¿Realiza actividad física?" value={formData.actFisica} onChange={v => updateForm('actFisica', v)} options={['Sí', 'No']} />
              <MultiSelector label="¿Cómo es su alimentación?" value={formData.alimentacion} onChange={v => updateForm('alimentacion', v)} options={['Buena', 'Regular', 'Mala']} />
            </div>
          )}

          {/* STEP 9 */}
          {step === 9 && (
            <div>
              <YesNoSelector label="¿Presenta algún síntoma actualmente?" value={formData.sintomaActual} onChange={v => updateForm('sintomaActual', v)} />
              {formData.sintomaActual && (
                <>
                  <TextInput label="¿Cuál(es)?" value={formData.sintomaNombre} onChange={v => updateForm('sintomaNombre', v)} placeholder="Ej: Dolor de cabeza, fiebre..." />
                  <TextInput label="¿Desde cuándo?" value={formData.sintomaDesde} onChange={v => updateForm('sintomaDesde', v)} placeholder="Ej: Hace 3 días" />
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#1B2C66', letterSpacing: '1px', marginBottom: '8px' }}>INTENSIDAD DEL DOLOR: {formData.dolor}</label>
                    <input type="range" min="1" max="10" value={formData.dolor} onChange={e => updateForm('dolor', e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                      <span>1 (Leve)</span><span>10 (Severo)</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 10 */}
          {step === 10 && (
            <div>
              <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '24px', fontStyle: 'italic', backgroundColor: '#FEE2E2', padding: '12px', borderRadius: '8px' }}>
                *Esta sección es opcional y está dirigida a pacientes mujeres.
              </p>
              <YesNoSelector label="¿Está embarazada?" value={formData.embarazada} onChange={v => updateForm('embarazada', v)} />
              <TextInput label="Fecha de última menstruación" value={formData.fechaMenstruacion} onChange={v => updateForm('fechaMenstruacion', v)} type="date" />
              <YesNoSelector label="¿Usa anticonceptivos?" value={formData.anticonceptivos} onChange={v => updateForm('anticonceptivos', v)} />
            </div>
          )}

        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ padding: '24px', backgroundColor: '#F7F9FC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={handleSkip} style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: '700', color: '#1B2C66', cursor: 'pointer', padding: '12px' }}>
          {step === 10 ? 'Saltar' : 'Omitir'}
        </button>
        <button onClick={handleNext} className="btn-primary" style={{ width: 'auto', padding: '16px 24px', whiteSpace: 'nowrap' }}>
          {step === 10 ? 'Finalizar' : 'Siguiente'} <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}

export default Questionnaire;
