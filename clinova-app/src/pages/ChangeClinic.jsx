import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, MapPin, CheckCircle2, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clinicService } from '../services/clinicService';

function ChangeClinic() {
  const navigate = useNavigate();
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await clinicService.getClinics();
        setClinics(data || []);
        if (data && data.length > 0) {
          setSelectedClinic(data[0].id); // Seleccionar la primera por defecto
        }
      } catch (error) {
        console.error("Error fetching clinics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  const handleSave = () => {
    alert('Sede actualizada correctamente.');
    navigate(-1);
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Cambiar de Sede</h1>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
          <Building2 size={40} color="#1D4ED8" />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>Selecciona tu Unidad Clínica</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, padding: '0 16px', lineHeight: '1.5' }}>Elige la sede en la que te encuentras operando actualmente para actualizar el dashboard.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <Loader className="spinner" size={24} color="#1D4ED8" />
          </div>
        ) : clinics.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>No hay sedes registradas.</p>
        ) : (
          clinics.map((clinic) => (
            <div 
              key={clinic.id} 
              onClick={() => setSelectedClinic(clinic.id)}
              className="card" 
              style={{ 
                padding: '20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                cursor: 'pointer',
                border: selectedClinic === clinic.id ? '2px solid #3B82F6' : '2px solid transparent',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>{clinic.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B7280', fontSize: '13px' }}>
                  <MapPin size={12} /> {clinic.address || 'Sin dirección registrada'}
                </div>
              </div>
              {selectedClinic === clinic.id && (
                <CheckCircle2 size={24} color="#3B82F6" />
              )}
            </div>
          ))
        )}
      </div>

      <button onClick={handleSave} className="btn-primary" style={{ marginTop: '32px', width: '100%' }} disabled={loading || clinics.length === 0}>
        CONFIRMAR CAMBIO
      </button>
    </div>
  );
}

export default ChangeClinic;
