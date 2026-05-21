import React from 'react';
import { ArrowLeft, Building2, Phone, Mail, MapPin, Users, CreditCard, FileText, CheckCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminClinicProfile() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/admin/clinics')} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E293B', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Expediente de Contrato Sede</h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>ID: SED-001 • Cliente B2B</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Clinic Demographics */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          
          <div style={{ width: '96px', height: '96px', borderRadius: '24px', backgroundColor: '#EFF6FF', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3B82F6', marginBottom: '16px' }}>
            <Building2 size={48} />
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px 0' }}>CLINOVA Central</h2>
          <p style={{ fontSize: '15px', color: '#64748B', fontWeight: '500', margin: '0 0 16px 0' }}>Hospital de Especialidades</p>
          
          <span style={{ backgroundColor: '#D1FAE5', color: '#059669', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '32px' }}>
            Servicio Activo
          </span>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><User size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>GERENTE/DIRECTOR</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>Lic. Martha Gómez</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><Phone size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>TELÉFONO SEDE</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>+52 55 9876 5432</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><Mail size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>CORREO ADMINISTRACIÓN</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>admin.central@clinova.com</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><MapPin size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>DIRECCIÓN</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>Av. Reforma #123, CDMX</p>
              </div>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '1px', backgroundColor: '#F1F5F9', margin: '24px 0' }}></div>
          
          <button style={{ width: '100%', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}>
            Suspender Servicio
          </button>
        </div>

        {/* Right Column: Contract & Billing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Contract Details */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#3B82F6" />
                Detalles del Contrato
              </h3>
              <button style={{ color: '#3B82F6', background: 'none', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Actualizar Plan</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>TIPO DE PLAN</p>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Corporativo 50</p>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>$15,000 MXN / mes</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>PRÓXIMA RENOVACIÓN</p>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: 0 }}>15 Nov 2026</p>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>Cobro Automático</p>
              </div>
            </div>
          </div>

          {/* Licenses */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#8B5CF6" />
              Consumo de Licencias (Staff)
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>32 médicos registrados</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#8B5CF6' }}>Límite: 50</span>
            </div>
            
            <div style={{ width: '100%', height: '12px', backgroundColor: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: '64%', height: '100%', backgroundColor: '#8B5CF6', borderRadius: '6px' }}></div>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '12px 0 0 0' }}>Si la sede excede este límite, deberán hacer un upgrade de plan.</p>
          </div>

          {/* Billing History */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="#10B981" />
              Historial de Facturación
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#D1FAE5', borderRadius: '10px', color: '#059669' }}><CheckCircle size={20} /></div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', margin: 0 }}>Factura #FAC-2026-10 (Octubre)</p>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>Pagada el 15 Oct 2026 • Stripe</p>
                  </div>
                </div>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>$15,000.00</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '10px', backgroundColor: '#D1FAE5', borderRadius: '10px', color: '#059669' }}><CheckCircle size={20} /></div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', margin: 0 }}>Factura #FAC-2026-09 (Septiembre)</p>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>Pagada el 15 Sep 2026 • Transferencia</p>
                  </div>
                </div>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>$15,000.00</span>
              </div>
              
              <button style={{ width: '100%', padding: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Descargar Comprobantes
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminClinicProfile;
