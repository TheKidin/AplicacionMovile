import React, { useState, useEffect } from 'react';
import { ArrowLeft, Pill, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import SkeletonLoader from '../components/ui/SkeletonLoader';

export default function Prescriptions() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!currentUser) return;
      try {
        const patient = await patientService.getPatientByEmail(currentUser.email);
        if (patient) {
          const appts = await appointmentService.getPatientAppointments(patient.id);
          
          const history = appts
            .filter(a => a.status === 'COMPLETED' && a.notes)
            .map(a => {
              try {
                const parsedNotes = JSON.parse(a.notes);
                if (parsedNotes.prescription && parsedNotes.prescription.medication) {
                  return {
                    id: a.id,
                    date: a.date,
                    time: a.time,
                    doctor: a.doctor,
                    medication: parsedNotes.prescription.medication,
                    instructions: parsedNotes.prescription.instructions || '',
                    diagnosis: parsedNotes.consultation?.diagnosis || ''
                  };
                }
              } catch (e) {
                console.error("Error parsing prescription notes", e);
              }
              return null;
            })
            .filter(item => item !== null)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            
          setPrescriptions(history);
        }
      } catch (err) {
        console.error("Error fetching prescriptions", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrescriptions();
  }, [currentUser]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F7F9FC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1B2C66" />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66' }}>Mis Recetas</h2>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: '1.5' }}>
          Aquí puedes consultar el historial de los medicamentos que te han recetado en tus consultas anteriores.
        </p>

        {loading ? (
          <SkeletonLoader type="card" count={3} />
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' }}>
              <Pill size={32} color="#EF4444" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>No hay recetas</h3>
            <p style={{ fontSize: '13px', color: '#64748B' }}>Aún no tienes medicamentos recetados en tu historial.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {prescriptions.map(presc => (
              <div key={presc.id} className="card" style={{ padding: '20px', borderLeft: '4px solid #EF4444', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px', fontWeight: '600' }}>
                    <Calendar size={14} /> {presc.date}
                    <Clock size={14} style={{ marginLeft: '8px' }} /> {presc.time.substring(0,5)}
                  </div>
                </div>
                
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1B2C66', marginBottom: '4px' }}>
                  Dr. {presc.doctor?.first_name} {presc.doctor?.last_name}
                </h4>
                {presc.diagnosis && (
                  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>Por: {presc.diagnosis}</p>
                )}

                <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Pill size={16} color="#DC2626" />
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#991B1B', letterSpacing: '0.5px' }}>MEDICAMENTO</span>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#7F1D1D', marginBottom: '8px' }}>{presc.medication}</p>
                  
                  {presc.instructions && (
                    <>
                      <div style={{ height: '1px', backgroundColor: '#FECACA', margin: '12px 0' }}></div>
                      <p style={{ fontSize: '11px', fontWeight: '800', color: '#991B1B', marginBottom: '4px', letterSpacing: '0.5px' }}>INDICACIONES</p>
                      <p style={{ fontSize: '13px', color: '#991B1B', lineHeight: '1.4' }}>{presc.instructions}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
