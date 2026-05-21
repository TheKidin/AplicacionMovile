import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, ChevronRight, Filter, FileText, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';

function DoctorPatients() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!currentUser) return;
      try {
        const appts = await appointmentService.getDoctorCompletedAppointments(currentUser.id);
        
        // Agrupar por paciente único
        const uniquePatientsMap = new Map();
        
        appts.forEach(appt => {
          if (!appt.patient) return;
          
          if (!uniquePatientsMap.has(appt.patient.id)) {
            let diagnosis = 'Sin diagnóstico registrado';
            try {
              const notes = JSON.parse(appt.notes || '{}');
              if (notes.consultation?.diagnostico) {
                diagnosis = notes.consultation.diagnostico;
              } else if (notes.consultation?.diagnosis) { // Compatibilidad con el mock anterior
                diagnosis = notes.consultation.diagnosis;
              }
            } catch(error) {
              console.error(error);
            }

            uniquePatientsMap.set(appt.patient.id, {
              id: appt.patient.id,
              name: `${appt.patient.first_name} ${appt.patient.last_name}`,
              lastVisit: appt.date,
              diagnosis: diagnosis,
              status: appt.status
            });
          }
        });
        
        setPatients(Array.from(uniquePatientsMap.values()));
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [currentUser]);

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F9FC', position: 'relative', paddingBottom: '120px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1B2C66' }}>Directorio Clínico</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <FolderOpen size={18} color="#4B5563" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o expediente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', fontSize: '14px', outline: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }} 
          />
        </div>
        <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
          <Filter size={20} color="#4B5563" />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#1B2C66' }}>Tus Pacientes ({filteredPatients.length})</h2>
      </div>

      {/* Patients List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
            <Loader size={32} className="spinner" color="var(--primary)" />
            <p style={{ marginTop: '16px', color: '#6B7280', fontSize: '14px', fontWeight: '600' }}>Cargando directorio...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px dashed #D1D5DB' }}>
            <FileText size={32} color="#9CA3AF" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: '600' }}>No se encontraron pacientes.</p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="card" onClick={() => navigate('/doctor/triage')} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EEF2FF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                    {patient.name.charAt(0)}
                  </span>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '2px' }}>{patient.name}</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Última visita: {patient.lastVisit}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#4B5563', backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '6px' }}>
                      {patient.diagnosis.substring(0, 30)}{patient.diagnosis.length > 30 ? '...' : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <ChevronRight size={20} color="#D1D5DB" />
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default DoctorPatients;
