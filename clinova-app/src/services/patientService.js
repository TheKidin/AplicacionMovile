import { supabase } from '../lib/supabaseClient';

export const patientService = {
  // Obtener todos los pacientes (para la recepcionista o doctores)
  async getPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Obtener detalles de un paciente específico
  async getPatientById(id) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener paciente por email (para cuando el paciente ve su propio perfil)
  async getPatientByEmail(email) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('email', email)
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data || null;
  },

  // Crear o actualizar el perfil de paciente (desde el cuestionario médico)
  async createPatient(patientData) {
    // Primero revisamos si ya existe el paciente con ese email para no duplicarlo
    const existingPatient = await this.getPatientByEmail(patientData.email);

    if (existingPatient) {
      // Actualizamos
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', existingPatient.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Insertamos
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  async getPatientVitals(patientId) {
    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Registrar nuevos signos vitales (desde triage / enfermería)
  async addVitals(vitalsData) {
    const { data, error } = await supabase
      .from('vitals')
      .insert([vitalsData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Eliminar un paciente
  async deletePatient(id) {
    // 1. Obtener el email del paciente para borrarlo también de Supabase Auth
    const { data: patientData } = await supabase
      .from('patients')
      .select('email')
      .eq('id', id)
      .single();

    if (patientData && patientData.email) {
      // Llamamos a la función de la base de datos (RPC) para borrar de auth.users
      const { error: rpcError } = await supabase.rpc('delete_user_by_email', { user_email: patientData.email });
      if (rpcError) {
        console.error("Error borrando el usuario de auth.users:", rpcError);
      }
    }

    // 2. Borrar de patients local
    const { data, error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }
};
