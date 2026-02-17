import { getTranslations } from "next-intl/server";

export default async function DatenschutzPage() {
  const t = await getTranslations("privacy");

  return (
    <div className="container-page py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-8">
        {t("title")}
      </h1>

      <div className="prose prose-lg text-text-secondary space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            {t("principleTitle")}
          </h2>
          <p>{t("principleText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            {t("noSharingTitle")}
          </h2>
          <p>{t("noSharingText1")}</p>
          <p className="mt-3">{t("noSharingText2")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            {t("publicProfilesTitle")}
          </h2>
          <p>{t("publicProfilesText1")}</p>
          <p className="mt-3">{t("publicProfilesText2")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            {t("emailProtectionTitle")}
          </h2>
          <p>{t("emailProtectionText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            {t("dataSecurityTitle")}
          </h2>
          <p>{t("dataSecurityText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            {t("userResponsibilityTitle")}
          </h2>
          <p>{t("userResponsibilityText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">
            {t("changesTitle")}
          </h2>
          <p>{t("changesText")}</p>
        </section>

        <p className="font-medium">{t("consent")}</p>
      </div>
    </div>
  );
}
