"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon path issue with webpack
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapProvider {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  services: { name: string }[];
}

interface MapViewProps {
  providers: MapProvider[];
}

export default function MapView({ providers }: MapViewProps) {
  const mappable = providers.filter((p) => p.latitude && p.longitude);

  if (mappable.length === 0) {
    return (
      <div className="h-[500px] rounded-card bg-surface-secondary flex items-center justify-center text-text-secondary">
        No providers with location data to display on map.
      </div>
    );
  }

  // Center on the first provider or Switzerland center
  const center: [number, number] = mappable.length > 0
    ? [mappable[0].latitude!, mappable[0].longitude!]
    : [46.8182, 8.2275];

  return (
    <div className="h-[500px] rounded-card overflow-hidden border border-surface-border">
      <MapContainer
        center={center}
        zoom={mappable.length === 1 ? 13 : 8}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappable.map((provider) => (
          <Marker
            key={provider.id}
            position={[provider.latitude!, provider.longitude!]}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{provider.name}</p>
                {provider.services.length > 0 && (
                  <p className="text-text-secondary">
                    {provider.services.map((s) => s.name).join(", ")}
                  </p>
                )}
                <Link
                  href={`/providers/${provider.id}`}
                  className="text-brand-500 hover:underline text-xs mt-1 inline-block"
                >
                  View profile
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
