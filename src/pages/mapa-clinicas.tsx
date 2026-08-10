import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  Navigation,
  Stethoscope,
  Building2,
  Cross,
  Star,
  Plus,
  MapPin,
  X,
  Phone,
  Globe,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export interface Clinic {
  id: string;
  name: string;
  type: 'hospital' | 'clinica' | 'centro' | 'consultorio' | 'laboratorio';
  specialty: string;
  address: string;
  phone?: string;
  rating: number;
  lat: number;
  lng: number;
  created_at?: string;
}

const DEFAULT_GLOBAL_CLINICS: Clinic[] = [
  {
    id: 'seed-1',
    name: 'Hospital Nacional Edgardo Rebagliati Martins',
    type: 'hospital',
    specialty: 'General / Alta Complejidad',
    address: 'Av. Edgardo Rebagliati 490, Jesús María, Lima, Perú',
    phone: '+51 1 265-4900',
    rating: 4.6,
    lat: -12.0734,
    lng: -77.0396,
  },
  {
    id: 'seed-2',
    name: 'Clínica Anglo Americana',
    type: 'clinica',
    specialty: 'Especialidades Médicas',
    address: 'Calle Alfredo Salazar 350, San Isidro, Lima, Perú',
    phone: '+51 1 616-8900',
    rating: 4.8,
    lat: -12.0991,
    lng: -77.0361,
  },
  {
    id: 'seed-3',
    name: 'Hospital Universitario La Paz',
    type: 'hospital',
    specialty: 'Pediatría y Urgencias',
    address: 'Paseo de la Castellana 261, Madrid, España',
    phone: '+34 917 27 70 00',
    rating: 4.7,
    lat: 40.4808,
    lng: -3.6876,
  },
  {
    id: 'seed-4',
    name: 'Instituto Nacional de Ciencias Médicas Salvador Zubirán',
    type: 'hospital',
    specialty: 'Investigación y Medicina Interna',
    address: 'Vasco de Quiroga 15, Tlalpan, Ciudad de México, México',
    phone: '+52 55 5487 0900',
    rating: 4.9,
    lat: 19.2882,
    lng: -99.1601,
  },
  {
    id: 'seed-5',
    name: 'Hospital Italiano de Buenos Aires',
    type: 'hospital',
    specialty: 'Cardiología y Cirugía',
    address: 'Tte. Gral. Juan Domingo Perón 4190, Buenos Aires, Argentina',
    phone: '+54 11 4959-0200',
    rating: 4.7,
    lat: -34.6062,
    lng: -58.4239,
  },
  {
    id: 'seed-6',
    name: 'Fundación Santa Fe de Bogotá',
    type: 'clinica',
    specialty: 'Oncología y Neurología',
    address: 'Carrera 7 No. 117-15, Bogotá, Colombia',
    phone: '+57 601 6030303',
    rating: 4.8,
    lat: 4.6936,
    lng: -74.0322,
  },
  {
    id: 'seed-7',
    name: 'Mount Sinai Hospital',
    type: 'hospital',
    specialty: 'Traumatología y Emergencias',
    address: '1468 Madison Ave, New York, NY, USA',
    phone: '+1 212-241-6500',
    rating: 4.8,
    lat: 40.7891,
    lng: -73.9542,
  },
];

const TYPE_CFG: Record<
  Clinic['type'],
  { label: string; icon: any; bg: string; color: string; hex: string }
> = {
  hospital: {
    label: 'Hospital',
    icon: Building2,
    bg: 'bg-error/10',
    color: 'text-error',
    hex: '#EF4444',
  },
  clinica: {
    label: 'Clínica',
    icon: Stethoscope,
    bg: 'bg-blue/10',
    color: 'text-blue',
    hex: '#2563EB',
  },
  centro: {
    label: 'Centro de salud',
    icon: Cross,
    bg: 'bg-teal/10',
    color: 'text-teal',
    hex: '#14B8A6',
  },
  consultorio: {
    label: 'Consultorio',
    icon: Stethoscope,
    bg: 'bg-purple-500/10',
    color: 'text-purple-500',
    hex: '#A855F7',
  },
  laboratorio: {
    label: 'Laboratorio',
    icon: Building2,
    bg: 'bg-amber-500/10',
    color: 'text-amber-500',
    hex: '#F59E0B',
  },
};

