import { supabase } from '../lib/supabaseClient';

export const appointmentService = {
  // Crear una nueva cita (agendada por el paciente)
  async createAppointment(appointmentData) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        patient_id: appointmentData.patient_id,
        doctor_id: appointmentData.doctor_id,
        clinic_id: appointmentData.clinic_id,
        date: appointmentData.date,
        time: appointmentData.time,
        status: 'SCHEDULED',
        notes: appointmentData.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener próximas citas de un paciente
  async getPatientAppointments(patientId) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!appointments_doctor_id_fkey(first_name, last_name, email),
        clinic:clinics(name, address)
      `)
      .eq('patient_id', patientId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  // Obtener citas del día para una clínica (Para Recepción)
  async getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(first_name, last_name, date_of_birth),
        doctor:profiles!appointments_doctor_id_fkey(first_name, last_name),
        clinic:clinics(name)
      `)
      .eq('date', today)
      // .eq('clinic_id', clinicId) // Descomentar cuando tengamos clinics configuradas correctamente
      .order('time', { ascending: true });
      
    if (error) throw error;
    return data;
  },

  // Obtener pacientes en espera o en cita para un doctor (Dashboard del Doctor)
  // eslint-disable-next-line no-unused-vars
  async getDoctorQueue(doctorId) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(first_name, last_name, date_of_birth, gender)
      `)
      // .eq('doctor_id', doctorId) // Descomentar cuando la selección de doctor inserte el UUID correcto
      .eq('date', today)
      .in('status', ['WAITING', 'IN_PROGRESS'])
      .order('time', { ascending: true });
      
    if (error) throw error;
    return data;
  },
  // Obtener una cita específica con todos sus detalles
  async getAppointmentById(appointmentId) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*)
      `)
      .eq('id', appointmentId)
      .single();
      
    if (error) throw error;
    return data;
  },

  // Actualizar estado de cita (ej. SCHEDULED -> WAITING -> COMPLETED)
  async updateAppointmentStatus(appointmentId, newStatus, newNotes = undefined) {
    const updateData = { status: newStatus };
    if (newNotes !== undefined) {
      updateData.notes = newNotes;
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  // Obtener historial de pacientes atendidos por un doctor
  async getDoctorCompletedAppointments(doctorId) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(id, first_name, last_name, date_of_birth, gender)
      `)
      .eq('doctor_id', doctorId)
      .eq('status', 'COMPLETED')
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data;
  },

  // Obtener horarios ya ocupados para un doctor en una fecha específica
  async getBookedSlots(doctorId, date) {
    let query = supabase
      .from('appointments')
      .select('time')
      .eq('date', date)
      .in('status', ['SCHEDULED', 'WAITING', 'IN_PROGRESS']);

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(a => a.time); // ej: ['09:00:00', '10:00:00']
  },

  // Obtener todas las citas de una fecha específica (para StaffSchedule)
  async getAppointmentsByDate(date) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(first_name, last_name),
        doctor:profiles!appointments_doctor_id_fkey(first_name, last_name)
      `)
      .eq('date', date)
      .order('time', { ascending: true });

    if (error) throw error;
    return data;
  }
};
