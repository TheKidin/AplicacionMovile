-- Esquema SQL para CLINOVA

-- 1. Tabla de Usuarios (Extensión de Auth de Supabase)
-- Supabase ya tiene auth.users, pero podemos crear una tabla 'profiles' ligada a ella
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. Tabla de Clínicas (Sedes)
CREATE TABLE public.clinics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  rfc TEXT,
  contract_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Tabla de Pacientes
CREATE TABLE public.patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT,
  email TEXT,
  blood_type TEXT,
  allergies TEXT,
  clinical_history JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Tabla de Signos Vitales
CREATE TABLE public.vitals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  blood_pressure TEXT, -- Ej. '120/80'
  heart_rate INTEGER,  -- Ej. 72
  oxygen_saturation INTEGER, -- Ej. 98
  weight DECIMAL, -- Ej. 70.5
  temperature DECIMAL, -- Ej. 36.5
  recorded_by UUID REFERENCES public.profiles(id), -- Quién lo registró (enfermero)
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Tabla de Citas (Appointments)
CREATE TABLE public.appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id),
  clinic_id UUID REFERENCES public.clinics(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT CHECK (status IN ('SCHEDULED', 'WAITING', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS')) DEFAULT 'SCHEDULED',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Permitir todo por ahora para desarrollo rápido, LUEGO DEBES RESTRINGIR)
CREATE POLICY "Permitir lectura y escritura a usuarios autenticados en profiles" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura y escritura a usuarios autenticados en clinics" ON public.clinics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura y escritura a usuarios autenticados en patients" ON public.patients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura y escritura a usuarios autenticados en vitals" ON public.vitals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura y escritura a usuarios autenticados en appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
