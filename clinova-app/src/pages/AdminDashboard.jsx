import React, { useState, useEffect } from 'react';
import { Users, UserCog, CalendarCheck, TrendingUp, MoreVertical, Loader, UserCheck, XCircle, Clock, Building2, ChevronRight } from 'lucide-react';
import { patientService } from '../services/patientService';
import { authService } from '../services/authService';
import { appointmentService } from '../services/appointmentService';

function AdminDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointmentsToday: 0,
    income: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [weeklyData, setWeeklyData] = useState([0,0,0,0,0,0,0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patients = await patientService.getPatients();
        // Filtrar pacientes unicos por correo
        const uniquePatientsMap = new Map();
        (patients || []).forEach(p => {
          if (p.email && !uniquePatientsMap.has(p.email)) uniquePatientsMap.set(p.email, p);
          else if (!p.email) uniquePatientsMap.set(p.id, p);
        });
        
        const doctors = await authService.getUsersByRole('DOCTOR');
        const appointments = await appointmentService.getTodayAppointments();
        
        setStats({
          patients: uniquePatientsMap.size,
          doctors: (doctors || []).length,
          appointmentsToday: (appointments || []).length,
          income: (appointments || []).length // Citas del día en vez de ingreso ficticio
        });

        const pending = await authService.getPendingStaff();
        setPendingStaff(pending || []);

        // Calculate weekly data from appointments
        const days = [0,0,0,0,0,0,0]; // Lun-Dom
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        (appointments || []).forEach(app => {
          const appDate = new Date(app.date);
          const dayIdx = (appDate.getDay() + 6) % 7; // 0=Mon, 6=Sun
          if (appDate >= startOfWeek) days[dayIdx]++;
        });
        setWeeklyData(days);

        const formattedActivity = (appointments || []).slice(0, 5).map(app => {
          return {
            id: '#' + app.id.substring(0,4).toUpperCase(),
            patient: `${app.patient?.first_name || ''} ${app.patient?.last_name || ''}`,
            doctor: app.doctor ? `Dr. ${app.doctor.last_name || app.doctor.first_name}` : 'Médico Asignado',
            clinic: app.clinic?.name || 'Sin sede asignada',
            time: app.time.substring(0,5),
            status: app.status === 'COMPLETED' ? 'Completada' : app.status === 'IN_PROGRESS' ? 'En Proceso' : app.status === 'WAITING' ? 'En Espera' : 'Agendada'
          };
        });
        
        setRecentActivity(formattedActivity);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpis = [
    { title: 'Pacientes Registrados', value: stats.patients.toString(), change: 'En Sistema', isPositive: true, icon: Users, color: '#3B82F6', bg: '#EFF6FF' },
    { title: 'Médicos Activos', value: stats.doctors.toString(), change: 'En Sistema', isPositive: true, icon: UserCog, color: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'Solicitudes Pendientes', value: pendingStaff.length.toString(), change: pendingStaff.length > 0 ? 'Requiere atención' : 'Sin pendientes', isPositive: pendingStaff.length === 0, icon: Clock, color: '#F59E0B', bg: '#FFFBEB' },
    { title: 'Citas del Día', value: stats.income.toString(), change: 'Hoy', isPositive: true, icon: TrendingUp, color: '#10B981', bg: '#ECFDF5' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completada': return { bg: '#D1FAE5', color: '#065F46' };
      case 'En Proceso': return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'En Espera': return { bg: '#FEF3C7', color: '#92400E' };
      default: return { bg: '#F1F5F9', color: '#475569' };
    }
  };

  const handleApprove = async (staffId) => {
    try {
      await authService.updateProfileStatus(staffId, 'ACTIVE');
      setPendingStaff(prev => prev.filter(s => s.id !== staffId));
      // Update doctors count if it was a doctor
      const approved = pendingStaff.find(s => s.id === staffId);
      if (approved?.role === 'DOCTOR') {
        setStats(prev => ({ ...prev, doctors: prev.doctors + 1 }));
      }
    } catch (error) {
      console.error('Error approving staff:', error);
    }
  };

  const handleReject = async (staffId) => {
    try {
      await authService.updateProfileStatus(staffId, 'SUSPENDED');
      setPendingStaff(prev => prev.filter(s => s.id !== staffId));
    } catch (error) {
      console.error('Error rejecting staff:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' }}>Dashboard General</h1>
        <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>Bienvenido al panel de control de la red médica CLINOVA.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: kpi.bg, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <kpi.icon size={24} color={kpi.color} />
              </div>
              <div style={{ backgroundColor: kpi.isPositive ? '#D1FAE5' : '#FEE2E2', color: kpi.isPositive ? '#059669' : '#DC2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                {kpi.change}
              </div>
            </div>
            <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>{kpi.value}</h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0, fontWeight: '500' }}>{kpi.title}</p>
          </div>
        ))}
      </div>

      {/* Pending Staff Requests */}
      {pendingStaff.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #FDE68A' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFBEB', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Clock size={20} color="#F59E0B" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Solicitudes de Personal Pendientes</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>{pendingStaff.length} solicitud(es) esperando aprobación</p>
              </div>
            </div>
            <button onClick={() => window.location.href = '/admin/staff'} style={{ fontSize: '13px', fontWeight: '700', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Ver todas <ChevronRight size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingStaff.map(staff => (
              <div key={staff.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEF3C7', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.first_name}`} alt={staff.first_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{staff.first_name} {staff.last_name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>{staff.role === 'DOCTOR' ? '🩺 Doctor(a)' : '👩‍⚕️ Enfermería'}</span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>•</span>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>{staff.email}</span>
                    </div>
                    {staff.specialty && <span style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: '600' }}>Especialidad: {staff.specialty}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleReject(staff.id)} style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FEE2E2'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}>
                    <XCircle size={16} /> Rechazar
                  </button>
                  <button onClick={() => handleApprove(staff.id)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#059669', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#047857'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#059669'}>
                    <UserCheck size={16} /> Aprobar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area (Charts & Tables) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Simulated Chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Flujo de Citas (Semana Actual)</h3>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
              <MoreVertical size={20} />
            </button>
          </div>
          
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '2%', paddingBottom: '24px', borderBottom: '1px solid #E2E8F0', position: 'relative' }}>
            {/* Horizontal Grid Lines */}
            <div style={{ position: 'absolute', top: '0', left: 0, right: 0, borderTop: '1px dashed #E2E8F0', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, borderTop: '1px dashed #E2E8F0', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #E2E8F0', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, borderTop: '1px dashed #E2E8F0', zIndex: 0 }}></div>

            {/* Bars */}
            {(() => {
              const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
              const maxVal = Math.max(...weeklyData, 1);
              return dayNames.map((day, i) => {
                const pct = Math.round((weeklyData[i] / maxVal) * 100);
                return (
                  <div key={day} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', zIndex: 1 }}>
                    <div style={{ width: '60%', minHeight: pct > 0 ? '8px' : '2px', height: `${pct}%`, backgroundColor: '#3B82F6', borderRadius: '6px 6px 0 0', transition: 'height 1s ease', cursor: 'pointer', position: 'relative' }} onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'} onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}>
                      {weeklyData[i] > 0 && <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', fontWeight: '700', color: '#3B82F6' }}>{weeklyData[i]}</span>}
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>{day}</div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0 }}>Actividad Reciente en Sedes</h3>
            <button style={{ fontSize: '14px', fontWeight: '600', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>
              Ver todas
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#94A3B8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '16px 8px', fontWeight: '700' }}>ID Cita</th>
                  <th style={{ padding: '16px 8px', fontWeight: '700' }}>Paciente</th>
                  <th style={{ padding: '16px 8px', fontWeight: '700' }}>Médico Asignado</th>
                  <th style={{ padding: '16px 8px', fontWeight: '700' }}>Sede</th>
                  <th style={{ padding: '16px 8px', fontWeight: '700' }}>Hora</th>
                  <th style={{ padding: '16px 8px', fontWeight: '700' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center' }}>
                      <Loader className="spinner" size={24} color="#1D4ED8" />
                    </td>
                  </tr>
                ) : recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                      No hay citas registradas para hoy.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((act, idx) => {
                  const statusStyle = getStatusColor(act.status);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '600', color: '#64748B' }}>{act.id}</td>
                      <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{act.patient}</td>
                      <td style={{ padding: '16px 8px', fontSize: '14px', color: '#475569' }}>{act.doctor}</td>
                      <td style={{ padding: '16px 8px', fontSize: '14px', color: '#475569' }}>{act.clinic}</td>
                      <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '600', color: '#3B82F6' }}>{act.time}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  )
                }))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
