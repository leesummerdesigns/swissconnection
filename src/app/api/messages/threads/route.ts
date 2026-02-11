import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const threads = await prisma.messageThread.findMany({
      where: {
        participants: { some: { userId } },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, senderId: true },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Count unread messages per thread
    const threadsWithUnread = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await prisma.message.count({
          where: {
            threadId: thread.id,
            senderId: { not: userId },
            readAt: null,
          },
        });

        const otherUser = thread.participants.find(
          (p) => p.userId !== userId
        )?.user;

        return {
          id: thread.id,
          lastMessageAt: thread.lastMessageAt,
          otherUser: otherUser || { id: "", name: "Unknown", avatarUrl: null },
          lastMessage: thread.messages[0] || null,
          unreadCount,
        };
      })
    );

    return NextResponse.json(threadsWithUnread);
  } catch (error) {
    console.error("Get threads error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
