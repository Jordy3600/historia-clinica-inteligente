import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Mail,
  Lock,
  User,
  BadgeCheck,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const navigate = useNavigate();
  const { session, isDemoUser, signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsDemoDoctor } =
    useAuth();
  const { t } = useI18n();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cmpNumber, setCmpNumber] = useState('');

  useEffect(() => {
    if (session || isDemoUser) {
      navigate('/app', { replace: true });
    }
  }, [session, isDemoUser, navigate]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const { error } = await signInWithEmail(email.trim(), password);
      setLoading(false);
      if (error) {
        toast.error(`Error al iniciar sesión: ${error.message}`);
      } else {
        toast.success('¡Bienvenido de nuevo a HistorIA!');
        navigate('/app', { replace: true });
      }
    } else {
      if (!fullName.trim()) {
        toast.error('Ingresa tu nombre completo para el registro médico');
        setLoading(false);
        return;
      }
      const { error } = await signUpWithEmail(email.trim(), password, fullName.trim(), cmpNumber.trim());
      setLoading(false);
      if (error) {
        toast.error(`Error en el registro: ${error.message}`);
      } else {
        toast.success('Cuenta registrada correctamente. Revisa tu correo o ingresa.');
        navigate('/app', { replace: true });
      }
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(`Error con Google SSO: ${error.message}`);
      setGoogleLoading(false);
    }
  }

  function handleDemoAccess(doctorName: string) {
    signInAsDemoDoctor(doctorName);
    toast.success(`Iniciando sesión como ${doctorName} (Modo Demo)`);
    navigate('/app', { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text-1 lg:flex-row">
      {/* Left side: Branding / Showcase (visible on lg screens) */}
      <div className="relative hidden flex-1 flex-col justify-between bg-gradient-to-br from-blue-900 via-bg-card to-blue-950 p-12 text-white lg:flex border-r border-border overflow-hidden">
        {/* Subtle decorative background blur elements */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-teal/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue/20 border border-blue/40 shadow-glow-blue backdrop-blur">
            <Stethoscope className="h-6 w-6 text-blue" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight">HistorIA</span>
            <span className="ml-2 rounded-md bg-blue/20 px-2 py-0.5 text-xs font-semibold text-blue border border-blue/30">
              SaaS B2B Médico
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3.5 py-1 text-xs font-semibold text-teal backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Asistencia Médica Inteligente HistorIA IA
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl text-text-1">
            Gestión clínica avanzada, voz y resúmenes SOAP para profesionales de la salud.
          </h1>
          <p className="text-sm leading-relaxed text-text-2">
            HistorIA permite a médicos y centros de salud estructurar anamnesis, realizar consultas con IA médica, gestionar agendas y sincronizar expedientes de forma segura con Supabase.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-text-2">
              <CheckCircle2 className="h-4 w-4 text-teal flex-shrink-0" />
              <span>Sincronización multi-idioma instantánea (Español, Inglés, Quechua, Aimara)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-2">
              <CheckCircle2 className="h-4 w-4 text-teal flex-shrink-0" />
              <span>Persistencia permanente de historias clínicas en base de datos Supabase</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-text-2">
              <CheckCircle2 className="h-4 w-4 text-teal flex-shrink-0" />
              <span>Resguardo de privacidad de pacientes y seguridad encriptada</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-border/50 pt-6 text-xs text-text-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-teal" />
            <span>Estándares de interoperabilidad HL7 / FHIR</span>
          </div>
          <span>v2.4 Pro SaaS</span>
        </div>
      </div>

      {/* Right side: Login & Register Form Container */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Header for Mobile/Form */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 lg:hidden mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/15 text-blue">
                <Stethoscope className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-text-1">HistorIA</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-text-1">
              {mode === 'login' ? 'Iniciar Sesión Médica' : 'Crear Cuenta en HistorIA'}
            </h2>
            <p className="mt-1.5 text-xs text-text-2">
              {mode === 'login'
                ? 'Ingresa tus credenciales o accede con tu cuenta corporativa de Google.'
                : 'Registra tus datos profesionales para acceder a la plataforma médica.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 rounded-xl border border-border bg-bg-card p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={cn(
                'rounded-lg py-2 transition-all cursor-pointer',
                mode === 'login' ? 'bg-blue text-white shadow-xs' : 'text-text-2 hover:text-text-1',
              )}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={cn(
                'rounded-lg py-2 transition-all cursor-pointer',
                mode === 'register' ? 'bg-blue text-white shadow-xs' : 'text-text-2 hover:text-text-1',
              )}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Google SSO button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3 text-xs font-semibold text-text-1 shadow-xs transition-all hover:border-blue/50 hover:bg-bg-hover cursor-pointer disabled:opacity-60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Conectando con Google…' : 'Continuar con Google'}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-bg px-3 text-[11px] uppercase tracking-wider text-text-3 font-semibold">
                O con correo electrónico
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-text-2 mb-1">
                    Nombre completo del profesional *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Dr. Roberto Mendoza"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-bg-card py-2.5 pl-10 pr-4 text-xs text-text-1 placeholder:text-text-3 focus:border-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-2 mb-1">
                    Colegiatura Médica / Licencia (CMP)
                  </label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
                    <input
                      type="text"
                      placeholder="Ej. CMP-84920"
                      value={cmpNumber}
                      onChange={(e) => setCmpNumber(e.target.value)}
                      className="w-full rounded-xl border border-border bg-bg-card py-2.5 pl-10 pr-4 text-xs text-text-1 placeholder:text-text-3 focus:border-blue focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Correo electrónico institucional o personal *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
                <input
                  type="email"
                  required
                  placeholder="doctor@clinica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-card py-2.5 pl-10 pr-4 text-xs text-text-1 placeholder:text-text-3 focus:border-blue focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-2 mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-card py-2.5 pl-10 pr-10 text-xs text-text-1 placeholder:text-text-3 focus:border-blue focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue py-3 text-xs font-bold text-white shadow-glow-blue transition-all hover:bg-blue-hover cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Procesando…' : mode === 'login' ? 'Ingresar al Panel Clínico' : 'Crear Mi Cuenta Médica'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="rounded-2xl border border-teal/30 bg-teal/5 p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-teal">
              <Building2 className="h-4 w-4" />
              <span>Acceso Rápido para Demostración</span>
            </div>
            <p className="text-[11px] text-text-2">
              Prueba la plataforma instantáneamente como médico registrado sin esperar confirmación por correo:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemoAccess('Dr. Roberto Mendoza')}
                className="rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-hover cursor-pointer"
              >
                Ingresar como Dr. Roberto Mendoza
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccess('Dra. Sofía Alarcón')}
                className="rounded-lg border border-teal/40 bg-bg-card px-3 py-1.5 text-xs font-semibold text-teal hover:bg-teal/10 cursor-pointer"
              >
                Dra. Sofía Alarcón (Pediatra)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
