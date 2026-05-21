import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Records from './pages/Records';
import Questionnaire from './pages/Questionnaire';
import Settings from './pages/Settings';
import Schedule from './pages/Schedule';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionDashboard from './pages/ReceptionDashboard';
import NurseVitals from './pages/NurseVitals';
import PatientRecord from './pages/PatientRecord';
import Consultation from './pages/Consultation';
import StaffLogin from './pages/StaffLogin';
import StaffRegister from './pages/StaffRegister';
import StaffSchedule from './pages/StaffSchedule';
import StaffSettings from './pages/StaffSettings';
import DoctorPatients from './pages/DoctorPatients';
import TodayAppointments from './pages/TodayAppointments';
import WaitingPatients from './pages/WaitingPatients';
import DoctorsDirectory from './pages/DoctorsDirectory';
import UrgencyPatients from './pages/UrgencyPatients';
import GeneralPatients from './pages/GeneralPatients';
import ConsultationsMonitor from './pages/ConsultationsMonitor';
import BottomNav from './components/BottomNav';
import StaffBottomNav from './components/StaffBottomNav';
import ForgotPassword from './pages/ForgotPassword';
import Clinics from './pages/Clinics';
import Profile from './pages/Profile';
import Security from './pages/Security';
import Terms from './pages/Terms';
import Support from './pages/Support';
import ChangeClinic from './pages/ChangeClinic';
import DoctorScheduleConfig from './pages/DoctorScheduleConfig';
import PreCheckin from './pages/PreCheckin';
import PatientVitals from './pages/PatientVitals';
import AppointmentMap from './pages/AppointmentMap';
import Telemedicine from './pages/Telemedicine';
import Prescriptions from './pages/Prescriptions';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminPatients from './pages/AdminPatients';
import AdminPatientProfile from './pages/AdminPatientProfile';
import AdminStaff from './pages/AdminStaff';
import AdminStaffProfile from './pages/AdminStaffProfile';
import AdminClinics from './pages/AdminClinics';
import AdminClinicProfile from './pages/AdminClinicProfile';
import AdminClinicRegister from './pages/AdminClinicRegister';
import AdminSettings from './pages/AdminSettings';
import AdminBilling from './pages/AdminBilling';
import AdminLogin from './pages/AdminLogin';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import OfflineDetector from './components/OfflineDetector';
import './index.css';

