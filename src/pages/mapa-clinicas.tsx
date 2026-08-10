import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, ArrowLeft, MapPin, Phone, Clock, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import AiOrb from '@/components/AiOrb';
import { cn } from '@/lib/utils';

export interface Clinic {
  id: string;
  name: string;
  type: 'hospital' | 'clinica' | 'centro' | 'consultorio' | 'laboratorio';
  specialty: string;
  address: string;
  phone?: string;
  hours?: string;
  status?: 'activa' | 'expansion';
  rating: number;
  lat: number;
  lng: number;
  created_at?: string;
}

const DEFAULT_GLOBAL_CLINICS: Clinic[] = [
  { id: 'seed-1', name: 'Hospital Nacional Edgardo Rebagliati', type: 'hospital', specialty: 'Alta Complejidad', address: 'Av. Edgardo Rebagliati 490, Jesús María, Lima', phone: '+51 1 265-4900', hours: '24 horas', status: 'activa', rating: 4.6, lat: -12.0734, lng: -77.0396 },
  { id: 'seed-2', name: 'Clínica Anglo Americana', type: 'clinica', specialty: 'Especialidades Médicas', address: 'Calle Alfredo Salazar 350, San Isidro, Lima', phone: '+51 1 616-8900', hours: '7:00 AM - 10:00 PM', status: 'activa', rating: 4.8, lat: -12.0991, lng: -77.0361 },
  { id: 'seed-3', name: 'Hospital Universitario La Paz', type: 'hospital', specialty: 'Pediatría y Urgencias', address: 'Paseo de la Castellana 261, Madrid', phone: '+34 917 27 70 00', hours: '24 horas', status: 'expansion', rating: 4.7, lat: 40.4808, lng: -3.6876 },
  { id: 'seed-4', name: 'Instituto Salvador Zubirán', type: 'hospital', specialty: 'Medicina Interna', address: 'Vasco de Quiroga 15, Ciudad de México', phone: '+52 55 5487 0900', hours: '8:00 AM - 8:00 PM', status: 'activa', rating: 4.9, lat: 19.2882, lng: -99.1601 },
  { id: 'seed-5', name: 'Hospital Italiano de Buenos Aires', type: 'hospital', specialty: 'Cardiología y Cirugía', address: 'Juan D. Perón 4190, Buenos Aires', phone: '+54 11 4959-0200', hours: '24 horas', status: 'activa', rating: 4.7, lat: -34.6062, lng: -58.4239 },
  { id: 'seed-6', name: 'Fundación Santa Fe de Bogotá', type: 'clinica', specialty: 'Oncología y Neurología', address: 'Carrera 7 No. 117-15, Bogotá', phone: '+57 601 6030303', hours: '6:00 AM - 9:00 PM', status: 'expansion', rating: 4.8, lat: 4.6936, lng: -74.0322 },
  { id: 'seed-7', name: "St. Mary's Medical Center", type: 'hospital', specialty: 'Traumatología y Emergencias', address: '1468 Madison Ave, New York, 50000', phone: '(409) 786-2990', hours: '9:00 AM - 1:00 PM', status: 'activa', rating: 4.8, lat: 40.7891, lng: -73.9542 },
  { id: 'seed-8', name: 'Hospital Sírio-Libanês', type: 'hospital', specialty: 'Alta Complejidad', address: 'R. Dona Adma Jafet 91, São Paulo', phone: '+55 11 3394-0200', hours: '24 horas', status: 'activa', rating: 4.9, lat: -23.5558, lng: -46.6396 },
  { id: 'seed-9', name: 'Groote Schuur Hospital', type: 'hospital', specialty: 'Cirugía Cardiovascular', address: 'Main Rd, Observatory, Cape Town', phone: '+27 21 404 9111', hours: '24 horas', status: 'expansion', rating: 4.5, lat: -33.9406, lng: 18.4653 },
  { id: 'seed-10', name: 'Apollo Hospitals', type: 'clinica', specialty: 'Especialidades Médicas', address: 'Greams Lane, Chennai, India', phone: '+91 44 2829 3333', hours: '24 horas', status: 'activa', rating: 4.6, lat: 13.0604, lng: 80.2496 },
];

