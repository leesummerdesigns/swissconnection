"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowResend(false);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("verify your email")) {
          setShowResend(true);
        }
        toast.error(result.error);
        return;
      }

      toast.success(t("welcomeBackToast"));
      router.push("/");
      router.refresh();
    } catch {
      toast.error(tc("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(t("verificationResent"));
        setShowResend(false);
      } else {
        toast.error(data.error || tc("somethingWentWrong"));
      }
    } catch {
      toast.error(tc("somethingWentWrong"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">{t("welcomeBack")}</h1>
          <p className="mt-2 text-text-secondary">
            {t("signInToAccount")}
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
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-primary mb-1"
            >
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              required
              className="input-field"
              placeholder={t("passwordPlaceholder")}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center"
          >
            {loading ? t("signingIn") : t("signIn")}
          </button>
        </form>

        {showResend && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-sm text-yellow-800 mb-2">{t("emailNotVerified")}</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-medium text-brand-500 hover:text-brand-600"
            >
              {resending ? t("resendingEmail") : t("resendVerification")}
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-text-secondary">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="text-brand-500 font-medium hover:text-brand-600"
          >
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