const SPECIALTIES = [
  'Todas',
  'General / Alta Complejidad',
  'Especialidades Médicas',
  'Pediatría',
  'Cardiología',
  'Ginecología',
  'Emergencias',
  'Oncología',
  'Traumatología',
  'Neurología',
];

function createMarkerIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.2s;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function MapaClinicasPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('Todas');
  const [selected, setSelected] = useState<string | null>(null);

  // Registration modal states
  const [showModal, setShowModal] = useState(false);
  const [isPickingPoint, setIsPickingPoint] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<Clinic['type']>('clinica');
  const [formSpecialty, setFormSpecialty] = useState('General / Alta Complejidad');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRating, setFormRating] = useState('4.8');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Load clinics from storage / Supabase
  useEffect(() => {
    async function loadClinics() {
      const local = localStorage.getItem('historia_clinics');
      let combined: Clinic[] = [];

      if (local) {
        try {
          combined = JSON.parse(local);
        } catch {
          combined = [...DEFAULT_GLOBAL_CLINICS];
        }
      } else {
        combined = [...DEFAULT_GLOBAL_CLINICS];
        localStorage.setItem('historia_clinics', JSON.stringify(combined));
      }

      // Try fetching user registered clinics from Supabase if table exists
      try {
        const { data, error } = await supabase.from('clinics').select('*');
        if (!error && data && data.length > 0) {
          const mapById = new Map<string, Clinic>();
          combined.forEach((c) => mapById.set(c.id, c));
          data.forEach((c) => mapById.set(c.id, c as unknown as Clinic));
          combined = Array.from(mapById.values());
        }
      } catch {}

      setClinics(combined);
    }

    loadClinics();
  }, []);

  // Filter clinics
  const filtered = clinics.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.specialty.toLowerCase().includes(q);
    const matchesSpec = specialty === 'Todas' || c.specialty.includes(specialty);
    return matchesSearch && matchesSpec;
  });

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Default global view centered on Atlantic / America / Europe overview
    const map = L.map(containerRef.current, {
      center: [-12.0734, -77.0396], // Lima default center
      zoom: 4,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Try detecting user current position for smooth initial pan
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (mapRef.current) {
            mapRef.current.flyTo([pos.coords.latitude, pos.coords.longitude], 10, {
              duration: 1.5,
            });
          }
        },
        () => {},
        { timeout: 5000 },
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Map Click Listener for picking point
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (isPickingPoint) {
        const lat = Number(e.latlng.lat.toFixed(5));
        const lng = Number(e.latlng.lng.toFixed(5));
        setPickedCoords({ lat, lng });
        setFormLat(lat.toString());
        setFormLng(lng.toString());
        setIsPickingPoint(false);
        setShowModal(true);
        toast.success(`Ubicación seleccionada: ${lat}, ${lng}`);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [isPickingPoint]);

  // Update Markers when filtered clinics change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    filtered.forEach((c) => {
      const cfg = TYPE_CFG[c.type] || TYPE_CFG.clinica;
      const marker = L.marker([c.lat, c.lng], {
        icon: createMarkerIcon(cfg.hex),
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-family:sans-serif;min-width:200px;padding:2px;">
          <strong style="font-size:14px;color:#0F172A;display:block;margin-bottom:2px;">${c.name}</strong>
          <span style="font-size:11px;color:#64748B;display:block;margin-bottom:4px;">📍 ${c.address}</span>
          ${c.phone ? `<span style="font-size:11px;color:#475569;display:block;margin-bottom:4px;">📞 ${c.phone}</span>` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
            <span style="font-size:11px;color:${cfg.hex};font-weight:600;background:rgba(37,99,235,0.1);padding:2px 8px;border-radius:4px;">${cfg.label} · ${c.specialty}</span>
            <span style="font-size:11px;color:#EAB308;font-weight:bold;">★ ${c.rating}</span>
          </div>
        </div>`,
      );

      marker.on('click', () => setSelected(c.id));
      markersRef.current.set(c.id, marker);
    });
  }, [filtered]);

  // Fly to selected clinic
  useEffect(() => {
    if (!selected || !mapRef.current) return;
    const clinic = clinics.find((c) => c.id === selected);
    if (clinic) {
      mapRef.current.flyTo([clinic.lat, clinic.lng], 14, { duration: 1 });
      const marker = markersRef.current.get(selected);
      if (marker) marker.openPopup();
    }
  }, [selected, clinics]);

  // Geolocation trigger
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error('La geolocalización no está soportada por tu navegador.');
      return;
    }
    toast.info('Obteniendo tu ubicación GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setFormLat(lat.toString());
        setFormLng(lng.toString());
        setPickedCoords({ lat, lng });
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 14);
        }
        toast.success(`Ubicación GPS detectada: ${lat}, ${lng}`);
      },
      () => {
        toast.error('No se pudo obtener la ubicación GPS.');
      },
      { enableHighAccuracy: true },
    );
  }

  function handleStartPickingPoint() {
    setShowModal(false);
    setIsPickingPoint(true);
    toast.info('Haz clic en cualquier parte del mapa mundial para elegir la posición exacta de tu clínica.');
  }

  // Register clinic submit
  async function handleRegisterClinic(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim()) {
      toast.error('Por favor completa el nombre y la dirección');
      return;
    }

    const lat = parseFloat(formLat);
    const lng = parseFloat(formLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Ingresa coordenadas de latitud y longitud válidas en el mapa mundial');
      return;
    }

    const newClinic: Clinic = {
      id: crypto.randomUUID(),
      name: formName.trim(),
      type: formType,
      specialty: formSpecialty,
      address: formAddress.trim(),
      phone: formPhone.trim() || undefined,
      rating: parseFloat(formRating) || 5.0,
      lat,
      lng,
      created_at: new Date().toISOString(),
    };

    const updated = [newClinic, ...clinics];
    setClinics(updated);
    localStorage.setItem('historia_clinics', JSON.stringify(updated));

    // Try saving to Supabase
    try {
      await supabase.from('clinics').insert({
        id: newClinic.id,
        name: newClinic.name,
        type: newClinic.type,
        specialty: newClinic.specialty,
        address: newClinic.address,
        phone: newClinic.phone,
        rating: newClinic.rating,
        lat: newClinic.lat,
        lng: newClinic.lng,
      });
    } catch {}

    toast.success(`¡Clínica "${newClinic.name}" registrada con éxito!`);
    setShowModal(false);
    setSelected(newClinic.id);

    // Reset form
    setFormName('');
    setFormAddress('');
    setFormPhone('');
    setFormLat('');
    setFormLng('');
    setPickedCoords(null);

    // Fly to new clinic
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-6 lg:p-8">
      {/* Header Minimalista */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="text-xl font-bold text-text-1">
            Mapa de clínicas
          </h1>
          <p className="text-xs text-text-3">
            Explora o registra centros de salud, clínicas y hospitales en cualquier parte del mundo.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#00a8c6] hover:bg-[#00c2e0] px-4 py-2.5 text-xs font-bold text-slate-950 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar clínica</span>
        </button>
      </div>

      {/* Mode notice if picking point */}
      {isPickingPoint && (
        <div className="flex items-center justify-between rounded-xl border border-blue/40 bg-blue/10 p-3.5 text-sm text-text-1 animate-pulse">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue" />
            <span>Haz clic en cualquier punto del mapa mundial para fijar la ubicación de la nueva clínica.</span>
          </div>
          <button
            onClick={() => {
              setIsPickingPoint(false);
              setShowModal(true);
            }}
            className="rounded-lg border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3 py-1 text-xs font-medium text-text-2 hover:text-text-1"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, especialidad, dirección, ciudad o país…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl py-2.5 pl-10 pr-4 text-sm text-text-1 placeholder:text-text-3 focus:border-teal/50 focus:outline-none focus:ring-2 focus:ring-blue/20"
          />
        </div>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="rounded-xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-3 py-2.5 text-sm text-text-1 focus:border-teal/50 focus:outline-none cursor-pointer"
        >
          {SPECIALTIES.map((s) => (
            <option key={s} value={s} className="bg-bg-card">
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Grid: Map & List */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div
            ref={containerRef}
            className="h-[420px] w-full overflow-hidden rounded-2xl border border-border sm:h-[540px] shadow-sm"
            style={{ zIndex: 0 }}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap gap-4">
              {Object.entries(TYPE_CFG).map(([k, c]) => (
                <div key={k} className="flex items-center gap-2 text-xs text-text-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                  {c.label}
                </div>
              ))}
            </div>
            <span className="text-xs text-text-3">
              Mostrando {filtered.length} de {clinics.length} registradas en la red mundial
            </span>
          </div>
        </div>

        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-3">
              Directorio Global ({filtered.length})
            </p>
            <span className="flex items-center gap-1 text-xs text-text-3">
              <Navigation className="h-3 w-3" />
              Haz clic para enfocar
            </span>
          </div>

          <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
            {filtered.map((c) => {
              const cfg = TYPE_CFG[c.type] || TYPE_CFG.clinica;
              const Icon = cfg.icon;
              const sel = selected === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(sel ? null : c.id)}
                  className={cn(
                    'w-full rounded-xl border bg-bg-card p-3.5 text-left transition-all cursor-pointer',
                    sel ? 'border-blue/60 shadow-card-hover ring-1 ring-blue/30' : 'border-border hover:border-blue/30',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl', cfg.bg)}>
                      <Icon className={cn('h-5 w-5', cfg.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold text-text-1">{c.name}</h3>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {c.rating}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-text-2">📍 {c.address}</p>
                      {c.phone && <p className="truncate text-xs text-text-3 mt-0.5">📞 {c.phone}</p>}
                      <div className="mt-2.5 flex items-center gap-2 text-xs">
                        <span className={cn('rounded-md px-2 py-0.5 font-medium', cfg.bg, cfg.color)}>
                          {cfg.label}
                        </span>
                        <span className="truncate text-text-2">{c.specialty}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <Building2 className="mx-auto mb-2 h-8 w-8 text-text-3" />
                <p className="text-sm font-medium text-text-2">No se encontraron clínicas con ese filtro.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Sé el primero en registrar una aquí
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-teal/12 bg-bg-card/60 backdrop-blur-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue/15 text-blue">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-1">Registrar nueva clínica o centro</h2>
                  <p className="text-xs text-text-2">Disponible globalmente en el mapa</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-text-3 hover:bg-bg-hover hover:text-text-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterClinic} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-text-2 mb-1">Nombre del centro o clínica *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Clínica San Lucas, Hospital General, etc."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-sm text-text-1 placeholder:text-text-3 focus:border-teal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1">Tipo de establecimiento</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as Clinic['type'])}
                    className="w-full rounded-xl border border-border bg-bg-hover px-3 py-2 text-sm text-text-1 focus:border-teal focus:outline-none cursor-pointer"
                  >
                    <option value="clinica">Clínica</option>
                    <option value="hospital">Hospital</option>
                    <option value="centro">Centro de Salud</option>
                    <option value="consultorio">Consultorio Médico</option>
                    <option value="laboratorio">Laboratorio Clínico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1">Especialidad principal</label>
                  <input
                    type="text"
                    placeholder="Ej. General, Cardiología, etc."
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-sm text-text-1 placeholder:text-text-3 focus:border-teal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-2 mb-1">
                  Dirección completa (Calle, Ciudad, País) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Av. Javier Prado 1230, Lima, Perú"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-sm text-text-1 placeholder:text-text-3 focus:border-teal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1">Teléfono / Contacto</label>
                  <input
                    type="text"
                    placeholder="+51 987 654 321"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-sm text-text-1 placeholder:text-text-3 focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-2 mb-1">Calificación (1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg-hover px-3.5 py-2 text-sm text-text-1 focus:border-teal focus:outline-none"
                  />
                </div>
              </div>

              {/* Location Picker Section */}
              <div className="rounded-xl border border-border bg-bg-hover p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-1">Coordenadas GPS en el Mapa</label>
                  {pickedCoords && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-teal">
                      <Check className="h-3 w-3" /> Punto seleccionado
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="flex items-center gap-1.5 rounded-lg border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-2.5 py-1.5 text-xs font-medium text-text-2 hover:border-blue/40 hover:text-text-1 cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5 text-blue" /> Usar mi ubicación GPS
                  </button>

                  <button
                    type="button"
                    onClick={handleStartPickingPoint}
                    className="flex items-center gap-1.5 rounded-lg border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-2.5 py-1.5 text-xs font-medium text-text-2 hover:border-blue/40 hover:text-text-1 cursor-pointer"
                  >
                    <MapPin className="h-3.5 w-3.5 text-teal" /> Seleccionar en el mapa
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="block text-[10px] text-text-3">Latitud</span>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="-12.0734"
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      className="w-full rounded-lg border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-2.5 py-1 text-xs text-text-1 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-text-3">Longitud</span>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="-77.0396"
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      className="w-full rounded-lg border border-teal/12 bg-bg-card/60 backdrop-blur-xl px-2.5 py-1 text-xs text-text-1 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-text-2 hover:bg-bg-hover hover:text-text-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue px-4 py-2 text-xs font-semibold text-white shadow-glow-blue hover:bg-blue-hover cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Registrar clínica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
