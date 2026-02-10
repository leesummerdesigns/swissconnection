import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePhotos } from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");
    const location = searchParams.get("location");
    const sort = searchParams.get("sort") || "newest";
    const minRating = searchParams.get("minRating");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius");

    const where: any = {
      role: "PROVIDER",
    };

    // Filter by service — match predefined slug/name OR customName
    if (service) {
      where.providerProfile = {
        services: {
          some: {
            OR: [
              { service: { slug: { contains: service } } },
              { service: { name: { contains: service } } },
              { customName: { contains: service } },
            ],
          },
        },
      };
    } else {
      where.providerProfile = { services: { some: {} } };
    }

    // Filter by location text (also search postal code)
    if (location && !lat) {
      where.OR = [
        { city: { contains: location } },
        { canton: { contains: location } },
        { postalCode: { contains: location } },
      ];
    }

    // Determine sort order
    let orderBy: any;
    switch (sort) {
      case "rating":
        orderBy = { reviewsReceived: { _count: "desc" } };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const users = await prisma.user.findMany({
      where,
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
      orderBy,
      take: 100,
    });

    let providers = users
      .map((u) => {
        const ratings = u.reviewsReceived.map((r) => r.rating);
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;

        return {
          id: u.id,
          name: u.name,
          avatarUrl: u.avatarUrl,
          bio: u.bio,
          city: u.city,
          canton: u.canton,
          postalCode: u.postalCode,
          latitude: u.latitude,
          longitude: u.longitude,
          services:
            u.providerProfile?.services.map((s) => ({
              name: s.service?.name || s.customName || "Other",
            })) || [],
          rating: avgRating,
          reviewCount: ratings.length,
          photos: parsePhotos(u.providerProfile?.photos ?? null),
        };
      })
      .filter((p) => {
        if (minRating && p.rating < Number(minRating)) return false;
        return true;
      });

    // Filter by radius if lat/lng/radius provided
    if (lat && lng && radius) {
      const centerLat = parseFloat(lat);
      const centerLng = parseFloat(lng);
      const maxDist = parseFloat(radius);
      providers = providers.filter((p) => {
        if (!p.latitude || !p.longitude) return false;
        const dist = haversineDistance(centerLat, centerLng, p.latitude, p.longitude);
        return dist <= maxDist;
      });
    }

    return NextResponse.json({ providers });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ providers: [] }, { status: 500 });
  }
}
