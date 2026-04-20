'use client';
import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { useFirebaseZones } from '@/hooks/useFirebaseZones';
import { Zone, ZoneId, ZoneStatus } from '@/types/arena.types';

const STATUS_COLORS: Record<ZoneStatus, string> = {
  clear: '#10B981',
  moderate: '#F59E0B',
  busy: '#F97316',
  critical: '#EF4444',
};

interface WankhedeZone {
  id: ZoneId;
  name: string;
  label: string;
  polygon: { lat: number; lng: number }[];
}

// Internal GoogleMapView component
function GoogleMapView({ zones }: { zones: Record<ZoneId, Zone> }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const polygonsRef = useRef<Map<string, google.maps.Polygon>>(new Map());
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const zoneDataRef = useRef<WankhedeZone[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const polygons = polygonsRef.current;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 12.9792, lng: 77.5996 },
      zoom: 17,
      mapTypeId: 'satellite',
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    fetch('/chinnaswamy-zones.json')
      .then(r => r.json())
      .then((data: WankhedeZone[]) => {
        zoneDataRef.current = data;
        data.forEach(zone => {
          const zoneState = zones[zone.id];
          const status = zoneState?.status ?? 'clear';
          const color = STATUS_COLORS[status];

          const polygon = new google.maps.Polygon({
            paths: zone.polygon,
            fillColor: color,
            fillOpacity: 0.4,
            strokeColor: color,
            strokeWeight: 2,
            map,
          });

          polygon.addListener('mouseover', () => {
            const z = zones[zone.id];
            const capacityPct = z ? Math.round((z.current / z.capacity) * 100) : 0;
            infoWindowRef.current?.setContent(
              `<div style="color:#0F172A;font-size:12px;padding:4px">
                <strong>${zone.name}</strong><br/>
                Capacity: ${capacityPct}%<br/>
                Queue: ${z?.queueMinutes ?? 0} min<br/>
                Staff: ${z?.staffDeployed ?? 0}/${z?.staffRequired ?? 0}
              </div>`
            );
            infoWindowRef.current?.setPosition(zone.polygon[0]);
            infoWindowRef.current?.open(map);
          });

          polygon.addListener('mouseout', () => {
            infoWindowRef.current?.close();
          });

          polygons.set(zone.id, polygon);
        });
      })
      .catch(err => console.warn('Failed to load chinnaswamy-zones.json:', err));

    return () => {
      polygons.forEach(p => p.setMap(null));
      polygons.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update polygon colors when zones change
  useEffect(() => {
    polygonsRef.current.forEach((polygon, zoneId) => {
      const status = zones[zoneId as ZoneId]?.status ?? 'clear';
      const color = STATUS_COLORS[status];
      polygon.setOptions({ fillColor: color, strokeColor: color });
    });
  }, [zones]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      aria-label="Chinnaswamy Stadium zone map"
      role="img"
    />
  );
}

const STATUS_BAR: Record<ZoneStatus, string> = {
  clear: 'bg-green-500',
  moderate: 'bg-amber-500',
  busy: 'bg-orange-500',
  critical: 'bg-red-500',
};

const STATUS_RING: Record<ZoneStatus, string> = {
  clear: 'border-green-500/60 bg-green-500/10',
  moderate: 'border-amber-500/60 bg-amber-500/10',
  busy: 'border-orange-500/60 bg-orange-500/10',
  critical: 'border-red-500/60 bg-red-500/10 animate-pulse',
};

const STATUS_TEXT: Record<ZoneStatus, string> = {
  clear: 'text-green-400',
  moderate: 'text-amber-400',
  busy: 'text-orange-400',
  critical: 'text-red-400',
};

function ZoneChip({ zone }: { zone: Zone }) {
  const pct = Math.round((zone.current / zone.capacity) * 100);
  const status = zone.status ?? 'clear';
  return (
    <div className={`border rounded px-2 py-1.5 flex flex-col gap-1 transition-colors duration-500 ${STATUS_RING[status]}`}>
      <div className="flex justify-between items-center gap-2">
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider truncate max-w-[80px]">
          {zone.name.split(' ').slice(0, 2).join(' ')}
        </span>
        <span className={`text-[9px] font-bold uppercase ${STATUS_TEXT[status]}`}>{status}</span>
      </div>
      <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${STATUS_BAR[status]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[8px] text-slate-500">
        <span>{pct}% full</span>
        {zone.queueMinutes > 0 && <span>{zone.queueMinutes}m queue</span>}
      </div>
    </div>
  );
}

// SVG Fallback — stadium schematic with live zone data
function SVGFallback({ zones }: { zones: Record<ZoneId, Zone> }) {
  const stands: ZoneId[] = ['north-stand', 'south-stand', 'east-stand', 'west-stand'];
  const concourses: ZoneId[] = ['north-concourse', 'south-concourse'];
  const gates: ZoneId[] = ['gate-a', 'gate-b', 'gate-c', 'gate-d'];
  const concessions: ZoneId[] = ['concession-n1', 'concession-n2', 'concession-n3', 'concession-s1', 'concession-s2'];
  const other: ZoneId[] = ['medical-bay', 'vip-lounge'];

  const getStandColor = (id: ZoneId) => {
    const s = zones[id]?.status ?? 'clear';
    return STATUS_COLORS[s];
  };

  const standOpacity = (id: ZoneId) => {
    const pct = zones[id] ? zones[id].current / zones[id].capacity : 0.3;
    return 0.25 + pct * 0.55;
  };

  return (
    <div className="flex-1 bg-[#0a0f18] overflow-hidden flex flex-col">
      {/* Stadium SVG schematic */}
      <div className="flex-1 flex items-center justify-center px-4 pt-8 pb-2 min-h-0">
        <svg viewBox="0 0 260 200" className="w-full max-w-[260px]" aria-label="Stadium zone schematic">
          {/* Outer boundary */}
          <ellipse cx="130" cy="100" rx="120" ry="90" fill="#0d1520" stroke="#1e293b" strokeWidth="1" />

          {/* North Stand */}
          <path d="M 50,18 A 120,90 0 0,1 210,18 L 190,38 A 95,68 0 0,0 70,38 Z"
            fill={getStandColor('north-stand')} fillOpacity={standOpacity('north-stand')}
            stroke={getStandColor('north-stand')} strokeWidth="1.5" strokeOpacity="0.8" />
          <text x="130" y="30" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">N STAND</text>

          {/* South Stand */}
          <path d="M 50,182 A 120,90 0 0,0 210,182 L 190,162 A 95,68 0 0,1 70,162 Z"
            fill={getStandColor('south-stand')} fillOpacity={standOpacity('south-stand')}
            stroke={getStandColor('south-stand')} strokeWidth="1.5" strokeOpacity="0.8" />
          <text x="130" y="178" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">S STAND</text>

          {/* East Stand */}
          <path d="M 210,18 A 120,90 0 0,1 210,182 L 190,162 A 95,68 0 0,0 190,38 Z"
            fill={getStandColor('east-stand')} fillOpacity={standOpacity('east-stand')}
            stroke={getStandColor('east-stand')} strokeWidth="1.5" strokeOpacity="0.8" />
          <text x="222" y="103" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" transform="rotate(90,222,103)">E STAND</text>

          {/* West Stand */}
          <path d="M 50,18 A 120,90 0 0,0 50,182 L 70,162 A 95,68 0 0,1 70,38 Z"
            fill={getStandColor('west-stand')} fillOpacity={standOpacity('west-stand')}
            stroke={getStandColor('west-stand')} strokeWidth="1.5" strokeOpacity="0.8" />
          <text x="38" y="103" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" transform="rotate(-90,38,103)">W STAND</text>

          {/* Pitch (inner oval) */}
          <ellipse cx="130" cy="100" rx="55" ry="42" fill="#1a3a1a" stroke="#2d5a2d" strokeWidth="1" />
          {/* Pitch crease */}
          <ellipse cx="130" cy="100" rx="38" ry="28" fill="none" stroke="#3f6333" strokeWidth="0.5" strokeDasharray="3,2" />
          {/* Wickets */}
          <rect x="127" y="82" width="6" height="2" fill="#c8a96e" rx="0.5" />
          <rect x="127" y="116" width="6" height="2" fill="#c8a96e" rx="0.5" />
          <text x="130" y="103" textAnchor="middle" fill="#4a7a4a" fontSize="5" fontWeight="bold">PITCH</text>

          {/* Gate dots */}
          <circle cx="130" cy="10" r="4" fill={getStandColor('gate-a')} fillOpacity="0.9" />
          <text x="130" y="9" textAnchor="middle" fill="white" fontSize="4.5" fontWeight="bold">A</text>
          <circle cx="248" cy="100" r="4" fill={getStandColor('gate-b')} fillOpacity="0.9" />
          <text x="248" y="101.5" textAnchor="middle" fill="white" fontSize="4.5" fontWeight="bold">B</text>
          <circle cx="130" cy="190" r="4" fill={getStandColor('gate-c')} fillOpacity="0.9" />
          <text x="130" y="191.5" textAnchor="middle" fill="white" fontSize="4.5" fontWeight="bold">C</text>
          <circle cx="12" cy="100" r="4" fill={getStandColor('gate-d')} fillOpacity="0.9" />
          <text x="12" y="101.5" textAnchor="middle" fill="white" fontSize="4.5" fontWeight="bold">D</text>

          {/* Medical bay dot */}
          <circle cx="88" cy="58" r="3.5" fill={getStandColor('medical-bay')} fillOpacity="0.9" />
          <text x="88" y="59.5" textAnchor="middle" fill="white" fontSize="3.5" fontWeight="bold">MED</text>

          {/* VIP dot */}
          <circle cx="172" cy="58" r="3.5" fill={getStandColor('vip-lounge')} fillOpacity="0.9" />
          <text x="172" y="59.5" textAnchor="middle" fill="white" fontSize="3.5" fontWeight="bold">VIP</text>
        </svg>
      </div>

      {/* Zone data grid */}
      <div className="px-3 pb-3 flex flex-col gap-2 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1.5">
          {stands.map(id => zones[id] && <ZoneChip key={id} zone={zones[id]} />)}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {concourses.map(id => zones[id] && <ZoneChip key={id} zone={zones[id]} />)}
          {gates.map(id => zones[id] && <ZoneChip key={id} zone={zones[id]} />)}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {concessions.map(id => zones[id] && <ZoneChip key={id} zone={zones[id]} />)}
          {other.map(id => zones[id] && <ZoneChip key={id} zone={zones[id]} />)}
        </div>
      </div>
    </div>
  );
}

export default function ZoneHeatmap() {
  const zones = useFirebaseZones();
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;
    if (!apiKey) {
      setMapsError(true);
      return;
    }

    setOptions({ key: apiKey, v: 'weekly' });
    importLibrary('maps')
      .then(() => setMapsLoaded(true))
      .catch(() => setMapsError(true));
  }, []);

  return (
    <div className="flex flex-col h-full relative" aria-label="Zone Heatmap">
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-sm font-bold tracking-widest text-slate-200 uppercase drop-shadow-md">Live Heatmap</h2>
      </div>

      {!mapsLoaded && !mapsError && (
        <div className="flex-1 bg-[#0a0f18] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" aria-label="Loading map" />
        </div>
      )}

      {mapsError && <SVGFallback zones={zones} />}

      {mapsLoaded && (
        <div className="flex-1 relative">
          <GoogleMapView zones={zones} />
        </div>
      )}
    </div>
  );
}
