import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, Star, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clinicService } from '../services/clinicService';

function Clinics() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await clinicService.getClinics();
        setClinics(data || []);
      } catch (error) {
        console.error('Error fetching clinics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Directorio de Clínicas</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <Loader className="spinner" size={24} color="#1D4ED8" />
          </div>
        ) : clinics.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '14px', padding: '32px' }}>No hay clínicas registradas.</p>
        ) : (
          clinics.map((clinic, idx) => {
            const isOpen = clinic.status !== 'Suspendido'; // Or any logic
            return (
              <div key={idx} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1B2C66', marginBottom: '4px' }}>{clinic.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B7280', fontSize: '12px' }}>
                      <MapPin size={12} /> {clinic.address}
                    </div>
                  </div>
                  <div style={{ backgroundColor: isOpen ? '#D1FAE5' : '#FEE2E2', color: isOpen ? '#065F46' : '#991B1B', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' }}>
                    {isOpen ? 'ABIERTO' : 'CERRADO'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} color="#F59E0B" fill="#F59E0B" /> 5.0
                    </span>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>•</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#4B5563' }}>N/A km</span>
                  </div>
                  <button style={{ backgroundColor: '#F3F4F6', color: '#1D4ED8', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <Phone size={14} /> Contactar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Clinics;
