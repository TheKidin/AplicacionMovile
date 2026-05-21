import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Fingerprint, FileText, HelpCircle, LogOut, ChevronRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';

const SettingRow = ({ icon, title, rightElement, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
      padding: '16px 0', borderBottom: '1px solid #E5E7EB', cursor: onClick ? 'pointer' : 'default' 
    }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {React.createElement(icon, { size: 20, color: '#4B5563' })}
      </div>
      <span style={{ fontSize: '15px', fontWeight: '600', color: '#1B2C66' }}>{title}</span>
    </div>
    <div>
      {rightElement || <ChevronRight size={20} color="#9CA3AF" />}
    </div>
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px',
      backgroundColor: checked ? 'var(--primary-light)' : '#E5E7EB',
      position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
    }}>
    <div style={{
      width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
      position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
      transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }} />
  </div>
);

function Settings() {
  const navigate = useNavigate();
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ id: null, name: 'Usuario', email: 'Cargando...', avatar: null });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authService.getUser();
        if (user) {
          const localAvatar = authService.getAvatarLocal(user.id);
          setUserData(prev => ({ ...prev, id: user.id, email: user.email, avatar: localAvatar }));
          let nameFound = null;

          try {
            const profile = await authService.getProfile(user.id);
            if (profile && profile.first_name) {
              nameFound = `${profile.first_name} ${profile.last_name || ''}`.trim();
            }
          } catch {
            console.log("No se encontró perfil, buscando en pacientes...");
          }

          if (!nameFound) {
            try {
              const patient = await patientService.getPatientByEmail(user.email);
              if (patient && patient.first_name) {
                nameFound = `${patient.first_name} ${patient.last_name || ''}`.trim();
              }
            } catch {
              console.log("No se encontró en pacientes");
            }
          }

          if (nameFound) {
            setUserData({ name: nameFound, email: user.email });
          }
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '0px 24px 32px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ margin: '32px 0 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1B2C66' }}>Ajustes</h1>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          {loading ? <Loader size={20} className="spinner" color="var(--primary)" /> : <img src={userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66', marginBottom: '4px' }}>{userData.name}</h2>
          <p style={{ fontSize: '14px', color: '#64748B' }}>{userData.email}</p>
        </div>
        <button onClick={() => navigate('/profile')} style={{ backgroundColor: '#F3F4F6', color: '#1B2C66', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
          Editar
        </button>
      </div>

      {/* Settings Groups */}
      <div className="card" style={{ padding: '8px 20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#9CA3AF', marginTop: '12px', marginBottom: '8px', letterSpacing: '1px' }}>CUENTA</h3>
        <SettingRow icon={User} title="Información Personal" onClick={() => navigate('/profile')} />
        <SettingRow icon={Shield} title="Contraseña y Seguridad" onClick={() => navigate('/security')} />
        <SettingRow icon={Fingerprint} title="Inicio Sesión Biométrico" rightElement={<ToggleSwitch checked={biometrics} onChange={setBiometrics} />} />
      </div>

      <div className="card" style={{ padding: '8px 20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#9CA3AF', marginTop: '12px', marginBottom: '8px', letterSpacing: '1px' }}>PREFERENCIAS</h3>
        <SettingRow icon={Bell} title="Notificaciones Push" rightElement={<ToggleSwitch checked={notifications} onChange={setNotifications} />} />
        <SettingRow icon={FileText} title="Términos y Privacidad" onClick={() => navigate('/terms')} />
        <SettingRow icon={HelpCircle} title="Ayuda y Soporte" onClick={() => navigate('/support')} />
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        style={{ 
          backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none',
          padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: '700',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
          cursor: 'pointer', marginTop: 'auto'
        }}>
        <LogOut size={20} /> Cerrar Sesión
      </button>

      {/* Version info */}
      <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '24px' }}>
        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>CLINOVA v1.0.0</span>
      </div>

    </div>
  );
}

export default Settings;
