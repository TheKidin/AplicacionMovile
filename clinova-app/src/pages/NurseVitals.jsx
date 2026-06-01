import React, { useState } from 'react';
import { ArrowLeft, Activity, Thermometer, Heart, Scale, Save, Droplets } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';

function NurseVitals() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const appointmentId = location.state?.appointmentId;
  const patientData = location.state?.patient;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular edad
  let age = 'N/A';
  if (patientData?.date_of_birth) {
    const diffMs = new Date().getTime() - new Date(patientData.date_of_birth).getTime();
    const ageDt = new Date(diffMs);
    age = Math.abs(ageDt.getUTCFullYear() - 1970);
  }

  const patient = { 
    name: patientData ? `${patientData.first_name} ${patientData.last_name}` : 'Paciente Desconocido', 
    age: age,
    id: location.state?.patientId
  };

  const [vitals, setVitals] = useState({
    presionSistolica: '',
    presionDiastolica: '',
    temperatura: '',
    frecuenciaCardiaca: '',
    peso: '',
    estatura: '',
    oxigenacion: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!patient.id || !currentUser) {
      toast.error('Faltan datos del paciente o sesión.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await patientService.addVitals({
        patient_id: patient.id,
        blood_pressure: `${vitals.presionSistolica}/${vitals.presionDiastolica}`,
        heart_rate: parseInt(vitals.frecuenciaCardiaca),
        temperature: parseFloat(vitals.temperatura),
        weight: parseFloat(vitals.peso),
        oxygen_saturation: parseInt(vitals.oxigenacion),
        recorded_by: currentUser.id
      });
      
      if (appointmentId) {
        const appt = await appointmentService.getAppointmentById(appointmentId);
        let notes = {};
        try { 
          notes = JSON.parse(appt.notes || '{}'); 
        } catch(error) {
          console.error(error);
        }
        notes.vitalsTaken = true;
        await appointmentService.updateAppointmentStatus(appointmentId, appt.status, JSON.stringify(notes));
      }

      toast.success("Signos vitales guardados. Paciente listo para consulta.");
      navigate('/reception');
    } catch (error) {
      console.error("Error saving vitals", error);
      toast.error("Hubo un error al guardar los signos vitales.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F7F9FC' }}>
      
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'sticky', top: 0, zIndex: 10 }}>
        <ArrowLeft size={24} color="#1B2C66" onClick={() => navigate('/reception')} style={{ cursor: 'pointer' }} />
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66' }}>Toma de Signos Vitales</h2>
          <p style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>{patient.name} • {patient.age} años</p>
        </div>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Tensión Arterial */}
          <div className="card" style={{ padding: '20px', borderLeft: '4px solid #EF4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Activity size={20} color="#EF4444" />
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66' }}>Tensión Arterial</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>SISTÓLICA</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="120"
                  style={{ width: '100%', padding: '16px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', textAlign: 'center', outline: 'none' }}
                  value={vitals.presionSistolica}
                  onChange={e => setVitals({...vitals, presionSistolica: e.target.value})}
                  required
                />
              </div>
              <span style={{ fontSize: '24px', fontWeight: '300', color: '#D1D5DB' }}>/</span>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>DIASTÓLICA</label>
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="80"
                  style={{ width: '100%', padding: '16px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', textAlign: 'center', outline: 'none' }}
                  value={vitals.presionDiastolica}
                  onChange={e => setVitals({...vitals, presionDiastolica: e.target.value})}
                  required
                />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#6B7280', alignSelf: 'flex-end', paddingBottom: '16px' }}>mmHg</span>
            </div>
          </div>

          {/* Frecuencia Cardíaca, Temperatura y Oxigenación */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Heart size={20} color="#F59E0B" />
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#1B2C66' }}>FC</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="75"
                  style={{ width: '100%', padding: '12px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', textAlign: 'center', outline: 'none' }}
                  value={vitals.frecuenciaCardiaca}
                  onChange={e => setVitals({...vitals, frecuenciaCardiaca: e.target.value})}
                  required
                />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', paddingBottom: '12px' }}>lpm</span>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #3B82F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Thermometer size={20} color="#3B82F6" />
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#1B2C66' }}>Temp</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <input 
                  type="number" 
                  inputMode="decimal"
                  step="0.1"
                  placeholder="36.5"
                  style={{ width: '100%', padding: '12px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', textAlign: 'center', outline: 'none' }}
                  value={vitals.temperatura}
                  onChange={e => setVitals({...vitals, temperatura: e.target.value})}
                  required
                />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', paddingBottom: '12px' }}>°C</span>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #0EA5E9', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Droplets size={20} color="#0EA5E9" />
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#1B2C66' }}>Oxigenación (SpO2)</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="98"
                  style={{ width: '100%', padding: '12px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', textAlign: 'center', outline: 'none' }}
                  value={vitals.oxigenacion}
                  onChange={e => setVitals({...vitals, oxigenacion: e.target.value})}
                  required
                />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', paddingBottom: '12px' }}>%</span>
              </div>
            </div>

          </div>

          {/* Peso y Talla */}
          <div className="card" style={{ padding: '20px', borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Scale size={20} color="#8B5CF6" />
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66' }}>Medidas Antropométricas</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>PESO</label>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <input 
                    type="number" 
                    inputMode="decimal"
                    step="0.1"
                    placeholder="70.5"
                    style={{ width: '100%', padding: '12px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', textAlign: 'center', outline: 'none' }}
                    value={vitals.peso}
                    onChange={e => setVitals({...vitals, peso: e.target.value})}
                    required
                  />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', paddingBottom: '12px' }}>kg</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>ESTATURA</label>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <input 
                    type="number" 
                    inputMode="decimal"
                    step="0.01"
                    placeholder="1.75"
                    style={{ width: '100%', padding: '12px', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', textAlign: 'center', outline: 'none' }}
                    value={vitals.estatura}
                    onChange={e => setVitals({...vitals, estatura: e.target.value})}
                    required
                  />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', paddingBottom: '12px' }}>m</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '8px 0 24px 0' }}>
            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(48,227,194,0.3)', opacity: isSubmitting ? 0.7 : 1 }}>
              <Save size={20} />
              {isSubmitting ? 'GUARDANDO...' : 'REGISTRAR Y ENVIAR AL DOCTOR'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

export default NurseVitals;
