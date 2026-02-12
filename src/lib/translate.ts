import * as deepl from "deepl-node";
import { prisma } from "./prisma";
import { locales } from "@/i18n/config";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;

// Map our locale codes to DeepL target language codes
const deeplLocaleMap: Record<string, deepl.TargetLanguageCode> = {
  de: "de",
  en: "en-GB",
  fr: "fr",
  it: "it",
  uk: "uk",
};

// Map our locale codes to DeepL source language codes
const deeplSourceMap: Record<string, deepl.SourceLanguageCode> = {
  de: "de",
  en: "en",
  fr: "fr",
  it: "it",
  uk: "uk",
};

/**
 * Translate text and store results in the Translation table.
 * Translates to all locales except the source locale.
 * Fire-and-forget — call without awaiting from API routes.
 */
export async function translateAndStore(
  entityType: string,
  entityId: string,
  sourceText: string,
  sourceLocale: string = "de"
) {
  if (!DEEPL_API_KEY || !sourceText.trim()) return;

  const translator = new deepl.Translator(DEEPL_API_KEY);
  const targetLocales = locales.filter((l) => l !== sourceLocale);

  // Store the source text as-is for its own locale
  await prisma.translation.upsert({
    where: {
      entityType_entityId_locale: {
        entityType,
        entityId,
        locale: sourceLocale,
      },
    },
    update: { text: sourceText, isAutoTranslated: false, updatedAt: new Date() },
    create: {
      entityType,
      entityId,
      locale: sourceLocale,
      text: sourceText,
      isAutoTranslated: false,
    },
  });

  // Translate to all other locales
  for (const locale of targetLocales) {
    try {
      const targetLang = deeplLocaleMap[locale];
      if (!targetLang) continue;

      const result = await translator.translateText(
        sourceText,
        deeplSourceMap[sourceLocale] || null,
        targetLang
      );

      await prisma.translation.upsert({
        where: {
          entityType_entityId_locale: {
            entityType,
            entityId,
            locale,
          },
        },
        update: { text: result.text, isAutoTranslated: true, updatedAt: new Date() },
        create: {
          entityType,
          entityId,
          locale,
          text: result.text,
          isAutoTranslated: true,
        },
      });
    } catch (error) {
      console.error(`DeepL translation failed for ${locale}:`, error);
    }
  }
}

/**
 * Get translated text for a specific entity and locale.
 * Falls back to null if no translation exists.
 */
export async function getTranslatedText(
  entityType: string,
  entityId: string,
  locale: string
): Promise<string | null> {
  try {
    const translation = await prisma.translation.findUnique({
      where: {
        entityType_entityId_locale: {
          entityType,
          entityId,
          locale,
        },
      },
    });
    return translation?.text ?? null;
  } catch {
    return null;
  }
}

/**
 * Get all translations for an entity (all locales).
 */
export async function getTranslations(
  entityType: string,
  entityId: string
): Promise<Record<string, string>> {
  try {
    const translations = await prisma.translation.findMany({
      where: { entityType, entityId },
    });
    return Object.fromEntries(translations.map((t) => [t.locale, t.text]));
  } catch {
    return {};
  }
}
