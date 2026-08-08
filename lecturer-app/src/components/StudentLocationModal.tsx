import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { AttendingStudent } from '../types';

const sessionIcon = new L.DivIcon({
  html: `<div style="
    width: 32px; height: 32px; border-radius: 50%;
    background: #F5B41C; border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
  "><span style="font-size: 14px;">📍</span></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const studentIcon = new L.DivIcon({
  html: `<div style="
    width: 32px; height: 32px; border-radius: 50%;
    background: #1a2332; border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
  "><span style="font-size: 14px; filter: grayscale(1) brightness(10);">🎓</span></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface StudentLocationModalProps {
  open: boolean;
  onClose: () => void;
  student: AttendingStudent;
  sessionLatitude: number;
  sessionLongitude: number;
  geofenceRadius: number;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length < 2) {
      map.setView(points[0], 17);
      return;
    }
    const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });
  }, [map, points]);

  return null;
}

export default function StudentLocationModal({
  open,
  onClose,
  student,
  sessionLatitude,
  sessionLongitude,
  geofenceRadius,
}: StudentLocationModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const hasStudentLocation =
    student.studentLatitude != null && student.studentLongitude != null;

  const mapPoints: [number, number][] = hasStudentLocation
    ? [
        [sessionLatitude, sessionLongitude],
        [student.studentLatitude!, student.studentLongitude!],
      ]
    : [[sessionLatitude, sessionLongitude]];

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[640px] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#1a2332' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: '#F5B41C', color: '#1a2332' }}>
              {student.avatarInitials}
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-white">{student.name}</h3>
              <p className="text-[10px] font-mono text-white/60">{student.indexNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Map */}
        <div className="h-[350px]">
          {hasStudentLocation ? (
            <MapContainer
              center={[sessionLatitude, sessionLongitude]}
              zoom={17}
              scrollWheelZoom={true}
              zoomControl={false}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds points={mapPoints} />

              {/* Geofence circle */}
              <Circle
                center={[sessionLatitude, sessionLongitude]}
                radius={geofenceRadius}
                pathOptions={{
                  color: '#F5B41C',
                  fillColor: '#F5B41C',
                  fillOpacity: 0.1,
                  weight: 2,
                  dashArray: '8 6',
                }}
              />

              {/* Session location marker */}
              <Marker position={[sessionLatitude, sessionLongitude]} icon={sessionIcon} />

              {/* Student location marker */}
              <Marker position={[student.studentLatitude!, student.studentLongitude!]} icon={studentIcon} />

              {/* Line between the two */}
              <Polyline
                positions={[
                  [sessionLatitude, sessionLongitude],
                  [student.studentLatitude!, student.studentLongitude!],
                ]}
                pathOptions={{
                  color: '#1a2332',
                  weight: 2,
                  dashArray: '6 4',
                  opacity: 0.5,
                }}
              />
            </MapContainer>
          ) : (
            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-[40px] text-slate-300">location_off</span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location data not available</p>
              <p className="text-[10px] text-slate-400 font-mono">This record was created before location tracking was enabled</p>
            </div>
          )}
        </div>

        {/* Metadata footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-1">Distance</p>
              <p className="text-[14px] font-bold text-slate-900">
                {student.distance != null ? `${Math.round(student.distance)}m` : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-1">Check-in Time</p>
              <p className="text-[14px] font-bold text-slate-900">{student.time}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-1">Verification</p>
              <div className="flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]" style={{ color: student.gpsVerified ? '#10b981' : '#94a3b8' }}>
                  {student.gpsVerified ? 'check_circle' : 'pending'}
                </span>
                <p className="text-[14px] font-bold" style={{ color: student.gpsVerified ? '#10b981' : '#94a3b8' }}>
                  {student.gpsVerified ? 'GPS Verified' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Legend */}
          {hasStudentLocation && (
            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F5B41C' }} />
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Session Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1a2332' }} />
                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Student Location</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
