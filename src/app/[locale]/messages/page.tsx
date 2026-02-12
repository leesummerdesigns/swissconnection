import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import MessagesContent from "./MessagesContent";

export default async function MessagesPage() {
  const t = await getTranslations("messages");

  return (
    <Suspense
      fallback={
        <div className="container-page py-16 text-center text-text-secondary">
          {t("loading")}
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
