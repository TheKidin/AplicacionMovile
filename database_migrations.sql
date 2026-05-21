-- =====================================================
-- CLINOVA - Migraciones pendientes
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Agregar columnas faltantes a profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id),
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS license_verified BOOLEAN DEFAULT false;

-- 2. Actualizar constraint de planes en subscriptions para coincidir con nombres reales
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check 
CHECK (plan IN ('Individual', 'Clínica Pequeña', 'Hospital Grande'));

-- 3. Actualizar constraint de status en profiles (por si no acepta PENDING/SUSPENDED)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED'));

-- 4. Verificar que todo esté correcto
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' ORDER BY ordinal_position;
