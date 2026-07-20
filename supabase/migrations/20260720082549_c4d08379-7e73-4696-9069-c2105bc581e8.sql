
CREATE TABLE public.patient_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_code TEXT,
  raw_history TEXT NOT NULL,
  motivo_consulta TEXT NOT NULL DEFAULT '',
  antecedentes TEXT NOT NULL DEFAULT '',
  diagnostico TEXT NOT NULL DEFAULT '',
  alertas TEXT NOT NULL DEFAULT '',
  tratamiento TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patient_summaries_doctor_created ON public.patient_summaries (doctor_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_summaries TO authenticated;
GRANT ALL ON public.patient_summaries TO service_role;

ALTER TABLE public.patient_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage own summaries"
  ON public.patient_summaries
  FOR ALL
  TO authenticated
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);
