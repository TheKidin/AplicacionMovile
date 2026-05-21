import React from 'react';
import { ArrowLeft, User, Phone, Mail, Droplet, Calendar, FileText, Clock, Trash2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';

function AdminPatientProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = location.state?.patient;
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!patient) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <h2 style={{ color: '#1E293B' }}>Paciente no seleccionado</h2>
        <button onClick={() => navigate('/admin/patients')} className="btn-primary">Volver al Directorio</button>
      </div>
    );
  }

  let age = 'N/A';
  if (patient.date_of_birth) {
    const diffMs = new Date().getTime() - new Date(patient.date_of_birth).getTime();
    const ageDt = new Date(diffMs);
    age = Math.abs(ageDt.getUTCFullYear() - 1970);
  }

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al paciente ${patient.first_name}? Esta acción no se puede deshacer.`)) {
      setIsDeleting(true);
      try {
        await patientService.deletePatient(patient.id);
        navigate('/admin/patients');
      } catch (error) {
        console.error("Error al eliminar el paciente:", error);
        alert("Hubo un error al eliminar el paciente de la base de datos local.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/admin/patients')} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E293B', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Expediente Administrativo</h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>ID: {patient.id.substring(0,8).toUpperCase()} • Datos Demográficos</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Demographics */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: '800', color: '#4F46E5', marginBottom: '16px' }}>
            {patient.first_name ? patient.first_name.charAt(0) : 'P'}
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px 0' }}>{patient.first_name} {patient.last_name}</h2>
          <p style={{ fontSize: '15px', color: '#64748B', fontWeight: '500', margin: '0 0 16px 0' }}>Paciente Registrado(a)</p>
          
          <span style={{ backgroundColor: '#D1FAE5', color: '#059669', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '32px' }}>
            Cuenta Activa
          </span>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><User size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>EDAD Y SEXO</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>{age} años • {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'No especificado'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#EF4444' }}><Droplet size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>TIPO DE SANGRE</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>{patient.blood_type || 'No registrado'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><Phone size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>TELÉFONO</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>{patient.phone || 'Sin registro'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><Mail size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>CORREO</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>{patient.email}</p>
              </div>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '1px', backgroundColor: '#F1F5F9', margin: '24px 0' }}></div>
          
          <button 
            onClick={handleDelete} 
            disabled={isDeleting} 
            style={{ 
              width: '100%', 
              backgroundColor: '#FEF2F2', 
              color: '#EF4444', 
              border: '1px solid #FECACA', 
              padding: '14px', 
              borderRadius: '12px', 
              fontSize: '14px', 
              fontWeight: '700', 
              cursor: isDeleting ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px', 
              transition: 'all 0.2s ease', 
              opacity: isDeleting ? 0.7 : 1,
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)'
            }}
            onMouseOver={(e) => { if(!isDeleting) { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.borderColor = '#F87171'; } }}
            onMouseOut={(e) => { if(!isDeleting) { e.currentTarget.style.backgroundColor = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; } }}
          >
            {isDeleting ? <Clock size={18} className="spinner" /> : <Trash2 size={18} />}
            {isDeleting ? 'Eliminando Cuenta...' : 'Eliminar Cuenta Permanentemente'}
          </button>
        </div>

        {/* Right Column: Meta-Data & Usage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Privacy Notice Alert */}
          <div style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #3B82F6', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <FileText size={20} color="#3B82F6" style={{ marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1E40AF', margin: '0 0 4px 0' }}>Privacidad Protegida (HIPAA)</h4>
              <p style={{ fontSize: '13px', color: '#1E3A8A', margin: 0, lineHeight: '1.5' }}>Como administrador, solo tienes acceso a metadatos de uso. Las notas clínicas, diagnósticos y recetas de este paciente están encriptadas y solo son visibles para su médico tratante.</p>
            </div>
          </div>

          {/* Appointment History (Metadata) */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="#8B5CF6" />
              Historial de Citas (Metadatos)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '10px', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800' }}>MAY</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B' }}>10</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', margin: 0 }}>Dr. Alejandro Vargas (Medicina General)</p>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>CLINOVA Central • 10:30 AM</p>
                  </div>
                </div>
                <span style={{ backgroundColor: '#D1FAE5', color: '#059669', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>Completada</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '10px', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800' }}>ABR</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B' }}>22</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', margin: 0 }}>Dra. Sofía Reyes (Pediatría)</p>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>Torre Médica Sur • 04:00 PM</p>
                  </div>
                </div>
                <span style={{ backgroundColor: '#D1FAE5', color: '#059669', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>Completada</span>
              </div>

            </div>
            
            <button style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              Ver todas las visitas (12)
            </button>
          </div>



        </div>
      </div>
    </div>
  );
}

export default AdminPatientProfile;
