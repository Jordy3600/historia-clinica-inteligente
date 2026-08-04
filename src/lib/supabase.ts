export { supabase } from '@/integrations/supabase/client';

export interface PatientSummary {
  id: string;
  doctor_id: string | null;
  patient_name: string;
  patient_code: string | null;
  raw_history: string;
  motivo_consulta: string;
  antecedentes: string;
  diagnostico: string;
  alertas: string;
  tratamiento: string;
  created_at: string;
}

export type SummaryListItem = Pick<PatientSummary, 'id' | 'patient_name' | 'patient_code' | 'created_at'>;
export type SummarySections = Pick<
  PatientSummary,
  'motivo_consulta' | 'antecedentes' | 'diagnostico' | 'alertas' | 'tratamiento'
>;
