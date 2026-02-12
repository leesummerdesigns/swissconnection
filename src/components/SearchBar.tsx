"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  size?: "large" | "compact";
  className?: string;
}

export function SearchBar({ size = "compact", className = "" }: SearchBarProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set("service", service);
    if (location) params.set("location", location);
    router.push(`/search?${params.toString()}`);
  };

  if (size === "large") {
    return (
      <form onSubmit={handleSubmit} className={className}>
        <div className="flex flex-col md:flex-row bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
          <div className="flex-1 flex items-center gap-3 px-6 py-4 border-b md:border-b-0 md:border-r border-surface-border">
            <Search size={20} className="text-text-tertiary flex-shrink-0" />
            <input
              type="text"
              placeholder={t("placeholder")}
              className="w-full outline-none text-text-primary placeholder:text-text-tertiary"
              value={service}
              onChange={(e) => setService(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-4 md:w-72">
            <MapPin size={20} className="text-text-tertiary flex-shrink-0" />
            <input
              type="text"
              placeholder={t("locationPlaceholder")}
              className="w-full outline-none text-text-primary placeholder:text-text-tertiary"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-brand-500 text-white px-8 py-4 font-medium hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
          >
            <Search size={18} />
            <span>{t("searchButton")}</span>
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex items-center bg-white rounded-full shadow-card border border-surface-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 flex-1">
          <Search size={16} className="text-text-tertiary" />
          <input
            type="text"
            placeholder={t("searchCompactPlaceholder")}
            className="w-full outline-none text-sm text-text-primary placeholder:text-text-tertiary"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-brand-500 text-white p-2 m-1 rounded-full hover:bg-brand-600 transition-colors"
        >
          <Search size={16} />
        </button>
      </div>
    </form>
  );
}
