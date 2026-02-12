import { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import SearchContent from "./SearchContent";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "search" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SearchPage() {
  const t = await getTranslations("search");

  return (
    <Suspense
      fallback={
        <div className="container-page py-16 text-center text-text-secondary">
          {t("searching")}
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
