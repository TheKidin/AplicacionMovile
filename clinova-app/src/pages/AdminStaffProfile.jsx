import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Mail, Phone, MapPin, Briefcase, GraduationCap, Clock, Award, Key, AlertTriangle, Save, ExternalLink, CheckCircle, Edit3 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { clinicService } from '../services/clinicService';
import toast from 'react-hot-toast';

function AdminStaffProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [employee, setEmployee] = useState(location.state?.employee);
  const [suspending, setSuspending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [editLicense, setEditLicense] = useState(employee?.license_number || '');
  const [editUniversity, setEditUniversity] = useState(employee?.university || '');
  const [editSpecialty, setEditSpecialty] = useState(employee?.specialty || '');
  const [editClinicId, setEditClinicId] = useState(employee?.clinic_id || '');
  const [licenseVerified, setLicenseVerified] = useState(employee?.license_verified || false);

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const data = await clinicService.getClinics();
        setClinics(data || []);
      } catch (err) {
        console.error('Error loading clinics:', err);
      }
    };
    loadClinics();
  }, []);

  if (!employee) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <h2 style={{ color: '#1E293B' }}>Empleado no seleccionado</h2>
        <button onClick={() => navigate('/admin/staff')} className="btn-primary">Volver al Directorio</button>
      </div>
    );
  }

  const isSuspended = employee.status === 'SUSPENDED';
  const isPending = employee.status === 'PENDING';
  const roleName = employee.role === 'DOCTOR' ? 'Doctor(a)' : employee.role === 'NURSE' ? 'Enfermero(a)' : employee.role === 'ADMIN' ? 'Administrador' : 'Staff';
  const name = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Sin Nombre';
  const clinicName = employee.clinic_id ? (clinics.find(c => c.id === employee.clinic_id)?.name || 'Sin Asignar') : 'Sin Asignar';

  const handleToggleSuspend = async () => {
    setSuspending(true);
    try {
      const newStatus = isSuspended || isPending ? 'ACTIVE' : 'SUSPENDED';
      const updated = await authService.updateProfileStatus(employee.id, newStatus);
      setEmployee({ ...employee, status: updated.status });
      toast.success(isSuspended || isPending ? '✅ Empleado reactivado correctamente' : '🔴 Empleado suspendido correctamente');
      setShowConfirm(false);
    } catch (err) {
      toast.error('Error al actualizar el estado: ' + (err.message || 'Intenta de nuevo'));
    } finally {
      setSuspending(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      await authService.updateProfile(employee.id, {
        license_number: editLicense,
        university: editUniversity,
        specialty: editSpecialty,
        clinic_id: editClinicId || null,
        license_verified: licenseVerified,
      });
      setEmployee({
        ...employee,
        license_number: editLicense,
        university: editUniversity,
        specialty: editSpecialty,
        clinic_id: editClinicId || null,
        license_verified: licenseVerified,
      });
      setEditing(false);
      toast.success('✅ Datos actualizados correctamente');
    } catch (err) {
      toast.error('Error al guardar: ' + (err.message || 'Intenta de nuevo'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: (isSuspended || isPending) ? '#D1FAE5' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={32} color={(isSuspended || isPending) ? '#059669' : '#DC2626'} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                {(isSuspended || isPending) ? 'Aprobar / Reactivar empleado' : 'Suspender empleado'}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                {(isSuspended || isPending)
                  ? `¿Deseas aprobar y activar la cuenta de ${name}? Podrá acceder al sistema.`
                  : `¿Estás seguro de suspender a ${name}? No podrá acceder al sistema hasta que sea reactivado.`}
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
                <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', color: '#475569' }}>
                  Cancelar
                </button>
                <button
                  onClick={handleToggleSuspend}
                  disabled={suspending}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: (isSuspended || isPending) ? '#059669' : '#DC2626', color: 'white', fontSize: '14px', fontWeight: '700', cursor: suspending ? 'not-allowed' : 'pointer', opacity: suspending ? 0.7 : 1 }}
                >
                  {suspending ? 'Procesando...' : (isSuspended || isPending) ? 'Aprobar' : 'Suspender'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/admin/staff')} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E293B', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Expediente de Empleado</h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>ID: {employee.id.substring(0,8).toUpperCase()} • Perfil de Recursos Humanos</p>
        </div>
        {isPending && (
          <button onClick={() => setShowConfirm(true)} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #059669, #10B981)', color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5,150,105,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> Aprobar Solicitud
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Identity Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '24px', backgroundColor: '#F3F4F6', overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', opacity: isSuspended ? 0.6 : 1 }}>
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', backgroundColor: isSuspended ? '#DC2626' : isPending ? '#F59E0B' : '#10B981', color: 'white', padding: '4px', borderRadius: '50%', border: '3px solid white', display: 'flex' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1E293B', margin: '0 0 4px 0' }}>{name}</h2>
          <p style={{ fontSize: '15px', color: '#3B82F6', fontWeight: '600', margin: '0 0 16px 0' }}>{roleName} {employee.specialty ? `• ${employee.specialty}` : ''}</p>
          
          <span style={{ backgroundColor: isPending ? '#FEF3C7' : isSuspended ? '#FEE2E2' : '#D1FAE5', color: isPending ? '#B45309' : isSuspended ? '#DC2626' : '#059669', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '32px' }}>
            {isPending ? '⏳ Pendiente de Aprobación' : isSuspended ? 'Cuenta Suspendida' : 'Cuenta Activa'}
          </span>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><Mail size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>CORREO INSTITUCIONAL</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>{employee.email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><Phone size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>TELÉFONO PERSONAL</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>{employee.phone || 'Sin registro'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B' }}><MapPin size={16} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', margin: 0 }}>SEDE ASIGNADA</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: 0 }}>{clinicName}</p>
              </div>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '1px', backgroundColor: '#F1F5F9', margin: '24px 0' }}></div>
          
          {/* Suspend / Reactivate Button */}
          <button
            onClick={() => setShowConfirm(true)}
            style={{ width: '100%', backgroundColor: (isSuspended || isPending) ? '#D1FAE5' : '#FEE2E2', color: (isSuspended || isPending) ? '#059669' : '#DC2626', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'opacity 0.2s' }}
          >
            {(isSuspended || isPending) ? '✅ Aprobar / Reactivar' : '🔴 Suspender Empleado'}
          </button>
        </div>

        {/* Right Column: Details & Validations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Professional Credentials — EDITABLE */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: licenseVerified ? '1px solid #D1FAE5' : '1px solid #FDE68A' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#3B82F6" />
                Validación Profesional
                {licenseVerified && <span style={{ fontSize: '11px', backgroundColor: '#D1FAE5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontWeight: '700' }}>✓ Verificada</span>}
              </h3>
              <button onClick={() => setEditing(!editing)} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={14} /> {editing ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>CÉDULA PROFESIONAL</p>
                {editing ? (
                  <input type="text" value={editLicense} onChange={e => setEditLicense(e.target.value)} placeholder="Ej. CP-1234567" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid #E2E8F0', backgroundColor: 'white', fontSize: '14px', outline: 'none', fontWeight: '600' }} />
                ) : (
                  <>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B', margin: 0 }}>{employee.license_number || 'Sin registro'}</p>
                    {licenseVerified && <p style={{ fontSize: '12px', color: '#10B981', margin: '4px 0 0 0', fontWeight: '600' }}>✓ Verificada por administrador</p>}
                  </>
                )}
              </div>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>UNIVERSIDAD EGRESO</p>
                {editing ? (
                  <input type="text" value={editUniversity} onChange={e => setEditUniversity(e.target.value)} placeholder="Ej. U.N.A.M." style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid #E2E8F0', backgroundColor: 'white', fontSize: '14px', outline: 'none', fontWeight: '600' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={16} color="#64748B" />
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B', margin: 0 }}>{employee.university || 'Sin registro'}</p>
                  </div>
                )}
              </div>
            </div>

            {editing && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                  <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>ESPECIALIDAD</p>
                  <input type="text" value={editSpecialty} onChange={e => setEditSpecialty(e.target.value)} placeholder="Ej. Cardiología" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid #E2E8F0', backgroundColor: 'white', fontSize: '14px', outline: 'none', fontWeight: '600' }} />
                </div>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                  <p style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>SEDE ASIGNADA</p>
                  <select value={editClinicId} onChange={e => setEditClinicId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid #E2E8F0', backgroundColor: 'white', fontSize: '14px', outline: 'none', fontWeight: '600', appearance: 'none' }}>
                    <option value="">Sin Asignar</option>
                    {clinics.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Verification Controls */}
            {editing && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Verify on SEP button */}
                <a href="https://cedulaprofesional.sep.gob.mx/cedula/presidencia/indexAvanzada.action" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '13px', fontWeight: '700', textDecoration: 'none', border: '1px solid #BFDBFE', transition: 'all 0.2s' }}>
                  <ExternalLink size={16} /> Verificar Cédula en Portal de la SEP
                </a>
                
                {/* Mark as verified checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', backgroundColor: licenseVerified ? '#D1FAE5' : '#F8FAFC', border: licenseVerified ? '1px solid #6EE7B7' : '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => setLicenseVerified(!licenseVerified)}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: licenseVerified ? 'none' : '2px solid #CBD5E1', backgroundColor: licenseVerified ? '#059669' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {licenseVerified && <CheckCircle size={16} color="white" />}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: licenseVerified ? '#059669' : '#64748B' }}>
                    {licenseVerified ? 'Cédula verificada por administrador' : 'Marcar cédula como verificada'}
                  </span>
                </div>

                {/* Save Button */}
                <button onClick={handleSaveChanges} disabled={saving} style={{ padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1B2C66, #2563EB)', color: 'white', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(27,44,102,0.3)' }}>
                  <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            )}
          </div>

          {/* Operational Info */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="#8B5CF6" />
              Asignación Operativa
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ padding: '10px', backgroundColor: '#F5F3FF', borderRadius: '10px', color: '#8B5CF6' }}><MapPin size={20} /></div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', margin: 0 }}>SEDE ASIGNADA</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B', margin: '2px 0 0 0' }}>{clinicName}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '10px', backgroundColor: '#FFFBEB', borderRadius: '10px', color: '#D97706' }}><Clock size={20} /></div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', margin: 0 }}>HORARIO LABORAL</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#1E293B', margin: '2px 0 0 0' }}>Lunes a Viernes • 08:00 AM - 04:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1E293B', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={20} color="#64748B" />
              Seguridad de la Cuenta
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B', margin: '0 0 4px 0' }}>Estado de acceso</p>
                <p style={{ fontSize: '13px', color: isPending ? '#B45309' : isSuspended ? '#DC2626' : '#059669', margin: 0, fontWeight: '600' }}>
                  {isPending ? '⏳ Esperando aprobación del administrador' : isSuspended ? '🔴 Acceso bloqueado por administrador' : '🟢 Acceso activo al sistema'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminStaffProfile;
