"use client";

import { useEffect, useState } from "react";
import { ProviderCard } from "@/components/ProviderCard";

interface Provider {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  postalCode: string | null;
  city: string | null;
  canton: string | null;
  latitude: number | null;
  longitude: number | null;
  services: { name: string }[];
  rating: number;
  reviewCount: number;
  photos: string[];
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function FeaturedProviders({ providers }: { providers: Provider[] }) {
  const [sorted, setSorted] = useState<Provider[]>(providers.slice(0, 8));

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const withDistance = providers
          .map((p) => ({
            ...p,
            distance:
              p.latitude && p.longitude
                ? haversineKm(latitude, longitude, p.latitude, p.longitude)
                : Infinity,
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 8);
        setSorted(withDistance);
      },
      () => {
        // Geolocation denied — keep default order
      }
    );
  }, [providers]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {sorted.map(({ latitude, longitude, ...rest }) => (
        <ProviderCard key={rest.id} {...rest} />
      ))}
    </div>
  );
}
