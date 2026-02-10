import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ count: 0 });
  }

  const userId = (session.user as any).id;

  // Find threads where this user is a participant
  const threads = await prisma.threadParticipant.findMany({
    where: { userId },
    select: { threadId: true },
  });

  const threadIds = threads.map((t) => t.threadId);

  if (threadIds.length === 0) {
    return NextResponse.json({ count: 0 });
  }

  // Count messages in those threads not sent by this user and unread
  const count = await prisma.message.count({
    where: {
      threadId: { in: threadIds },
      senderId: { not: userId },
      readAt: null,
    },
  });

  return NextResponse.json({ count });
}
