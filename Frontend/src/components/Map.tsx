import { useEffect, useRef } from 'react';
import { Pothole } from '../lib/supabase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  potholes: Pothole[];
  onMarkerClick: (pothole: Pothole) => void;
  center?: { lat: number; lng: number };
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return '#dc2626';
    case 'medium':
      return '#ea580c';
    case 'low':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

const createMarkerIcon = (severity: string) => {
  const fillColor = getSeverityColor(severity);
  return L.divIcon({
    className: 'pothole-marker-icon',
    html: `
      <div class="pothole-marker-pin" style="background:${fillColor}; border: 3px solid white;">
        <div class="pothole-marker-inner"></div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -36],
  });
};

export default function Map({ potholes, onMarkerClick, center }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const defaultCenter = center || { lat: 22.7196, lng: 75.8577 };

    // Initialize Leaflet Map
    const map = L.map(mapRef.current).setView(
      [defaultCenter.lat, defaultCenter.lng],
      13
    );

    // Load OpenStreetMap layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    leafletMapRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);
  }, [center]);

  useEffect(() => {
    if (!leafletMapRef.current || !markerLayerRef.current) return;

    // Clear old markers
    markerLayerRef.current.clearLayers();

    potholes.forEach((pothole) => {
      const lat = Number(pothole.latitude);
      const lng = Number(pothole.longitude);
      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(pothole.severity),
      });

      marker.on('click', () => onMarkerClick(pothole));
      marker.addTo(markerLayerRef.current!);
    });
  }, [potholes, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: '350px' }}
    />
  );
}
