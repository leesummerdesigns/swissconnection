"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || tc("somethingWentWrong"));
        return;
      }

      setSubmitted(true);
    } catch {
      toast.error(tc("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 text-4xl">📧</div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">
            {t("sendResetLink")}
          </h1>
          <p className="text-text-secondary mb-6">{t("resetLinkSent")}</p>
          <Link
            href="/login"
            className="text-brand-500 font-medium hover:text-brand-600 text-sm"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            {t("forgotPasswordTitle")}
          </h1>
          <p className="mt-2 text-text-secondary">
            {t("forgotPasswordDescription")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center"
          >
            {loading ? t("sendingResetLink") : t("sendResetLink")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link
            href="/login"
            className="text-brand-500 font-medium hover:text-brand-600"
          >
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
