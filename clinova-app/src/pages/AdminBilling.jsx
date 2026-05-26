import React, { useState, useEffect } from 'react';
import { CreditCard, Building2, DollarSign, CheckCircle, Clock, AlertCircle, X, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { clinicService } from '../services/clinicService';
import { subscriptionService } from '../services/subscriptionService';

function AdminBilling() {
  const [clinics, setClinics] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'SPEI',
    reference: ''
  });

  const plans = [
    {
      name: 'Individual',
      price: '$85',
      period: '/mes',
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      lightBg: '#EFF6FF',
      features: ['1 usuario', 'Acceso básico', 'Soporte por email']
    },
    {
      name: 'Clínica Pequeña',
      price: '$80K-$100K',
      period: '/año',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      lightBg: '#F5F3FF',
      features: ['Múltiples doctores', 'Reportes avanzados', 'Soporte prioritario']
    },
    {
      name: 'Hospital Grande',
      price: '$120K-$180K',
      period: '/año',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      lightBg: '#ECFDF5',
      features: ['Doctores ilimitados', 'Sedes ilimitadas', 'SLA garantizado', '+ Mantenimiento $6,000/mes']
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clinicsData = await clinicService.getClinics();
        setClinics(clinicsData || []);

        // Load real subscriptions from Supabase
        const subs = await subscriptionService.getSubscriptions();
        setSubscriptions(subs || []);

        // Load real payments
        const pays = await subscriptionService.getPayments();
        setPayments(pays || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error cargando datos de facturación');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper: get subscription for a clinic
  const getClinicSubscription = (clinicId) => {
    return subscriptions.find(s => s.clinic_id === clinicId);
  };

  // Helper: get last payment for a clinic
  const getLastPayment = (clinicId) => {
    return payments.find(p => p.clinic_id === clinicId);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'PAST_DUE': return 'Vencida';
      case 'CANCELLED': return 'Cancelada';
      case 'TRIAL': return 'Prueba';
      default: return 'Sin suscripción';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE': return { bg: '#D1FAE5', color: '#065F46', icon: CheckCircle };
      case 'PAST_DUE': return { bg: '#FEE2E2', color: '#991B1B', icon: AlertCircle };
      case 'CANCELLED': return { bg: '#FEE2E2', color: '#991B1B', icon: X };
      case 'TRIAL': return { bg: '#FEF3C7', color: '#92400E', icon: Clock };
      default: return { bg: '#F1F5F9', color: '#475569', icon: Clock };
    }
  };

  // Calculate KPIs from real data
  const activeCount = subscriptions.filter(s => s.status === 'ACTIVE').length;
  const pendingPayments = subscriptions.filter(s => s.status === 'PAST_DUE').length;
  const totalRevenue = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const kpis = [
    { title: 'Ingresos del Mes', value: `$${totalRevenue.toLocaleString()}`, subtitle: 'Total facturado', icon: DollarSign, color: '#10B981', bg: '#ECFDF5' },
    { title: 'Clínicas Activas', value: activeCount.toString(), subtitle: 'Con suscripción vigente', icon: Building2, color: '#3B82F6', bg: '#EFF6FF' },
    { title: 'Pagos Pendientes', value: pendingPayments.toString(), subtitle: 'Requieren atención', icon: CreditCard, color: '#F59E0B', bg: '#FFFBEB' }
  ];

  const handleOpenModal = (clinic) => {
    setSelectedClinic(clinic);
    const sub = getClinicSubscription(clinic.id);
    setPaymentForm({
      amount: sub ? sub.amount?.toString() || '' : '',
      method: 'SPEI',
      reference: ''
    });
    setShowModal(true);
  };

  const handleRegisterPayment = async () => {
    if (!paymentForm.amount || !paymentForm.reference) {
      toast.error('Completa todos los campos');
      return;
    }

    try {
      const sub = getClinicSubscription(selectedClinic.id);

      // Register payment in Supabase
      await subscriptionService.registerPayment({
        clinic_id: selectedClinic.id,
        subscription_id: sub?.id || null,
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method.toUpperCase(),
        reference: paymentForm.reference,
        status: 'COMPLETED',
        paid_at: new Date().toISOString(),
      });

      // Update subscription status to ACTIVE in Supabase
      if (sub) {
        await subscriptionService.updateSubscription(sub.id, { status: 'ACTIVE' });
      }

      // Update clinic status to 'Activo' in Supabase
      await clinicService.updateClinic(selectedClinic.id, { status: 'Activo' });

      // Reload data
      const clinicsData = await clinicService.getClinics();
      setClinics(clinicsData || []);

      const subs = await subscriptionService.getSubscriptions();
      setSubscriptions(subs || []);

      const updatedPayments = await subscriptionService.getPayments();
      setPayments(updatedPayments || []);

      toast.success(`Pago de $${parseFloat(paymentForm.amount).toLocaleString()} registrado para ${selectedClinic.name}`);
      setShowModal(false);
      setSelectedClinic(null);
    } catch (error) {
      console.error('Error registering payment:', error);
      toast.error('Error al registrar pago: ' + (error.message || 'Intenta de nuevo'));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}>Facturación y Suscripciones</h1>
        <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>Gestión de planes, pagos y suscripciones de clínicas en la red CLINOVA.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: kpi.bg, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <kpi.icon size={24} color={kpi.color} />
              </div>
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>{kpi.value}</h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0, fontWeight: '500' }}>{kpi.title}</p>
            <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Plans Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px 0' }}>Planes Disponibles</h3>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 24px 0' }}>Planes de suscripción para clínicas de la red</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {plans.map((plan, idx) => (
            <div key={idx} style={{ borderRadius: '14px', border: '1px solid #F1F5F9', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ height: '6px', background: plan.gradient }} />
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', backgroundColor: plan.lightBg, marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: plan.color }}>{plan.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', color: '#0F172A' }}>{plan.price}</span>
                  <span style={{ fontSize: '15px', color: '#94A3B8', fontWeight: '500' }}>{plan.period}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: plan.lightBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle size={14} color={plan.color} />
                      </div>
                      <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Maintenance fee note */}
        <div style={{ marginTop: '20px', padding: '14px 20px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wrench size={18} color="#92400E" />
          <span style={{ fontSize: '13px', color: '#92400E', fontWeight: '600' }}>Cuota mensual de mantenimiento: $6,000 MXN (soporte y actualizaciones para todos los planes)</span>
        </div>
      </div>

      {/* Clinics Payment Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px 0' }}>Clínicas y Pagos</h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Estado de suscripción y últimos pagos registrados</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 8px', fontWeight: '700' }}>Clínica</th>
                <th style={{ padding: '16px 8px', fontWeight: '700' }}>Plan</th>
                <th style={{ padding: '16px 8px', fontWeight: '700' }}>Estado</th>
                <th style={{ padding: '16px 8px', fontWeight: '700' }}>Último Pago</th>
                <th style={{ padding: '16px 8px', fontWeight: '700' }}>Monto</th>
                <th style={{ padding: '16px 8px', fontWeight: '700' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ fontSize: '14px' }}>Cargando datos...</span>
                    </div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </td>
                </tr>
              ) : clinics.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={32} color="#CBD5E1" />
                      <span style={{ fontSize: '14px' }}>No hay clínicas registradas aún.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                clinics.map((clinic) => {
                  const sub = getClinicSubscription(clinic.id);
                  const lastPayment = getLastPayment(clinic.id);
                  const statusKey = sub?.status || 'none';
                  const statusStyle = getStatusStyle(statusKey);
                  const StatusIcon = statusStyle.icon;
                  const planName = sub?.plan || clinic.contract_plan || 'Sin plan';
                  const planMatch = plans.find(p => p.name === planName);
                  
                  return (
                    <tr key={clinic.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building2 size={18} color="white" />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{clinic.name}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>{clinic.address || 'Sin dirección'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: planMatch?.color || '#64748B', backgroundColor: planMatch?.lightBg || '#F1F5F9', padding: '4px 12px', borderRadius: '20px' }}>
                          {planName}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <StatusIcon size={14} color={statusStyle.color} />
                          <span style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                            {getStatusLabel(statusKey)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px', fontSize: '14px', color: '#475569' }}>
                        {lastPayment?.paid_at ? new Date(lastPayment.paid_at).toLocaleDateString('es-MX') : <span style={{ color: '#CBD5E1', fontStyle: 'italic' }}>Sin pagos</span>}
                      </td>
                      <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                        {lastPayment ? `$${lastPayment.amount?.toLocaleString()}` : '$0'}
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <button
                          onClick={() => handleOpenModal(clinic)}
                          style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(59,130,246,0.3)', whiteSpace: 'nowrap' }}
                          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)'; }}
                          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)'; }}
                        >
                          <CreditCard size={14} />
                          Registrar Pago
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Payment Modal */}
      {showModal && selectedClinic && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setShowModal(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 24px 48px rgba(0,0,0,0.12)', position: 'relative', animation: 'modalIn 0.3s ease' }} onClick={e => e.stopPropagation()}>
            <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px 0' }}>Registrar Pago</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Registrar un nuevo pago para la clínica</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Clínica</label>
              <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '14px', color: '#1E293B', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={16} color="#3B82F6" />
                {selectedClinic.name}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Monto (MXN)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', fontWeight: '700', color: '#94A3B8' }}>$</span>
                <input
                  type="number"
                  value={paymentForm.amount}
                  readOnly
                  placeholder="0.00"
                  style={{ width: '100%', padding: '12px 16px 12px 36px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', color: '#1E293B', outline: 'none', boxSizing: 'border-box', fontWeight: '600', backgroundColor: '#F8FAFC', cursor: 'not-allowed' }}
                />
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>
                🔒 El monto correspond al plan contratado y no puede modificarse. Para cambiar de plan, el contrato actual debe cancelarse.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Método de Pago</label>
              <select
                value={paymentForm.method}
                onChange={e => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', color: '#1E293B', outline: 'none', backgroundColor: 'white', cursor: 'pointer', transition: 'border-color 0.2s', fontWeight: '600', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              >
                <option value="SPEI">SPEI (Transferencia)</option>
                <option value="OXXO">OXXO</option>
                <option value="CARD">Tarjeta de Crédito/Débito</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Número de Referencia</label>
              <input
                type="text"
                value={paymentForm.reference}
                onChange={e => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Ej: REF-2026-001"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px', color: '#1E293B', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', fontWeight: '500' }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>

            <button
              onClick={handleRegisterPayment}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(59,130,246,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)'; }}
            >
              <CheckCircle size={18} />
              Confirmar Pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBilling;
