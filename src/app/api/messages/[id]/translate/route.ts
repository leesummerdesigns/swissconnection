import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslatedText } from "@/lib/translate";
import { getRequestLocale } from "@/lib/get-request-locale";
import * as deepl from "deepl-node";

const deeplLocaleMap: Record<string, deepl.TargetLanguageCode> = {
  de: "de",
  en: "en-GB",
  fr: "fr",
  it: "it",
  uk: "uk",
};

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
    const targetLocale = getRequestLocale(request);

    const message = await prisma.message.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Verify user is a participant
    const participant = await prisma.threadParticipant.findFirst({
      where: { threadId: message.threadId, userId },
    });

    if (!participant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if translation already exists
    const existing = await getTranslatedText("message", params.id, targetLocale);
    if (existing && existing !== message.body) {
      return NextResponse.json({ translatedText: existing });
    }

    // On-demand DeepL translation
    const apiKey = process.env.DEEPL_API_KEY;
    const targetLang = deeplLocaleMap[targetLocale];

    if (!apiKey || !targetLang) {
      return NextResponse.json({ translatedText: message.body });
    }

    const translator = new deepl.Translator(apiKey);
    const result = await translator.translateText(message.body, null, targetLang);
    const translatedText = result.text;

    // Store for future use
    await prisma.translation.upsert({
      where: {
        entityType_entityId_locale: {
          entityType: "message",
          entityId: params.id,
          locale: targetLocale,
        },
      },
      update: { text: translatedText, isAutoTranslated: true, updatedAt: new Date() },
      create: {
        entityType: "message",
        entityId: params.id,
        locale: targetLocale,
        text: translatedText,
        isAutoTranslated: true,
      },
    });

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("On-demand translate error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
