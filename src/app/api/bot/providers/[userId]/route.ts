import { NextResponse } from "next/server";
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
 * GET /api/bot/providers/[userId]
 * Fetch a single provider profile.
 */
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: params.userId },
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

  if (!profile) {
    return NextResponse.json(
      { error: "Provider not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ...profile,
    photos: parsePhotos(profile.photos),
    availability: parseAvailability(profile.availability),
    user: profile.user
      ? { ...profile.user, languages: parseLanguages(profile.user.languages) }
      : null,
  });
}

/**
 * PUT /api/bot/providers/[userId]
 * Update a provider's profile and/or user info.
 *
 * Body (all fields optional):
 * {
 *   "name": "...",
 *   "bio": "...",
 *   "city": "...",
 *   "canton": "...",
 *   "postalCode": "...",
 *   "languages": ["uk", "de"],
 *   "photos": ["https://..."],
 *   "availability": { "monday": true },
 *   "services": [ ... ]   // replaces all existing services
 * }
 */
export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user fields if provided
    const userUpdates: Record<string, unknown> = {};
    if (body.name !== undefined) userUpdates.name = body.name;
    if (body.bio !== undefined) userUpdates.bio = body.bio;
    if (body.city !== undefined) userUpdates.city = body.city;
    if (body.canton !== undefined) userUpdates.canton = body.canton;
    if (body.postalCode !== undefined) userUpdates.postalCode = body.postalCode;
    if (body.languages !== undefined)
      userUpdates.languages = serializeLanguages(body.languages);

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: params.userId },
        data: userUpdates,
      });
    }

    // Update provider profile
    const profileUpdates: Record<string, unknown> = {};
    if (body.photos !== undefined)
      profileUpdates.photos = serializePhotos(body.photos);
    if (body.availability !== undefined)
      profileUpdates.availability = serializeAvailability(body.availability);

    let profile = await prisma.providerProfile.findUnique({
      where: { userId: params.userId },
    });

    if (!profile) {
      // Create profile if it doesn't exist yet
      profile = await prisma.providerProfile.create({
        data: {
          userId: params.userId,
          photos: serializePhotos(body.photos ?? []),
          availability: serializeAvailability(body.availability ?? {}),
        },
      });
      await prisma.user.update({
        where: { id: params.userId },
        data: { role: "PROVIDER" },
      });
    } else if (Object.keys(profileUpdates).length > 0) {
      profile = await prisma.providerProfile.update({
        where: { userId: params.userId },
        data: profileUpdates,
      });
    }

    // Replace services if provided
    if (body.services && Array.isArray(body.services)) {
      await prisma.providerService.deleteMany({
        where: { profileId: profile.id },
      });
      await Promise.all(
        body.services.map((s: {
          serviceId?: string;
          customName?: string;
          description?: string;
          priceType?: string;
          price?: number | null;
        }) =>
          prisma.providerService.create({
            data: {
              profileId: profile!.id,
              serviceId: s.serviceId ?? null,
              customName: s.customName ?? null,
              description: s.description ?? null,
              priceType: s.priceType ?? "NEGOTIABLE",
              price: s.price ?? null,
            },
          })
        )
      );
    }

    const updated = await prisma.providerProfile.findUnique({
      where: { userId: params.userId },
      include: {
        services: { include: { service: true } },
        user: {
          select: {
            id: true, name: true, email: true, bio: true,
            city: true, canton: true, postalCode: true, languages: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...updated,
      photos: parsePhotos(updated!.photos),
      availability: parseAvailability(updated!.availability),
      user: updated?.user
        ? { ...updated.user, languages: parseLanguages(updated.user.languages) }
        : null,
    });
  } catch (error) {
    console.error("[bot] Update provider error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/**
 * DELETE /api/bot/providers/[userId]
 * Permanently delete a provider's user account and all associated data.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const authError = validateBotApiKey(request);
  if (authError) return authError;

  try {
    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cascade delete handled by Prisma schema (onDelete: Cascade)
    await prisma.user.delete({ where: { id: params.userId } });

    return NextResponse.json({ message: "Provider deleted", userId: params.userId });
  } catch (error) {
    console.error("[bot] Delete provider error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
