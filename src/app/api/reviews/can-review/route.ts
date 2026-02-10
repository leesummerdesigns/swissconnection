import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ canReview: false });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get("providerId");

  if (!providerId || providerId === userId) {
    return NextResponse.json({ canReview: false });
  }

  const sharedThread = await prisma.messageThread.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: providerId } } },
      ],
      messages: { some: {} },
    },
  });

  return NextResponse.json({ canReview: !!sharedThread });
}
