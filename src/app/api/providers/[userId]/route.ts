import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {

export const dynamic = "force-dynamic";
  parseLanguages,
  parsePhotos,
  parseAvailability,
  serializePhotos,
  serializeAvailability,
} from "@/lib/db-helpers";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: params.userId },
      include: {
        services: {
          include: { service: true },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
            postalCode: true,
            city: true,
            canton: true,
            languages: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Provider profile not found" },
        { status: 404 }
      );
    }

    const result = {
      ...profile,
      photos: parsePhotos(profile.photos),
      availability: parseAvailability(profile.availability),
      user: profile.user
        ? { ...profile.user, languages: parseLanguages(profile.user.languages) }
        : null,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get provider error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).id !== params.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const profile = await prisma.providerProfile.update({
      where: { userId: params.userId },
      data: {
        photos: serializePhotos(body.photos || []),
        availability: serializeAvailability(body.availability || {}),
      },
    });

    // Update services if provided
    if (body.services) {
      // Delete existing services
      await prisma.providerService.deleteMany({
        where: { profileId: profile.id },
      });

      // Create new services
      await Promise.all(
        body.services.map(
          (s: {
            serviceId?: string;
            customName?: string;
            description?: string;
            priceType?: string;
            price?: number | null;
          }) =>
            prisma.providerService.create({
              data: {
                profileId: profile.id,
                serviceId: s.serviceId || null,
                customName: s.customName || null,
                description: s.description || null,
                priceType: s.priceType || "NEGOTIABLE",
                price: s.price || null,
              },
            })
        )
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Update provider error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
