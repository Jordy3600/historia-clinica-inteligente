import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

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
export type SummarySections = Pick<PatientSummary, 'motivo_consulta' | 'antecedentes' | 'diagnostico' | 'alertas' | 'tratamiento'>;
