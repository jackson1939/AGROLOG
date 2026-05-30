'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Parcela } from '@/types';

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((m) => m.Popup),
  { ssr: false }
);

interface ParcelaMapProps {
  parcelas: Parcela[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onSelect?: (parcela: Parcela) => void;
}

export function ParcelaMap({
  parcelas,
  center,
  zoom = 6,
  height = '400px',
  onSelect,
}: ParcelaMapProps) {
  useEffect(() => {
    void import('leaflet').then((L) => {
      const iconProto = L.Icon.Default.prototype as { _getIconUrl?: unknown };
      delete iconProto._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);

  const mapCenter: [number, number] = center ?? [
    parcelas[0]?.lat ?? -16.5,
    parcelas[0]?.lng ?? -63.5,
  ];

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {parcelas.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            eventHandlers={{
              click: () => onSelect?.(p),
            }}
          >
            <Popup>
              <strong>{p.nombre}</strong>
              <br />
              {p.municipio}, {p.departamento}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
