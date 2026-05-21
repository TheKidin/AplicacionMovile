import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserCheck, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function DoctorsDirectory() {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsData = await authService.getUsersByRole('DOCTOR');
        setMedicos(doctorsData || []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', backgroundColor: '#F7F9FC' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Directorio Médico</h1>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
          <UserCheck size={20} color="#1E293B" />
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>Médicos Registrados</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <Loader className="spinner" size={24} color="#1D4ED8" />
            </div>
          ) : medicos.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 16px', margin: 0 }}>No hay médicos registrados.</p>
          ) : (
            medicos.map((m, index) => (
              <div key={m.id || index} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: index < medicos.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E0E7FF', overflow: 'hidden', marginRight: '16px' }}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.first_name}`} alt="avatar" style={{ width: '100%' }} />
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>{m.first_name} {m.last_name}</h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{m.email}</p>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#10B981', backgroundColor: '#D1FAE5', padding: '6px 12px', borderRadius: '20px' }}>
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

export default DoctorsDirectory;
