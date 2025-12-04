-- Enable realtime for machines table
ALTER TABLE public.machines REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.machines;

-- Enable realtime for jobs table
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;

-- Enable realtime for fault_logs table
ALTER TABLE public.fault_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fault_logs;