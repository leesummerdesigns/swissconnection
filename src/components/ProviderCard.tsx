import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";

interface ProviderCardProps {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  postalCode?: string | null;
  city?: string | null;
  canton?: string | null;
  services: { name: string }[];
  rating?: number;
  reviewCount?: number;
  photos?: string[];
}

export function ProviderCard({
  id,
  name,
  avatarUrl,
  bio,
  postalCode,
  city,
  canton,
  services,
  rating,
  reviewCount = 0,
  photos = [],
}: ProviderCardProps) {
  const coverImage = photos[0] || avatarUrl;

  return (
    <Link href={`/providers/${id}`} className="block">
      <div className="card group cursor-pointer">
        {/* Cover image */}
        <div className="relative h-48 bg-surface-secondary overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-50">
              <span className="text-4xl font-bold text-brand-500">
                {name[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-text-primary text-lg">{name}</h3>
            {rating !== undefined && rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star size={14} className="fill-current text-yellow-500" />
                <span className="font-medium">{rating.toFixed(1)}</span>
                <span className="text-text-tertiary">({reviewCount})</span>
              </div>
            )}
          </div>

          {/* Services badges */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {services.slice(0, 3).map((s) => (
                <span key={s.name} className="badge text-xs">
                  {s.name}
                </span>
              ))}
              {services.length > 3 && (
                <span className="badge text-xs">+{services.length - 3}</span>
              )}
            </div>
          )}

          {/* Bio snippet */}
          {bio && (
            <p className="text-sm text-text-secondary line-clamp-2 mb-2">
              {bio}
            </p>
          )}

          {/* Location */}
          {(postalCode || city) && (
            <div className="flex items-center gap-1 text-sm text-text-secondary">
              <MapPin size={14} />
              <span>
                {[postalCode, city, canton].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
