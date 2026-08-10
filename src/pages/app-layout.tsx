import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  FileText,
  Users,
  Calendar,
  MapPin,
  History,
  BarChart3,
  Stethoscope,
  Menu,
  X,
  ArrowLeft,
  Sparkles,
  ChevronUp,
  User,
  Sun,
  Globe,
  CreditCard,
  Bell,
  ShieldCheck,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import SettingsModal, { type SettingsTab } from '@/components/SettingsModal';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedSettingsTab, setSelectedSettingsTab] = useState<SettingsTab>('profile');

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  // Close profile popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openSettingsTab = (tab: SettingsTab) => {
    setSelectedSettingsTab(tab);
    setSettingsModalOpen(true);
    setProfileMenuOpen(false);
  };

  const NAV_ITEMS = [
    { to: '/app', label: 'Inicio', icon: LayoutDashboard },
    { to: '/app/asistente', label: 'Asistente IA', icon: Bot },
    { to: '/app/nueva-consulta', label: 'Resumen clínico', icon: FileText },
    { to: '/app/pacientes', label: 'Pacientes', icon: Users },
    { to: '/app/agenda', label: 'Agenda', icon: Calendar },
    { to: '/app/historial', label: 'Historial', icon: History },
    { to: '/app/mapa', label: 'Mapa de clínicas', icon: MapPin },
    { to: '/app/reportes', label: 'Reportes', icon: BarChart3 },
    { to: '#configuracion', label: 'Configuración', icon: Settings, isSettings: true },
  ];

  const isActive = (to: string) =>
    to === '/app' ? location.pathname === '/app' : location.pathname.startsWith(to);

  // Solo "Inicio" conserva el menú lateral; el resto de secciones se muestran
  // a pantalla completa con una flecha de retroceso.
  const isHome = location.pathname === '/app';
  const currentNav = NAV_ITEMS.find(
    (item) => !item.isSettings && item.to !== '/app' && location.pathname.startsWith(item.to)
  );
  const isAssistant = location.pathname.startsWith('/app/asistente');
  const isFullBleed = isAssistant || location.pathname.startsWith('/app/mapa');

  const SidebarContent = () => (
    <>
      <div className="flex items-center px-5 py-5">
        <Link to="/app" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/15 text-teal border border-teal/30">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-text-1">HistorIA</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, isSettings }) => {
          const active = isActive(to);
          
          if (isSettings) {
            return (
              <button
                key={to}
                type="button"
                onClick={() => openSettingsTab('profile')}
                className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
              >
                <Icon className="h-4.5 w-4.5 text-text-3 group-hover:text-text-1 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer',
                active
                  ? 'bg-[#121b29] text-[#00f2fe] font-semibold border border-teal/30'
                  : 'text-text-2 hover:bg-bg-hover hover:text-text-1'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4.5 w-4.5 flex-shrink-0 transition-colors',
                    active ? 'text-[#00f2fe]' : 'text-text-3 group-hover:text-text-1'
                  )}
                />
                <span className="truncate">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Doctor Profile Footer with Popover Menu */}
      <div className="relative border-t border-border/60 p-3" ref={profileRef}>
        {/* Doctor Profile Popover Dropdown */}
        {profileMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 z-50 rounded-2xl border border-border/80 bg-[#141824]/95 backdrop-blur-xl p-2 shadow-2xl animate-fade-in text-xs space-y-0.5">
            <div className="px-3 py-2 border-b border-border/50 mb-1">
              <p className="font-extrabold text-text-1">{userProfile.fullName}</p>
              <p className="text-[10px] text-text-3">CMP {userProfile.cmp} • {userProfile.specialty}</p>
            </div>

            <button
              onClick={() => openSettingsTab('profile')}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
            >
              <User className="h-4 w-4 text-teal" />
              <span>Perfil y cuenta</span>
            </button>

            <button
              onClick={() => openSettingsTab('appearance')}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
            >
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Apariencia / Tema (dark / light / system)</span>
            </button>

            <button
              onClick={() => openSettingsTab('language')}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
            >
              <Globe className="h-4 w-4 text-blue" />
              <span>Idioma</span>
            </button>

            <button
              onClick={() => openSettingsTab('ai')}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
            >
              <Bot className="h-4 w-4 text-teal" />
              <span>Preferencias de la IA</span>
            </button>

            <button
              onClick={() => openSettingsTab('plan')}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
            >
              <CreditCard className="h-4 w-4 text-purple-400" />
              <span>Plan y suscripción</span>
            </button>

            <button
              onClick={() => openSettingsTab('notifications')}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
            >
              <Bell className="h-4 w-4 text-yellow-400" />
              <span>Notificaciones</span>
            </button>

            <button
              onClick={() => openSettingsTab('security')}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-text-2 hover:bg-bg-hover hover:text-text-1 transition-all cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Seguridad y privacidad</span>
            </button>

            <div className="border-t border-border/50 pt-1 mt-1">
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-error hover:bg-error/10 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}

        {/* Doctor Profile Clickable Area */}
        <button
          type="button"
          onClick={() => setProfileMenuOpen((prev) => !prev)}
          className={cn(
            'group flex w-full items-center justify-between rounded-2xl border p-2.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]',
            profileMenuOpen
              ? 'border-teal/60 bg-bg-hover ring-2 ring-teal/20'
              : 'border-border/80 bg-bg-hover/60 hover:border-teal/50 hover:bg-bg-hover'
          )}
          title="Opciones de perfil y cuenta médica"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.fullName}
              className="h-9 w-9 flex-shrink-0 rounded-xl object-cover ring-2 ring-teal/30 group-hover:ring-teal/60 transition-all"
            />
            <div className="min-w-0 flex-1 text-left">
              <div className="text-xs font-bold text-text-1 truncate group-hover:text-teal transition-colors">
                {userProfile.fullName}
              </div>
              <div className="text-[10px] text-text-3 font-medium truncate">
                CMP {userProfile.cmp} • {userProfile.specialty}
              </div>
            </div>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-xl text-text-3 group-hover:bg-teal/15 group-hover:text-teal transition-all flex-shrink-0">
            <ChevronUp className={cn('h-4 w-4 transition-transform duration-200', profileMenuOpen && 'rotate-180')} />
          </div>
        </button>
      </div>
    </>
  );

  return (
    !isHome ? (
      <div className="flex min-h-screen flex-col bg-bg text-text-1">
        {!isFullBleed && (
          <header className="no-print sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg-card/80 px-4 backdrop-blur-md">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-hover text-text-2 transition-all hover:border-teal/40 hover:text-teal cursor-pointer active:scale-95"
              title="Volver a Inicio"
              aria-label="Volver a Inicio"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-teal/30 bg-teal/15 text-teal">
                {currentNav ? <currentNav.icon className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
              </div>
              <span className="truncate text-sm font-bold text-text-1">
                {currentNav?.label ?? 'HistorIA'}
              </span>
            </div>
          </header>
        )}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <SettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          defaultTab={selectedSettingsTab}
        />
      </div>
    ) : (
    <div className="flex min-h-screen bg-bg text-text-1">
      {/* Sidebar Desktop */}
      <aside className="no-print hidden w-64 flex-shrink-0 flex-col border-r border-border bg-bg-card/95 backdrop-blur-md md:flex">
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-bg-card/95 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg-hover text-text-2 cursor-pointer hover:text-text-1"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal/15 text-teal border border-teal/30">
                <Stethoscope className="h-4 w-4 text-teal" />
              </div>
              <span className="font-extrabold text-text-1 text-sm">HistorIA AI</span>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-bg-card shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="text-xs font-bold text-text-3 uppercase tracking-wider">Menú Clinico</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-2 hover:bg-bg-hover cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent />
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        defaultTab={selectedSettingsTab}
      />
    </div>
    )
  );
}


