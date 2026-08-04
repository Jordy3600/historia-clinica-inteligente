import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
  fullName: string;
  email: string;
  avatarUrl: string;
  cmp: string; // Colegiatura / Licencia
  specialty: string;
  clinicName: string;
  phone: string;
  subscriptionPlan: 'gratuito' | 'pro' | 'clinica';
  billingCycle: 'mensual' | 'anual';
}

const DEFAULT_PROFILE: UserProfile = {
  fullName: 'Dr. Roberto Mendoza',
  email: 'roberto.mendoza@historia.med',
  avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  cmp: 'CMP-84920',
  specialty: 'Medicina General y Familiar',
  clinicName: 'Clínica San Lucas',
  phone: '+51 987 654 321',
  subscriptionPlan: 'pro',
  billingCycle: 'mensual',
};

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile;
  loading: boolean;
  isDemoUser: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, pass: string, name: string, cmp?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInAsDemoDoctor: (doctorName?: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('historia_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_PROFILE;
  });
  const [isDemoUser, setIsDemoUser] = useState<boolean>(() => {
    return localStorage.getItem('historia_demo_mode') === 'true';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync session from Supabase
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        syncProfileFromUser(data.session.user);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setIsDemoUser(false);
        localStorage.removeItem('historia_demo_mode');
        syncProfileFromUser(newSession.user);
      } else if (!localStorage.getItem('historia_demo_mode')) {
        setIsDemoUser(false);
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  function syncProfileFromUser(user: User) {
    const meta = user.user_metadata || {};
    const updated: UserProfile = {
      fullName: meta.full_name || meta.name || user.email?.split('@')[0] || 'Doctor',
      email: user.email || '',
      avatarUrl: meta.avatar_url || meta.picture || DEFAULT_PROFILE.avatarUrl,
      cmp: meta.cmp || DEFAULT_PROFILE.cmp,
      specialty: meta.specialty || DEFAULT_PROFILE.specialty,
      clinicName: meta.clinic_name || DEFAULT_PROFILE.clinicName,
      phone: meta.phone || DEFAULT_PROFILE.phone,
      subscriptionPlan: meta.subscription_plan || 'pro',
      billingCycle: meta.billing_cycle || 'mensual',
    };
    setUserProfile(updated);
    localStorage.setItem('historia_user_profile', JSON.stringify(updated));
  }

  const signInWithEmail = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error };
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, cmp?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
          cmp: cmp || 'CMP-PENDIENTE',
          specialty: 'Medicina General',
        },
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });
    return { error };
  };

  const signInAsDemoDoctor = (doctorName = 'Dr. Roberto Mendoza') => {
    const demoProf: UserProfile = {
      ...DEFAULT_PROFILE,
      fullName: doctorName,
    };
    setUserProfile(demoProf);
    setIsDemoUser(true);
    localStorage.setItem('historia_demo_mode', 'true');
    localStorage.setItem('historia_user_profile', JSON.stringify(demoProf));
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    const newProf = { ...userProfile, ...updates };
    setUserProfile(newProf);
    localStorage.setItem('historia_user_profile', JSON.stringify(newProf));

    if (session?.user) {
      try {
        await supabase.auth.updateUser({
          data: {
            full_name: newProf.fullName,
            avatar_url: newProf.avatarUrl,
            cmp: newProf.cmp,
            specialty: newProf.specialty,
            clinic_name: newProf.clinicName,
            phone: newProf.phone,
            subscription_plan: newProf.subscriptionPlan,
            billing_cycle: newProf.billingCycle,
          },
        });
      } catch {}
    }
  };

  const signOut = async () => {
    setIsDemoUser(false);
    localStorage.removeItem('historia_demo_mode');
    await supabase.auth.signOut();
  };

  const user = session?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userProfile,
        loading,
        isDemoUser,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsDemoDoctor,
        updateUserProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
