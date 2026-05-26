import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Stethoscope, Clock, XCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

// Configuración de estilos por estado
const STATUS_CONFIG = {
  disponible: {
    label: 'Disponible',
    emoji: '🟢',
    bg: '#DCFCE7',
    color: '#065F46',
    border: '#10B981',
    dot: '#10B981',
    icon: CheckCircle2,
  },
  descanso: {
    label: 'En Descanso',
    emoji: '🟡',
    bg: '#FEF3C7',
    color: '#92400E',
    border: '#F59E0B',
    dot: '#F59E0B',
    icon: Clock,
  },
  ausente: {
    label: 'Ausente',
    emoji: '🔴',
    bg: '#FEE2E2',
    color: '#991B1B',
    border: '#EF4444',
    dot: '#EF4444',
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.disponible;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: cfg.bg,
      color: cfg.color,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: '20px',
      padding: '5px 12px',
      fontSize: '11px',
      fontWeight: '800',
      letterSpacing: '0.3px',
      whiteSpace: 'nowrap',
    }}>
      {/* Dot pulsante solo si disponible */}
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: cfg.dot,
        display: 'inline-block',
        animation: status === 'disponible' ? 'pulse-dot 1.6s ease-in-out infinite' : 'none',
        flexShrink: 0,
      }} />
      {cfg.label}
    </div>
  );
}

function DoctorsDirectory() {
  const navigate = useNavigate();
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const channelRef = useRef(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const doctorsData = await authService.getDoctorsWithAvailability();
      setMedicos(doctorsData || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Llamada dentro de función async local para evitar setState directo en el efecto
    const load = async () => {
      await fetchDoctors();
    };
    load();

    // Suscripción en tiempo real
    channelRef.current = authService.subscribeToDoctorAvailability((updatedDoctor) => {
      setMedicos(prev =>
        prev.map(m => m.id === updatedDoctor.id
          ? { ...m, availability_status: updatedDoctor.availability_status }
          : m
        )
      );
      setLastUpdate(new Date());
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [fetchDoctors]);

  // Resumen de conteos
  const counts = {
    disponible: medicos.filter(m => (m.availability_status || 'disponible') === 'disponible').length,
    descanso: medicos.filter(m => m.availability_status === 'descanso').length,
    ausente: medicos.filter(m => m.availability_status === 'ausente').length,
  };

  return (
    <div style={{ padding: '32px 24px', minHeight: '100%', backgroundColor: '#F7F9FC' }}>

      {/* Estilos de animación */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginRight: '16px' }}
        >
          <ArrowLeft size={20} color="#1E293B" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1B2C66', margin: 0 }}>Directorio Médico</h1>
          <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginTop: '2px' }}>
            Actualizado {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={fetchDoctors}
          style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          title="Refrescar"
        >
          <RefreshCw size={18} color="#6B7280" />
        </button>
      </div>

      {/* Resumen de disponibilidad */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        {[
          { key: 'disponible', label: 'DISPONIBLES', count: counts.disponible, bg: '#DCFCE7', color: '#065F46', border: '#10B981' },
          { key: 'descanso',   label: 'DESCANSO',    count: counts.descanso,   bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' },
          { key: 'ausente',    label: 'AUSENTES',    count: counts.ausente,    bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' },
        ].map(item => (
          <div key={item.key} style={{
            backgroundColor: item.bg,
            border: `2px solid ${item.border}`,
            borderRadius: '16px',
            padding: '14px 10px',
            textAlign: 'center',
            animation: 'fadeInUp 0.3s ease',
          }}>
            <span style={{ fontSize: '26px', fontWeight: '900', color: item.color, lineHeight: '1' }}>
              {item.count}
            </span>
            <p style={{ fontSize: '9px', fontWeight: '800', color: item.color, margin: '4px 0 0 0', letterSpacing: '0.5px' }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Lista de doctores */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
          <Stethoscope size={20} color="#1E293B" />
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>
            Médicos Activos ({medicos.length})
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            // Skeleton loader
            [1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #F3F4F6', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F3F4F6', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '14px', width: '55%', backgroundColor: '#F3F4F6', borderRadius: '8px', marginBottom: '8px' }} />
                  <div style={{ height: '11px', width: '35%', backgroundColor: '#F3F4F6', borderRadius: '8px' }} />
                </div>
                <div style={{ height: '28px', width: '90px', backgroundColor: '#F3F4F6', borderRadius: '20px' }} />
              </div>
            ))
          ) : medicos.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 16px', margin: 0 }}>
              No hay médicos registrados activos.
            </p>
          ) : (
            medicos.map((m, index) => {
              const availStatus = m.availability_status || 'disponible';
              const cfg = STATUS_CONFIG[availStatus] || STATUS_CONFIG.disponible;
              return (
                <div
                  key={m.id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: index < medicos.length - 1 ? '1px solid #F3F4F6' : 'none',
                    gap: '16px',
                    animation: 'fadeInUp 0.3s ease',
                    borderLeft: `3px solid ${cfg.border}`,
                    paddingLeft: '12px',
                    borderRadius: '0 0 0 4px',
                    transition: 'border-left-color 0.4s ease',
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#E0E7FF', overflow: 'hidden', border: `2px solid ${cfg.border}` }}>
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.first_name}${m.last_name}`}
                        alt="avatar"
                        style={{ width: '100%' }}
                      />
                    </div>
                    {/* Indicador de estado en el avatar */}
                    <span style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: cfg.dot,
                      border: '2px solid white',
                      animation: availStatus === 'disponible' ? 'pulse-dot 1.6s ease-in-out infinite' : 'none',
                    }} />
                  </div>

                  {/* Info del doctor */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Dr. {m.first_name} {m.last_name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                      {m.specialty || 'Medicina General'}
                    </p>
                  </div>

                  {/* Badge de estado */}
                  <StatusBadge status={availStatus} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Nota de tiempo real */}
      <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>⚡</span>
        <p style={{ fontSize: '11px', color: '#1E40AF', fontWeight: '600', margin: 0 }}>
          Los estados se actualizan en tiempo real cuando el médico cambia su disponibilidad.
        </p>
      </div>

    </div>
  );
}

export default DoctorsDirectory;
