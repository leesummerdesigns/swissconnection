"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const t = useTranslations("verifyEmail");
  const ta = useTranslations("auth");
  const tc = useTranslations("common");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("noToken"));
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(t("verifiedMessage"));
        } else {
          setStatus("error");
          setMessage(data.error || t("failedMessage"));
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage(tc("somethingWentWrong"));
      });
  }, [token]);

  return (
    <>
      {status === "loading" && (
        <div>
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">{t("verifying")}</p>
        </div>
      )}

      {status === "success" && (
        <div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">{t("verified")}</h1>
          <p className="text-text-secondary mb-6">{message}</p>
          <Link href="/login" className="btn-primary">
            {ta("signIn")}
          </Link>
        </div>
      )}

      {status === "error" && (
        <div>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">{t("failed")}</h1>
          <p className="text-text-secondary mb-6">{message}</p>
          <Link href="/register" className="btn-primary">
            {t("tryAgain")}
          </Link>
        </div>
      )}
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="container-page py-20 text-center max-w-md mx-auto">
      <Suspense
        fallback={
          <div>
            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary"></p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
