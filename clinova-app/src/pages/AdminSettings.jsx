import React, { useState } from 'react';
import { User, Lock, Settings, Save, Globe, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const AdminSettings = () => {
  const { currentUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Administrador',
    email: currentUser?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [systemForm, setSystemForm] = useState({
    companyName: 'Clinova',
    timezone: 'America/Mexico_City',
    language: 'es',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSystem, setSavingSystem] = useState(false);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      if (currentUser?.id) {
        await authService.updateProfile(currentUser.id, { first_name: profileForm.name });
      }
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword(passwordForm.newPassword);
      toast.success('Contraseña actualizada correctamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      toast.error('Error al cambiar la contraseña: ' + (err.message || ''));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSystemSave = async () => {
    setSavingSystem(true);
    try {
      // System config is saved locally for now (no settings table yet)
      localStorage.setItem('clinova_system_config', JSON.stringify(systemForm));
      toast.success('Configuración del sistema guardada');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar la configuración');
    } finally {
      setSavingSystem(false);
    }
  };


  const timezones = [
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
    { value: 'America/Cancun', label: 'Cancún (GMT-5)' },
    { value: 'America/Tijuana', label: 'Tijuana (GMT-8)' },
    { value: 'America/Hermosillo', label: 'Hermosillo (GMT-7)' },
    { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
    { value: 'America/Lima', label: 'Lima (GMT-5)' },
    { value: 'America/Santiago', label: 'Santiago (GMT-4)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  ];

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
  ];

  /* ── shared styles ── */
  const styles = {
    page: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      padding: '32px 24px 80px',
      maxWidth: 900,
      margin: '0 auto',
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: 900,
      color: '#1E293B',
      marginBottom: 4,
      letterSpacing: '-0.02em',
    },
    pageSubtitle: {
      fontSize: 15,
      color: '#64748B',
      marginBottom: 32,
      fontWeight: 500,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      border: '1px solid #F1F5F9',
      padding: '28px 28px 24px',
      marginBottom: 24,
      transition: 'box-shadow 0.2s ease',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 24,
    },
    sectionIconWrap: (bg) => ({
      width: 42,
      height: 42,
      borderRadius: 12,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),
    sectionTitle: {
      fontSize: 18,
      fontWeight: 800,
      color: '#1E293B',
      margin: 0,
      letterSpacing: '-0.01em',
    },
    sectionSubtitle: {
      fontSize: 13,
      color: '#94A3B8',
      marginTop: 2,
      fontWeight: 500,
    },
    fieldGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 18,
    },
    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 700,
      color: '#475569',
      marginBottom: 6,
      letterSpacing: '0.01em',
    },
    input: {
      width: '100%',
      padding: 14,
      borderRadius: 12,
      border: '2px solid #E2E8F0',
      backgroundColor: '#F8FAFC',
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      color: '#1E293B',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: 14,
      borderRadius: 12,
      border: '2px solid #E2E8F0',
      backgroundColor: '#F8FAFC',
      fontSize: 14,
      fontFamily: "'Inter', sans-serif",
      color: '#1E293B',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      boxSizing: 'border-box',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 14px center',
    },
    btnPrimary: (loading) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 28px',
      borderRadius: 12,
      border: 'none',
      background: loading ? '#94A3B8' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: "'Inter', sans-serif",
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'transform 0.15s ease, box-shadow 0.2s ease',
      boxShadow: '0 2px 8px rgba(59,130,246,0.25)',
      marginTop: 8,
    }),
    divider: {
      height: 1,
      backgroundColor: '#F1F5F9',
      margin: '20px 0',
      border: 'none',
    },
  };

  const SectionHeader = ({ icon: Icon, iconBg, title, subtitle }) => (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionIconWrap(iconBg)}>
        <Icon size={20} color="#FFFFFF" strokeWidth={2.5} />
      </div>
      <div>
        <h2 style={styles.sectionTitle}>{title}</h2>
        {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
      </div>
    </div>
  );

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#3B82F6';
    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
  };
  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#E2E8F0';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <h1 style={styles.pageTitle}>Configuración</h1>
      <p style={styles.pageSubtitle}>Administra tu perfil, seguridad y preferencias del sistema</p>

      {/* ── 1. Perfil del Administrador ── */}
      <div style={styles.card}>
        <SectionHeader
          icon={User}
          iconBg="linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)"
          title="Perfil del Administrador"
          subtitle="Información personal y datos de contacto"
        />

        <div style={styles.fieldGrid}>
          <div>
            <label style={styles.label}>Nombre completo</label>
            <input
              type="text"
              style={styles.input}
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Tu nombre"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={styles.label}>Correo electrónico</label>
            <input
              type="email"
              style={{ ...styles.input, backgroundColor: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed' }}
              value={profileForm.email}
              readOnly
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button
            style={styles.btnPrimary(savingProfile)}
            disabled={savingProfile}
            onClick={handleProfileSave}
            onMouseEnter={(e) => { if (!savingProfile) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.35)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.25)'; }}
          >
            <Save size={16} />
            {savingProfile ? 'Guardando…' : 'Guardar perfil'}
          </button>
        </div>
      </div>

      {/* ── 2. Seguridad ── */}
      <div style={styles.card}>
        <SectionHeader
          icon={Lock}
          iconBg="linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)"
          title="Seguridad"
          subtitle="Cambia tu contraseña de acceso"
        />

        <div style={styles.fieldGrid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={styles.label}>Contraseña actual</label>
            <input
              type="password"
              style={styles.input}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="••••••••"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={styles.label}>Nueva contraseña</label>
            <input
              type="password"
              style={styles.input}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={styles.label}>Confirmar contraseña</label>
            <input
              type="password"
              style={styles.input}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Repite la contraseña"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button
            style={styles.btnPrimary(savingPassword)}
            disabled={savingPassword}
            onClick={handlePasswordSave}
            onMouseEnter={(e) => { if (!savingPassword) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.35)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.25)'; }}
          >
            <Lock size={16} />
            {savingPassword ? 'Actualizando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </div>

      {/* ── 3. Configuración del Sistema ── */}
      <div style={styles.card}>
        <SectionHeader
          icon={Settings}
          iconBg="linear-gradient(135deg, #30E3C2 0%, #06B6D4 100%)"
          title="Configuración del Sistema"
          subtitle="Preferencias generales de la plataforma"
        />

        <div style={styles.fieldGrid}>
          <div>
            <label style={styles.label}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={14} color="#64748B" /> Nombre de la empresa
              </span>
            </label>
            <input
              type="text"
              style={styles.input}
              value={systemForm.companyName}
              onChange={(e) => setSystemForm({ ...systemForm, companyName: e.target.value })}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={styles.label}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Globe size={14} color="#64748B" /> Zona horaria
              </span>
            </label>
            <select
              style={styles.select}
              value={systemForm.timezone}
              onChange={(e) => setSystemForm({ ...systemForm, timezone: e.target.value })}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Idioma</label>
            <select
              style={styles.select}
              value={systemForm.language}
              onChange={(e) => setSystemForm({ ...systemForm, language: e.target.value })}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button
            style={styles.btnPrimary(savingSystem)}
            disabled={savingSystem}
            onClick={handleSystemSave}
            onMouseEnter={(e) => { if (!savingSystem) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.35)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.25)'; }}
          >
            <Save size={16} />
            {savingSystem ? 'Guardando…' : 'Guardar configuración'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminSettings;
