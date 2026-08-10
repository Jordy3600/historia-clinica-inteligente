import { useState, useEffect } from 'react';
import {
  X,
  User,
  Sun,
  Moon,
  Globe,
  CreditCard,
  Bot,
  Sparkles,
  Camera,
  Check,
  ShieldCheck,
  LogOut,
  Sliders,
  Award,
  Lock,
  CheckCircle2,
  Volume2,
  Bell,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { useI18n, LANGUAGES, type Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export type SettingsTab =
  | 'profile'
  | 'appearance'
  | 'language'
  | 'ai'
  | 'plan'
  | 'notifications'
  | 'security';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: SettingsTab;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813566-788b22730b20?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
];

export default function SettingsModal({ isOpen, onClose, defaultTab = 'profile' }: SettingsModalProps) {
  const { userProfile, updateUserProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useI18n();

  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab);

  // Profile Form state
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [cmp, setCmp] = useState(userProfile.cmp);
  const [specialty, setSpecialty] = useState(userProfile.specialty);
  const [clinicName, setClinicName] = useState(userProfile.clinicName);
  const [phone, setPhone] = useState(userProfile.phone);
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Subscription Billing State
  const [billingCycle, setBillingCycle] = useState<'mensual' | 'anual'>(
    userProfile.billingCycle || 'mensual'
  );
  const [selectedPlan, setSelectedPlan] = useState<'gratuito' | 'pro' | 'clinica'>(
    userProfile.subscriptionPlan || 'pro'
  );

  // AI Preferences
  const [autoReadSpeech, setAutoReadSpeech] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState<'natural' | 'pausado'>('natural');
  const [autoPatientContext, setAutoPatientContext] = useState(true);

  // Sync state when profile changes
  useEffect(() => {
    setFullName(userProfile.fullName);
    setCmp(userProfile.cmp);
    setSpecialty(userProfile.specialty);
    setClinicName(userProfile.clinicName);
    setPhone(userProfile.phone);
    setAvatarUrl(userProfile.avatarUrl);
  }, [userProfile]);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateUserProfile({
      fullName: fullName.trim(),
      cmp: cmp.trim(),
      specialty: specialty.trim(),
      clinicName: clinicName.trim(),
      phone: phone.trim(),
      avatarUrl: customAvatarUrl.trim() || avatarUrl,
    });
    toast.success('Perfil médico actualizado exitosamente');
  }

  function handleSaveAIPreferences() {
    toast.success('Preferencias de IA guardadas correctamente');
  }

  function handleSelectPlan(plan: 'gratuito' | 'pro' | 'clinica') {
    setSelectedPlan(plan);
    updateUserProfile({
      subscriptionPlan: plan,
      billingCycle,
    });
    toast.success(`Plan de suscripción cambiado a ${plan.toUpperCase()}`);
  }

  async function handleSignOut() {
    onClose();
    await signOut();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="glass-panel relative z-10 flex h-[90vh] max-h-[700px] w-full max-w-4xl flex-col overflow-hidden animate-fade-in md:flex-row">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-bg-hover text-text-2 hover:text-text-1 transition-colors cursor-pointer"
          title="Cerrar ajustes"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Left Sidebar Tabs */}
        <div className="w-full flex-shrink-0 border-b border-border bg-bg-hover/50 p-4 md:w-64 md:border-b-0 md:border-r">
          <div className="mb-6 flex items-center gap-3 px-2 pt-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue/15 text-blue font-bold">
              ⚙️
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-text-1">Ajustes & Configuración</h2>
              <p className="text-[11px] text-text-3">Plataforma HistorIA</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'profile'
                  ? 'bg-blue text-white shadow-glow-blue'
                  : 'text-text-2 hover:bg-bg-hover hover:text-text-1'
              )}
            >
              <User className="h-4 w-4" />
              <span>Perfil y Cuenta</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'appearance'
                  ? 'bg-blue text-white shadow-glow-blue'
                  : 'text-text-2 hover:bg-bg-hover hover:text-text-1'
              )}
            >
              <Sun className="h-4 w-4" />
              <span>Apariencia / Tema</span>
            </button>

            <button
              onClick={() => setActiveTab('language')}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'language'
                  ? 'bg-blue text-white shadow-glow-blue'
                  : 'text-text-2 hover:bg-bg-hover hover:text-text-1'
              )}
            >
              <Globe className="h-4 w-4" />
              <span>Idioma</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'ai'
                  ? 'bg-blue text-white shadow-glow-blue'
                  : 'text-text-2 hover:bg-bg-hover hover:text-text-1'
              )}
            >
              <Bot className="h-4 w-4" />
              <span>Preferencias de IA</span>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'plan'
                  ? 'bg-blue text-white shadow-glow-blue'
                  : 'text-text-2 hover:bg-bg-hover hover:text-text-1'
              )}
            >
              <CreditCard className="h-4 w-4" />
              <span>Plan y Suscripción</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'notifications'
                  ? 'bg-blue text-white shadow-glow-blue'
                  : 'text-text-2 hover:bg-bg-hover hover:text-text-1'
              )}
            >
              <Bell className="h-4 w-4" />
              <span>Notificaciones</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
                activeTab === 'security'
                  ? 'bg-blue text-white shadow-glow-blue'
                  : 'text-text-2 hover:bg-bg-hover hover:text-text-1'
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Seguridad y Privacidad</span>
            </button>
          </nav>

          <div className="mt-8 border-t border-border/70 pt-4 px-2">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-error hover:bg-error/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Modal Right Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AiOrb
            size={40}
            className="pointer-events-none absolute right-16 top-5 drop-shadow-[0_0_20px_rgba(45,212,191,0.55)]"
          />
          {/* TAB 1: PERFIL Y CUENTA */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-text-1">Perfil y Cuenta Médica</h3>
                <p className="text-xs text-text-2">
                  Actualiza tus datos del profesional de salud, colegiatura y foto pública.
                </p>
              </div>

              {/* Avatar Picker */}
              <div className="rounded-2xl border border-teal/15 bg-white/[0.03] backdrop-blur-xl p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={customAvatarUrl || avatarUrl}
                      alt={fullName}
                      className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue/30"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue text-white shadow-xs">
                      <Camera className="h-3 w-3" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <span className="text-xs font-semibold text-text-2">Avatares disponibles:</span>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_PRESETS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatarUrl(url);
                            setCustomAvatarUrl('');
                          }}
                          className={cn(
                            'h-9 w-9 overflow-hidden rounded-xl border-2 transition-all cursor-pointer',
                            avatarUrl === url && !customAvatarUrl
                              ? 'border-blue scale-105 shadow-glow-blue'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          )}
                        >
                          <img src={url} alt={`Avatar ${idx}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="URL personalizada de foto (https://...)"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="w-full rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3.5 py-2 text-xs text-text-1 placeholder:text-text-3 focus:border-teal focus:outline-none"
                  />
                </div>
              </div>

              {/* Form inputs */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-text-2 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3.5 py-2 text-xs text-text-1 focus:border-teal focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-2 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      disabled
                      value={userProfile.email}
                      className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-xs text-text-3 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-2 mb-1">
                      Colegiatura Médica / CMP
                    </label>
                    <input
                      type="text"
                      value={cmp}
                      onChange={(e) => setCmp(e.target.value)}
                      className="w-full rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3.5 py-2 text-xs text-text-1 focus:border-teal focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-2 mb-1">
                      Especialidad médica
                    </label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3.5 py-2 text-xs text-text-1 focus:border-teal focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-2 mb-1">
                      Clínica / Centro médico
                    </label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3.5 py-2 text-xs text-text-1 focus:border-teal focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-2 mb-1">
                      Teléfono de contacto
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3.5 py-2 text-xs text-text-1 focus:border-teal focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-blue px-5 py-2 text-xs font-bold text-white shadow-glow-blue transition-all hover:bg-blue-hover cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Guardar Perfil</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: APARIENCIA E IDIOMA */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-text-1">Apariencia e Idioma</h3>
                <p className="text-xs text-text-2">
                  Personaliza el tema visual y el idioma de la plataforma.
                </p>
              </div>

              {/* Theme Toggle Cards */}
              <div className="rounded-2xl border border-teal/15 bg-white/[0.03] backdrop-blur-xl p-5 space-y-3">
                <span className="text-xs font-bold text-text-1">Tema de la aplicación</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer',
                      theme === 'dark'
                        ? 'border-blue bg-blue/10 ring-2 ring-blue/30 text-text-1'
                        : 'border-border bg-bg-card text-text-2 hover:text-text-1'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-amber-400">
                        <Moon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold">Modo Oscuro</div>
                        <div className="text-[10px] text-text-3">Para entornos médicos y visión nocturna</div>
                      </div>
                    </div>
                    {theme === 'dark' && <Check className="h-4 w-4 text-blue" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer',
                      theme === 'light'
                        ? 'border-blue bg-blue/10 ring-2 ring-blue/30 text-text-1'
                        : 'border-border bg-bg-card text-text-2 hover:text-text-1'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <Sun className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold">Modo Claro</div>
                        <div className="text-[10px] text-text-3">Limpio e iluminado de alta visibilidad</div>
                      </div>
                    </div>
                    {theme === 'light' && <Check className="h-4 w-4 text-blue" />}
                  </button>
                </div>
              </div>

              {/* Language Selector */}
              <div className="rounded-2xl border border-teal/15 bg-white/[0.03] backdrop-blur-xl p-5 space-y-3">
                <span className="text-xs font-bold text-text-1">Idioma del sistema</span>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-blue" />
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Lang)}
                    className="flex-1 rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-4 py-2.5 text-xs font-semibold text-text-1 outline-none cursor-pointer focus:border-teal"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code} className="bg-bg-card">
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLAN Y SUSCRIPCIÓN */}
          {activeTab === 'plan' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-text-1">Plan y Suscripción</h3>
                  <p className="text-xs text-text-2">
                    Gestiona tu plan clínico, facturación y consumo del sistema.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal/15 px-3 py-1 text-xs font-extrabold text-teal">
                  <Award className="h-4 w-4" />
                  <span>
                    {userProfile.subscriptionPlan === 'pro'
                      ? 'Plan Médico Pro Activo'
                      : userProfile.subscriptionPlan === 'clinica'
                        ? 'Plan Pro Clínica Activo'
                        : 'Plan Demo Gratuito'}
                  </span>
                </div>
              </div>

              {/* Consumption / Usage */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-teal/15 bg-white/[0.03] backdrop-blur-xl p-4">
                  <div className="text-[11px] font-semibold text-text-2">Consultas IA este mes</div>
                  <div className="mt-1 text-xl font-extrabold text-teal">Ilimitadas</div>
                  <div className="mt-1 text-[10px] text-text-3">Motor IA médica activo</div>
                </div>

                <div className="rounded-2xl border border-teal/15 bg-white/[0.03] backdrop-blur-xl p-4">
                  <div className="text-[11px] font-semibold text-text-2">Historias Clínicas</div>
                  <div className="mt-1 text-xl font-extrabold text-blue">Encriptadas HIPAA</div>
                  <div className="mt-1 text-[10px] text-text-3">Respaldadas en la nube 24/7</div>
                </div>
              </div>

              {/* Plans Selection */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-text-1">Seleccionar o cambiar de plan</span>
                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Plan Gratuito */}
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('gratuito')}
                    className={cn(
                      'flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer',
                      selectedPlan === 'gratuito'
                        ? 'border-blue bg-blue/10 ring-2 ring-blue/30'
                        : 'border-border bg-bg-card hover:border-border-hover'
                    )}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-text-1">Plan Gratuito</div>
                      <div className="mt-1 text-lg font-bold text-text-1">$0 <span className="text-xs text-text-3 font-normal">/mes</span></div>
                      <p className="mt-2 text-[10px] text-text-2">Pruebas básicas del asistente clínico.</p>
                    </div>
                    {selectedPlan === 'gratuito' && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Plan Seleccionado
                      </div>
                    )}
                  </button>

                  {/* Plan Médico Pro */}
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('pro')}
                    className={cn(
                      'flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer relative',
                      selectedPlan === 'pro'
                        ? 'border-blue bg-blue/10 ring-2 ring-blue/30'
                        : 'border-border bg-bg-card hover:border-border-hover'
                    )}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-text-1">Médico Pro</div>
                      <div className="mt-1 text-lg font-bold text-text-1">$29 <span className="text-xs text-text-3 font-normal">/mes</span></div>
                      <p className="mt-2 text-[10px] text-text-2">Consultas ilimitadas, dictado por voz y mapa de clínicas.</p>
                    </div>
                    {selectedPlan === 'pro' && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Plan Seleccionado
                      </div>
                    )}
                  </button>

                  {/* Plan Pro Clínica */}
                  <button
                    type="button"
                    onClick={() => handleSelectPlan('clinica')}
                    className={cn(
                      'flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer',
                      selectedPlan === 'clinica'
                        ? 'border-blue bg-blue/10 ring-2 ring-blue/30'
                        : 'border-border bg-bg-card hover:border-border-hover'
                    )}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-text-1">Pro Clínica</div>
                      <div className="mt-1 text-lg font-bold text-text-1">$79 <span className="text-xs text-text-3 font-normal">/mes</span></div>
                      <p className="mt-2 text-[10px] text-text-2">Para centros médicos y equipos multiusuario.</p>
                    </div>
                    {selectedPlan === 'clinica' && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-blue">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Plan Seleccionado
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PREFERENCIAS DE IA */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-text-1">Preferencias de Inteligencia Artificial</h3>
                <p className="text-xs text-text-2">
                  Configura cómo interactúa el Asistente Clínico HistorIA con tu consulta diaria.
                </p>
              </div>

              {/* Voice Read Aloud Toggle */}
              <div className="rounded-2xl border border-teal/15 bg-white/[0.03] backdrop-blur-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="h-5 w-5 text-teal" />
                    <div>
                      <div className="text-xs font-bold text-text-1">Lectura en Voz Alta Automática</div>
                      <div className="text-[11px] text-text-2">
                        Reproduce las respuestas del asistente con voz humana al recibirlas.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoReadSpeech(!autoReadSpeech)}
                    className={cn(
                      'relative h-6 w-11 rounded-full transition-colors cursor-pointer',
                      autoReadSpeech ? 'bg-teal' : 'bg-slate-700'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        autoReadSpeech ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="border-t border-border/50 pt-3">
                  <label className="block text-xs font-semibold text-text-2 mb-1.5">
                    Estilo y Cadencia de Voz Preferido
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVoiceSpeed('natural')}
                      className={cn(
                        'flex-1 rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer',
                        voiceSpeed === 'natural'
                          ? 'border-teal bg-teal/15 text-teal'
                          : 'border-border bg-bg-card text-text-2'
                      )}
                    >
                      Conversacional Humano (Recomendado)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoiceSpeed('pausado')}
                      className={cn(
                        'flex-1 rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer',
                        voiceSpeed === 'pausado'
                          ? 'border-teal bg-teal/15 text-teal'
                          : 'border-border bg-bg-card text-text-2'
                      )}
                    >
                      Lectura Dictado Pausado
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto Context Toggle */}
              <div className="rounded-2xl border border-teal/15 bg-white/[0.03] backdrop-blur-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue" />
                  <div>
                    <div className="text-xs font-bold text-text-1">Incluir Contexto de Paciente Automático</div>
                    <div className="text-[11px] text-text-2">
                      Proporciona antecedentes médicos relevantes al asistente sin seleccionarlos manualmente.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoPatientContext(!autoPatientContext)}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors cursor-pointer',
                    autoPatientContext ? 'bg-blue' : 'bg-slate-700'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      autoPatientContext ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* HIPAA Security Banner */}
              <div className="rounded-2xl border border-blue/30 bg-blue/10 p-4 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-blue flex-shrink-0" />
                <div className="text-xs text-text-1">
                  <strong className="font-bold">Privacidad Médica Protegida:</strong> Todos los datos de consulta e historia clínica procesados por HistorIA IA están cifrados de extremo a extremo conforme a estándares regulatorios de salud.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveAIPreferences}
                  className="flex items-center gap-2 rounded-xl bg-blue px-5 py-2 text-xs font-bold text-white shadow-glow-blue transition-all hover:bg-blue-hover cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Guardar Preferencias</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
