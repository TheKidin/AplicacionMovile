import React, { useState } from 'react';
import { ArrowLeft, Building2, User, CreditCard, ShieldCheck, CheckCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clinicService } from '../services/clinicService';

function AdminClinicRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rfc: '',
    address: '',
    contract_plan: '',
    // Nota: director, email y phone no están en la tabla clinics actual, pero podrían agregarse después
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clinicService.createClinic({
        name: formData.name,
        rfc: formData.rfc,
        address: formData.address,
        contract_plan: formData.contract_plan,
      });
      alert('¡Sede registrada exitosamente! El contrato ha sido guardado en la base de datos.');
      navigate('/admin/clinics');
    } catch (err) {
      console.error(err);
      alert('Hubo un error al registrar la sede. Verifica la consola para más detalles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/admin/clinics')} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E293B', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Alta de Contrato B2B</h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Registra una nueva Sede en la red CLINOVA</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section 1: Institución */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', backgroundColor: '#EFF6FF', borderRadius: '12px', color: '#3B82F6' }}>
              <Building2 size={24} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Datos de la Institución</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Nombre Comercial del Hospital</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ej. Hospital Ángeles" required style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>RFC (Facturación)</label>
              <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} placeholder="ABC123456T89" required style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Dirección Completa</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Av. Principal #123, Colonia, Ciudad, Estado" required style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>
        </div>

        {/* Section 2: Contacto Administrativo */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', backgroundColor: '#F3E8FF', borderRadius: '12px', color: '#A855F7' }}>
              <User size={24} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Contacto Administrativo (Gerencia)</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Nombre Completo del Director / Gerente</label>
              <input type="text" placeholder="Lic. Juan Pérez" required style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Correo para Facturas</label>
              <input type="email" placeholder="admin@hospital.com" required style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Teléfono Móvil (Directo)</label>
              <input type="tel" placeholder="+52 55 1234 5678" required style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none' }} />
            </div>
          </div>
        </div>

        {/* Section 3: Contrato */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', backgroundColor: '#ECFDF5', borderRadius: '12px', color: '#10B981' }}>
              <CreditCard size={24} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Configuración de Contrato y Licencias</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Seleccionar Plan de Licencias</label>
              <select name="contract_plan" value={formData.contract_plan} onChange={handleChange} required style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}>
                <option value="">Seleccione un plan...</option>
                <option value="Individual">Usuario Individual - $85 MXN/mes</option>
                <option value="Clínica Pequeña">Clínica Pequeña - $80,000 - $100,000 MXN/año</option>
                <option value="Hospital Grande">Hospital Grande - $120,000 - $180,000 MXN/año</option>
              </select>
            </div>
            
            <div style={{ padding: '12px 16px', backgroundColor: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A', fontSize: '13px', color: '#92400E', fontWeight: '600' }}>
              💡 Cuota mensual de mantenimiento: $6,000 MXN (para soporte y actualizaciones)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Método de Pago Acordado</label>
              <select required style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', outline: 'none', backgroundColor: 'white', cursor: 'pointer' }}>
                <option value="spei">Transferencia Bancaria (SPEI)</option>
                <option value="oxxo">Depósito en OXXO</option>
                <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="otro">Otro método acordado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingBottom: '32px' }}>
          <button type="submit" disabled={loading} style={{ backgroundColor: loading ? '#9CA3AF' : '#10B981', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'transform 0.2s' }} onMouseOver={e => {if(!loading) e.currentTarget.style.transform = 'scale(1.02)'}} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            {loading ? <Loader size={20} className="spinner" /> : <CheckCircle size={20} />}
            {loading ? 'Guardando...' : 'Crear Contrato y Activar Sede'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default AdminClinicRegister;
