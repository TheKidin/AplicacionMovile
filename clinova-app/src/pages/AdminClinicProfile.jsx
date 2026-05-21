import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Phone, Mail, MapPin, Users, CreditCard, FileText, CheckCircle, User, Clock, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';

function AdminClinicProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const clinic = location.state?.clinic;
  const [staffCount, setStaffCount] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinic) { navigate('/admin/clinics'); return; }
    const fetchData = async () => {
      try {
        // Count staff assigned to this clinic
        const profiles = await authService.getAllProfiles();
        const clinicStaff = (profiles || []).filter(p => p.clinic_id === clinic.id && (p.role === 'DOCTOR' || p.role === 'NURSE'));
        setStaffCount(clinicStaff.length);

        // Get subscription for this clinic
        const subs = await subscriptionService.getSubscriptions();
        const clinicSub = (subs || []).find(s => s.clinic_id === clinic.id);
        setSubscription(clinicSub || null);

        // Get payments for this clinic
        const pays = await subscriptionService.getPayments(clinic.id);
        setPayments(pays || []);
      } catch (err) {
        console.error('Error loading clinic profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clinic, navigate]);

  if (!clinic) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#D1FAE5', color: '#059669', label: 'Servicio Activo', icon: CheckCircle };
      case 'PAST_DUE': return { bg: '#FEE2E2', color: '#DC2626', label: 'Pago Vencido', icon: AlertCircle };
      case 'TRIAL': return { bg: '#FEF3C7', color: '#92400E', label: 'Prueba Gratis', icon: Clock };
      default: return { bg: '#F1F5F9', color: '#64748B', label: 'Sin suscripción', icon: Clock };
    }
  };

  const subStatus = getStatusStyle(subscription?.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/admin/clinics')} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E293B', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Expediente de Contrato Sede</h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>ID: {clinic.id?.substring(0, 8).toUpperCase()} • Cliente B2B</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '24px', backgroundColor: '#EFF6FF', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#3B82F6', marginBottom: '16px' }}>
            <Building2 size={48} />
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px 0' }}>{clinic.name}</h2>
          <p style={{ fontSize: '15px', color: '#64748B', fontWeight: '500', margin: '0 0 16px 0' }}>{clinic.contract_plan || 'Sin plan asignado'}</p>
          
          <span style={{ backgroundColor: subStatus.bg, color: subStatus.color, padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <subStatus.icon size={14} />
            {subStatus.label}
          </span>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><User size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>RFC</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>{clinic.rfc || 'No registrado'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><MapPin size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>DIRECCIÓN</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>{clinic.address || 'Sin dirección'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><Users size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>PERSONAL ASIGNADO</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>{staffCount} empleados</p>
              </div>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '1px', backgroundColor: '#F1F5F9', margin: '24px 0' }}></div>
          
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Registrada: {clinic.created_at ? new Date(clinic.created_at).toLocaleDateString('es-MX') : 'N/A'}</p>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Contract Details */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#3B82F6" />
              Detalles del Contrato
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>PLAN CONTRATADO</p>
                <p style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: 0 }}>{clinic.contract_plan || subscription?.plan || 'Sin plan'}</p>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>{subscription ? `$${subscription.amount?.toLocaleString()} MXN` : 'Sin monto'}</p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', margin: '0 0 4px 0', letterSpacing: '0.5px' }}>ESTADO</p>
                <p style={{ fontSize: '16px', fontWeight: '800', color: subStatus.color, margin: 0 }}>{subStatus.label}</p>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                  {subscription?.start_date ? `Desde: ${new Date(subscription.start_date).toLocaleDateString('es-MX')}` : 'Sin fecha'}
                </p>
              </div>
            </div>
          </div>

          {/* Staff Count */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#8B5CF6" />
              Personal Registrado
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{staffCount} empleados asignados</span>
            </div>
            <div style={{ width: '100%', height: '12px', backgroundColor: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ width: staffCount > 0 ? '100%' : '0%', height: '100%', backgroundColor: '#8B5CF6', borderRadius: '6px', transition: 'width 0.5s ease' }}></div>
            </div>
          </div>

          {/* Billing History */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="#10B981" />
              Historial de Pagos
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {payments.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#94A3B8', textAlign: 'center', padding: '24px 0' }}>No hay pagos registrados para esta sede.</p>
              ) : (
                payments.slice(0, 5).map(payment => (
                  <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ padding: '10px', backgroundColor: payment.status === 'COMPLETED' ? '#D1FAE5' : '#FEF3C7', borderRadius: '10px', color: payment.status === 'COMPLETED' ? '#059669' : '#92400E' }}>
                        {payment.status === 'COMPLETED' ? <CheckCircle size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                          Pago #{payment.reference || payment.id.substring(0, 8).toUpperCase()}
                        </p>
                        <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                          {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('es-MX') : 'Pendiente'} • {payment.method || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>${payment.amount?.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminClinicProfile;
