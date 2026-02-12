import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslatedText } from "@/lib/translate";
import { getRequestLocale } from "@/lib/get-request-locale";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Verify user is a participant
    const participant = await prisma.threadParticipant.findFirst({
      where: { threadId: params.id, userId },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant" },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { threadId: params.id },
      include: {
        sender: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        threadId: params.id,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    // Translate messages to the viewer's locale
    const viewerLocale = getRequestLocale(request);
    const messagesWithTranslations = await Promise.all(
      messages.map(async (msg) => {
        const translatedBody = await getTranslatedText("message", msg.id, viewerLocale);
        return {
          ...msg,
          body: translatedBody || msg.body,
          originalBody: msg.body,
          isTranslated: !!translatedBody && translatedBody !== msg.body,
        };
      })
    );

    return NextResponse.json({ messages: messagesWithTranslations });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}
