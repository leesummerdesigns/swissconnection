import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const validated = reviewSchema.parse(body);

    if (validated.providerId === userId) {
      return NextResponse.json(
        { error: "Cannot review yourself" },
        { status: 400 }
      );
    }

    // Check provider exists
    const provider = await prisma.user.findUnique({
      where: { id: validated.providerId, role: "PROVIDER" },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Only allow review if the user has exchanged messages with the provider
    const sharedThread = await prisma.messageThread.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: validated.providerId } } },
        ],
        messages: { some: {} },
      },
    });

    if (!sharedThread) {
      return NextResponse.json(
        { error: "You can only review providers you have messaged with" },
        { status: 403 }
      );
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: userId,
        providerId: validated.providerId,
        rating: validated.rating,
        text: validated.text,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    if (error.issues) {
      return NextResponse.json(
        { error: error.issues[0]?.message },
        { status: 400 }
      );
    }
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
