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
      center: { lat: 18.9388, lng: 72.8258 },
      zoom: 17,
      mapTypeId: 'satellite',
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    fetch('/wankhede-zones.json')
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
      .catch(err => console.warn('Failed to load wankhede-zones.json:', err));

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
      aria-label="Wankhede Stadium zone map"
      role="img"
    />
  );
}

// SVG Fallback (existing implementation)
function SVGFallback({ zones }: { zones: Record<ZoneId, Zone> }) {
  const getStatusColor = (status: ZoneStatus) => {
    switch (status) {
      case 'clear': return 'bg-green-500/80 border-green-400';
      case 'moderate': return 'bg-amber-500/80 border-amber-400';
      case 'busy': return 'bg-orange-500/80 border-orange-400';
      case 'critical': return 'bg-red-500/80 border-red-400 animate-pulse';
      default: return 'bg-slate-700/80 border-slate-600';
    }
  };

  return (
    <div className="flex-1 bg-[#0a0f18] relative overflow-hidden flex items-center justify-center p-8">
      <div className="relative w-full max-w-[300px] aspect-[3/4] border-4 border-slate-800 rounded-full flex items-center justify-center">
        <div className="w-1/3 aspect-[1/2] bg-[#2d4a22] border-2 border-[#3f6333] rounded-full z-10 flex items-center justify-center">
          <div className="w-[10%] h-[40%] bg-[#d2b48c] opacity-80" />
        </div>
        <div className={`absolute top-0 w-3/4 h-[15%] rounded-t-full border transition-colors duration-500 flex items-center justify-center group ${getStatusColor(zones['north-stand']?.status)}`} title="North Stand">
          <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">NORTH</span>
        </div>
        <div className={`absolute bottom-0 w-3/4 h-[15%] rounded-b-full border transition-colors duration-500 flex items-center justify-center group ${getStatusColor(zones['south-stand']?.status)}`} title="South Stand">
          <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">SOUTH</span>
        </div>
        <div className={`absolute right-0 h-3/4 w-[15%] rounded-r-full border transition-colors duration-500 flex items-center justify-center group ${getStatusColor(zones['east-stand']?.status)}`} title="East Stand">
          <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity rotate-90">EAST</span>
        </div>
        <div className={`absolute left-0 h-3/4 w-[15%] rounded-l-full border transition-colors duration-500 flex items-center justify-center group ${getStatusColor(zones['west-stand']?.status)}`} title="West Stand">
          <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity -rotate-90">WEST</span>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 bg-[#1E293B]/80 backdrop-blur border border-slate-700 p-2 rounded text-[10px] flex flex-col gap-1">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Clear</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Moderate</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Busy</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical</div>
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
