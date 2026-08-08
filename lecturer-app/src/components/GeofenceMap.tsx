import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const lecturerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface GeofenceMapProps {
  latitude: number | null;
  longitude: number | null;
  radius: number;
  gpsStatus: 'idle' | 'acquiring' | 'locked' | 'error';
  gpsError?: string | null;
  onRetry?: () => void;
}

function MapUpdater({ lat, lng, radius }: { lat: number; lng: number; radius: number }) {
  const map = useMap();

  useEffect(() => {
    const padding = Math.max(radius * 3, 200);
    const bounds = L.latLng(lat, lng).toBounds(padding);
    map.fitBounds(bounds, { animate: true, duration: 0.5 });
  }, [map, lat, lng, radius]);

  return null;
}

function AnimatedCircle({ lat, lng, radius }: { lat: number; lng: number; radius: number }) {
  const circleRef = useRef<L.Circle | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    const currentRadius = circle.getRadius();
    const targetRadius = radius;
    if (currentRadius === targetRadius) return;

    const duration = 400;
    const startTime = performance.now();
    const startRadius = currentRadius;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const newRadius = startRadius + (targetRadius - startRadius) * eased;
      circle.setRadius(newRadius);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [radius]);

  return (
    <Circle
      ref={circleRef}
      center={[lat, lng]}
      radius={radius}
      pathOptions={{
        color: '#F5B41C',
        fillColor: '#F5B41C',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '8 6',
      }}
    />
  );
}

export default function GeofenceMap({ latitude, longitude, radius, gpsStatus, gpsError, onRetry }: GeofenceMapProps) {
  const [mapReady, setMapReady] = useState(false);

  if (gpsStatus === 'idle' || gpsStatus === 'acquiring') {
    return (
      <div className="w-full h-full rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-amber-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-slate-400">my_location</span>
          </div>
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Acquiring GPS Signal...</p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (gpsStatus === 'error') {
    return (
      <div className="w-full h-full rounded-lg bg-red-50 border border-red-200 flex flex-col items-center justify-center gap-3 px-6">
        <span className="material-symbols-outlined text-[32px] text-red-400">location_off</span>
        <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider text-center">GPS Error</p>
        {gpsError && (
          <p className="text-[10px] text-red-400 font-mono text-center max-w-[280px]">{gpsError}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 px-4 py-1.5 rounded border border-red-300 text-[10px] font-bold text-red-500 uppercase tracking-wider hover:bg-red-100 transition-colors cursor-pointer"
          >
            Retry GPS
          </button>
        )}
      </div>
    );
  }

  if (latitude === null || longitude === null) return null;

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-slate-200 relative">
      <MapContainer
        center={[latitude, longitude]}
        zoom={17}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater lat={latitude} lng={longitude} radius={radius} />
        <Marker position={[latitude, longitude]} icon={lecturerIcon} />
        <AnimatedCircle lat={latitude} lng={longitude} radius={radius} />
      </MapContainer>

      {/* Coordinate overlay */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm rounded px-2.5 py-1.5 border border-slate-200 shadow-sm">
        <p className="text-[9px] font-mono text-slate-600">
          {latitude.toFixed(6)}°, {longitude.toFixed(6)}°
        </p>
      </div>

      {/* Radius badge overlay */}
      <div className="absolute top-2 right-2 z-[1000] px-2.5 py-1 rounded-full border border-amber-300 shadow-sm" style={{ backgroundColor: 'rgba(245, 180, 28, 0.15)' }}>
        <p className="text-[10px] font-mono font-bold" style={{ color: '#081637' }}>{radius}m radius</p>
      </div>
    </div>
  );
}
