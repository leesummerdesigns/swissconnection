import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializePhotos, serializeAvailability } from "@/lib/db-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    // Verify user exists in the database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: "Session expired. Please log out and log back in." },
        { status: 401 }
      );
    }

    // Check if provider profile already exists
    const existing = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Provider profile already exists" },
        { status: 409 }
      );
    }

    // Create provider profile with services
    const profile = await prisma.providerProfile.create({
      data: {
        userId,
        photos: serializePhotos(body.photos || []),
        availability: serializeAvailability(body.availability || {}),
        services: {
          create: body.services.map(
            (s: {
              serviceId?: string;
              customName?: string;
              description?: string;
              priceType?: string;
              price?: number | null;
            }) => ({
              serviceId: s.serviceId || null,
              customName: s.customName || null,
              description: s.description || null,
              priceType: s.priceType || "NEGOTIABLE",
              price: s.price || null,
            })
          ),
        },
      },
      include: {
        services: { include: { service: true } },
      },
    });

    // Update user role to PROVIDER
    await prisma.user.update({
      where: { id: userId },
      data: { role: "PROVIDER" },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Create provider error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
