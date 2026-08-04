import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PatientSummary, SummarySections } from '@/lib/supabase';

interface PendingSummary {
  patientName: string;
  patientCode: string;
  rawHistory: string;
  sections: SummarySections;
  date: string;
}

interface SummaryContextValue {
  pending: PendingSummary | null;
  setPending: (p: PendingSummary | null) => void;
  saved: PatientSummary | null;
  setSaved: (s: PatientSummary | null) => void;
}

const SummaryContext = createContext<SummaryContextValue | undefined>(undefined);

export function SummaryProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingSummary | null>(null);
  const [saved, setSaved] = useState<PatientSummary | null>(null);
  return (
    <SummaryContext.Provider value={{ pending, setPending, saved, setSaved }}>
      {children}
    </SummaryContext.Provider>
  );
}

export function useSummary() {
  const ctx = useContext(SummaryContext);
  if (!ctx) throw new Error('useSummary must be used within SummaryProvider');
  return ctx;
}

export type PendingSummaryType = PendingSummary;
