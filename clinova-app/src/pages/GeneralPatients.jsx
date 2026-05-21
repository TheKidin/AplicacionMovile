import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';

function GeneralPatients() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await patientService.getPatients();
        
        // Filtrar duplicados por correo electrónico para mantener la lista limpia
        const uniquePatientsMap = new Map();
        (data || []).forEach(patient => {
          if (patient.email && !uniquePatientsMap.has(patient.email)) {
            uniquePatientsMap.set(patient.email, patient);
          } else if (!patient.email) {
             uniquePatientsMap.set(patient.id, patient);
          }
        });
        
        setPacientes(Array.from(uniquePatientsMap.values()));
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', backgroundColor: '#F7F9FC' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Padrón de Pacientes</h1>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
          <Users size={20} color="#1E293B" />
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>En Sistema</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Loader className="spinner" size={24} color="#1D4ED8" />
            </div>
          ) : pacientes.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 16px', margin: 0 }}>No hay pacientes registrados en el sistema.</p>
          ) : (
            pacientes.map((p, index) => (
              <div key={p.id || index} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: index < pacientes.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>{p.first_name} {p.last_name}</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{p.email}</p>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '700', color: '#4B5563', backgroundColor: '#F3F4F6', padding: '6px 12px', borderRadius: '20px' }}>
                  REGISTRADO
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GeneralPatients;
