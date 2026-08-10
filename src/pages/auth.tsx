import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, BadgeCheck, ArrowRight, Building2, Eye, EyeOff } from 'lucide-react';
import AiOrb from '@/components/AiOrb';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Ambient neural background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-teal/15 blur-[140px]" />
        <div className="absolute -right-32 top-0 h-[460px] w-[460px] rounded-full bg-blue/15 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-teal/10 blur-[150px]" />
      </div>

      <div className="glass-panel relative z-10 w-full max-w-md p-8 sm:p-10">
        {/* Brand + orb */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-text-1">HistorIA</h1>
            <h2 className="mt-4 text-xl font-medium text-text-1">
              {mode === 'login' ? 'Iniciar Sesión Médica' : 'Crear Cuenta Médica'}
            </h2>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-text-2">
              {mode === 'login'
                ? 'Ingresa tus credenciales o accede con tu cuenta corporativa de Google.'
                : 'Registra tus datos profesionales para acceder a la plataforma clínica.'}
            </p>
          </div>
          <AiOrb size={52} className="mt-1 drop-shadow-[0_0_24px_rgba(45,212,191,0.6)]" />
        </div>

        {/* Mode switcher */}
        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-teal/15 bg-white/[0.03] p-1 text-xs font-semibold backdrop-blur">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn(
              'rounded-lg py-2 transition-all cursor-pointer',
              mode === 'login'
                ? 'bg-teal/20 text-teal shadow-glow-teal'
                : 'text-text-2 hover:text-text-1',
            )}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={cn(
              'rounded-lg py-2 transition-all cursor-pointer',
              mode === 'register'
                ? 'bg-teal/20 text-teal shadow-glow-teal'
                : 'text-text-2 hover:text-text-1',
            )}
          >
            Crear Cuenta
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="mt-5 space-y-3.5">
          {mode === 'register' && (
            <>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
                <input
                  type="text"
                  required
                  placeholder="Nombre completo del profesional"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input pl-10"
                />
              </div>
              <div className="relative">
                <BadgeCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
                <input
                  type="text"
                  placeholder="Colegiatura Médica / CMP"
                  value={cmpNumber}
                  onChange={(e) => setCmpNumber(e.target.value)}
                  className="glass-input pl-10"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
            <input
              type="email"
              required
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input pl-10"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-3 hover:text-text-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow flex w-full items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            <span>{loading ? 'Procesando…' : mode === 'login' ? 'Ingresar' : 'Crear Mi Cuenta Médica'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-text-2">¿Olvidaste tu contraseña?</p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-teal/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-text-1 backdrop-blur transition-all hover:border-teal/40 hover:bg-white/[0.07] disabled:opacity-60"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{googleLoading ? 'Conectando con Google…' : 'Continuar con Google'}</span>
        </button>

        {/* Demo access */}
        <div className="mt-6 rounded-2xl border border-teal/20 bg-teal/[0.06] p-4 text-center backdrop-blur">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-teal">
            <Building2 className="h-4 w-4" />
            <span>Acceso rápido de demostración</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleDemoAccess('Dr. Roberto Mendoza')}
              className="cursor-pointer rounded-lg bg-teal/20 px-3 py-1.5 text-xs font-semibold text-teal transition-all hover:bg-teal/30"
            >
              Dr. Roberto Mendoza
            </button>
            <button
              type="button"
              onClick={() => handleDemoAccess('Dra. Sofía Alarcón')}
              className="cursor-pointer rounded-lg border border-teal/25 px-3 py-1.5 text-xs font-semibold text-text-2 transition-all hover:text-teal"
            >
              Dra. Sofía Alarcón
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
