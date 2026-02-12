"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = (newLocale: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-button text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
        aria-label="Switch language"
      >
        <Globe size={16} />
        <span className="uppercase font-medium">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-card shadow-modal border border-surface-border py-1 z-50">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => handleSwitch(l)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-secondary transition-colors ${
                l === locale
                  ? "text-brand-500 font-medium bg-brand-50"
                  : "text-text-primary"
              }`}
            >
              {localeNames[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
