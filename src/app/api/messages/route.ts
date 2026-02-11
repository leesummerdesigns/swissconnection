import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const validated = messageSchema.parse(body);

    let threadId = validated.threadId;

    // If no threadId, create or find a thread with the recipient
    if (!threadId && validated.recipientId) {
      if (validated.recipientId === userId) {
        return NextResponse.json(
          { error: "Cannot message yourself" },
          { status: 400 }
        );
      }

      // Check if a thread already exists between these two users
      const existingThread = await prisma.messageThread.findFirst({
        where: {
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: validated.recipientId } } },
          ],
        },
      });

      if (existingThread) {
        threadId = existingThread.id;
      } else {
        // Create new thread
        const newThread = await prisma.messageThread.create({
          data: {
            participants: {
              create: [
                { userId },
                { userId: validated.recipientId },
              ],
            },
          },
        });
        threadId = newThread.id;
      }
    }

    if (!threadId) {
      return NextResponse.json(
        { error: "Thread or recipient is required" },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const participant = await prisma.threadParticipant.findFirst({
      where: { threadId, userId },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant of this thread" },
        { status: 403 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        threadId,
        senderId: userId,
        body: validated.body,
      },
      include: {
        sender: { select: { name: true } },
      },
    });

    // Update thread lastMessageAt
    await prisma.messageThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ ...message, threadId }, { status: 201 });
  } catch (error: any) {
    if (error.issues) {
      return NextResponse.json(
        { error: error.issues[0]?.message },
        { status: 400 }
      );
    }
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
