import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';
import { JitsiMeeting } from '@jitsi/react-sdk';

export default function Telemedicine() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (currentUser) {
        try {
          let name = 'Paciente';
          const profile = await authService.getProfile(currentUser.id);
          if (profile && profile.first_name) {
            name = profile.first_name + ' ' + (profile.last_name || '');
          } else {
            const patient = await patientService.getPatientByEmail(currentUser.email);
            if (patient && patient.first_name) {
              name = patient.first_name + ' ' + (patient.last_name || '');
            }
          }
          setUserName(name.trim());
          
          // Use appointmentId for the room if provided, otherwise fallback
          const appointmentId = location.state?.appointmentId;
          if (appointmentId) {
            setRoomName(`Clinova-Consulta-${appointmentId}`);
          } else {
            setRoomName(`Clinova-Consulta-${currentUser.id.substring(0,8)}`);
          }
        } catch (error) {
          console.error("Error fetching user data", error);
        }
      }
    };
    fetchUser();
  }, [currentUser, location]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F7F9FC' }}>
      {/* Header */}
      <div style={{ padding: '24px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1B2C66" />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1B2C66' }}>Consulta por Telemedicina</h2>
      </div>

      {/* Jitsi Meeting Wrapper */}
      <div style={{ flex: 1, backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
        {roomName ? (
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={roomName}
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableModeratorIndicator: true,
              enableEmailInStats: false
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
              SHOW_CHROME_EXTENSION_BANNER: false
            }}
            userInfo={{
              displayName: userName
            }}
            onApiReady={() => {
              // Podemos agregar eventos del SDK si queremos
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }}
          />
        ) : (
          <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
            <p>Conectando a la sala segura...</p>
          </div>
        )}
      </div>
    </div>
  );
}
