import { supabase } from '../lib/supabaseClient';

export const clinicService = {
  // Obtener todas las clínicas
  async getClinics() {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching clinics:', error);
      throw error;
    }
    return data;
  },

  // Crear una nueva clínica
  async createClinic(clinicData) {
    const { data, error } = await supabase
      .from('clinics')
      .insert([clinicData])
      .select();
      
    if (error) {
      console.error('Error creating clinic:', error);
      throw error;
    }
    return data;
  },

  // Actualizar una clínica existente
  async updateClinic(id, updateData) {
    const { data, error } = await supabase
      .from('clinics')
      .update(updateData)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error('Error updating clinic:', error);
      throw error;
    }
    return data;
  }
};

