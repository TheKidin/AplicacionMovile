import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Validar que la URL tenga el formato correcto (http:// o https://)
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error("URL de Supabase inválida o faltante. Usando placeholder para evitar crash.");
  supabaseUrl = 'https://placeholder.supabase.co';
}

if (!supabaseAnonKey || supabaseAnonKey === 'TU_ANON_KEY_DE_SUPABASE') {
  console.error("Anon Key de Supabase inválida o faltante.");
  supabaseAnonKey = 'placeholder';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
