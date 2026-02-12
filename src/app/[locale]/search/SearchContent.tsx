"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { SearchBar } from "@/components/SearchBar";
import { ProviderCard } from "@/components/ProviderCard";
import { SlidersHorizontal, List, Map as MapIcon } from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface Provider {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  postalCode?: string | null;
  city?: string | null;
  canton?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  services: { name: string }[];
  rating: number;
  reviewCount: number;
  photos: string[];
}

export default function SearchContent() {
  const t = useTranslations("search");
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState({
    service: searchParams.get("service") || "",
    location: searchParams.get("location") || "",
    sort: "newest",
    minRating: "",
    radius: "",
  });

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  async function geocodeLocation(location: string): Promise<{ lat: string; lng: string } | null> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location + ", Switzerland")}&format=json&limit=1`,
        { headers: { "User-Agent": "TheSwissConnection/1.0" } }
      );
      const data = await res.json();
      if (data.length > 0) {
        return { lat: data[0].lat, lng: data[0].lon };
      }
    } catch {
      // fallback to text search
    }
    return null;
  }

  async function fetchProviders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.service) params.set("service", filters.service);
      if (filters.location) params.set("location", filters.location);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.minRating) params.set("minRating", filters.minRating);

      // If radius is set and location exists, geocode and pass lat/lng/radius
      if (filters.radius && filters.location) {
        const coords = await geocodeLocation(filters.location);
        if (coords) {
          params.set("lat", coords.lat);
          params.set("lng", coords.lng);
          params.set("radius", filters.radius);
        }
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setProviders(data.providers || []);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-8">
      {/* Search Bar */}
      <SearchBar size="large" className="mb-8" />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal size={18} />
              <h2 className="font-semibold">{t("filters")}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {t("sortBy")}
                </label>
                <select
                  className="input-field text-sm"
                  value={filters.sort}
                  onChange={(e) =>
                    setFilters({ ...filters, sort: e.target.value })
                  }
                >
                  <option value="newest">{t("newest")}</option>
                  <option value="rating">{t("highestRated")}</option>
                  <option value="name">{t("nameAZ")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {t("minimumRating")}
                </label>
                <select
                  className="input-field text-sm"
                  value={filters.minRating}
                  onChange={(e) =>
                    setFilters({ ...filters, minRating: e.target.value })
                  }
                >
                  <option value="">{t("anyRating")}</option>
                  <option value="4">{t("starsPlus", { count: 4 })}</option>
                  <option value="3">{t("starsPlus", { count: 3 })}</option>
                  <option value="2">{t("starsPlus", { count: 2 })}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  {t("searchRadius")}
                </label>
                <select
                  className="input-field text-sm"
                  value={filters.radius}
                  onChange={(e) =>
                    setFilters({ ...filters, radius: e.target.value })
                  }
                >
                  <option value="">{t("anyDistance")}</option>
                  <option value="5">{t("withinKm", { km: 5 })}</option>
                  <option value="10">{t("withinKm", { km: 10 })}</option>
                  <option value="25">{t("withinKm", { km: 25 })}</option>
                  <option value="50">{t("withinKm", { km: 50 })}</option>
                </select>
                {filters.radius && !filters.location && (
                  <p className="text-xs text-amber-600 mt-1">
                    {t("enterLocationForRadius")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-text-secondary">
              {loading
                ? t("searching")
                : t("providersFound", { count: providers.length })}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-button ${viewMode === "list" ? "bg-surface-secondary text-text-primary" : "text-text-tertiary"}`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-button ${viewMode === "map" ? "bg-surface-secondary text-text-primary" : "text-text-tertiary"}`}
              >
                <MapIcon size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-surface-secondary" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-surface-secondary rounded w-2/3" />
                    <div className="h-4 bg-surface-secondary rounded w-1/2" />
                    <div className="h-4 bg-surface-secondary rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-secondary text-lg">
                {t("noProvidersFound")}
              </p>
            </div>
          ) : viewMode === "map" ? (
            <MapView providers={providers} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} {...provider} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
