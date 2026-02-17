import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="container-page py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        {t("title")}
      </h1>

      <div className="prose prose-lg text-text-secondary space-y-6">
        <p>{t("p1")}</p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
        <p>{t("p4")}</p>
      </div>
    </div>
  );
}
