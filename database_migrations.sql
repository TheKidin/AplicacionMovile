-- =====================================================
-- CLINOVA - Migraciones pendientes y corrección de esquema
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Agregar columnas faltantes a profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id),
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS license_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';

-- 2. Agregar columnas faltantes a clinics
ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pago Pendiente';

-- 3. Crear tabla de suscripciones si no existe
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  plan TEXT,
  status TEXT DEFAULT 'PAST_DUE',
  amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Crear tabla de pagos si no existe
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  method TEXT,
  reference TEXT,
  status TEXT DEFAULT 'COMPLETED',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Habilitar RLS en suscripciones y pagos
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas de RLS si no existen
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscriptions' AND policyname = 'Permitir lectura y escritura a usuarios autenticados en subscriptions'
    ) THEN
        CREATE POLICY "Permitir lectura y escritura a usuarios autenticados en subscriptions" 
        ON public.subscriptions FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' AND policyname = 'Permitir lectura y escritura a usuarios autenticados en payments'
    ) THEN
        CREATE POLICY "Permitir lectura y escritura a usuarios autenticados en payments" 
        ON public.payments FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- 7. Actualizar constraint de planes y status en subscriptions
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check 
CHECK (plan IN ('Individual', 'Clínica Pequeña', 'Hospital Grande'));

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIAL'));

-- 8. Actualizar constraint de status en profiles (por si no acepta PENDING/SUSPENDED)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED'));

-- 9. Actualizar constraint de métodos de pago en payments
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_method_check 
CHECK (method IN ('SPEI', 'OXXO', 'CARD', 'OTHER'));

-- 10. Verificar que todo esté correcto
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'clinics' ORDER BY ordinal_position;

-- 11. Permitir lectura pública de clinics para que los médicos puedan registrarse antes de iniciar sesión
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clinics' AND policyname = 'Permitir lectura publica de clinics'
    ) THEN
        CREATE POLICY "Permitir lectura publica de clinics" 
        ON public.clinics FOR SELECT USING (true);
    END IF;
END
$$;

