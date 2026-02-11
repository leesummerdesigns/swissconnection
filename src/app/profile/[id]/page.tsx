export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseLanguages, parsePhotos, parseAvailability } from "@/lib/db-helpers";
import {
  Star,
  MapPin,
  MessageSquare,
  Globe,
  Clock,
  Briefcase,
  Award,
} from "lucide-react";
import { ReviewList } from "@/components/ReviewList";
import { WriteReview } from "@/components/WriteReview";

const languageNames: Record<string, string> = {
  uk: "Ukrainian",
  de: "German",
  fr: "French",
  it: "Italian",
  en: "English",
  ru: "Russian",
};

async function getUser(id: string) {
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
      reviewsWritten: {
        select: { id: true },
      },
      recommendationsReceived: {
        include: {
          recommender: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return user;
}

export default async function PublicProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getUser(params.id);
  if (!user) notFound();

  const ratings = user.reviewsReceived.map((r) => r.rating);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

  const isProvider = user.role === "PROVIDER" && user.providerProfile;
  const photos = parsePhotos(user.providerProfile?.photos ?? null);
  const languages = parseLanguages(user.languages);
  const availability = user.providerProfile
    ? parseAvailability(user.providerProfile.availability)
    : {};

  return (
    <div className="container-page py-8">
      {/* Cover photos for providers */}
      {isProvider && photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-card overflow-hidden mb-8 max-h-[400px]">
          <div className="relative h-[400px]">
            <Image
              src={photos[0]}
              alt={user.name}
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
                    alt={`${user.name} work ${i + 2}`}
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
          {/* Profile Header */}
          <div className="flex items-start gap-5 mb-8">
            <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                user.name[0]?.toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {user.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
                {(user.postalCode || user.city) && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {[user.postalCode, user.city, user.canton].filter(Boolean).join(", ")}
                  </span>
                )}
                {avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-current text-yellow-500" />
                    {avgRating.toFixed(1)} ({ratings.length} review
                    {ratings.length !== 1 ? "s" : ""})
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString("de-CH", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {user.emailVerified && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-text-secondary leading-relaxed">{user.bio}</p>
            </section>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-secondary rounded-full text-sm text-text-secondary"
                  >
                    <Globe size={14} />
                    {languageNames[lang] || lang}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Services (provider only) */}
          {isProvider &&
            user.providerProfile!.services.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4">
                  <span className="flex items-center gap-2">
                    <Briefcase size={18} />
                    Services offered
                  </span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.providerProfile!.services.map((ps) => (
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
              </section>
            )}

          {/* Availability (provider only) */}
          {isProvider && Object.keys(availability).length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Availability</h2>
              <AvailabilityDisplay availability={availability} />
            </section>
          )}

          {/* Recommendations */}
          {user.recommendationsReceived.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4">
                <span className="flex items-center gap-2">
                  <Award size={18} />
                  Recommendations ({user.recommendationsReceived.length})
                </span>
              </h2>
              <div className="space-y-4">
                {user.recommendationsReceived.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-brand-50 rounded-card border border-brand-100"
                  >
                    <p className="text-sm text-text-secondary italic mb-2">
                      &ldquo;{rec.text}&rdquo;
                    </p>
                    <p className="text-xs text-text-tertiary">
                      &mdash; {rec.recommender.name},{" "}
                      {new Date(rec.createdAt).toLocaleDateString("de-CH", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="mb-8">
            {user.reviewsReceived.length > 0 && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Reviews ({user.reviewsReceived.length})
                </h2>
                <ReviewList reviews={user.reviewsReceived} />
              </>
            )}
            <div className="mt-6">
              <WriteReview providerId={user.id} />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Contact Card */}
            <div className="card p-6">
              <h3 className="font-semibold text-lg mb-4">
                Contact {user.name.split(" ")[0]}
              </h3>
              <Link
                href={`/messages?to=${user.id}`}
                className="btn-primary w-full text-center flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                Send Message
              </Link>
              <p className="text-xs text-text-tertiary text-center mt-3">
                Write a friendly message — introduce yourself and what you need.
              </p>
            </div>

            {/* Stats Card */}
            <div className="card p-6">
              <h3 className="font-medium text-sm text-text-secondary mb-4 uppercase tracking-wide">
                Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Reviews received</span>
                  <span className="font-medium">
                    {user.reviewsReceived.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Reviews written</span>
                  <span className="font-medium">
                    {user.reviewsWritten.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Recommendations</span>
                  <span className="font-medium">
                    {user.recommendationsReceived.length}
                  </span>
                </div>
                {avgRating > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Avg. rating</span>
                    <span className="font-medium flex items-center gap-1">
                      <Star
                        size={14}
                        className="fill-current text-yellow-500"
                      />
                      {avgRating.toFixed(1)}
                    </span>
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

function AvailabilityDisplay({
  availability,
}: {
  availability: Record<string, boolean>;
}) {
  const days = [
    { key: "mon", label: "Monday" },
    { key: "tue", label: "Tuesday" },
    { key: "wed", label: "Wednesday" },
    { key: "thu", label: "Thursday" },
    { key: "fri", label: "Friday" },
    { key: "sat", label: "Saturday" },
    { key: "sun", label: "Sunday" },
  ];
  const slots = [
    { key: "morning", label: "Morning" },
    { key: "afternoon", label: "Afternoon" },
    { key: "evening", label: "Evening" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 font-medium text-text-secondary">
              Day
            </th>
            {slots.map((s) => (
              <th
                key={s.key}
                className="py-2 px-3 font-medium text-text-secondary text-center"
              >
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.key} className="border-t border-surface-border">
              <td className="py-2 pr-4 text-text-primary">{day.label}</td>
              {slots.map((slot) => {
                const key = `${day.key}_${slot.key}`;
                const available = availability[key];
                return (
                  <td key={slot.key} className="py-2 px-3 text-center">
                    {available ? (
                      <span className="inline-block w-6 h-6 rounded-full bg-green-100 text-green-600 leading-6 text-xs">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-block w-6 h-6 rounded-full bg-surface-secondary text-text-tertiary leading-6 text-xs">
                        —
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
