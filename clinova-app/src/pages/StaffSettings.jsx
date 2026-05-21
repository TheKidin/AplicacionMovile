import React, { useState } from 'react';
import { User, Bell, Building2, LogOut, ChevronRight, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

function StaffSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDoctor = location.pathname.startsWith('/doctor');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  
  const { currentUser } = useAuth();
  
  const [staffName, setStaffName] = useState(isDoctor ? 'Dr. Cargando...' : 'Enf. Cargando...');
  const [staffEmail, setStaffEmail] = useState('Cargando...');
  const [staffRole, setStaffRole] = useState(isDoctor ? 'Medicina General' : 'Enfermería / Triaje');

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        setStaffEmail(currentUser.email);
        try {
          const profile = await authService.getProfile(currentUser.id);
          if (profile) {
            const prefix = isDoctor ? 'Dr. ' : 'Enf. ';
            setStaffName(`${prefix}${profile.first_name} ${profile.last_name || ''}`.trim());
            if (isDoctor && profile.specialty) {
              setStaffRole(profile.specialty);
            }
          }
        } catch (error) {
          console.error("Error loading profile", error);
          setStaffName(isDoctor ? 'Doctor' : 'Enfermero/a');
        }
      }
    };
    fetchProfile();
  }, [currentUser, isDoctor]);
  
  // Estado para la foto (carga de localStorage si existe, si no usa dicebear)
  const defaultImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${isDoctor ? 'Doctor' : 'Nurse'}`;
  const [profileImage, setProfileImage] = useState(() => {
    return authService.getAvatarLocal(currentUser?.id) || defaultImage;
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/staff-login');
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        authService.saveAvatarLocal(currentUser?.id, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F7F9FC', paddingBottom: '120px' }}>
      
      {/* Header */}
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1B2C66', marginBottom: '24px' }}>Ajustes</h1>

      {/* Profile Section */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div 
          onClick={() => document.getElementById('avatar-upload').click()}
          style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E0E7FF', overflow: 'hidden', border: '2px solid var(--primary-light)', position: 'relative', cursor: 'pointer' }}
        >
          <img src={profileImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '24px', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'white', fontWeight: 'bold' }}>EDITAR</span>
          </div>
        </div>
        <input 
          type="file" 
          id="avatar-upload" 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66' }}>{staffName}</h2>
          <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '4px' }}>{staffEmail}</p>
          <span style={{ fontSize: '10px', fontWeight: '800', color: isDoctor ? '#1D4ED8' : '#059669', backgroundColor: isDoctor ? '#DBEAFE' : '#D1FAE5', padding: '4px 8px', borderRadius: '6px' }}>{staffRole}</span>
        </div>
      </div>

      {/* Clinica Settings */}
      <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#6B7280', letterSpacing: '0.5px', marginBottom: '12px', marginLeft: '4px' }}>CONFIGURACIÓN CLÍNICA</h3>
      
      <div className="card" style={{ padding: '0', marginBottom: '24px', overflow: 'hidden' }}>
        
        {/* Cambio de Sede */}
        <div onClick={() => navigate('/staff/change-clinic')} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EEF2FF', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Building2 size={18} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Cambiar de Sede</div>
              <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                Actual: <MapPin size={10} /> Central
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#9CA3AF" />
        </div>

        {/* Configuraciones específicas de rol */}
        {isDoctor ? (
          <div onClick={() => navigate('/doctor/schedule-config')} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF3C7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Clock size={18} color="#D97706" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Horarios de Consulta</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Lun-Vie 08:00 a 16:00</div>
              </div>
            </div>
            <ChevronRight size={18} color="#9CA3AF" />
          </div>
        ) : (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEF2F2', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Bell size={18} color="#DC2626" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Alertas de Urgencia</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Notificar código rojo</div>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <div 
              onClick={() => setAlertsEnabled(!alertsEnabled)}
              style={{ width: '44px', height: '24px', backgroundColor: alertsEnabled ? '#10B981' : '#E5E7EB', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              <div style={{ width: '20px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '50%', position: 'absolute', top: '2px', left: alertsEnabled ? '22px' : '2px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
            </div>
          </div>
        )}

      </div>

      {/* Security Settings */}
      <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#6B7280', letterSpacing: '0.5px', marginBottom: '12px', marginLeft: '4px' }}>SEGURIDAD DE LA CUENTA</h3>
      
      <div className="card" style={{ padding: '0', marginBottom: '32px', overflow: 'hidden' }}>
        
        <div onClick={() => navigate('/security')} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <ShieldCheck size={18} color="#4B5563" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Cambiar Contraseña</div>
          </div>
          <ChevronRight size={18} color="#9CA3AF" />
        </div>

      </div>

      <button onClick={handleLogout} style={{ marginTop: 'auto', padding: '16px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '16px', fontSize: '14px', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <LogOut size={18} /> CERRAR SESIÓN
      </button>

    </div>
  );
}

export default StaffSettings;
