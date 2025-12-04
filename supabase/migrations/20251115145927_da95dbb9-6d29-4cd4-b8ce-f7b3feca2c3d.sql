-- Create enum types for better type safety
CREATE TYPE machine_status AS ENUM ('healthy', 'warning', 'critical', 'maintenance');
CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE component_type AS ENUM ('motor', 'sensor', 'controller', 'actuator', 'pump', 'valve');
CREATE TYPE fault_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Create machines table
CREATE TABLE public.machines (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status machine_status NOT NULL DEFAULT 'healthy',
  health_score INTEGER NOT NULL DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  location TEXT NOT NULL,
  components JSONB NOT NULL DEFAULT '[]',
  temperature NUMERIC(5,2),
  vibration NUMERIC(5,2),
  current_load NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  machine_id BIGINT REFERENCES public.machines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status job_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create fault_logs table
CREATE TABLE public.fault_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  machine_id BIGINT REFERENCES public.machines(id) ON DELETE CASCADE,
  fault_type TEXT NOT NULL,
  severity fault_severity NOT NULL,
  component TEXT NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fault_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for machines
CREATE POLICY "Users can view their own machines"
  ON public.machines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own machines"
  ON public.machines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own machines"
  ON public.machines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own machines"
  ON public.machines FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for jobs
CREATE POLICY "Users can view their own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for fault_logs
CREATE POLICY "Users can view their own fault logs"
  ON public.fault_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fault logs"
  ON public.fault_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fault logs"
  ON public.fault_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fault logs"
  ON public.fault_logs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_machines_updated_at
  BEFORE UPDATE ON public.machines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX idx_machines_user_id ON public.machines(user_id);
CREATE INDEX idx_machines_status ON public.machines(status);
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_machine_id ON public.jobs(machine_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_fault_logs_user_id ON public.fault_logs(user_id);
CREATE INDEX idx_fault_logs_machine_id ON public.fault_logs(machine_id);
CREATE INDEX idx_fault_logs_resolved ON public.fault_logs(resolved);