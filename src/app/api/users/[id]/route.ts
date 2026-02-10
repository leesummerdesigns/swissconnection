import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";
import {
  parseLanguages,
  serializeLanguages,
  parsePhotos,
  parseAvailability,
} from "@/lib/db-helpers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        languages: true,
        postalCode: true,
        city: true,
        canton: true,
        role: true,
        createdAt: true,
        providerProfile: {
          include: {
            services: {
              include: { service: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse serialized fields for the client
    const result = {
      ...user,
      languages: parseLanguages(user.languages),
      providerProfile: user.providerProfile
        ? {
            ...user.providerProfile,
            photos: parsePhotos(user.providerProfile.photos),
            availability: parseAvailability(user.providerProfile.availability),
          }
        : null,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = profileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: validated.name,
        bio: validated.bio,
        languages: validated.languages
          ? serializeLanguages(validated.languages)
          : undefined,
        postalCode: validated.postalCode,
        city: validated.city,
        canton: validated.canton,
        avatarUrl: validated.avatarUrl,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    if (error.issues) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
