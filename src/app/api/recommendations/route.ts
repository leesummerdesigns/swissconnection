import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { recommendedId, text } = await request.json();

    if (!recommendedId || !text) {
      return NextResponse.json(
        { error: "Recommended user ID and text are required" },
        { status: 400 }
      );
    }

    if (recommendedId === userId) {
      return NextResponse.json(
        { error: "Cannot recommend yourself" },
        { status: 400 }
      );
    }

    const recommendation = await prisma.recommendation.create({
      data: {
        recommenderId: userId,
        recommendedId,
        text,
      },
      include: {
        recommender: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(recommendation, { status: 201 });
  } catch (error) {
    console.error("Create recommendation error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
