export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseLanguages, parsePhotos } from "@/lib/db-helpers";
import { Star, MapPin, MessageSquare, Globe, Clock } from "lucide-react";
import { ReviewList } from "@/components/ReviewList";
import { WriteReview } from "@/components/WriteReview";
import { RecommendButton } from "@/components/RecommendButton";

async function getProvider(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      providerProfile: {
        include: {
          services: {
            include: { service: true },
          },
        },
      },
      reviewsReceived: {
        include: {
          reviewer: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      recommendationsReceived: {
        include: {
          recommender: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user || user.role !== "PROVIDER") return null;
  return user;
}

const languageNames: Record<string, string> = {
  uk: "Ukrainian",
  de: "German",
  fr: "French",
  it: "Italian",
  en: "English",
  ru: "Russian",
};

export default async function ProviderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const provider = await getProvider(params.id);
  if (!provider) notFound();

  const ratings = provider.reviewsReceived.map((r) => r.rating);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  const photos = parsePhotos(provider.providerProfile?.photos ?? null);
  const languages = parseLanguages(provider.languages);

  return (
    <div className="container-page py-8">
      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-card overflow-hidden mb-8 max-h-[400px]">
          <div className="relative h-[400px]">
            <Image
              src={photos[0]}
              alt={provider.name}
              fill
              className="object-cover"
            />
          </div>
          {photos.length > 1 && (
            <div className="grid grid-cols-2 gap-2">
              {photos.slice(1, 5).map((photo, i) => (
                <div key={i} className="relative h-[196px]">
                  <Image
                    src={photo}
                    alt={`${provider.name} work ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
              {provider.avatarUrl ? (
                <Image
                  src={provider.avatarUrl}
                  alt={provider.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                provider.name[0]?.toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {provider.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                {(provider.postalCode || provider.city) && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {[provider.postalCode, provider.city, provider.canton].filter(Boolean).join(", ")}
                  </span>
                )}
                {avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star
                      size={14}
                      className="fill-current text-yellow-500"
                    />
                    {avgRating.toFixed(1)} ({ratings.length} review
                    {ratings.length !== 1 ? "s" : ""})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {provider.bio && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-text-secondary leading-relaxed">
                {provider.bio}
              </p>
            </div>
          )}

          {/* Services */}
          {provider.providerProfile?.services &&
            provider.providerProfile.services.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Services offered</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.providerProfile.services.map((ps) => (
                    <span
                      key={ps.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium border border-brand-100"
                    >
                      {ps.service?.name || ps.customName}
                      {ps.price && (
                        <span className="text-brand-500 font-semibold ml-1">
                          CHF {ps.price}{ps.priceType === "HOURLY" ? "/hr" : ""}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Languages</h2>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-text-secondary" />
                <span className="text-text-secondary">
                  {languages
                    .map((l) => languageNames[l] || l)
                    .join(", ")}
                </span>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="mb-8">
            {provider.reviewsReceived.length > 0 && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Reviews ({provider.reviewsReceived.length})
                </h2>
                <ReviewList reviews={provider.reviewsReceived} />
              </>
            )}
            <div className="mt-6">
              <WriteReview providerId={provider.id} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">Contact {provider.name}</h3>
              <Link
                href={`/messages?to=${provider.id}`}
                className="btn-primary w-full text-center flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                Send Message
              </Link>
              <p className="text-xs text-text-tertiary text-center mt-3">
                Write a friendly message — introduce yourself and what you need.
              </p>

              <RecommendButton userId={provider.id} userName={provider.name} />

              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t border-surface-border space-y-3">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Clock size={14} />
                  <span>
                    Member since{" "}
                    {new Date(provider.createdAt).toLocaleDateString("de-CH", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {provider.emailVerified && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Email verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
