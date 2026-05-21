import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Terms() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Términos y Privacidad</h1>
      </div>

      <div className="card" style={{ padding: '24px', lineHeight: '1.6', color: '#4B5563', fontSize: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#1D4ED8' }}>
          <FileText size={24} />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>Aviso de Privacidad</h2>
        </div>
        
        <p style={{ marginBottom: '16px' }}>
          En <strong>CLINOVA</strong> valoramos su privacidad y nos comprometemos a proteger sus datos personales y médicos de acuerdo con las normativas legales vigentes.
        </p>

        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginTop: '24px', marginBottom: '8px' }}>1. Uso de la Información</h3>
        <p style={{ marginBottom: '16px' }}>
          Su información clínica será utilizada exclusivamente para proveerle atención médica integral, llevar un control de su historial, y facilitar diagnósticos por parte de nuestro equipo de especialistas autorizados.
        </p>

        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginTop: '24px', marginBottom: '8px' }}>2. Confidencialidad</h3>
        <p style={{ marginBottom: '16px' }}>
          Todos los registros médicos, diagnósticos y resultados de laboratorio están encriptados y protegidos con los más altos estándares de seguridad tecnológica. Ninguna entidad externa tendrá acceso a esta información sin su consentimiento explícito por escrito.
        </p>

        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginTop: '24px', marginBottom: '8px' }}>3. Derechos ARCO</h3>
        <p style={{ marginBottom: '16px' }}>
          Usted tiene el derecho de Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, puede comunicarse con el departamento legal a través del área de Soporte de esta aplicación.
        </p>

        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Última actualización: Octubre 2023</p>
        </div>
      </div>
    </div>
  );
}

export default Terms;
