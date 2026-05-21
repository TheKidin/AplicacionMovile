import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, MoreVertical, ShieldCheck, Clock, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { clinicService } from '../services/clinicService';

function AdminStaff() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleApprove = async (employeeId) => {
    try {
      await authService.updateProfileStatus(employeeId, 'ACTIVE');
      setStaff(prev => prev.map(s => s.id === employeeId ? { ...s, status: 'ACTIVE' } : s));
      setPendingCount(prev => Math.max(0, prev - 1));
      toast.success('✅ Empleado aprobado y activado exitosamente');
    } catch (error) {
      toast.error('Error al aprobar: ' + (error.message || 'Intenta de nuevo'));
    }
    setOpenMenuId(null);
  };

  const handleSuspend = async (employeeId, employeeName) => {
    try {
      await authService.updateProfileStatus(employeeId, 'SUSPENDED');
      setStaff(prev => prev.map(s => s.id === employeeId ? { ...s, status: 'SUSPENDED' } : s));
      toast.success(`🔴 ${employeeName} ha sido desactivado del sistema`);
    } catch (error) {
      toast.error('Error al desactivar: ' + (error.message || 'Intenta de nuevo'));
    }
    setOpenMenuId(null);
  };

  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const profiles = await authService.getAllProfiles();
        const staffProfiles = profiles.filter(p => {
          const role = (p.role || '').toUpperCase();
          return role !== 'PATIENT' && role !== 'CLIENT' && role !== 'ADMIN';
        });
        setStaff(staffProfiles);
        
        const pending = staffProfiles.filter(p => p.status === 'PENDING');
        setPendingCount(pending.length);
      } catch (error) {
        console.error("Error loading staff:", error);
      } finally {
        setLoading(false);
      }
    };
    const loadClinics = async () => {
      try {
        const cData = await clinicService.getClinics();
        setClinics(cData || []);
      } catch (error) {
        console.error("Error loading clinics:", error);
      }
    };
    loadStaff();
    loadClinics();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Activo': return { bg: '#D1FAE5', color: '#059669', icon: <ShieldCheck size={14} /> };
      case 'Pendiente': return { bg: '#FEF3C7', color: '#B45309', icon: <Clock size={14} /> };
      case 'Inactivo': return { bg: '#F1F5F9', color: '#64748B', icon: null };
      default: return { bg: '#D1FAE5', color: '#059669', icon: <ShieldCheck size={14} /> };
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (searchTerm === 'PENDING' && s.status === 'PENDING');
    const matchesClinic = !selectedClinic || s.clinic_id === selectedClinic;
    return matchesSearch && matchesClinic;
  });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}>Directorio de Personal Médico</h1>
          <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>Gestiona a los médicos, enfermeras y recepcionistas de la red.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setSearchTerm('PENDING')}
            style={{ backgroundColor: pendingCount > 0 ? '#FEF2F2' : '#FFFFFF', color: pendingCount > 0 ? '#DC2626' : '#1B2C66', border: pendingCount > 0 ? '1px solid #FCA5A5' : '1px solid #E2E8F0', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}>
            Revisar Solicitudes ({pendingCount})
          </button>
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
              placeholder="Buscar por nombre o ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', outline: 'none', fontSize: '14px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <select value={selectedClinic} onChange={(e) => { setSelectedClinic(e.target.value); setCurrentPage(1); }} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', outline: 'none', fontSize: '14px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
              <option value="">Todas las Sedes</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button style={{ backgroundColor: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Filter size={18} />
              Más Filtros
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'visible' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Empleado</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Rol</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Sede Asignada</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Estado</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Loader className="spinner" size={24} color="#1D4ED8" />
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                    No se encontró personal registrado.
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((employee, idx) => {
                  const statusStyle = getStatusColor(employee.status === 'PENDING' ? 'Pendiente' : (employee.status === 'SUSPENDED' ? 'Inactivo' : 'Activo'));
                  const avatarStr = authService.getAvatarLocal(employee.id);
                  return (
                    <tr key={employee.id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                            <img src={avatarStr || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.first_name}`} alt={employee.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{employee.first_name} {employee.last_name}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{employee.role}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{employee.specialty || 'General'}</p>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{employee.clinic_id ? (clinics.find(c => c.id === employee.clinic_id)?.name || 'Sin Asignar') : 'Sin Asignar'}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {statusStyle.icon} {employee.status === 'PENDING' ? 'Pendiente' : (employee.status === 'SUSPENDED' ? 'Inactivo' : 'Activo')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={(e) => { e.stopPropagation(); navigate('/admin/staff/profile', { state: { employee } }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', padding: '6px', borderRadius: '6px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#EFF6FF'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'} title="Ver Perfil">
                          <FileText size={18} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === employee.id ? null : employee.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px', borderRadius: '6px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F1F5F9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'} title="Opciones">
                          <MoreVertical size={18} />
                        </button>
                      </div>

                      {openMenuId === employee.id && (
                        <>
                          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                          <div style={{ position: 'absolute', right: '40px', top: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '8px', zIndex: 100, minWidth: '180px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                            <button onClick={(e) => { e.stopPropagation(); handleApprove(employee.id); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: '600', color: '#059669', cursor: 'pointer', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#D1FAE5'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                              Aprobar / Activar
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); navigate('/admin/staff/profile', { state: { employee } }); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: '600', color: '#1E293B', cursor: 'pointer', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                              Editar Especialidad
                            </button>
                            <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }}></div>
                            <button onClick={(e) => { e.stopPropagation(); handleSuspend(employee.id, employee.first_name); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: '700', color: '#DC2626', cursor: 'pointer', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                              Desactivar Cuenta
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748B' }}>
          <span>Mostrando {paginatedStaff.length} de {filteredStaff.length} empleados • Página {currentPage} de {totalPages || 1}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', backgroundColor: 'white', borderRadius: '6px', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', opacity: currentPage <= 1 ? 0.5 : 1 }}>Anterior</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', backgroundColor: 'white', borderRadius: '6px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage >= totalPages ? 0.5 : 1 }}>Siguiente</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminStaff;
