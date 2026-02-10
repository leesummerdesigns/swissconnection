import Link from "next/link";
import Image from "next/image";
import { SearchBar } from "@/components/SearchBar";
import { FeaturedProviders } from "@/components/FeaturedProviders";
import { prisma } from "@/lib/prisma";
import { parsePhotos } from "@/lib/db-helpers";
import { Scissors, Shirt, SprayCan, Wrench, UtensilsCrossed, Paintbrush } from "lucide-react";

const allCategories = [
  { name: "Haircuts", slug: "haircuts", icon: Scissors },
  { name: "Sewing", slug: "sewing", icon: Shirt },
  { name: "Cleaning", slug: "cleaning", icon: SprayCan },
  { name: "Repairs", slug: "repairs", icon: Wrench },
  { name: "Cooking", slug: "cooking", icon: UtensilsCrossed },
  { name: "Beauty", slug: "beauty", icon: Paintbrush },
];

async function getCategoriesWithCounts() {
  try {
    const services = await prisma.service.findMany({
      include: { _count: { select: { providers: true } } },
    });
    const countMap = new Map(services.map((s) => [s.slug, s._count.providers]));
    return [...allCategories].sort(
      (a, b) => (countMap.get(b.slug) || 0) - (countMap.get(a.slug) || 0)
    );
  } catch {
    return allCategories;
  }
}

async function getFeaturedProviders() {
  try {
    const providers = await prisma.user.findMany({
      where: {
        role: "PROVIDER",
        providerProfile: { isNot: null },
      },
      include: {
        providerProfile: {
          include: {
            services: {
              include: { service: true },
            },
          },
        },
        reviewsReceived: {
          select: { rating: true },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    return providers.map((p) => {
      const ratings = p.reviewsReceived.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      return {
        id: p.id,
        name: p.name,
        avatarUrl: p.avatarUrl,
        bio: p.bio,
        postalCode: p.postalCode,
        city: p.city,
        canton: p.canton,
        latitude: p.latitude,
        longitude: p.longitude,
        services:
          p.providerProfile?.services.map((s) => ({
            name: s.service?.name || s.customName || "Other",
          })) || [],
        rating: avgRating,
        reviewCount: ratings.length,
        photos: parsePhotos(p.providerProfile?.photos ?? null),
      };
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [categories, providers] = await Promise.all([
    getCategoriesWithCounts(),
    getFeaturedProviders(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <Image
          src="/hero_image2.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="container-page text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Private services
            <br />
            <span className="text-brand-300">from people near you</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow">
            Find skilled individuals offering personal services in Switzerland.
            No businesses — just real people with real talent.
          </p>

          <SearchBar size="large" className="max-w-3xl mx-auto" />
        </div>
      </section>

      {/* Service Categories */}
      <section className="container-page py-16">
        <h2 className="text-2xl font-semibold text-text-primary mb-8">
          Browse by service
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/search?service=${cat.slug}`}
                className="flex flex-col items-center gap-3 p-6 rounded-card bg-white border border-surface-border hover:shadow-card hover:border-brand-200 transition-all group"
              >
                <Icon
                  size={32}
                  className="text-text-secondary group-hover:text-brand-500 transition-colors"
                />
                <span className="text-sm font-medium text-text-primary">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Providers */}
      {providers.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-text-primary">
              Featured providers
            </h2>
            <Link
              href="/search"
              className="text-brand-500 font-medium hover:text-brand-600 transition-colors"
            >
              View all
            </Link>
          </div>
          <FeaturedProviders providers={providers} />
        </section>
      )}

      {/* How It Works */}
      <section className="bg-surface-secondary py-16">
        <div className="container-page">
          <h2 className="text-2xl font-semibold text-text-primary text-center mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Search",
                description:
                  "Browse service providers by category, location, or keyword. Filter by rating, price, and language.",
              },
              {
                step: "2",
                title: "Connect",
                description:
                  "View provider profiles, check reviews, and send a message directly to discuss your needs.",
              },
              {
                step: "3",
                title: "Get it done",
                description:
                  "Arrange the service, then leave a review and recommendation to help the community.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-page py-16 text-center">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          Offer your services
        </h2>
        <p className="text-text-secondary max-w-lg mx-auto mb-6">
          Are you a skilled professional? Create your provider profile and start
          connecting with people who need your services.
        </p>
        <Link href="/provider/setup" className="btn-primary inline-block">
          Become a Provider
        </Link>
      </section>
    </div>
  );
}
