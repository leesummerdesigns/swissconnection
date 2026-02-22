import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { validateBotApiKey } from "@/lib/bot-auth";
import {
  serializePhotos,
  serializeAvailability,
  serializeLanguages,
  parsePhotos,
  parseAvailability,
  parseLanguages,
} from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

/**
 * GET /api/bot/providers
 * List all providers with their profiles and services.
 *
 * Headers:
 *   Authorization: Bearer <BOT_API_KEY>
 *
 * Query params:
 *   limit  (default: 50)
 *   offset (default: 0)
 */
export async function GET(request: Request) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);
  const offset = Number(searchParams.get("offset") ?? 0);

  const providers = await prisma.providerProfile.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
    include: {
      services: { include: { service: true } },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          avatarUrl: true,
          postalCode: true,
          city: true,
          canton: true,
          languages: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  const total = await prisma.providerProfile.count();

  const result = providers.map((p) => ({
    ...p,
    photos: parsePhotos(p.photos),
    availability: parseAvailability(p.availability),
    user: p.user
      ? { ...p.user, languages: parseLanguages(p.user.languages) }
      : null,
  }));

  return NextResponse.json({ total, limit, offset, providers: result });
}

/**
 * POST /api/bot/providers
 * Create a new user account and provider profile in one call.
 *
 * Headers:
 *   Authorization: Bearer <BOT_API_KEY>
 *   Content-Type: application/json
 *
 * Body:
 * {
 *   "name": "Anna Müller",
 *   "email": "anna@example.com",
 *   "bio": "...",
 *   "city": "Zürich",
 *   "canton": "ZH",
 *   "postalCode": "8001",
 *   "languages": ["uk", "de"],          // optional, defaults to ["uk","de"]
 *   "photos": ["https://..."],           // optional
 *   "availability": { "monday": true },  // optional
 *   "services": [                        // at least one required
 *     {
 *       "serviceId": "existing-service-id",  // use an existing Service slug or id
 *       "customName": "My Custom Service",   // or provide a custom name
 *       "description": "Details about...",
 *       "priceType": "FIXED" | "HOURLY" | "NEGOTIABLE",
 *       "price": 80
 *     }
 *   ]
 * }
 */
export async function POST(request: Request) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    const { name, email, bio, city, canton, postalCode, languages, photos, availability, services } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "name and email are required" },
        { status: 400 }
      );
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: "At least one service is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Generate a secure random password — bot-created accounts use email login disabled
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        bio: bio ?? null,
        city: city ?? null,
        canton: canton ?? null,
        postalCode: postalCode ?? null,
        languages: serializeLanguages(languages ?? ["uk", "de"]),
        role: "PROVIDER",
        emailVerified: new Date(), // bot-created accounts skip email verification
      },
    });

    const profile = await prisma.providerProfile.create({
      data: {
        userId: user.id,
        photos: serializePhotos(photos ?? []),
        availability: serializeAvailability(availability ?? {}),
        services: {
          create: services.map((s: {
            serviceId?: string;
            customName?: string;
            description?: string;
            priceType?: string;
            price?: number | null;
          }) => ({
            serviceId: s.serviceId ?? null,
            customName: s.customName ?? null,
            description: s.description ?? null,
            priceType: s.priceType ?? "NEGOTIABLE",
            price: s.price ?? null,
          })),
        },
      },
      include: {
        services: { include: { service: true } },
      },
    });

    return NextResponse.json(
      {
        userId: user.id,
        profileId: profile.id,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          city: user.city,
          canton: user.canton,
          role: user.role,
        },
        profile: {
          ...profile,
          photos: parsePhotos(profile.photos),
          availability: parseAvailability(profile.availability),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[bot] Create provider error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
