import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, MoreVertical, Loader, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { authService } from '../services/authService';

function AdminPatients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await patientService.getPatients();
        
        // Filtrar duplicados por correo electrónico
        const uniquePatientsMap = new Map();
        (data || []).forEach(patient => {
          if (patient.email && !uniquePatientsMap.has(patient.email)) {
            uniquePatientsMap.set(patient.email, patient);
          } else if (!patient.email) {
             uniquePatientsMap.set(patient.id, patient);
          }
        });
        
        setPatients(Array.from(uniquePatientsMap.values()));
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => 
    (p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}>Directorio de Pacientes</h1>
          <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>Gestiona los expedientes y registros de la red CLINOVA.</p>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', overflow: 'visible' }}>
        
        {/* Table Toolbar */}
        <div style={{ padding: '24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'relative', width: '350px', maxWidth: '100%' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, ID o teléfono..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', outline: 'none', fontSize: '14px' }}
            />
          </div>
          
          <button style={{ backgroundColor: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Filter size={18} />
            Filtros
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'visible' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>ID Paciente</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Nombre Completo</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Contacto</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Última Cita</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Estado</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Loader className="spinner" size={24} color="#1D4ED8" />
                    </div>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                    No se encontró ningún paciente.
                  </td>
                </tr>
              ) : (
                filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((patient, idx) => {
                  
                  // Calcular edad
                  let age = 'N/A';
                  if (patient.date_of_birth) {
                    const diffMs = new Date().getTime() - new Date(patient.date_of_birth).getTime();
                    const ageDt = new Date(diffMs);
                    age = Math.abs(ageDt.getUTCFullYear() - 1970);
                  }

                  return (
                    <tr key={patient.id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: '#64748B' }}>{patient.id.substring(0,8)}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: '700', color: '#4F46E5', overflow: 'hidden' }}>
                            {authService.getAvatarLocal(patient.id) ? (
                              <img src={authService.getAvatarLocal(patient.id)} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              patient.first_name ? patient.first_name.charAt(0) : 'P'
                            )}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{patient.first_name} {patient.last_name}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{age} años</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#1E293B' }}>{patient.phone || 'Sin teléfono'}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{patient.email}</p>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>Sin registro</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ backgroundColor: '#D1FAE5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                          Activo
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={(e) => { e.stopPropagation(); navigate('/admin/patients/profile', { state: { patient } }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', padding: '6px', borderRadius: '6px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#EFF6FF'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'} title="Ver Expediente">
                            <FileText size={18} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === patient.id ? null : patient.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px', borderRadius: '6px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F1F5F9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'} title="Opciones">
                            <MoreVertical size={18} />
                          </button>
                        </div>

                        {openMenuId === patient.id && (
                          <>
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                            <div style={{ position: 'absolute', right: '40px', top: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '8px', zIndex: 100, minWidth: '180px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                              <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); alert('Abriendo editor...'); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: '600', color: '#1E293B', cursor: 'pointer', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                Editar Información
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); alert('Enviando recordatorio...'); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: '600', color: '#1E293B', cursor: 'pointer', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                Enviar Notificación
                              </button>
                              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }}></div>
                              <button onClick={async (e) => { 
                                e.stopPropagation(); 
                                setOpenMenuId(null); 
                                if(window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al paciente ${patient.first_name}?`)) {
                                  try {
                                    await patientService.deletePatient(patient.id);
                                    setPatients(patients.filter(p => p.id !== patient.id));
                                  } catch (err) {
                                    console.error(err);
                                    alert("Hubo un error al eliminar el paciente de la base de datos.");
                                  }
                                }
                              }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: '700', color: '#DC2626', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <Trash2 size={14} /> Eliminar Permanente
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748B' }}>
          <span>Mostrando {Math.min(itemsPerPage, filteredPatients.length - (currentPage - 1) * itemsPerPage)} de {filteredPatients.length} pacientes • Página {currentPage} de {Math.ceil(filteredPatients.length / itemsPerPage) || 1}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', backgroundColor: 'white', borderRadius: '6px', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', opacity: currentPage <= 1 ? 0.5 : 1 }}>Anterior</button>
            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredPatients.length / itemsPerPage), p + 1))} disabled={currentPage >= Math.ceil(filteredPatients.length / itemsPerPage)} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', backgroundColor: 'white', borderRadius: '6px', cursor: currentPage >= Math.ceil(filteredPatients.length / itemsPerPage) ? 'not-allowed' : 'pointer', opacity: currentPage >= Math.ceil(filteredPatients.length / itemsPerPage) ? 0.5 : 1 }}>Siguiente</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminPatients;
