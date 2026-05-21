import React, { useState } from 'react';
import { ArrowLeft, Save, CheckCircle2, Pill, Activity, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { appointmentService } from '../services/appointmentService';

function Consultation() {
  const navigate = useNavigate();
  const location = useLocation();
  const appointmentId = location.state?.appointmentId;

  const [activeTab, setActiveTab] = useState('notas');
  const [patientName, setPatientName] = useState('Cargando...');
  const [appointment, setAppointment] = useState(null);
  const [modality, setModality] = useState('presencial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [consultationData, setConsultationData] = useState({
    exploracion: '',
    diagnostico: '',
    recomendaciones: ''
  });

  const [prescription, setPrescription] = useState([]);
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ med: '', dosis: '', frecuencia: '', dias: '' });

  React.useEffect(() => {
    if (!appointmentId) return;

    const initConsultation = async () => {
      try {
        const appt = await appointmentService.getAppointmentById(appointmentId);
        setAppointment(appt);
        if (appt.patient) {
          setPatientName(`${appt.patient.first_name} ${appt.patient.last_name}`);
        }
        try {
          const notes = JSON.parse(appt.notes || '{}');
          if (notes.modality) setModality(notes.modality);
        } catch (error) {
          console.error('Error parsing notes:', error);
        }
        
        // Update status to IN_PROGRESS as soon as consultation starts
        if (appt.status === 'WAITING' || appt.status === 'SCHEDULED') {
          await appointmentService.updateAppointmentStatus(appointmentId, 'IN_PROGRESS');
        }
      } catch (error) {
        console.error("Error loading consultation", error);
      }
    };
    initConsultation();
  }, [appointmentId]);

  const handleFinish = async () => {
    if (!appointmentId || !appointment) return;
    
    setIsSubmitting(true);
    try {
      // Parse existing notes to preserve triage info
      let existingNotes = {};
      try { 
        existingNotes = JSON.parse(appointment.notes || '{}'); 
      } catch(error) {
        console.error(error);
      }

      const updatedNotes = {
        ...existingNotes,
        consultation: consultationData,
        prescription: prescription
      };

      await appointmentService.updateAppointmentStatus(
        appointmentId, 
        'COMPLETED', 
        JSON.stringify(updatedNotes)
      );

      toast.success("Consulta finalizada. Receta enviada.");
      navigate('/doctor');
    } catch (error) {
      console.error("Error finishing consultation", error);
      toast.error("Error al finalizar consulta");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F7F9FC' }}>
      
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ArrowLeft size={24} color="#1B2C66" onClick={() => navigate('/doctor/triage')} style={{ cursor: 'pointer' }} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66' }}>Consulta en curso</h2>
            <p style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>{patientName}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {modality === 'telemedicina' && (
            <button onClick={() => navigate('/telemedicina', { state: { appointmentId: appointmentId } })} style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
              VIDEOLLAMADA
            </button>
          )}
          <button onClick={handleFinish} disabled={isSubmitting} style={{ backgroundColor: '#30E3C2', color: '#064E3B', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'GUARDANDO...' : 'FINALIZAR'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: 'white', padding: '0 24px', borderBottom: '1px solid #E5E7EB' }}>
        <div onClick={() => setActiveTab('notas')} style={{ flex: 1, textAlign: 'center', padding: '16px 0', borderBottom: activeTab === 'notas' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'notas' ? 'var(--primary)' : '#6B7280', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
          NOTAS CLÍNICAS
        </div>
        <div onClick={() => setActiveTab('receta')} style={{ flex: 1, textAlign: 'center', padding: '16px 0', borderBottom: activeTab === 'receta' ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === 'receta' ? 'var(--primary)' : '#6B7280', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
          RECETA MÉDICA
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        
        {activeTab === 'notas' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#1B2C66', marginBottom: '12px' }}>
                <Activity size={16} /> EXPLORACIÓN FÍSICA
              </label>
              <textarea 
                placeholder="Escribe los hallazgos de la exploración..."
                style={{ width: '100%', padding: '16px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', outline: 'none', fontSize: '14px', minHeight: '100px', resize: 'vertical' }}
                value={consultationData.exploracion}
                onChange={e => setConsultationData({...consultationData, exploracion: e.target.value})}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#1B2C66', marginBottom: '12px' }}>
                <CheckCircle2 size={16} /> DIAGNÓSTICO
              </label>
              <textarea 
                placeholder="Ej. Infección gastrointestinal..."
                style={{ width: '100%', padding: '16px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', outline: 'none', fontSize: '14px', minHeight: '80px', resize: 'vertical' }}
                value={consultationData.diagnostico}
                onChange={e => setConsultationData({...consultationData, diagnostico: e.target.value})}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#1B2C66', marginBottom: '12px' }}>
                <Save size={16} /> RECOMENDACIONES GENERALES
              </label>
              <textarea 
                placeholder="Reposo, dieta blanda..."
                style={{ width: '100%', padding: '16px', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', outline: 'none', fontSize: '14px', minHeight: '80px', resize: 'vertical' }}
                value={consultationData.recomendaciones}
                onChange={e => setConsultationData({...consultationData, recomendaciones: e.target.value})}
              />
            </div>
          </div>
        )}

        {activeTab === 'receta' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66' }}>MEDICAMENTOS</h3>
              <button onClick={() => setShowAddMed(!showAddMed)} style={{ backgroundColor: '#E0E7FF', color: 'var(--primary)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Plus size={14} /> {showAddMed ? 'Cancelar' : 'Añadir'}
              </button>
            </div>

            {showAddMed && (
              <div className="card" style={{ padding: '16px', marginBottom: '16px', border: '2px solid var(--primary)' }}>
                <input type="text" placeholder="Nombre del medicamento" value={newMed.med} onChange={e => setNewMed({...newMed, med: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '8px', outline: 'none' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" placeholder="Dosis (Ej. 1 tableta)" value={newMed.dosis} onChange={e => setNewMed({...newMed, dosis: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none' }} />
                  <input type="text" placeholder="Frecuencia (Ej. 8 horas)" value={newMed.frecuencia} onChange={e => setNewMed({...newMed, frecuencia: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none' }} />
                </div>
                <input type="text" placeholder="Duración (Ej. 5 días)" value={newMed.dias} onChange={e => setNewMed({...newMed, dias: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '12px', outline: 'none' }} />
                <button 
                  onClick={() => {
                    if (newMed.med) {
                      setPrescription([...prescription, { id: Date.now(), ...newMed }]);
                      setNewMed({ med: '', dosis: '', frecuencia: '', dias: '' });
                      setShowAddMed(false);
                    }
                  }} 
                  style={{ width: '100%', padding: '12px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
                  Agregar a Receta
                </button>
              </div>
            )}

            {prescription.length === 0 && !showAddMed ? (
              <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '13px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px' }}>No hay medicamentos en la receta.</p>
            ) : prescription.map(p => (
              <div key={p.id} className="card" style={{ padding: '16px', marginBottom: '12px', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Pill size={16} color="#4B5563" />
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>{p.med}</h4>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px' }}>DOSIS</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#4B5563' }}>{p.dosis}</span>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px' }}>FRECUENCIA</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#4B5563' }}>{p.frecuencia}</span>
                  </div>
                  <div style={{ backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', gridColumn: '1 / -1' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px' }}>DURACIÓN</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#4B5563' }}>{p.dias}</span>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '24px', backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '16px' }}>
              <p style={{ fontSize: '12px', color: '#991B1B', fontWeight: '600', lineHeight: '1.5' }}>
                <strong>Nota:</strong> Al finalizar la consulta, esta receta se enviará automáticamente al expediente digital del paciente con la firma electrónica correspondiente.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Consultation;
