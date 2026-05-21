import { supabase } from '../lib/supabaseClient';

export const authService = {
  // Iniciar sesión con email y contraseña
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  // Registrar un nuevo usuario
  async register(email, password, userData) {
    // 1. Crear el usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;

    // 2. Insertar perfil adicional en la tabla 'profiles'
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email: email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role || 'PATIENT',
          license_number: userData.license_number,
          university: userData.university,
          specialty: userData.specialty,
          status: (userData.role === 'DOCTOR' || userData.role === 'NURSE') ? 'PENDING' : 'ACTIVE',
          clinic_id: userData.clinic_id || null
        }]);
      
      if (profileError) {
        console.error("Error al crear el perfil:", profileError);
        // Fallo silencioso del perfil, el auth fue exitoso
      }
    }

    return authData;
  },

  // Cerrar sesión
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener sesión actual
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  
  // Manejo de Avatar Local
  getAvatarLocal(userId) {
    if (!userId) return null;
    return localStorage.getItem(`clinova_avatar_${userId}`);
  },

  saveAvatarLocal(userId, base64String) {
    if (!userId) return;
    localStorage.setItem(`clinova_avatar_${userId}`, base64String);
  },
  
  // Obtener usuario actual
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Obtener perfil de usuario
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Obtener todos los perfiles
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Obtener perfiles por rol
  async getUsersByRole(role) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role);
    if (error) throw error;
    return data;
  },

  // Actualizar status de un empleado (ACTIVE / SUSPENDED / PENDING)
  async updateProfileStatus(userId, status) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Obtener staff pendiente de aprobación
  async getPendingStaff() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'PENDING');
    if (error) throw error;
    return data || [];
  },

  // Contar enfermeras/secretarias
  async getNurseCount() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'NURSE')
      .eq('status', 'ACTIVE');
    if (error) throw error;
    return (data || []).length;
  },

  // Actualizar perfil completo (cédula, universidad, especialidad, sede, etc.)
  async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Cambiar contraseña
  async changePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  },
};