function createMarkerIcon(active: boolean): L.DivIcon {
  const color = active ? '#2dd4bf' : '#0e7490';
  const glow = active ? 'rgba(45,212,191,0.65)' : 'rgba(14,116,144,0.55)';
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};box-shadow:0 0 12px 3px ${glow}, 0 0 24px 6px ${glow};"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function MapaClinicasPage() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    async function loadClinics() {
      let combined: Clinic[] = [];
      const local = typeof window !== 'undefined' ? localStorage.getItem('historia_clinics_v2') : null;
      if (local) {
        try {
          combined = JSON.parse(local);
        } catch {
          combined = [...DEFAULT_GLOBAL_CLINICS];
        }
      } else {
        combined = [...DEFAULT_GLOBAL_CLINICS];
        localStorage.setItem('historia_clinics_v2', JSON.stringify(combined));
      }
      try {
        const { data, error } = await supabase.from('clinics').select('*');
        if (!error && data && data.length > 0) {
          const byId = new Map<string, Clinic>();
          combined.forEach((c) => byId.set(c.id, c));
          data.forEach((c) => byId.set(c.id, c as unknown as Clinic));
          combined = Array.from(byId.values());
        }
      } catch {}
      setClinics(combined);
    }
    loadClinics();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clinics;
    return clinics.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.specialty.toLowerCase().includes(q),
    );
  }, [clinics, search]);

  const selectedClinic = clinics.find((c) => c.id === selected) ?? null;

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [18, 5],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      worldCopyJump: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    filtered.forEach((c) => {
      const marker = L.marker([c.lat, c.lng], {
        icon: createMarkerIcon(c.status !== 'expansion'),
      }).addTo(map);
      marker.on('click', () => setSelected(c.id));
      markersRef.current.set(c.id, marker);
    });
  }, [filtered]);

  useEffect(() => {
    if (!selected || !mapRef.current) return;
    const clinic = clinics.find((c) => c.id === selected);
    if (clinic) mapRef.current.flyTo([clinic.lat, clinic.lng], 6, { duration: 1 });
  }, [selected, clinics]);

  async function handleRegisterClinic(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(formLat);
    const lng = parseFloat(formLng);
    if (!formName.trim() || !formAddress.trim()) {
      toast.error('Completa el nombre y la dirección');
      return;
    }
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Ingresa coordenadas válidas');
      return;
    }
    const newClinic: Clinic = {
      id: crypto.randomUUID(),
      name: formName.trim(),
      type: 'clinica',
      specialty: 'Especialidades Médicas',
      address: formAddress.trim(),
      phone: formPhone.trim() || undefined,
      hours: formHours.trim() || undefined,
      status: 'expansion',
      rating: 5,
      lat,
      lng,
      created_at: new Date().toISOString(),
    };
    const updated = [newClinic, ...clinics];
    setClinics(updated);
    localStorage.setItem('historia_clinics_v2', JSON.stringify(updated));
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
    toast.success(`Clínica "${newClinic.name}" registrada`);
    setShowForm(false);
    setSelected(newClinic.id);
    setFormName('');
    setFormAddress('');
    setFormPhone('');
    setFormHours('');
    setFormLat('');
    setFormLng('');
  }

  return (
    <div className="relative h-screen min-h-[520px] w-full overflow-hidden bg-[#050a0d]">
      {/* Mapa */}
      <div ref={containerRef} className="absolute inset-0 z-0 [&_.leaflet-container]:bg-[#050a0d]" />

      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/app')}
        aria-label="Volver a Inicio"
        className="absolute left-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-2xl border border-teal/20 bg-bg-card/70 text-text-1 backdrop-blur-xl transition-all hover:border-teal/50 hover:text-teal cursor-pointer active:scale-95"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="absolute left-1/2 top-5 z-20 w-[min(460px,calc(100%-9rem))] -translate-x-1/2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search locations..."
            className="w-full rounded-2xl border border-teal/15 bg-bg-card/70 py-3 pl-12 pr-12 text-sm text-text-1 placeholder:text-text-3 backdrop-blur-xl transition-all focus:border-teal/50 focus:outline-none"
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
          />
          <button
            type="button"
            onClick={() => setShowForm(true)}
            title="Registrar clínica"
            className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-text-3 transition-all hover:bg-teal/15 hover:text-teal cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Orb */}
      <div className="absolute right-6 top-5 z-20">
        <AiOrb size={44} />
      </div>

      {/* Detalle de clínica */}
      {selectedClinic && (
        <div
          className="absolute right-5 top-24 z-20 w-[min(300px,calc(100%-2.5rem))] rounded-3xl border border-teal/40 bg-bg-card/70 p-5 backdrop-blur-2xl animate-fade-in"
          style={{ boxShadow: '0 0 60px rgba(45,212,191,0.25), 0 24px 70px rgba(0,0,0,0.6)' }}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Cerrar"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-text-3 hover:text-text-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="pr-6 text-base font-bold leading-snug text-text-1">{selectedClinic.name}</h2>
          <div className="my-3 h-px w-full bg-teal/20" />

          <div className="space-y-3 text-sm text-text-2">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal" />
              <span className="leading-snug">{selectedClinic.address}</span>
            </div>
            {selectedClinic.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 flex-shrink-0 text-teal" />
                <span>{selectedClinic.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 flex-shrink-0 text-teal" />
              <span>{selectedClinic.hours ?? '24 horas'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (mapRef.current) mapRef.current.flyTo([selectedClinic.lat, selectedClinic.lng], 14, { duration: 1.2 });
            }}
            className="mt-5 w-full rounded-2xl bg-teal py-3 text-sm font-bold text-[#04222a] transition-all hover:bg-teal-2 cursor-pointer active:scale-[0.99]"
            style={{ boxShadow: '0 0 28px rgba(45,212,191,0.45)' }}
          >
            View Details
          </button>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-6 left-5 z-20 rounded-2xl border border-teal/15 bg-bg-card/70 px-4 py-3.5 backdrop-blur-2xl"
        style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.55)' }}
      >
        <div className="space-y-2.5 text-sm text-text-1">
          <div className="flex items-center gap-3">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-teal/50">
              <span className="h-2 w-2 rounded-full bg-teal shadow-glow-teal" />
            </span>
            <span>Clínicas activas</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-teal/25">
              <span className="h-2 w-2 rounded-full bg-[#0e7490]" />
            </span>
            <span className="text-text-2">En expansión</span>
          </div>
        </div>
      </div>

      {/* Registro */}
      {showForm && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleRegisterClinic}
            className={cn('w-full max-w-md rounded-3xl border border-teal/20 bg-bg-card/90 p-6 backdrop-blur-2xl animate-fade-in')}
            style={{ boxShadow: '0 24px 70px rgba(0,0,0,0.6)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-text-1">Registrar clínica</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-3 hover:text-text-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input className="glass-input" placeholder="Nombre de la clínica" value={formName} onChange={(e) => setFormName(e.target.value)} />
              <input className="glass-input" placeholder="Dirección" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
              <input className="glass-input" placeholder="Teléfono" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              <input className="glass-input" placeholder="Horario (9:00 AM - 1:00 PM)" value={formHours} onChange={(e) => setFormHours(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <input className="glass-input" placeholder="Latitud" value={formLat} onChange={(e) => setFormLat(e.target.value)} />
                <input className="glass-input" placeholder="Longitud" value={formLng} onChange={(e) => setFormLng(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-glow mt-5 w-full">Guardar clínica</button>
          </form>
        </div>
      )}
    </div>
  );
}
