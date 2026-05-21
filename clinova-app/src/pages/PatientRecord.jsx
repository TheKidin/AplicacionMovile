import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Activity, AlertTriangle, Pill, Stethoscope, ChevronRight, Loader } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';

function PatientRecord() {
  const navigate = useNavigate();
  const location = useLocation();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const appointmentId = location.state?.appointmentId;
        if (!appointmentId) {
          setLoading(false);
          return;
        }

        const appt = await appointmentService.getAppointmentById(appointmentId);
        
        if (appt && appt.patient) {
          const p = appt.patient;
          let triage = {};
          
          try { 
            const notes = JSON.parse(appt.notes || '{}'); 
            triage = notes.triage || {};
          } catch(error) {
            console.error("Error parsing notes:", error);
          }

          // Fetch Vitals
          let latestVitals = null;
          try {
            const vitals = await patientService.getPatientVitals(p.id);
            if (vitals && vitals.length > 0) {
              latestVitals = vitals[0];
            }
          } catch(err) {
            console.error("Error fetching vitals", err);
          }

          // Calcular edad aproximada
          const age = p.date_of_birth ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear() : 'N/A';
          
          setPatientData({
            id: appt.id,
            name: `${p.first_name} ${p.last_name}`,
            age: age,
            gender: p.gender || 'No especificado',
            bloodType: p.blood_type || 'N/A',
            allergies: p.allergies || 'Ninguna',
            reason: triage.motivo || 'Consulta General',
            painLevel: triage.intensidad || 1,
            symptoms: triage.tieneSintomas ? triage.sintomasNombres : 'Ningún síntoma reportado',
            symptomsSince: triage.sintomasDesde || 'N/A',
            currentMedication: triage.medicamentoPrevio ? (triage.medicamentoNombre || 'Sí (No especificó)') : 'Ninguna',
            vitals: latestVitals
          });
        }
      } catch (err) {
        console.error("Error al cargar paciente:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [location.state]);

  // Lógica para el indicador visual de dolor
  const getPainColor = (level) => {
    if (level <= 3) return '#30E3C2'; // Verde/Leve
    if (level <= 6) return '#F59E0B'; // Amarillo/Moderado
    return '#EF4444'; // Rojo/Severo
  };

  const getPainText = (level) => {
    if (level <= 3) return 'Leve';
    if (level <= 6) return 'Moderado';
    return 'Severo';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F7F9FC' }}>
      
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'sticky', top: 0, zIndex: 10 }}>
        <ArrowLeft size={24} color="#1B2C66" onClick={() => navigate('/doctor')} style={{ cursor: 'pointer' }} />
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66' }}>Triage del Paciente</h2>
          <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Reporte Preliminar</p>
        </div>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '16px' }}>
            <Loader size={32} className="spinner" color="var(--primary)" />
            <p style={{ color: '#6B7280', fontSize: '14px', fontWeight: '600' }}>Cargando expediente...</p>
          </div>
        ) : !patientData ? (
          <div style={{ backgroundColor: '#F3F4F6', borderRadius: '16px', padding: '32px 24px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#9CA3AF" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>No hay pacientes</h3>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>Aún no hay historiales médicos registrados en la base de datos.</p>
          </div>
        ) : (
          <>
        {/* Patient Info Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <User size={32} color="var(--primary)" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66' }}>{patientData.name}</h1>
            <p style={{ fontSize: '13px', color: '#4B5563', fontWeight: '600', marginTop: '2px' }}>
              {patientData.age} años • {patientData.gender} • Sangre: <span style={{ color: '#EF4444' }}>{patientData.bloodType}</span>
            </p>
          </div>
        </div>

        {/* Motivo y Dolor */}
        <div style={{ marginBottom: '24px' }}>
          
          {/* SIGNOS VITALES */}
          {patientData.vitals && (
            <div className="card" style={{ padding: '16px', marginBottom: '24px', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Activity size={16} color="#F59E0B" />
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#1B2C66', textTransform: 'uppercase' }}>Signos Vitales</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700', display: 'block' }}>TENSIÓN ARTERIAL</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{patientData.vitals.blood_pressure || 'N/A'} mmHg</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700', display: 'block' }}>FRECUENCIA CARDÍACA</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{patientData.vitals.heart_rate || 'N/A'} lpm</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700', display: 'block' }}>TEMPERATURA</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{patientData.vitals.temperature || 'N/A'} °C</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700', display: 'block' }}>PESO / TALLA</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#111827' }}>{patientData.vitals.weight || 'N/A'} kg</span>
                </div>
              </div>
            </div>
          )}

        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity size={20} color="#1B2C66" />
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', textTransform: 'uppercase' }}>Motivo Principal</h3>
          </div>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>"{patientData.reason}"</p>
          
          {/* INDICADOR EXPLICITO DE DOLOR */}
          <div style={{ backgroundColor: '#F3F4F6', padding: '16px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#4B5563' }}>NIVEL DE DOLOR INDICADO</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: getPainColor(patientData.painLevel) }}>{patientData.painLevel}</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#9CA3AF' }}>/10</span>
              </div>
            </div>
            
            {/* Barra Visual */}
            <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ height: '100%', width: `${patientData.painLevel * 10}%`, backgroundColor: getPainColor(patientData.painLevel), borderRadius: '4px' }}></div>
            </div>
            
            <p style={{ fontSize: '12px', fontWeight: '700', color: getPainColor(patientData.painLevel), textAlign: 'right' }}>
              Nivel: {getPainText(patientData.painLevel)}
            </p>
          </div>
        </div>
        </div>

        {/* Síntomas Detallados */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Stethoscope size={20} color="#1B2C66" />
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#1B2C66', textTransform: 'uppercase' }}>Síntomas Actuales</h3>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px' }}>DESCRIPCIÓN</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{patientData.symptoms}</p>
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px' }}>EVOLUCIÓN</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>Inició {patientData.symptomsSince}</p>
            </div>
          </div>
        </div>

        {/* Alertas Médicas */}
        <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#9CA3AF', letterSpacing: '1px', marginBottom: '12px', marginLeft: '4px' }}>ANTECEDENTES IMPORTANTES</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '16px', backgroundColor: patientData.allergies !== 'Ninguna' ? '#FEF2F2' : 'white', border: patientData.allergies !== 'Ninguna' ? '1px solid #FCA5A5' : 'none' }}>
            <AlertTriangle size={20} color={patientData.allergies !== 'Ninguna' ? '#EF4444' : '#6B7280'} style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '11px', fontWeight: '800', color: patientData.allergies !== 'Ninguna' ? '#991B1B' : '#9CA3AF', marginBottom: '4px' }}>ALERGIAS</p>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{patientData.allergies}</p>
          </div>
          
          <div className="card" style={{ padding: '16px' }}>
            <Pill size={20} color="#6B7280" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', marginBottom: '4px' }}>MEDICACIÓN ACTUAL</p>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{patientData.currentMedication}</p>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Action Button */}
      <div style={{ padding: '24px', backgroundColor: 'white', borderTop: '1px solid #E5E7EB' }}>
        <button className="btn-primary" onClick={() => navigate('/doctor/consultation', { state: { appointmentId: patientData?.id } })} style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          INICIAR CONSULTA <ChevronRight size={20} />
        </button>
      </div>

    </div>
  );
}

export default PatientRecord;
