"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("categories");

  return (
    <footer className="bg-surface-secondary border-t border-surface-border mt-16">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-text-primary mb-3">
              The Swiss Connection
            </h3>
            <p className="text-sm text-text-secondary">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-text-primary mb-3">{t("discover")}</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/search" className="hover:text-text-primary">
                  {t("findServices")}
                </Link>
              </li>
              <li>
                <Link
                  href="/search?service=haircuts"
                  className="hover:text-text-primary"
                >
                  {tc("haircuts")}
                </Link>
              </li>
              <li>
                <Link
                  href="/search?service=cleaning"
                  className="hover:text-text-primary"
                >
                  {t("houseCleaning")}
                </Link>
              </li>
              <li>
                <Link
                  href="/search?service=sewing"
                  className="hover:text-text-primary"
                >
                  {tc("sewing")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-text-primary mb-3">{t("forProviders")}</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link
                  href="/provider/setup"
                  className="hover:text-text-primary"
                >
                  {t("becomeProvider")}
                </Link>
              </li>
              <li>
                <Link href="/profile/edit" className="hover:text-text-primary">
                  {t("editProfile")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-text-primary mb-3">{t("support")}</h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link href="/about" className="hover:text-text-primary">
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-text-primary">
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-text-primary">
                  {t("termsOfService")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-surface-border text-center text-sm text-text-secondary">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
