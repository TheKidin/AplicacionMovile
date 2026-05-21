import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Droplets, Edit2, Loader, MapPin, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  const [name, setName] = useState('Usuario');
  const [profileImage, setProfileImage] = useState(null);
  const [email, setEmail] = useState('Cargando...');
  const [phone, setPhone] = useState('No registrado');
  const [bloodType, setBloodType] = useState('No registrado');
  const [address, setAddress] = useState('Ubicación no detectada');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await authService.getUser();
        if (user) {
          setEmail(user.email);
          let nameFound = null;

          try {
            const profile = await authService.getProfile(user.id);
            if (profile && profile.first_name) {
              nameFound = `${profile.first_name} ${profile.last_name || ''}`.trim();
            }
          } catch {
            // Ignorar
          }

          try {
            const patient = await patientService.getPatientByEmail(user.email);
            if (patient) {
              if (!nameFound && patient.first_name) {
                nameFound = `${patient.first_name} ${patient.last_name || ''}`.trim();
              }
              if (patient.phone) setPhone(patient.phone);
              if (patient.blood_type) setBloodType(patient.blood_type);
            }
          } catch {
            // Ignorar
          }

          if (nameFound) setName(nameFound);

          const localAvatar = authService.getAvatarLocal(user.id);
          if (localAvatar) {
            setProfileImage(localAvatar);
          }
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

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

  const handleSave = () => {
    setEditing(false);
    toast('La edición del perfil estará disponible próximamente.', { icon: '🚧' });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Usamos Nominatim de OpenStreetMap para obtener la dirección legible
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.display_name) {
              // Extraer una versión más corta de la dirección
              const parts = data.display_name.split(', ');
              const shortAddress = parts.slice(0, 3).join(', ');
              setAddress(shortAddress);
              toast.success("Ubicación actualizada");
            } else {
              setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              toast.success("Coordenadas obtenidas");
            }
          } catch {
            setAddress("Error al obtener dirección");
            toast.error("No se pudo traducir tu ubicación a una dirección.");
          } finally {
            setLoadingLocation(false);
          }
        },
        () => {
          toast.error("Permiso de ubicación denegado. Actívalo en tu navegador.");
          setLoadingLocation(false);
        }
      );
    } else {
      toast.error("Geolocalización no soportada por el navegador.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={32} className="spinner" color="var(--primary)" />
        <p style={{ marginTop: '16px', color: '#6B7280', fontWeight: '600' }}>Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', backgroundColor: '#F7F9FC' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginRight: '16px' }}>
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0, flex: 1 }}>Perfil</h1>
        <button onClick={() => editing ? handleSave() : setEditing(true)} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E0E7FF', borderRadius: '12px', color: '#1D4ED8' }}>
          {editing ? <span style={{ fontSize: '13px', fontWeight: '700', padding: '0 8px' }}>Guardar</span> : <Edit2 size={18} />}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <div 
          onClick={() => document.getElementById('profile-avatar-upload').click()}
          style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#E0E7FF', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '4px solid #FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '16px', position: 'relative', cursor: 'pointer' }}
        >
          <img src={profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28px', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'white', fontWeight: 'bold' }}>EDITAR</span>
          </div>
        </div>
        <input 
          type="file" 
          id="profile-avatar-upload" 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>{name}</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Paciente Regular</p>
      </div>

      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' }}>Nombre Completo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <User size={18} color="#9CA3AF" />
            {editing ? <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ flex: 1, border: 'none', borderBottom: '1px solid #3B82F6', outline: 'none', fontSize: '14px', padding: '4px 0', backgroundColor: 'transparent' }} /> : <span style={{ fontSize: '15px', color: '#111827', fontWeight: '600' }}>{name}</span>}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' }}>Correo Electrónico</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Mail size={18} color="#9CA3AF" />
            <span style={{ fontSize: '15px', color: '#6B7280', fontWeight: '600' }}>{email}</span>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' }}>Teléfono</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Phone size={18} color="#9CA3AF" />
            {editing ? <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={{ flex: 1, border: 'none', borderBottom: '1px solid #3B82F6', outline: 'none', fontSize: '14px', padding: '4px 0', backgroundColor: 'transparent' }} /> : <span style={{ fontSize: '15px', color: '#111827', fontWeight: '600' }}>{phone}</span>}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de Sangre</label>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Droplets size={18} color="#9CA3AF" style={{ marginTop: '2px' }} />
            {editing ? <input type="text" value={bloodType} onChange={e => setBloodType(e.target.value)} style={{ flex: 1, border: 'none', borderBottom: '1px solid #3B82F6', outline: 'none', fontSize: '14px', padding: '4px 0', backgroundColor: 'transparent' }} /> : <span style={{ fontSize: '15px', color: '#111827', fontWeight: '600' }}>{bloodType}</span>}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>Ubicación Actual</label>
            <button 
              onClick={handleGetLocation} 
              disabled={loadingLocation}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              {loadingLocation ? <Loader size={12} className="spinner" /> : <Navigation size={12} />}
              Obtener
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <MapPin size={18} color="#9CA3AF" style={{ marginTop: '2px' }} />
            <span style={{ fontSize: '14px', color: address === 'Ubicación no detectada' ? '#9CA3AF' : '#111827', fontWeight: '500', lineHeight: '1.4' }}>{address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
