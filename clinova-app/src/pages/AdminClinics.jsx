import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, FileText, MoreVertical, Building2, CreditCard, Users, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clinicService } from '../services/clinicService';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';

function AdminClinics() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffCount, setStaffCount] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const data = await clinicService.getClinics();
        setClinics(data || []);
        // Count total staff (doctors + nurses)
        const doctors = await authService.getUsersByRole('DOCTOR');
        const nurses = await authService.getNurseCount();
        setStaffCount((doctors || []).length + (nurses || 0));
        // Count pending payments from subscriptions
        try {
          const subs = await subscriptionService.getSubscriptions();
          setPendingPayments((subs || []).filter(s => s.status === 'PAST_DUE').length);
        } catch (e) { console.log('Subscriptions not loaded'); }
      } catch (error) {
        console.error("Error al cargar clínicas", error);
      } finally {
        setLoading(false);
      }
    };
    loadClinics();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Activo': return { bg: '#D1FAE5', color: '#059669' };
      case 'Pago Pendiente': return { bg: '#FEF3C7', color: '#B45309' };
      case 'Suspendido': return { bg: '#FEE2E2', color: '#DC2626' };
      default: return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}>Gestión de Sedes (Hospitales)</h1>
          <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>Administra los contratos, licencias y el estado de las clínicas afiliadas.</p>
        </div>
        
        <button onClick={() => navigate('/admin/clinics/new')} style={{ backgroundColor: '#1B2C66', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(27,44,102,0.2)' }}>
          <Plus size={18} />
          Registrar Nueva Sede
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
            <Building2 size={24} color="#3B82F6" />
          </div>
          <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>{clinics.length}</h3>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, fontWeight: '500' }}>Sedes Activas</p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FEE2E2', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
            <CreditCard size={24} color="#DC2626" />
          </div>
          <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>{pendingPayments}</h3>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, fontWeight: '500' }}>Pagos Pendientes</p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F5F3FF', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
            <Users size={24} color="#8B5CF6" />
          </div>
          <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>{staffCount}</h3>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, fontWeight: '500' }}>Personal Registrado</p>
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
              placeholder="Buscar hospital o clínica..." 
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
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Hospital / Clínica</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Administrador (Contacto)</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Plan Contratado</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Licencias (En Uso)</th>
                <th style={{ padding: '16px 24px', fontWeight: '700' }}>Estado de Servicio</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', textAlign: 'right' }}>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#3B82F6' }}>
                      <Loader size={20} className="spinner" />
                      <span>Cargando sedes desde Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : clinics.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                    No hay clínicas registradas. Haz clic en "Registrar Nueva Sede" para empezar.
                  </td>
                </tr>
              ) : (
                clinics.map((clinic) => {
                  const status = clinic.status || 'Activo'; 
                  const statusStyle = getStatusColor(status);
                  return (
                    <tr key={clinic.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1B2C66', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: '800', fontSize: '14px' }}>
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{clinic.name}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{clinic.rfc || 'RFC Pendiente'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#475569', fontWeight: '500' }}>{clinic.rfc || 'Sin RFC'}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B', fontWeight: '600' }}>{clinic.contract_plan || 'N/A'}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B', fontWeight: '500' }}>{clinic.contract_plan || 'Sin asignar'}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={(e) => { e.stopPropagation(); navigate('/admin/clinics/profile', { state: { clinic } }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', padding: '6px', borderRadius: '6px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#EFF6FF'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'} title="Detalles del Contrato">
                          <FileText size={18} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === clinic.id ? null : clinic.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '6px', borderRadius: '6px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F1F5F9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'} title="Opciones">
                          <MoreVertical size={18} />
                        </button>
                      </div>

                    {openMenuId === clinic.id && (
                      <>
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}></div>
                        <div style={{ position: 'absolute', right: '40px', top: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '8px', zIndex: 100, minWidth: '180px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                          <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); alert('Verificando cobros...'); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: '600', color: '#1E293B', cursor: 'pointer', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            Historial de Pagos
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); alert('Abriendo editor...'); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: '600', color: '#1E293B', cursor: 'pointer', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            Cambiar Suscripción
                          </button>
                          <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }}></div>
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            if (window.confirm(`¿Estás seguro de suspender el servicio para ${clinic.name}?`)) {
                              try {
                                await clinicService.updateClinic(clinic.id, { status: 'Suspendido' });
                                const subs = await subscriptionService.getSubscriptions();
                                const clinicSub = (subs || []).find(s => s.clinic_id === clinic.id);
                                if (clinicSub) {
                                  await subscriptionService.updateSubscription(clinicSub.id, { status: 'CANCELLED' });
                                }
                                const updatedClinics = await clinicService.getClinics();
                                setClinics(updatedClinics || []);
                                alert(`La Sede ${clinic.name} ha sido SUSPENDIDA.`);
                              } catch (err) {
                                console.error('Error al suspender clínica:', err);
                                alert('Error al suspender la clínica');
                              }
                            }
                          }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: '700', color: '#DC2626', cursor: 'pointer', borderRadius: '6px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            Suspender Servicio
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
        
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748B' }}>
          <span>Mostrando {clinics.length} sedes registradas</span>
        </div>

      </div>
    </div>
  );
}

export default AdminClinics;
