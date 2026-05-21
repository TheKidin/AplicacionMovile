import React, { useState, useEffect } from 'react';
import { ArrowLeft, Activity, Heart, Droplets, Thermometer, Weight, Loader, FileText } from 'lucide-react';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';

function PatientVitals() {
  const [loading, setLoading] = useState(true);
  const [vitals, setVitals] = useState(null);

  useEffect(() => {
    const loadVitals = async () => {
      try {
        const user = await authService.getUser();
        if (user) {
          const patient = await patientService.getPatientByEmail(user.email);
          if (patient) {
            const data = await patientService.getPatientVitals(patient.id);
            if (data) setVitals(data);
          }
        }
      } catch (err) {
        console.error("Error al cargar signos vitales:", err);
      } finally {
        setLoading(false);
      }
    };
    loadVitals();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={32} className="spinner" color="var(--primary)" />
        <p style={{ marginTop: '16px', color: '#6B7280', fontWeight: '600' }}>Cargando signos vitales...</p>
      </div>
    );
  }

  if (!vitals) {
    return (
      <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Signos Vitales</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px dashed #D1D5DB' }}>
          <Activity size={48} color="#9CA3AF" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66', marginBottom: '8px' }}>Sin mediciones aún</h3>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
            Tus signos vitales se reflejarán aquí una vez que asistas a tu consulta presencial y la enfermera los registre en el sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Signos Vitales</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Última medición</h2>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#1B2C66' }}>
            {new Date(vitals.created_at).toLocaleDateString()}
          </p>
        </div>
        <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
          REGISTRADO
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        {/* Presión Arterial */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEE2E2', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Activity size={16} color="#EF4444" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#4B5563' }}>Presión Arterial</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: '#111827' }}>{vitals.blood_pressure || '--/--'}</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#6B7280' }}>mmHg</span>
          </div>
        </div>

        {/* Ritmo Cardíaco */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FCE7F3', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Heart size={16} color="#EC4899" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#4B5563' }}>Ritmo Cardíaco</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>{vitals.heart_rate || '--'}</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>lpm</span>
          </div>
        </div>

        {/* Oxigenación */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#E0F2FE', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Droplets size={16} color="#0EA5E9" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#4B5563' }}>Oxigenación</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>{vitals.oxygen_saturation || '--'}</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>% SpO2</span>
          </div>
        </div>

        {/* Peso */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Weight size={16} color="#D97706" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#4B5563' }}>Peso</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>{vitals.weight || '--'}</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>kg</span>
          </div>
        </div>

        {/* Temperatura */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Thermometer size={16} color="#6B7280" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#4B5563' }}>Temperatura</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>{vitals.temperature || '--'}</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>°C</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default PatientVitals;