function AppLayout({ children, showNav }) {
  return (
    <div className="mobile-wrapper">
      <div style={{ flex: 1, paddingBottom: showNav ? '80px' : '0' }}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}

function AppLayoutStaff({ children, showNav }) {
  return (
    <div className="mobile-wrapper">
      <div style={{ flex: 1, paddingBottom: showNav ? '80px' : '0' }}>
        {children}
      </div>
      {showNav && <StaffBottomNav />}
    </div>
  );
}

function App() {
  // Capacitor nativo usa HashRouter (no hay server que maneje rutas)
  // Web usa BrowserRouter normal
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{
        style: {
          borderRadius: '16px',
          background: '#333',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '600'
        },
      }} />
      <OfflineDetector />
      <Routes>
        {/* Desktop (>1024px) → admin-login, Mobile → patient login */}
        <Route path="/" element={<Navigate to={window.innerWidth > 1024 ? "/admin-login" : "/login"} replace />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<AppLayout showNav={false}><Login /></AppLayout>} />
        <Route path="/register" element={<AppLayout showNav={false}><Register /></AppLayout>} />
        <Route path="/forgot-password" element={<AppLayout showNav={false}><ForgotPassword /></AppLayout>} />
        <Route path="/clinics" element={<AppLayout showNav={false}><Clinics /></AppLayout>} />
        <Route path="/terms" element={<AppLayout showNav={false}><Terms /></AppLayout>} />
        <Route path="/support" element={<AppLayout showNav={false}><Support /></AppLayout>} />
        <Route path="/staff-login" element={<AppLayout showNav={false}><StaffLogin /></AppLayout>} />
        <Route path="/staff-register" element={<AppLayout showNav={false}><StaffRegister /></AppLayout>} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* Patient Routes */}
        <Route path="/home" element={<PrivateRoute><AppLayout showNav={true}><Home /></AppLayout></PrivateRoute>} />
        <Route path="/pre-checkin" element={<PrivateRoute><AppLayout showNav={false}><PreCheckin /></AppLayout></PrivateRoute>} />
        <Route path="/appointment-map" element={<PrivateRoute><AppLayout showNav={false}><AppointmentMap /></AppLayout></PrivateRoute>} />
        <Route path="/records" element={<PrivateRoute><AppLayout showNav={true}><Records /></AppLayout></PrivateRoute>} />
        <Route path="/vitals" element={<PrivateRoute><AppLayout showNav={true}><PatientVitals /></AppLayout></PrivateRoute>} />
        <Route path="/questionnaire" element={<PrivateRoute><AppLayout showNav={false}><Questionnaire /></AppLayout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><AppLayout showNav={true}><Settings /></AppLayout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><AppLayout showNav={false}><Profile /></AppLayout></PrivateRoute>} />
        <Route path="/security" element={<PrivateRoute><AppLayout showNav={false}><Security /></AppLayout></PrivateRoute>} />
        <Route path="/schedule" element={<PrivateRoute><AppLayout showNav={false}><Schedule /></AppLayout></PrivateRoute>} />
        <Route path="/telemedicina" element={<PrivateRoute><AppLayout showNav={false}><Telemedicine /></AppLayout></PrivateRoute>} />
        <Route path="/recetas" element={<PrivateRoute><AppLayout showNav={true}><Prescriptions /></AppLayout></PrivateRoute>} />
        
        {/* Staff / Doctor Routes */}
        <Route path="/doctor" element={<RoleRoute><AppLayoutStaff showNav={true}><DoctorDashboard /></AppLayoutStaff></RoleRoute>} />
        <Route path="/doctor/triage" element={<RoleRoute><AppLayoutStaff showNav={false}><PatientRecord /></AppLayoutStaff></RoleRoute>} />
        <Route path="/doctor/consultation" element={<RoleRoute><AppLayoutStaff showNav={false}><Consultation /></AppLayoutStaff></RoleRoute>} />
        <Route path="/doctor/pacientes" element={<RoleRoute><AppLayoutStaff showNav={true}><DoctorPatients /></AppLayoutStaff></RoleRoute>} />
        <Route path="/doctor/settings" element={<RoleRoute><AppLayoutStaff showNav={true}><StaffSettings /></AppLayoutStaff></RoleRoute>} />
        <Route path="/doctor/schedule-config" element={<RoleRoute><AppLayoutStaff showNav={false}><DoctorScheduleConfig /></AppLayoutStaff></RoleRoute>} />

        {/* Staff / Reception Routes */}
        <Route path="/reception" element={<RoleRoute><AppLayoutStaff showNav={true}><ReceptionDashboard /></AppLayoutStaff></RoleRoute>} />
        <Route path="/reception/agenda" element={<RoleRoute><AppLayoutStaff showNav={true}><StaffSchedule /></AppLayoutStaff></RoleRoute>} />
        <Route path="/reception/citas-hoy" element={<RoleRoute><AppLayoutStaff showNav={false}><TodayAppointments /></AppLayoutStaff></RoleRoute>} />
        <Route path="/reception/en-espera" element={<RoleRoute><AppLayoutStaff showNav={false}><WaitingPatients /></AppLayoutStaff></RoleRoute>} />
        <Route path="/reception/medicos" element={<RoleRoute><AppLayoutStaff showNav={false}><DoctorsDirectory /></AppLayoutStaff></RoleRoute>} />
        <Route path="/reception/urgencias" element={<RoleRoute><AppLayoutStaff showNav={false}><UrgencyPatients /></AppLayoutStaff></RoleRoute>} />
        <Route path="/reception/pacientes" element={<RoleRoute><AppLayoutStaff showNav={false}><GeneralPatients /></AppLayoutStaff></RoleRoute>} />
        <Route path="/reception/consultas" element={<RoleRoute><AppLayoutStaff showNav={false}><ConsultationsMonitor /></AppLayoutStaff></RoleRoute>} />
        <Route path="/reception/settings" element={<RoleRoute><AppLayoutStaff showNav={true}><StaffSettings /></AppLayoutStaff></RoleRoute>} />
        <Route path="/staff/change-clinic" element={<RoleRoute><AppLayoutStaff showNav={false}><ChangeClinic /></AppLayoutStaff></RoleRoute>} />
        <Route path="/reception/vitals" element={<RoleRoute><AppLayoutStaff showNav={false}><NurseVitals /></AppLayoutStaff></RoleRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<RoleRoute><AdminLayout><AdminDashboard /></AdminLayout></RoleRoute>} />
        <Route path="/admin/patients" element={<RoleRoute><AdminLayout><AdminPatients /></AdminLayout></RoleRoute>} />
        <Route path="/admin/patients/profile" element={<RoleRoute><AdminLayout><AdminPatientProfile /></AdminLayout></RoleRoute>} />
        <Route path="/admin/staff" element={<RoleRoute><AdminLayout><AdminStaff /></AdminLayout></RoleRoute>} />
        <Route path="/admin/staff/profile" element={<RoleRoute><AdminLayout><AdminStaffProfile /></AdminLayout></RoleRoute>} />
        <Route path="/admin/clinics" element={<RoleRoute><AdminLayout><AdminClinics /></AdminLayout></RoleRoute>} />
        <Route path="/admin/clinics/profile" element={<RoleRoute><AdminLayout><AdminClinicProfile /></AdminLayout></RoleRoute>} />
        <Route path="/admin/clinics/new" element={<RoleRoute><AdminLayout><AdminClinicRegister /></AdminLayout></RoleRoute>} />
        <Route path="/admin/settings" element={<RoleRoute><AdminLayout><AdminSettings /></AdminLayout></RoleRoute>} />
        <Route path="/admin/billing" element={<RoleRoute><AdminLayout><AdminBilling /></AdminLayout></RoleRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
